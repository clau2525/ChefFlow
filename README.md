# ChefFlow

A personal cooking app: keep your recipes, queue up what you want to cook next,
and let the ingredients land on a shopping list automatically.

Static frontend on **GitHub Pages**, data and accounts on **Supabase**. No
server of your own to run.

- **Recipes** — photos, times, servings, ingredients, steps, tags, macros
- **To Cook** — a queue of what's planned next
- **Cooking mode** — one step at a time, screen stays awake, edit as you go
- **Shopping list** — filled from the recipes you plan, quantities merged

---

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier is plenty).
2. Open **SQL Editor**, paste the whole of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it.
   That creates the three tables, the row-level security policies, and the
   `recipe-images` storage bucket.
3. Go to **Project Settings → API** and copy:
   - the **Project URL** → `VITE_SUPABASE_URL`
   - the **anon / public** key → `VITE_SUPABASE_ANON_KEY`

   Never use the `service_role` key here — it bypasses every security policy.

### Auth settings

Under **Authentication → URL Configuration**, add your site to **Redirect URLs**
so confirmation and password-reset links are allowed to come back to it:

```
https://<your-github-username>.github.io/ChefFlow/**
http://localhost:5173/**
```

Two optional switches under **Authentication → Providers → Email**:

- **Confirm email** — on by default. Leave it on, or turn it off if you'd rather
  sign up and be straight in without checking your inbox.
- To use the 6-digit code box on the sign-up screen instead of the emailed link,
  add `{{ .Token }}` to the "Confirm signup" template under
  **Authentication → Email Templates**.

**Google sign-in** is hidden unless you set `VITE_ENABLE_GOOGLE_AUTH=true`. Turn
it on only after configuring **Authentication → Providers → Google**.

## 2. Run it locally

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in the two values from step 1.
`.env.local` is gitignored and never ends up in the repo.

```bash
npm run dev
```

## 3. Publish to GitHub Pages

1. Create a repository named **ChefFlow** on GitHub and push this folder to it.
2. In the repo: **Settings → Secrets and variables → Actions → Variables tab**,
   add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENABLE_GOOGLE_AUTH` (optional, `true`/`false`)

   The **Variables** tab is the right home for these: Vite inlines them into the
   published JavaScript, so they are public the moment the site is live. What
   actually protects your data is row-level security in the database, not
   secrecy of the anon key. (The workflow accepts them from the Secrets tab too,
   in case you put them there.)
3. **Settings → Pages → Source → GitHub Actions.**
4. Push to `main`. The
   [deploy workflow](.github/workflows/deploy.yml) builds and publishes to
   `https://<your-github-username>.github.io/ChefFlow/`.

If the repo has a different name, everything still works — the workflow reads
the repo name and sets the base path from it. Just use that name in the Supabase
redirect URLs.

---

## How it's put together

```
src/api/          Supabase client, one module per table, image upload
src/lib/          AuthContext (session state), small shared helpers
src/pages/        Recipes, RecipeDetail, RecipeForm, Plan, Cooking,
                  ShoppingList, and the four auth screens
src/components/   Layout + nav, recipe editors, shadcn/ui primitives
supabase/         The SQL that defines the schema and its access rules
```

**Security model.** Everything you save belongs to your account. Each table
carries a `user_id` that defaults to the signed-in user, and every policy is
`auth.uid() = user_id` — so a request with no session matches no rows at all,
and one account can never read or write another's. Uploaded photos live in a
folder named after your user id, which is the only place your session may write.

**Routing.** The app uses `HashRouter` (URLs look like `/ChefFlow/#/plan`).
GitHub Pages has no server to rewrite deep links back to `index.html`, so a
refresh on any other path would otherwise 404. Supabase auth uses the PKCE flow
for the same reason: it returns its `?code=` in the query string rather than the
URL fragment, which the router owns.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint |
