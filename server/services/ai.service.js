const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../config/env');

// Gemini model — stable production identifier
const GEMINI_MODEL = 'gemini-2.0-flash';

// Default request timeout in ms (avoids indefinite hangs)
const REQUEST_TIMEOUT_MS = 20000;

/**
 * Resolve and validate the Gemini API key from env.
 * Throws a clear error if the key is missing or still a placeholder.
 */
function resolveApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('AIza-placeholder')) {
    throw new Error('Gemini API key is missing. Please set GEMINI_API_KEY in server/.env');
  }
  return apiKey;
}

/**
 * Build a GoogleGenAI client instance.
 */
function buildClient() {
  return new GoogleGenAI({ apiKey: resolveApiKey() });
}

/**
 * Wrap a promise with a timeout so requests never hang indefinitely.
 */
function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Chat Completion — Gemini only.
 * Accepts OpenAI-style messages array and returns the assistant reply string.
 */
async function askAI({ messages }) {
  const client = buildClient();

  // Map OpenAI-style roles to Gemini roles
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const result = await withTimeout(
      client.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction:
            'You are an elite, production-grade email marketing copilot built into the MailPilot workspace dashboard. ' +
            'Help users craft high-converting subject lines, draft full email campaigns, audit deliverability, and optimize copy. ' +
            'Maintain a professional, growth-focused, concise tone.',
        },
      })
    );
    return result.text;
  } catch (error) {
    console.error('❌ [AI Service] Gemini completion failed:', error.message);
    throw new Error(`Gemini API Request Error: ${error.message}`);
  }
}

const SPAM_TRIGGER_WORDS = [
  '100% free', 'act now', 'apply now', 'as seen on', 'bargain', 'beneficiary',
  'billing', 'bonus', 'buy direct', 'call now', 'cancel at any time', 'cash bonus',
  'casino', 'certified', 'cheap', 'claim', 'clearance', 'click here', 'click now',
  'compare rates', 'congratulations', 'credit card offers', 'cures', 'dear friend',
  'direct email', 'direct marketing', 'discount', 'double your income', 'earn extra cash',
  'eliminate debt', 'exclusive deal', 'expect to earn', 'extra income', 'fast cash',
  'financial freedom', 'free consultation', 'free gift', 'free info', 'free membership',
  'free money', 'free sample', 'free trial', 'get out of debt', 'get paid', 'giveaway',
  'guaranteed', 'hidden assets', 'increase sales', 'instant', 'investment', 'join millions',
  'limited time', 'lowest price', 'make money', 'million dollars', 'miracle', 'money back',
  'mortgage', 'no catch', 'no cost', 'no credit check', 'no experience', 'no fees',
  'no gimmick', 'no hidden costs', 'no obligation', 'no purchase necessary', 'no risk',
  'no strings attached', 'not spam', 'obligation', 'offshore', 'one time', 'online marketing',
  'open immediately', 'opportunity', 'order now', 'passwords', 'pennies a day', 'potential earnings',
  'prize', 'promise', 'pure profit', 'refund', 'remove', 'reverses', 'risk-free', 'save big',
  'save up to', 'score', 'secret', 'special promotion', 'supplies are limited', 'take action',
  'terms and conditions', 'the best rates', 'unlimited', 'unsecured', 'urgent', 'valuable',
  'viagra', 'vicodin', 'warranty', 'weight loss', 'while supplies last', 'win', 'winner',
  'winning', 'work from home', 'you have been selected', 'your income',
];

/**
 * Generate subject lines with Gemini or fallback heuristic.
 */
async function generateSubjectLines({ topic, audience = 'General Subscribers', tone = 'Engaging' }) {
  try {
    const client = buildClient();
    const response = await withTimeout(
      client.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{
              text:
                `Generate exactly 5 highly-optimized email subject line variations:\n` +
                `- Topic: ${topic}\n` +
                `- Target Audience: ${audience}\n` +
                `- Selected Tone Profile: ${tone}`,
            }],
          },
        ],
        config: {
          systemInstruction:
            'You are an expert email marketing copywriter. ' +
            'Return a strict JSON object with a top-level array named "variations". ' +
            'Do NOT wrap the output in markdown code fences. ' +
            'Each item must have: ' +
            '"subject" (string), "tone" (one of: Urgent/Curious/Direct/Conversational/Value-driven), ' +
            '"score" (integer 80-99), "rationale" (one-sentence explanation).',
          responseMimeType: 'application/json',
        },
      })
    );

    const content = JSON.parse(response.text);
    return content.variations || content.subject_lines || content;
  } catch (err) {
    console.warn('⚠️ [AI Service] Gemini subject line generation failed, using heuristic fallback:', err.message);
  }

  // High-converting rule-based heuristic templates
  const cleanTopic = (topic || 'New Update').trim();
  return [
    {
      subject: `Introducing ${cleanTopic}: built for ${audience}`,
      tone: 'Direct',
      score: 94,
      rationale: 'Direct value proposition clearly stating audience benefit.',
    },
    {
      subject: `The fastest way to master ${cleanTopic} ⚡`,
      tone: 'Curious',
      score: 91,
      rationale: 'Appeals to speed and efficiency with high curiosity gap.',
    },
    {
      subject: `Quick question about your ${cleanTopic} strategy...`,
      tone: 'Conversational',
      score: 88,
      rationale: 'Feels personalized and 1-on-1 like a direct message from a founder.',
    },
    {
      subject: `[Inside] How we improved ${cleanTopic} by 40%`,
      tone: 'Value-driven',
      score: 95,
      rationale: 'Social proof with concrete metric triggers high open rates.',
    },
    {
      subject: `Don't miss this: ${cleanTopic} access opens today`,
      tone: 'Urgent',
      score: 89,
      rationale: 'Creates healthy FOMO without triggering spam filters.',
    },
  ];
}

/**
 * Generate complete email copy with Gemini.
 */
async function generateEmailCopy({ topic, audience = 'General Subscribers', tone = 'Professional', goal = 'Product announcement' }) {
  try {
    const client = buildClient();
    const response = await withTimeout(
      client.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{
              text:
                `Generate a high-converting full email for:\n` +
                `- Topic: ${topic}\n` +
                `- Audience: ${audience}\n` +
                `- Tone: ${tone}\n` +
                `- Goal: ${goal}`,
            }],
          },
        ],
        config: {
          systemInstruction:
            'You are an elite SaaS email marketer. ' +
            'Respond ONLY with a raw JSON object (no markdown fences) matching this exact schema: ' +
            '{ "subject": string, "previewText": string, "body": string }. ' +
            '"body" must be clean, valid HTML with headings, paragraphs, a bullet list with <strong> highlights, ' +
            'and a styled call-to-action anchor button.',
          responseMimeType: 'application/json',
        },
      })
    );
    return JSON.parse(response.text);
  } catch (err) {
    console.warn('⚠️ [AI Service] Gemini copy generation failed, using heuristic fallback:', err.message);
  }

  const cleanTopic = (topic || 'Special Announcement').trim();
  return {
    subject: `Important update: ${cleanTopic}`,
    previewText: `Here is everything you need to know about our latest ${cleanTopic} release.`,
    body: `
      <h2>Hello {{first_name}},</h2>
      <p>We are thrilled to announce <strong>${cleanTopic}</strong> — designed specifically to help you save time and achieve better results.</p>
      <p>Here is what is new:</p>
      <ul>
        <li><strong>Streamlined Workflow:</strong> Get tasks done 2x faster with zero friction.</li>
        <li><strong>Real-time Telemetry:</strong> Keep track of every key event directly from your dashboard.</li>
        <li><strong>Enhanced Reliability:</strong> Built for scale, security, and enterprise peace of mind.</li>
      </ul>`
  };
}

module.exports = {
  askAI,
  generateSubjectLines,
  generateEmailCopy,
  SPAM_TRIGGER_WORDS,
};
