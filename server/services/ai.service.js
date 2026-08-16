// AI Assistant Service — MailPilot
// Multi-provider LLM adapter (OpenAI / Gemini) with intelligent rule-based fallbacks

const { OPENAI_API_KEY, GEMINI_API_KEY } = require('../config/env');

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
 * Generate subject lines with AI or fallback heuristic
 */
async function generateSubjectLines({ topic, audience = 'General Subscribers', tone = 'Engaging' }) {
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert email marketing copywriter. Return a JSON array of exactly 5 subject line variations for the given topic and audience.
              Each item must be an object with:
              - "subject": string (the subject line)
              - "tone": string ("Urgent", "Curious", "Direct", "Conversational", "Value-driven")
              - "score": number (predicted open score between 80 and 99)
              - "rationale": string (short 1-sentence explanation why it works)`,
            },
            {
              role: 'user',
              content: `Topic: ${topic}\nAudience: ${audience}\nTone: ${tone}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return content.variations || content.subject_lines || content;
    } catch (err) {
      console.warn('⚠️ [AI Service] OpenAI generation failed, using heuristic fallback:', err.message);
    }
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
 * Generate complete email copy
 */
async function generateEmailCopy({ topic, audience = 'General Subscribers', tone = 'Professional', goal = 'Product announcement' }) {
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an elite email marketer for SaaS. Generate complete email copy in JSON format with fields:
              - "subject": string
              - "previewText": string
              - "body": string (clean HTML formatted with paragraphs, bold highlights, and a call-to-action button)`,
            },
            {
              role: 'user',
              content: `Topic: ${topic}\nAudience: ${audience}\nTone: ${tone}\nGoal: ${goal}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.warn('⚠️ [AI Service] OpenAI copy generation failed, using heuristic fallback:', err.message);
    }
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
      </ul>
      <p style="margin: 28px 0;">
        <a href="https://mailpilot.io" style="background-color: #E8A33D; color: #14171C; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Explore ${cleanTopic} Now &rarr;
        </a>
      </p>
      <p>If you have any questions or feedback, simply reply directly to this email.</p>
      <p>Best regards,<br>The {{workspace_name}} Team</p>
    `.trim(),
  };
}

/**
 * Scan subject line and content for deliverability spam risks
 */
function analyzeSpamRisk({ subject = '', content = '' }) {
  const combined = `${subject} ${content}`.toLowerCase();
  const foundTriggers = [];

  for (const trigger of SPAM_TRIGGER_WORDS) {
    if (combined.includes(trigger)) {
      foundTriggers.push(trigger);
    }
  }

  // Capitalization check in subject
  const uppercaseLetters = (subject.match(/[A-Z]/g) || []).length;
  const totalLetters = (subject.match(/[a-zA-Z]/g) || []).length;
  const capsRatio = totalLetters > 0 ? uppercaseLetters / totalLetters : 0;
  const hasExcessiveCaps = capsRatio > 0.4 && subject.length > 10;

  // Excessive punctuation check
  const exclamationCount = (subject.match(/!/g) || []).length;
  const questionCount = (subject.match(/\?/g) || []).length;
  const hasExcessivePunctuation = exclamationCount > 1 || (exclamationCount + questionCount) > 2;

  // Calculate Risk Score (0 = Clean, 100 = Guaranteed Spam)
  let riskScore = 5; // Baseline
  riskScore += foundTriggers.length * 15;
  if (hasExcessiveCaps) riskScore += 25;
  if (hasExcessivePunctuation) riskScore += 20;

  riskScore = Math.min(Math.max(riskScore, 0), 100);

  let rating = 'EXCELLENT';
  let ratingColor = '#22C55E';
  if (riskScore >= 60) {
    rating = 'HIGH RISK';
    ratingColor = '#EF4444';
  } else if (riskScore >= 25) {
    rating = 'MODERATE RISK';
    ratingColor = '#F59E0B';
  }

  const suggestions = [];
  if (foundTriggers.length > 0) {
    suggestions.push(`Avoid spam trigger phrases: "${foundTriggers.slice(0, 3).join('", "')}".`);
  }
  if (hasExcessiveCaps) {
    suggestions.push('Reduce all-caps words in your subject line to avoid spam filters.');
  }
  if (hasExcessivePunctuation) {
    suggestions.push('Limit exclamation marks and question marks to a single punctuation mark.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Your content passes all standard ISP deliverability heuristics.');
  }

  return {
    score: riskScore,
    deliverabilityScore: 100 - riskScore,
    rating,
    ratingColor,
    foundTriggers: foundTriggers.slice(0, 10),
    hasExcessiveCaps,
    hasExcessivePunctuation,
    suggestions,
  };
}

module.exports = {
  generateSubjectLines,
  generateEmailCopy,
  analyzeSpamRisk,
};
