const test = require('node:test');
const assert = require('node:assert/strict');
const { getAuthenticatedGmailClient, refreshUserTokens, createOAuth2Client } = require('../services/gmail.service');
const { encryptToken } = require('../services/crypto.service');
const { prisma } = require('../config/db');

test('createOAuth2Client creates an OAuth2Client instance', () => {
  const client = createOAuth2Client();
  assert.ok(client);
  assert.equal(typeof client.generateAuthUrl, 'function');
  assert.equal(typeof client.refreshAccessToken, 'function');
});

test('getAuthenticatedGmailClient rejects missing userId with 400', async () => {
  await assert.rejects(
    async () => {
      await getAuthenticatedGmailClient(null);
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('User ID is required'));
      return true;
    }
  );
});

test('getAuthenticatedGmailClient throws 404 if user has no connected Google account', async () => {
  await assert.rejects(
    async () => {
      await getAuthenticatedGmailClient('usr_nonexistent_999');
    },
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.ok(err.message.includes('No Google account connected'));
      return true;
    }
  );
});

test('getAuthenticatedGmailClient instantiates client and decodes encrypted tokens', async () => {
  const userId = `usr_test_${Date.now()}`;
  const rawAccessToken = 'ya29.test_access_token_12345';
  const rawRefreshToken = '1//0g_test_refresh_token_67890';

  // Create test user and linked Google Account with encrypted tokens
  await prisma.user.create({
    data: {
      id: userId,
      name: 'Gmail Test User',
      email: `${userId}@example.com`,
    },
  });

  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // Expiring in 1 hour
  await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${userId}`,
      accessToken: encryptToken(rawAccessToken),
      refreshToken: encryptToken(rawRefreshToken),
      expiresAt,
      scope: 'https://www.googleapis.com/auth/gmail.modify',
    },
  });

  const client = await getAuthenticatedGmailClient(userId);
  assert.ok(client);
  assert.equal(client.credentials.access_token, rawAccessToken);
  assert.equal(client.credentials.refresh_token, rawRefreshToken);
});

test('refreshUserTokens throws 404 if user has no refreshable account', async () => {
  await assert.rejects(
    async () => {
      await refreshUserTokens('usr_no_refresh_account');
    },
    (err) => {
      assert.equal(err.statusCode, 404);
      return true;
    }
  );
});
