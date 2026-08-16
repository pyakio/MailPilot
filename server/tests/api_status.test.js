const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

test('GET /api/status returns 200 OK with service info', async () => {
  const res = await request(app).get('/api/status');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.service, 'MailPilot API');
});

test('GET /api/unknown-route returns 404 Not Found', async () => {
  const res = await request(app).get('/api/unknown-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
