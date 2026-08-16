const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateTrackingToken,
  verifyTrackingToken,
  compileEmailHtml,
} = require('../services/email.service');

test('Tracking token HMAC generation and verification', () => {
  const cId = 'camp_123';
  const kId = 'cont_456';
  const wId = 'work_789';

  const token = generateTrackingToken(cId, kId, wId);
  assert.ok(token);
  assert.ok(token.includes('.'));

  const decoded = verifyTrackingToken(token);
  assert.equal(decoded.campaignId, cId);
  assert.equal(decoded.contactId, kId);
  assert.equal(decoded.workspaceId, wId);
});

test('Invalid tracking token is rejected', () => {
  const invalid = 'tampered_token.invalid_hash';
  const decoded = verifyTrackingToken(invalid);
  assert.equal(decoded, null);
});

test('compileEmailHtml personalizes variables and injects tracking pixel & unsubscribe footer', () => {
  const campaign = { id: 'c1', subject: 'Special Announcement' };
  const contact = { id: 'k1', email: 'alex@example.com', name: 'Alex Morgan' };
  const workspace = { id: 'w1', name: 'Acme SaaS' };
  const body = '<p>Hello {{name}}, welcome to {{workspace_name}}! Visit <a href="https://example.com/pricing">our pricing</a>.</p>';

  const compiled = compileEmailHtml({
    body,
    contact,
    campaign,
    workspace,
  });

  assert.ok(compiled.includes('Hello Alex Morgan'));
  assert.ok(compiled.includes('welcome to Acme SaaS'));
  assert.ok(compiled.includes('/api/track/open/'));
  assert.ok(compiled.includes('/api/track/click/'));
  assert.ok(compiled.includes('/unsubscribe?token='));
});
