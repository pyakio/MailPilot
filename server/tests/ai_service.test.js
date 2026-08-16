const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateSubjectLines,
  generateEmailCopy,
  analyzeSpamRisk,
} = require('../services/ai.service');

test('AI service generates 5 subject line variations with scores and rationales', async () => {
  const results = await generateSubjectLines({
    topic: 'Instant Webhook Delivery',
    audience: 'Developers',
  });

  assert.ok(Array.isArray(results));
  assert.equal(results.length, 5);
  assert.ok(results[0].subject);
  assert.ok(results[0].score >= 80);
  assert.ok(results[0].tone);
});

test('AI service generates structured email copy', async () => {
  const result = await generateEmailCopy({
    topic: 'Version 2.0 Launch',
    audience: 'SaaS Users',
    tone: 'Professional',
  });

  assert.ok(result.subject);
  assert.ok(result.body);
  assert.ok(result.body.includes('Hello {{first_name}}'));
});

test('Spam risk auditor flags triggers and excessive punctuation', () => {
  const cleanAudit = analyzeSpamRisk({
    subject: 'Monthly product updates and release notes',
    content: 'Here are the bug fixes and performance improvements.',
  });

  assert.equal(cleanAudit.rating, 'EXCELLENT');
  assert.equal(cleanAudit.foundTriggers.length, 0);

  const spammyAudit = analyzeSpamRisk({
    subject: 'GET 100% FREE CASH BONUS NOW!!! ACT FAST',
    content: 'No risk guarantee, claim your prize today without obligation.',
  });

  assert.equal(spammyAudit.rating, 'HIGH RISK');
  assert.ok(spammyAudit.foundTriggers.length >= 2);
  assert.ok(spammyAudit.score > 50);
});
