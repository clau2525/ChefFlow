import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Google sign-in only works once the provider is configured in the Supabase
// dashboard (Authentication -> Providers -> Google). Off by default so the
// button never appears next to a provider that would reject it.
export const GOOGLE_AUTH_ENABLED =
  String(import.meta.env.VITE_ENABLE_GOOGLE_AUTH).toLowerCase() === 'true';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env.local and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Supabase dashboard → Project Settings → API).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // PKCE, not implicit. The implicit flow hands the session back in the URL
    // *hash*, which HashRouter owns (see src/App.jsx) — the router would eat it
    // before supabase-js ever looked. PKCE uses a `?code=` query param instead,
    // which sits in front of the fragment and leaves routing alone.
    flowType: 'pkce',
    detectSessionInUrl: true,
    storageKey: 'chefflow.auth',
  },
});

// Where Supabase sends the browser back to after a confirmation, recovery or
// OAuth round-trip. BASE_URL is "/" in dev and "/<repo>/" on GitHub Pages.
// Supabase appends its `?code=` before the fragment, so the hash route survives.
export function authRedirectTo(hashPath = '/') {
  return `${window.location.origin}${import.meta.env.BASE_URL}#${hashPath}`;
}
