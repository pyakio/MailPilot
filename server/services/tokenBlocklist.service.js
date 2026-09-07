// Token Blocklist Service — MailPilot
// In-process JWT revocation store keyed by JTI (JWT ID).
// On logout, the token's jti is added here and rejected by authMiddleware.
//
// Limitations:
//   - Resets on server restart. Previously-revoked tokens expire naturally within
//     their original 7-day TTL window after a restart.
//   - Single-instance only. For multi-instance deployments, replace the Map with
//     Redis SETNX/SISMEMBER — one-file swap, same interface.
//
// Automatic cleanup runs every hour to prevent unbounded Map growth.

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Map<jti: string, expiresAtMs: number>
const blocklist = new Map();

/**
 * Add a JTI to the blocklist.
 * @param {string} jti  - The JWT ID claim from the token payload.
 * @param {number} exp  - The JWT exp claim (Unix timestamp in seconds).
 */
function revokeToken(jti, exp) {
  if (!jti) return;
  const expiresAtMs = exp ? exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
  blocklist.set(jti, expiresAtMs);
}

/**
 * Returns true if the given JTI has been explicitly revoked and has not expired.
 * @param {string} jti
 * @returns {boolean}
 */
function isRevoked(jti) {
  if (!jti || !blocklist.has(jti)) return false;
  const expiresAtMs = blocklist.get(jti);
  // If the token has naturally expired, it's no longer a threat — clean up
  if (Date.now() > expiresAtMs) {
    blocklist.delete(jti);
    return false;
  }
  return true;
}

/**
 * Remove all expired JTIs from the blocklist.
 * Called automatically every hour.
 */
function pruneExpiredTokens() {
  const now = Date.now();
  let pruned = 0;
  for (const [jti, expiresAtMs] of blocklist.entries()) {
    if (now > expiresAtMs) {
      blocklist.delete(jti);
      pruned++;
    }
  }
  if (pruned > 0) {
    console.log(`🧹 [TokenBlocklist] Pruned ${pruned} expired revoked token(s). Active blocklist size: ${blocklist.size}`);
  }
}

// Start periodic cleanup
const cleanupTimer = setInterval(pruneExpiredTokens, CLEANUP_INTERVAL_MS);
// Allow Node.js process to exit cleanly without waiting for this timer
if (cleanupTimer.unref) cleanupTimer.unref();

module.exports = { revokeToken, isRevoked, pruneExpiredTokens };
