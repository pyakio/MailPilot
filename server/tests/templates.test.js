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

test('GET /api/templates returns workspace templates', async () => {
  const res = await request(app)
    .get('/api/templates')
    .set('Authorization', `Bearer ${authToken}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test('POST /api/templates creates a template with sanitization and thumbnail', async () => {
  const res = await request(app)
    .post('/api/templates')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Automated Test Newsletter',
      subject: 'Monthly Digest',
      body: '<p>Welcome <script>alert("xss")</script>to our digest.</p>',
      category: 'newsletter',
      thumbnail: '/templates/tmpl_01.svg',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'Automated Test Newsletter');
  // Verify HTML sanitization stripped script tag
  assert.ok(!res.body.body.includes('<script>'));
  assert.ok(res.body.body.includes('<p>Welcome to our digest.</p>'));
});

test('PUT /api/templates/:id updates existing template', async () => {
  const createRes = await request(app)
    .post('/api/templates')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Before Template Edit',
      body: '<p>Initial content</p>',
    });

  const templateId = createRes.body.id;

  const updateRes = await request(app)
    .put(`/api/templates/${templateId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'After Template Edit',
      body: '<p>Updated content</p>',
    });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.title, 'After Template Edit');
});
