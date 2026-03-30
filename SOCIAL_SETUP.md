# Live Social Leaderboard Setup (PWA)

This app now supports a live leaderboard via Supabase when env vars are configured.

## 1) Create Supabase project

1. Go to Supabase dashboard and create a project.
2. Open SQL editor and run:

```sql
create table if not exists public.leaderboard_profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  display_name text not null default 'You',
  referral_code text not null unique,
  referred_by text null,
  friend_codes text[] not null default '{}',
  xp integer not null default 0,
  all_time_reps integer not null default 0,
  weekly_reps integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);
```

For quick prototype testing, disable RLS on this table in Supabase UI.

## 2) Configure env vars

1. Copy `.env.example` to `.env.local`
2. Set values from Supabase project settings:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

## 3) Run app

```bash
npm run dev
```

Open `Ranks`:
- You should see no "backend not configured" notice.
- Your profile syncs automatically when reps/xp/social changes.
- Friends tab filters using friend codes in your profile.

## 4) Deploy (Vercel)

Add the same two env vars in Vercel project settings, then redeploy.

