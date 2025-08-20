## Database migration (profiles additions)

Add these columns to `public.profiles`:

```sql
alter table public.profiles add column if not exists subscription_format text;
alter table public.profiles add column if not exists subscription_quality text;
alter table public.profiles add column if not exists included_poster_selected_url text;

create table if not exists public.pending_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_ciphertext text not null,
  password_iv text not null,
  created_at timestamp with time zone default now()
);

alter table public.pending_signups enable row level security;
create policy "allow anon insert pending_signups" on public.pending_signups for insert to anon with check (true);
-- No select/update/delete for anon; service role bypasses RLS

-- Add secret key for encryption in Edge Functions
-- SIGNUP_ENC_KEY: 32 bytes base64 (e.g., `openssl rand -base64 32`)
```

Deploy updated Edge Functions:

- `supabase/functions/create-checkout-session`
- `supabase/functions/stripe-webhook`

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fb709933-c052-4507-9e69-61a36c8641bf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fb709933-c052-4507-9e69-61a36c8641bf) and start prompting.

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

Simply open [Lovable](https://lovable.dev/projects/fb709933-c052-4507-9e69-61a36c8641bf) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
