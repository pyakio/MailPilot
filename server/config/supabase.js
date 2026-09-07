// Supabase Admin Client — MailPilot Server
// Used for server-side auth operations (email signup, Google OAuth, password resets)
// Uses the service role key — NEVER expose this to the client

const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = require('./env');

let supabaseAdmin = null;
let supabasePublic = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  // Admin client — full access, bypasses RLS. Server-only.
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  // Public client — respects RLS. For non-privileged queries.
  supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get the Supabase admin client (service role).
 * Throws if not configured.
 */
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
  }
  return supabaseAdmin;
}

/**
 * Get the Supabase public client (anon key).
 */
function getSupabasePublic() {
  if (!supabasePublic) {
    throw new Error('Supabase public client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env');
  }
  return supabasePublic;
}

module.exports = {
  supabaseAdmin,
  supabasePublic,
  getSupabaseAdmin,
  getSupabasePublic,
};
