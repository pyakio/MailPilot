// AI Controller — MailPilot
// Endpoints for subject line generation, copy composition, and spam risk auditing

const aiService = require('../services/ai.service');

async function getSubjectLines(req, res, next) {
  try {
    const { topic, audience, tone } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required for subject line generation.' });
    }

    const suggestions = await aiService.generateSubjectLines({ topic, audience, tone });
    res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
}

async function getEmailCopy(req, res, next) {
  try {
    const { topic, audience, tone, goal } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required for email copy generation.' });
    }

    const copy = await aiService.generateEmailCopy({ topic, audience, tone, goal });
    res.json({ success: true, copy });
  } catch (err) {
    next(err);
  }
}

async function checkSpamRisk(req, res, next) {
  try {
    const { subject, content } = req.body;
    const analysis = aiService.analyzeSpamRisk({ subject: subject || '', content: content || '' });
    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
}

async function assistantChat(req, res, next) {
  try {
    const { messages, provider } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const reply = await aiService.askAI({ messages, provider });
    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSubjectLines,
  getEmailCopy,
  checkSpamRisk,
  assistantChat,
};

