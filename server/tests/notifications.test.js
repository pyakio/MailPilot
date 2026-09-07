const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

let authToken = '';

test.before(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@mailpilot.io',
      password: 'password123',
    });
  authToken = loginRes.body.token;
});

test('GET /api/notifications returns workspace notifications', async () => {
  const res = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.notifications));
  assert.ok(typeof res.body.unreadCount === 'number');
});

test('POST /api/notifications/read-all marks notifications as read', async () => {
  const res = await request(app)
    .post('/api/notifications/read-all')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});
