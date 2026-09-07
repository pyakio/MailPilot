const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { askAI } = require('../services/ai.service');

test('askAI throws error for unknown provider', async () => {
  await assert.rejects(
    async () => {
      await askAI({ messages: [{ role: 'user', content: 'hello' }], provider: 'unsupported-llm' });
    },
    {
      message: /Unknown AI provider/,
    }
  );
});

test('askAI handles missing API keys gracefully', async () => {
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    await assert.rejects(
      async () => {
        await askAI({ messages: [{ role: 'user', content: 'hello' }], provider: 'openai' });
      },
      {
        message: /OpenAI API key is missing/,
      }
    );

    await assert.rejects(
      async () => {
        await askAI({ messages: [{ role: 'user', content: 'hello' }], provider: 'gemini' });
      },
      {
        message: /Gemini API key is missing/,
      }
    );
  } finally {
    if (originalOpenAIKey) process.env.OPENAI_API_KEY = originalOpenAIKey;
    if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
  }
});

test('services/ai.service exports all expected functions', () => {
  assert.equal(typeof askAI, 'function');
});

test('POST /api/ai/assistant rejects unauthenticated requests', async () => {
  const res = await request(app)
    .post('/api/ai/assistant')
    .send({ messages: [{ role: 'user', content: 'hello' }] });

  assert.equal(res.status, 401);
});

test('POST /api/ai/assistant validates messages array for authenticated users', async () => {
  const testToken = jwt.sign({ id: 'user-123', email: 'test@mailpilot.io' }, JWT_SECRET);

  const res = await request(app)
    .post('/api/ai/assistant')
    .set('Authorization', `Bearer ${testToken}`)
    .send({ messages: 'not-an-array' });

  assert.equal(res.status, 400);
  assert.match(res.body.error, /messages array is required/i);
});
