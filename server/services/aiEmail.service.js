// AI Email Intelligence Engine — MailPilot
// Thread summarization, smart reply suggestion, and email polishing

const { prisma, ensureDbConnected } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { OPENAI_API_KEY, GEMINI_API_KEY, AI_PROVIDER } = require('../config/env');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');

/**
 * Helper to call configured LLM or fallback safely
 */
async function callLLM(prompt, systemInstruction = 'You are an executive AI assistant specialized in business email productivity.') {
  const provider = (AI_PROVIDER || 'openai').toLowerCase();

  // 1. Try OpenAI if key is configured
  const openAiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  if (provider === 'openai' && openAiKey && !openAiKey.startsWith('sk-placeholder') && openAiKey.length > 20) {
    try {
      const client = new OpenAI({ apiKey: openAiKey });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      return { raw: completion.choices[0].message.content, model: 'gpt-4o-mini' };
    } catch (err) {
      console.warn('⚠️ [AI Service] OpenAI call error, falling back:', err.message);
    }
  }

  // 2. Try Gemini if key is configured
  const geminiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith('AIza-placeholder') && geminiKey.length > 20) {
    try {
      const client = new GoogleGenAI({ apiKey: geminiKey });
      const result = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${prompt}\n\nPlease respond ONLY with valid JSON.` }],
          },
        ],
      });
      return { raw: result.text, model: 'gemini-2.0-flash' };
    } catch (err) {
      console.warn('⚠️ [AI Service] Gemini call error, falling back:', err.message);
    }
  }

  return null;
}

/**
 * Generates an executive summary for an email conversation thread
 */
async function summarizeThread(userId, threadId) {
  ensureDbConnected();

  if (!userId || !threadId) {
    throw new ApiError(400, 'User ID and Thread ID are required.');
  }

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      emails: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!thread || thread.userId !== userId) {
    throw new ApiError(404, 'Thread not found.');
  }

  const emails = Array.isArray(thread.emails) ? thread.emails : [];
  if (emails.length === 0) {
    throw new ApiError(400, 'Cannot summarize an empty thread with no messages.');
  }

  // Format transcript
  const transcript = emails
    .map((e, idx) => {
      const sender = e.fromName ? `${e.fromName} <${e.from}>` : e.from;
      const date = e.date ? new Date(e.date).toLocaleString() : 'Recent';
      const body = (e.bodyText || e.snippet || '').trim();
      return `[Message ${idx + 1} - From: ${sender} on ${date}]\nSubject: ${e.subject}\nBody:\n${body}\n`;
    })
    .join('\n---\n\n');

  let summaryResult = null;

  const prompt = `Analyze this email thread and output a structured JSON summary:\n\n${transcript}\n\nReturn JSON with schema:\n{\n  "summary": "2-3 concise sentences summarizing key discussion and current status",\n  "keyPoints": ["Key point 1", "Key point 2"],\n  "actionItems": ["Action item 1", "Action item 2"],\n  "sentiment": "POSITIVE" | "NEUTRAL" | "URGENT" | "NEGATIVE"\n}`;

  const llmResponse = await callLLM(prompt);

  if (llmResponse?.raw) {
    try {
      const cleaned = llmResponse.raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.summary) {
        summaryResult = {
          summary: parsed.summary,
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          sentiment: ['POSITIVE', 'NEUTRAL', 'URGENT', 'NEGATIVE'].includes(parsed.sentiment)
            ? parsed.sentiment
            : 'NEUTRAL',
          modelUsed: llmResponse.model,
        };
      }
    } catch (parseErr) {
      console.warn('⚠️ [AI Service] Failed to parse LLM JSON summary, generating heuristic summary:', parseErr.message);
    }
  }

  // Fallback heuristic intelligence engine
  if (!summaryResult) {
    const latestEmail = emails[emails.length - 1];
    const sender = latestEmail.fromName || latestEmail.from;
    const cleanSnippet = latestEmail.snippet || thread.snippet || 'No message preview.';

    const keyPoints = [
      `Conversation with ${sender} regarding "${thread.subject}".`,
      `Thread contains ${emails.length} message(s), last active on ${new Date(thread.lastMessageAt).toLocaleDateString()}.`,
    ];

    const actionItems = [];
    if (cleanSnippet.includes('?') || cleanSnippet.toLowerCase().includes('let me know') || cleanSnippet.toLowerCase().includes('please')) {
      actionItems.push(`Respond to ${sender} regarding ${thread.subject}`);
    } else {
      actionItems.push(`Review latest notes from ${sender}`);
    }

    summaryResult = {
      summary: `Discussion with ${sender} concerning "${thread.subject}". Latest update: "${cleanSnippet.slice(0, 160)}".`,
      keyPoints,
      actionItems,
      sentiment: cleanSnippet.toLowerCase().includes('urgent') || cleanSnippet.toLowerCase().includes('asap')
        ? 'URGENT'
        : 'NEUTRAL',
      modelUsed: 'mailpilot-nlp-heuristics',
    };
  }

  // Persist or update AiSummary in database
  const existingSummary = await prisma.aiSummary.findFirst({
    where: { threadId },
  });

  let savedAiSummary;
  if (existingSummary) {
    savedAiSummary = await prisma.aiSummary.update({
      where: { id: existingSummary.id },
      data: {
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        actionItems: summaryResult.actionItems,
        sentiment: summaryResult.sentiment,
        modelUsed: summaryResult.modelUsed,
      },
    });
  } else {
    savedAiSummary = await prisma.aiSummary.create({
      data: {
        threadId,
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        actionItems: summaryResult.actionItems,
        sentiment: summaryResult.sentiment,
        modelUsed: summaryResult.modelUsed,
      },
    });
  }

  return savedAiSummary;
}

/**
 * Generates 3 smart reply suggestions for an email conversation
 */
async function generateSmartReplies(userId, threadId) {
  ensureDbConnected();

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      emails: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!thread || thread.userId !== userId) {
    throw new ApiError(404, 'Thread not found.');
  }

  const emails = Array.isArray(thread.emails) ? thread.emails : [];
  const latestEmail = emails.length > 0 ? emails[emails.length - 1] : null;
  const sender = latestEmail?.fromName || latestEmail?.from || 'the team';
  const snippet = latestEmail?.snippet || thread.snippet || '';

  const prompt = `Based on this latest email message from ${sender}:\n"${snippet}"\n\nGenerate 3 distinct, professional, concise one-to-two sentence smart replies formatted as JSON:\n{\n  "replies": [\n    "Positive confirmation reply",\n    "Follow-up scheduling or next steps reply",\n    "Clarification question reply"\n  ]\n}`;

  const llmResponse = await callLLM(prompt, 'You are an executive email assistant generating quick, context-aware smart replies.');

  if (llmResponse?.raw) {
    try {
      const cleaned = llmResponse.raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.replies) && parsed.replies.length >= 3) {
        return { replies: parsed.replies.slice(0, 3) };
      }
    } catch (e) {
      // Fallback
    }
  }

  return {
    replies: [
      `Thanks for the update, ${sender.split(' ')[0]}. Everything looks good on our end.`,
      `Sounds great. Let's schedule a quick 15-minute sync later this week to finalize.`,
      `Thanks for sharing! Could you clarify the timeline and next steps before we proceed?`,
    ],
  };
}

/**
 * Polishes an email draft with target tone and style
 */
async function polishEmailDraft(userId, { text, tone = 'professional' }) {
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Draft text is required for AI polishing.');
  }

  const toneGuides = {
    professional: 'Refine into crisp, executive, polished business communication.',
    friendly: 'Make the tone warm, welcoming, polite, and approachable.',
    concise: 'Cut unnecessary fluff; make it extremely brief and high-signal.',
    persuasive: 'Make the language compelling, structured, and action-oriented.',
  };

  const instruction = toneGuides[tone] || toneGuides.professional;

  const prompt = `Please polish and rewrite the following email draft:\n\n"${text}"\n\nGuidelines: ${instruction}\n\nReturn JSON: { "polishedText": "..." }`;

  const llmResponse = await callLLM(prompt, 'You are an expert communication coach and executive copywriter.');

  if (llmResponse?.raw) {
    try {
      const cleaned = llmResponse.raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.polishedText) {
        return { polishedText: parsed.polishedText };
      }
    } catch (e) {
      // Fallback
    }
  }

  // Fallback clean formatting
  const polishedText = text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(hey|hi|hello)\b/i, 'Hi there,')
    .concat('\n\nBest regards,\nMailPilot Team');

  return { polishedText };
}

module.exports = {
  summarizeThread,
  generateSmartReplies,
  polishEmailDraft,
};
