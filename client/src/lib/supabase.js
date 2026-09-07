// Supabase Client — MailPilot Frontend
// Use this for client-side auth, realtime subscriptions, and storage.
// The anon key is safe to expose — Supabase Row Level Security (RLS) restricts access.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in client/.env.\n' +
    'Direct Supabase features (realtime, storage) will be unavailable.\n' +
    'Auth via the Express backend (/api/auth/*) will still work.'
  );
}

/**
 * Supabase browser client.
 * Used for:
 *  - Supabase Auth sessions (Google OAuth popups, magic links)
 *  - Realtime subscriptions
 *  - Storage file uploads
 *
 * All database queries go through the Express backend (/api/*) with Prisma.
 */
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Store session in localStorage for persistence across page reloads
        persistSession: true,
        // Automatically refresh tokens before expiry
        autoRefreshToken: true,
        // Detect auth events in popups (needed for Google OAuth popup flow)
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;
