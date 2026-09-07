const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

test('POST /api/auth/register creates user, sets cookie, and returns token', async () => {
  const email = `test_${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Pilot',
      email,
      password: 'password123',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, email);
  assert.ok(res.body.token);
  assert.ok(res.headers['set-cookie']);
});

test('POST /api/auth/login with valid credentials signs in user', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@mailpilot.io',
      password: 'password123',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, 'admin@mailpilot.io');
  assert.ok(res.body.token);
  assert.ok(res.headers['set-cookie']);
});

test('POST /api/auth/login with nonexistent user returns specific 401 error', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'nonexistent_operator@unknown.com',
      password: 'password123',
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.ok(res.body.error.includes('No account found with this email'));
});

test('POST /api/auth/login with incorrect password returns specific 401 error', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@mailpilot.io',
      password: 'wrong_password_999',
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.ok(res.body.error.includes('Incorrect password. Please try again.'));
});

test('GET /api/auth/me returns authenticated user with valid token', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@mailpilot.io',
      password: 'password123',
    });

  const token = loginRes.body.token;

  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.success, true);
  assert.equal(meRes.body.user.email, 'admin@mailpilot.io');
  assert.ok(meRes.body.user.workspaceId);
});

test('POST /api/auth/logout clears session', async () => {
  const res = await request(app).post('/api/auth/logout');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('POST /api/auth/google rejects missing credential token', async () => {
  const res = await request(app)
    .post('/api/auth/google')
    .send({});

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/auth/google creates new user, workspace, and session for first-time Google sign-in', async () => {
  const email = `google_pilot_${Date.now()}@gmail.com`;
  const res = await request(app)
    .post('/api/auth/google')
    .send({
      credential: `demo_${email}:::Google Pilot`,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, email);
  assert.ok(res.body.user.workspaceId);
  assert.ok(res.body.token);
  assert.ok(res.headers['set-cookie']);
});

test('POST /api/auth/google authenticates returning Google user without creating duplicate accounts', async () => {
  const email = `google_returning_${Date.now()}@gmail.com`;
  const cred = `demo_${email}:::Returning Pilot`;

  const firstRes = await request(app)
    .post('/api/auth/google')
    .send({ credential: cred });
  assert.equal(firstRes.status, 200);
  const firstUserId = firstRes.body.user.id;

  const secondRes = await request(app)
    .post('/api/auth/google')
    .send({ credential: cred });
  assert.equal(secondRes.status, 200);
  assert.equal(secondRes.body.user.id, firstUserId);
});
