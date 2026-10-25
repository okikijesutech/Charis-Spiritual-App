# Supabase Database & Security Guide

This directory contains the database migrations and security policies for **Charis**.

---

## 1. Migrations Overview

* [**`00001_initial_schema.sql`**](./migrations/00001_initial_schema.sql):
  * **`public.profiles`**: User profile identity linked to `auth.users(id) on delete cascade`.
  * **`public.user_settings`**: User preferences (theme, timezone, dashboard layout, reminder preferences).
  * **Automated Trigger**: `on_auth_user_created` trigger automatically provisions a profile and default settings row when a user signs up.
  * **Row Level Security (RLS)**: Enforced on all tables with strict `auth.uid() = user_id` ownership checks.

---

## 2. Applying Migrations to Supabase

### Option A: Using the Supabase Dashboard (Fastest for initial setup)
1. Navigate to your Supabase project at [database.new](https://database.new) or [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation.
3. Paste the contents of [`migrations/00001_initial_schema.sql`](./migrations/00001_initial_schema.sql) and click **Run**.
4. Confirm under **Table Editor** that `profiles` and `user_settings` appear with RLS enabled (indicated by a shield icon).

### Option B: Using the Supabase CLI
```bash
# Link your project (requires project ref from dashboard settings)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

---

## 3. Configuring Authentication & OAuth Redirects

### Local Development Redirects
1. Go to **Authentication** → **URL Configuration** in the Supabase Dashboard.
2. Set **Site URL** to:
   ```text
   http://localhost:5173
   ```
3. Add the following to **Redirect URLs**:
   ```text
   http://localhost:5173/**
   ```

### Google OAuth Setup (Optional)
1. Go to **Authentication** → **Providers** → **Google**.
2. Enable Google provider and paste your Google Cloud OAuth Client ID and Secret.
3. Ensure the Supabase Callback URL is copied into your Google Cloud Console authorized redirect URIs.
