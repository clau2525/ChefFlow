# AGENTS.md

## Project Context

ChefFlow is a React + Vite single-page app. The frontend is published as a
static site on GitHub Pages; all data, files and accounts live in Supabase.
There is no backend of our own.

Start with `README.md` for setup, environment variables and the deploy flow.

## Key Files

- `src/api/supabaseClient.js`: the single Supabase client, plus `authRedirectTo()`.
- `src/api/{recipes,cookPlans,shoppingItems}.js`: one module per table. All
  database access goes through these — pages never call `supabase.from()` directly.
- `src/api/storage.js`: recipe photo uploads.
- `src/lib/AuthContext.jsx`: session state; `useAuth()` is the only way to read it.
- `supabase/migrations/0001_init.sql`: schema, RLS policies, storage bucket.
- `.github/workflows/deploy.yml`: build + publish to GitHub Pages.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- `npm run dev` for local work; `npm run build` and `npm run lint` before finishing.
- Schema changes go in a **new** numbered file under `supabase/migrations/`, and
  have to be run by hand in the Supabase SQL editor — nothing applies them
  automatically.
- Every table has a `user_id` defaulting to `auth.uid()` and an
  `auth.uid() = user_id` policy. Adding a table means adding both, plus
  `enable row level security`. Never add an `anon` write policy.
- The app is on `HashRouter` because GitHub Pages cannot rewrite deep links.
  Don't switch to `BrowserRouter` without solving that first. Supabase auth is
  pinned to the PKCE flow for the same reason (the implicit flow returns its
  session in the URL fragment, which the router owns).
- `VITE_*` variables are inlined into the published bundle and are therefore
  public. Anything that must stay secret does not belong in this codebase.
