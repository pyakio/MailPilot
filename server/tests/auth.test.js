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
