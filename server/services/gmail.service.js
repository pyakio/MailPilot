// Gmail Service — MailPilot
// Manages authenticated Gmail API clients and automatic OAuth token refresh

const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = require('../config/env');
const { prisma, ensureDbConnected } = require('../config/db');
const { encryptToken, decryptToken } = require('./crypto.service');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Factory for Google OAuth2Client
 */
function createOAuth2Client() {
  return new OAuth2Client(
    GOOGLE_CLIENT_ID || undefined,
    GOOGLE_CLIENT_SECRET || undefined,
    GOOGLE_CALLBACK_URL || undefined
  );
}

/**
 * Retrieves the user's connected Google account, refreshes expired tokens,
 * and returns an authenticated OAuth2Client instance ready for Gmail API requests.
 */
async function getAuthenticatedGmailClient(userId) {
  ensureDbConnected();

  if (!userId) {
    throw new ApiError(400, 'User ID is required to get authenticated Gmail client.');
  }

  // 1. Fetch user's Google Account record
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (!account) {
    throw new ApiError(404, 'No Google account connected. Please connect your Gmail account.');
  }

  const rawRefreshToken = account.refreshToken ? decryptToken(account.refreshToken) : null;
  const rawAccessToken = account.accessToken ? decryptToken(account.accessToken) : null;

  if (!rawRefreshToken && !rawAccessToken) {
    throw new ApiError(401, 'No Gmail access or refresh tokens found for this account.');
  }

  const oauth2Client = createOAuth2Client();

  // Set current credentials
  oauth2Client.setCredentials({
    access_token: rawAccessToken || undefined,
    refresh_token: rawRefreshToken || undefined,
    expiry_date: account.expiresAt ? account.expiresAt * 1000 : undefined,
  });

  // 2. Setup automatic token listener to persist newly issued tokens
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      const updateData = {};
      if (newTokens.access_token) {
        updateData.accessToken = encryptToken(newTokens.access_token);
      }
      if (newTokens.refresh_token) {
        updateData.refreshToken = encryptToken(newTokens.refresh_token);
      }
      if (newTokens.expiry_date) {
        updateData.expiresAt = Math.floor(newTokens.expiry_date / 1000);
      }
      if (newTokens.id_token) {
        updateData.idToken = newTokens.id_token;
      }
      if (newTokens.scope) {
        updateData.scope = newTokens.scope;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.account.update({
          where: { id: account.id },
          data: updateData,
        });
      }
    } catch (err) {
      console.error('⚠️ [Gmail Service] Failed to persist refreshed tokens:', err.message);
    }
  });

  // 3. Proactively check if access token is expired or expiring in next 5 minutes (300s)
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const isExpiringSoon = !account.expiresAt || (account.expiresAt - nowInSeconds) < 300;

  if (isExpiringSoon && rawRefreshToken) {
    try {
      const refreshRes = await oauth2Client.refreshAccessToken();
      const refreshedTokens = refreshRes.credentials;

      // Update database record immediately
      const newExpiresAt = refreshedTokens.expiry_date ? Math.floor(refreshedTokens.expiry_date / 1000) : null;
      const updateData = {
        accessToken: encryptToken(refreshedTokens.access_token),
        expiresAt: newExpiresAt,
      };
      if (refreshedTokens.refresh_token) {
        updateData.refreshToken = encryptToken(refreshedTokens.refresh_token);
      }

      await prisma.account.update({
        where: { id: account.id },
        data: updateData,
      });

      oauth2Client.setCredentials(refreshedTokens);
    } catch (refreshErr) {
      console.warn('⚠️ [Gmail Service] Proactive token refresh info:', refreshErr.message);
      if (refreshErr.message.includes('invalid_grant') || refreshErr.message.includes('revoked')) {
        throw new ApiError(401, 'Gmail authorization expired or was revoked. Please reconnect your Gmail account.');
      }
      if (!rawAccessToken || (account.expiresAt && account.expiresAt <= nowInSeconds)) {
        throw new ApiError(401, 'Unable to refresh Gmail access token. Please reconnect your account.');
      }
    }
  }

  return oauth2Client;
}

/**
 * Explicitly forces a token refresh for a user's Google account
 */
async function refreshUserTokens(userId) {
  ensureDbConnected();
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account || !account.refreshToken) {
    throw new ApiError(404, 'No refreshable Google account found for user.');
  }

  const rawRefreshToken = decryptToken(account.refreshToken);
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: rawRefreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();
  const expiresAt = credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null;

  const updateData = {
    accessToken: encryptToken(credentials.access_token),
    expiresAt,
  };
  if (credentials.refresh_token) {
    updateData.refreshToken = encryptToken(credentials.refresh_token);
  }

  await prisma.account.update({
    where: { id: account.id },
    data: updateData,
  });

  return {
    success: true,
    expiresAt,
    tokenType: credentials.token_type || 'Bearer',
  };
}

module.exports = {
  createOAuth2Client,
  getAuthenticatedGmailClient,
  refreshUserTokens,
};
