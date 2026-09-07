const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { GMAIL_OAUTH_SCOPES, getGoogleOAuth2Client } = require('../controllers/auth.controller');

test('GMAIL_OAUTH_SCOPES contains all required Gmail permissions', () => {
  assert.ok(GMAIL_OAUTH_SCOPES.includes('https://www.googleapis.com/auth/userinfo.email'));
  assert.ok(GMAIL_OAUTH_SCOPES.includes('https://www.googleapis.com/auth/userinfo.profile'));
  assert.ok(GMAIL_OAUTH_SCOPES.includes('https://www.googleapis.com/auth/gmail.modify'));
  assert.ok(GMAIL_OAUTH_SCOPES.includes('https://www.googleapis.com/auth/gmail.send'));
});

test('getGoogleOAuth2Client initializes OAuth2Client instance', () => {
  const client = getGoogleOAuth2Client();
  assert.ok(client);
  assert.equal(typeof client.generateAuthUrl, 'function');
  assert.equal(typeof client.getToken, 'function');
});

test('GET /api/auth/google/url returns OAuth authorization URL structure', async () => {
  const res = await request(app).get('/api/auth/google/url?state=test_state');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.url);
});

test('GET /api/auth/gmail/status requires authentication', async () => {
  const res = await request(app).get('/api/auth/gmail/status');
  assert.equal(res.status, 401);
});

test('GET /api/auth/gmail/status returns connected state without exposing tokens', async () => {
  const email = `gmail_user_${Date.now()}@example.com`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Gmail Tester',
      email,
      password: 'password123',
    });

  assert.equal(regRes.status, 201);
  const token = regRes.body.token;

  const statusRes = await request(app)
    .get('/api/auth/gmail/status')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.success, true);
  assert.equal(typeof statusRes.body.connected, 'boolean');
  // Ensure sensitive tokens are NEVER present in response
  assert.equal(statusRes.body.accessToken, undefined);
  assert.equal(statusRes.body.refreshToken, undefined);
});

test('POST /api/auth/gmail/disconnect requires authentication and executes cleanly', async () => {
  const email = `disconnect_${Date.now()}@example.com`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Disconnect User',
      email,
      password: 'password123',
    });

  const token = regRes.body.token;

  const disconnRes = await request(app)
    .post('/api/auth/gmail/disconnect')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(disconnRes.status, 200);
  assert.equal(disconnRes.body.success, true);
});
