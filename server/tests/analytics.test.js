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

test('GET /api/analytics returns complete telemetry data with time series and per-campaign metrics', async () => {
  const res = await request(app)
    .get('/api/analytics')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.ok(typeof res.body.totalCampaigns === 'number');
  assert.ok(typeof res.body.totalContacts === 'number');
  assert.ok(typeof res.body.openRate === 'number');
  assert.ok(typeof res.body.clickRate === 'number');
  assert.ok(Array.isArray(res.body.perCampaign));
  assert.ok(Array.isArray(res.body.openTrend));
  assert.ok(Array.isArray(res.body.engagementTrend));
  assert.ok(Array.isArray(res.body.deliveryBreakdown));

  // Verify time-series structure
  assert.equal(res.body.engagementTrend.length, 7);
  assert.ok(res.body.engagementTrend[0].date);
  assert.ok(typeof res.body.engagementTrend[0].Opens === 'number');
  assert.ok(typeof res.body.engagementTrend[0].Clicks === 'number');
});
