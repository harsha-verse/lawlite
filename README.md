# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/53d05699-7d25-4217-ac61-f1d3535f5211

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/53d05699-7d25-4217-ac61-f1d3535f5211) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Vercel (recommended)

1. Copy `.env.example` to `.env` for local dev and fill in Supabase values.
2. Push the repo to GitHub (do not commit `.env`).
3. Import the repo on [Vercel](https://vercel.com/new).
4. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy. Configure Supabase Auth URLs and Edge Functions as described in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

Full checklist: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Lovable

You can also publish via [Lovable](https://lovable.dev/projects/53d05699-7d25-4217-ac61-f1d3535f5211) → Share → Publish.

## Custom domain

- **Vercel:** Project → Settings → Domains, then update Supabase redirect URLs (see [DEPLOYMENT.md](./DEPLOYMENT.md)).
- **Lovable:** Project → Settings → Domains → [custom domain guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide).
