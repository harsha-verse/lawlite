# Deploy LAWLITE to Vercel

This app is a **Vite + React SPA**. Vercel hosts the static frontend. **Supabase** (database, auth, storage, and Edge Functions for NyayaBot chat and document generation) stays on Supabase and must be configured separately.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| [Node.js](https://nodejs.org/) 18+ | Local builds only; Vercel uses Node 18+ by default |
| [Git](https://git-scm.com/) | Push code to GitHub, GitLab, or Bitbucket |
| [Vercel account](https://vercel.com/) | Free tier works for the frontend |
| [Supabase project](https://supabase.com/) | Same project as in your `.env` (migrations in `supabase/migrations/`) |
| Supabase CLI (optional) | Only if you deploy or update Edge Functions yourself |

## 1. Push code to Git

Do **not** commit `.env` (it is in `.gitignore`). Use `.env.example` as reference.

```sh
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import project on Vercel

1. Open [vercel.com/new](https://vercel.com/new).
2. Import your Git repository.
3. Vercel should detect **Vite** automatically. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. These match `vercel.json` in the repo root.

## 3. Environment variables (required)

In Vercel: **Project → Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** public key |

Apply to **Production**, **Preview**, and **Development**.

Copy values from [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings → API**.

Redeploy after adding or changing variables (Vite bakes `VITE_*` vars in at build time).

## 4. Supabase Auth (required for login)

Production URL: **https://lawlite-khaki.vercel.app**

In Supabase: **Authentication → URL Configuration** (or run `npx supabase config push` after `supabase login`)

- **Site URL:** `https://lawlite-khaki.vercel.app`
- **Redirect URLs:** add:
  - `https://lawlite-khaki.vercel.app/**`
  - `https://lawlite-harsha-verses-projects.vercel.app/**`
  - `https://lawlite-git-main-harsha-verses-projects.vercel.app/**`
  - `http://localhost:8080/**` (local dev)

These values are also defined in [`supabase/config.toml`](supabase/config.toml) under `[auth]`.

Google sign-in uses `window.location.origin` as `redirect_uri`. Ensure that origin is allowed in your auth provider / Lovable cloud auth settings if you use Google OAuth.

## 5. Supabase Edge Functions (required for AI chat & documents)

Chat (`nyaya-chat`) and document generation (`generate-document`) run on **Supabase Edge Functions**, not on Vercel.

Deploy from the project root (with [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project):

```sh
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy nyaya-chat
npx supabase functions deploy generate-document
npx supabase functions deploy match-lawyers
```

Set secrets in Supabase (Dashboard → **Edge Functions → Secrets** or CLI):

| Secret | Used by |
|--------|---------|
| `LOVABLE_API_KEY` | `nyaya-chat`, `generate-document` (AI gateway) |
| `SUPABASE_URL` | Functions (often auto-injected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions that need admin access |

Without deployed functions and `LOVABLE_API_KEY`, the UI will load but chat and AI document generation will fail.

## 6. Database migrations

If the Supabase project is new, apply migrations:

```sh
npx supabase db push
```

Or run SQL from `supabase/migrations/` in the Supabase SQL editor.

## 7. Deploy

- **Automatic:** every push to `main` triggers a production deploy (default).
- **CLI:** `npx vercel` (preview) or `npx vercel --prod` (production).

## 8. Verify

1. Open your Vercel URL — login page loads.
2. Sign up / log in with email — confirms Supabase Auth + Site URL.
3. Open NyayaBot chat — confirms `nyaya-chat` function + `LOVABLE_API_KEY`.
4. Try **Generate document** — confirms `generate-document` function.
5. Refresh on a deep link (e.g. `/dashboard`) — confirms SPA rewrites in `vercel.json`.

## Custom domain

Vercel: **Project → Settings → Domains** → add your domain.

Then update Supabase **Site URL** and **Redirect URLs** to use the custom domain instead of `*.vercel.app`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page or “Invalid API key” | Set `VITE_SUPABASE_*` in Vercel and redeploy |
| 404 on refresh for `/dashboard` etc. | Ensure `vercel.json` rewrites are committed |
| Auth works locally, not on Vercel | Add Vercel URL to Supabase redirect URLs |
| Chat / documents fail with 500 | Deploy Edge Functions; set `LOVABLE_API_KEY` in Supabase |
| Google login fails | Allow your Vercel origin in OAuth redirect settings |

## What Vercel does *not* host

- PostgreSQL database
- Supabase Auth server
- Edge Functions (`supabase/functions/`)
- File storage buckets

Keep using the same Supabase project for local dev and production; only the frontend origin changes.
