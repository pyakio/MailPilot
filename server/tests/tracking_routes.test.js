const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { generateTrackingToken } = require('../services/email.service');

test('GET /api/track/open/:token returns 1x1 GIF with no-cache headers', async () => {
  const token = generateTrackingToken('c_test', 'k_test', 'w_test');
  const res = await request(app).get(`/api/track/open/${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'image/gif');
  assert.ok(res.headers['cache-control'].includes('no-store'));
  assert.ok(res.body.length > 0);
});

test('GET /api/track/click/:token?url=... redirects recipient to destination with valid token', async () => {
  const token = generateTrackingToken('c_test', 'k_test', 'w_test');
  const target = 'https://mailpilot.io/pricing';
  const res = await request(app).get(`/api/track/click/${token}?url=${encodeURIComponent(target)}`);

  assert.equal(res.status, 302);
  assert.equal(res.headers.location, target);
});

test('GET /api/track/click/:token rejects invalid token with 400 and does not redirect', async () => {
  const invalidToken = 'fake_tampered_token.123456';
  const evilTarget = 'https://phishing-site.example.com';
  const res = await request(app).get(`/api/track/click/${invalidToken}?url=${encodeURIComponent(evilTarget)}`);

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.headers.location, undefined);
});

test('GET /api/track/click/:token rejects missing or malformed url with 400', async () => {
  const token = generateTrackingToken('c_test', 'k_test', 'w_test');

  const resMissing = await request(app).get(`/api/track/click/${token}`);
  assert.equal(resMissing.status, 400);
  assert.equal(resMissing.body.success, false);

  const resMalformed = await request(app).get(`/api/track/click/${token}?url=javascript:alert(1)`);
  assert.equal(resMalformed.status, 400);
  assert.equal(resMalformed.body.success, false);
});

test('POST /api/unsubscribe/:token validates token', async () => {
  const invalidToken = 'invalid_token';
  const res = await request(app).post(`/api/unsubscribe/${invalidToken}`);

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});
