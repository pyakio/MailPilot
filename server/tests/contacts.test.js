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

test('GET /api/contacts returns workspace scoped subscriber audience', async () => {
  const res = await request(app)
    .get('/api/contacts')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test('POST /api/contacts creates a new subscriber contact', async () => {
  const uniqueEmail = `test_subscriber_${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/contacts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      email: uniqueEmail,
      name: 'Test Subscriber',
      tags: ['Engineering', 'VIP'],
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.email, uniqueEmail);
  assert.equal(res.body.subscribed, true);
  assert.deepEqual(res.body.tags, ['Engineering', 'VIP']);
});

test('POST /api/contacts rejects duplicate email in same workspace with 409', async () => {
  const duplicateEmail = `dupe_${Date.now()}@example.com`;
  
  // First creation
  await request(app)
    .post('/api/contacts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ email: duplicateEmail, name: 'Original' });

  // Duplicate attempt
  const res = await request(app)
    .post('/api/contacts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ email: duplicateEmail, name: 'Duplicate' });

  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
});

test('PUT /api/contacts/:id updates subscriber details', async () => {
  const createRes = await request(app)
    .post('/api/contacts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ email: `update_${Date.now()}@example.com`, name: 'Before Update' });

  const contactId = createRes.body.id;

  const updateRes = await request(app)
    .put(`/api/contacts/${contactId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'After Update', tags: ['UpdatedTag'] });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.name, 'After Update');
});

test('POST /api/contacts/import bulk imports CSV subscriber rows', async () => {
  const t = Date.now();
  const rows = [
    { email: `csv1_${t}@import.com`, name: 'CSV User 1', tags: 'Batch1,Beta' },
    { email: `csv2_${t}@import.com`, name: 'CSV User 2', tags: ['Batch1'] },
  ];

  const res = await request(app)
    .post('/api/contacts/import')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ rows });

  assert.equal(res.status, 200);
  assert.equal(res.body.total, 2);
  assert.equal(res.body.importedCount, 2);
  assert.equal(res.body.skippedCount, 0);
});
