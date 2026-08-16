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

test('GET /api/campaigns returns workspace scoped campaigns', async () => {
  const res = await request(app)
    .get('/api/campaigns')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test('POST /api/campaigns creates a new campaign in draft status', async () => {
  const res = await request(app)
    .post('/api/campaigns')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Automated Test Campaign',
      subject: 'Subject Line for Automated Testing',
      content: '<p>Hello {{first_name}}, this is a test.</p>',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Automated Test Campaign');
  assert.equal(res.body.status, 'DRAFT');
});

test('POST /api/campaigns/:id/send dispatches campaign and marks status SENT', async () => {
  // 1. Create a campaign
  const createRes = await request(app)
    .post('/api/campaigns')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Dispatch Test Campaign',
      subject: 'Special Delivery Test',
      content: '<p>Testing real delivery dispatch to contacts.</p>',
    });

  const campaignId = createRes.body.id;

  // 2. Dispatch campaign now
  const sendRes = await request(app)
    .post(`/api/campaigns/${campaignId}/send`)
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(sendRes.status, 200);
  assert.equal(sendRes.body.status, 'SENT');
  assert.ok(sendRes.body.sentCount >= 1);
  assert.ok(sendRes.body.emailProvider);
});

test('GET /api/campaigns/summary aggregates workspace totals', async () => {
  const res = await request(app)
    .get('/api/campaigns/summary')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.ok(typeof res.body.totalCampaigns === 'number');
  assert.ok(typeof res.body.emailsSent === 'number');
  assert.ok(typeof res.body.contacts === 'number');
});
