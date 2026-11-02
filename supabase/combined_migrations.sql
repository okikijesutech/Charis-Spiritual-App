-- ==============================================================================
-- Charis Complete Database Migration Setup (00001 - 00006)
-- Run this script in your Supabase Project -> SQL Editor to initialize all tables.
-- ==============================================================================

-- >>> START FILE: 00001_initial_schema.sql <<<
-- ==============================================================================
-- Charis PWA — Migration 00001: Initial Schema, Profiles, Settings & RLS
-- ==============================================================================
-- Designed per specs in docs/DATA-MODEL.md and docs/SECURITY.md
-- All tables enforce Row Level Security (RLS) linked to auth.users.
-- ==============================================================================

-- 1. Helper Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Private Identity per PRD FR-01 & DATA-MODEL.md)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for profiles.updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. User Settings Table (Appearance, Timezone & Layout Preferences)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  locale TEXT NOT NULL DEFAULT 'en',
  featured_reading_plan_id UUID NULL,
  dashboard_layout JSONB NOT NULL DEFAULT '{"widgets": ["featured_reading", "daily_verse", "fasting", "recent_activity"]}'::jsonb,
  reminder_preferences JSONB NOT NULL DEFAULT '{"enabled": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for user_settings.updated_at
DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. Automatic Profile & Settings Creation on New User Registration
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- Extract display name from OAuth metadata or fallback to email username
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- 1. Create Profile row
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create User Settings row
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Enforcement
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- User Settings RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;
CREATE POLICY "user_settings_delete_own" ON public.user_settings
  FOR DELETE
  USING (auth.uid() = user_id);


-- >>> START FILE: 00002_prayer_and_receipts.sql <<<
-- ==============================================================================
-- Charis PWA — Migration 00002: Prayer Entries & Sync Receipts
-- ==============================================================================
-- Enforces Row Level Security (RLS) linked strictly to auth.users.
-- Supports client-generated UUIDs, tombstones, and idempotency receipts.
-- Per docs/DATA-MODEL.md and docs/SYNC-PROTOCOL.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Prayer Entries Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prayer_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NULL,
  body TEXT NOT NULL,
  entry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] NOT NULL DEFAULT '{}',
  scripture_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_answered BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at TIMESTAMPTZ NULL,
  answered_note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Trigger for prayer_entries.updated_at
DROP TRIGGER IF EXISTS set_prayer_entries_updated_at ON public.prayer_entries;
CREATE TRIGGER set_prayer_entries_updated_at
  BEFORE UPDATE ON public.prayer_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on prayer_entries
ALTER TABLE public.prayer_entries ENABLE ROW LEVEL SECURITY;

-- Prayer Entries RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "prayer_entries_select_own" ON public.prayer_entries;
CREATE POLICY "prayer_entries_select_own" ON public.prayer_entries
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "prayer_entries_insert_own" ON public.prayer_entries;
CREATE POLICY "prayer_entries_insert_own" ON public.prayer_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "prayer_entries_update_own" ON public.prayer_entries;
CREATE POLICY "prayer_entries_update_own" ON public.prayer_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "prayer_entries_delete_own" ON public.prayer_entries;
CREATE POLICY "prayer_entries_delete_own" ON public.prayer_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prayer_entries_user_id ON public.prayer_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_entries_entry_at ON public.prayer_entries(user_id, entry_at DESC);

-- ------------------------------------------------------------------------------
-- 2. Sync Receipts Table (Server Idempotency Store)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sync_receipts (
  operation_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  server_version INTEGER NOT NULL DEFAULT 1,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on sync_receipts
ALTER TABLE public.sync_receipts ENABLE ROW LEVEL SECURITY;

-- Sync Receipts RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "sync_receipts_select_own" ON public.sync_receipts;
CREATE POLICY "sync_receipts_select_own" ON public.sync_receipts
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sync_receipts_insert_own" ON public.sync_receipts;
CREATE POLICY "sync_receipts_insert_own" ON public.sync_receipts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sync_receipts_delete_own" ON public.sync_receipts;
CREATE POLICY "sync_receipts_delete_own" ON public.sync_receipts
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sync_receipts_user_applied ON public.sync_receipts(user_id, applied_at DESC);


-- >>> START FILE: 00003_study_entries.sql <<<
-- ==============================================================================
-- Charis PWA — Migration 00003: Study Entries Table & RLS Policies
-- ==============================================================================
-- Enforces Row Level Security (RLS) linked strictly to auth.users.
-- Supports client-generated UUIDs, tombstones, and inductive study fields.
-- Per docs/DATA-MODEL.md and docs/SECURITY.md
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.study_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NULL,
  body TEXT NULL,
  passage_ref JSONB NULL,
  observations TEXT NULL,
  questions_context TEXT NULL,
  interpretation TEXT NULL,
  application TEXT NULL,
  notes TEXT NULL,
  cross_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Trigger for study_entries.updated_at
DROP TRIGGER IF EXISTS set_study_entries_updated_at ON public.study_entries;
CREATE TRIGGER set_study_entries_updated_at
  BEFORE UPDATE ON public.study_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on study_entries
ALTER TABLE public.study_entries ENABLE ROW LEVEL SECURITY;

-- Study Entries RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "study_entries_select_own" ON public.study_entries;
CREATE POLICY "study_entries_select_own" ON public.study_entries
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_entries_insert_own" ON public.study_entries;
CREATE POLICY "study_entries_insert_own" ON public.study_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_entries_update_own" ON public.study_entries;
CREATE POLICY "study_entries_update_own" ON public.study_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_entries_delete_own" ON public.study_entries;
CREATE POLICY "study_entries_delete_own" ON public.study_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_study_entries_user_id ON public.study_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_study_entries_updated_at ON public.study_entries(user_id, updated_at DESC);


-- >>> START FILE: 00004_activity_tracking.sql <<<
-- ==============================================================================
-- Charis PWA — Migration 00004: Activity Types & Activity Logs Table & RLS
-- ==============================================================================
-- Enforces Row Level Security (RLS) linked strictly to auth.users.
-- Supports client-generated UUIDs, multiple sessions per day, and tombstones.
-- Per docs/DATA-MODEL.md and docs/SECURITY.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Activity Types Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_types (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Trigger for activity_types.updated_at
DROP TRIGGER IF EXISTS set_activity_types_updated_at ON public.activity_types;
CREATE TRIGGER set_activity_types_updated_at
  BEFORE UPDATE ON public.activity_types
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on activity_types
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Activity Types RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "activity_types_select_own" ON public.activity_types;
CREATE POLICY "activity_types_select_own" ON public.activity_types
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_types_insert_own" ON public.activity_types;
CREATE POLICY "activity_types_insert_own" ON public.activity_types
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_types_update_own" ON public.activity_types;
CREATE POLICY "activity_types_update_own" ON public.activity_types
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_types_delete_own" ON public.activity_types;
CREATE POLICY "activity_types_delete_own" ON public.activity_types
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_types_user_id ON public.activity_types(user_id);

-- ------------------------------------------------------------------------------
-- 2. Activity Logs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_id UUID NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER NULL CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Trigger for activity_logs.updated_at
DROP TRIGGER IF EXISTS set_activity_logs_updated_at ON public.activity_logs;
CREATE TRIGGER set_activity_logs_updated_at
  BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Activity Logs RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "activity_logs_select_own" ON public.activity_logs;
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_logs_insert_own" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_own" ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_logs_update_own" ON public.activity_logs;
CREATE POLICY "activity_logs_update_own" ON public.activity_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_logs_delete_own" ON public.activity_logs;
CREATE POLICY "activity_logs_delete_own" ON public.activity_logs
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_started ON public.activity_logs(user_id, started_at DESC);


-- >>> START FILE: 00005_reading_plans.sql <<<
-- ==============================================================================
-- Charis PWA — Migration 00005: Reading Plans & Assignments Table & RLS
-- ==============================================================================
-- Enforces Row Level Security (RLS) linked strictly to auth.users.
-- Supports client-generated UUIDs, non-punitive plans, and safe rescheduling.
-- Per docs/DATA-MODEL.md and docs/SECURITY.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Reading Plans Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reading_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NULL,
  scope_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  target_end_date DATE NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  distribution_mode TEXT NOT NULL DEFAULT 'automatic',
  reading_days SMALLINT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  total_days INTEGER NULL,
  completed_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Trigger for reading_plans.updated_at
DROP TRIGGER IF EXISTS set_reading_plans_updated_at ON public.reading_plans;
CREATE TRIGGER set_reading_plans_updated_at
  BEFORE UPDATE ON public.reading_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on reading_plans
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;

-- Reading Plans RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "reading_plans_select_own" ON public.reading_plans;
CREATE POLICY "reading_plans_select_own" ON public.reading_plans
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_plans_insert_own" ON public.reading_plans;
CREATE POLICY "reading_plans_insert_own" ON public.reading_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_plans_update_own" ON public.reading_plans;
CREATE POLICY "reading_plans_update_own" ON public.reading_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_plans_delete_own" ON public.reading_plans;
CREATE POLICY "reading_plans_delete_own" ON public.reading_plans
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON public.reading_plans(user_id);

-- ------------------------------------------------------------------------------
-- 2. Reading Plan Assignments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reading_plan_assignments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL,
  sequence INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  passages JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  progress JSONB NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT uq_plan_sequence UNIQUE (plan_id, sequence)
);

-- Trigger for reading_plan_assignments.updated_at
DROP TRIGGER IF EXISTS set_reading_plan_assignments_updated_at ON public.reading_plan_assignments;
CREATE TRIGGER set_reading_plan_assignments_updated_at
  BEFORE UPDATE ON public.reading_plan_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on reading_plan_assignments
ALTER TABLE public.reading_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Assignments RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "reading_plan_assignments_select_own" ON public.reading_plan_assignments;
CREATE POLICY "reading_plan_assignments_select_own" ON public.reading_plan_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_plan_assignments_insert_own" ON public.reading_plan_assignments;
CREATE POLICY "reading_plan_assignments_insert_own" ON public.reading_plan_assignments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_plan_assignments_update_own" ON public.reading_plan_assignments;
CREATE POLICY "reading_plan_assignments_update_own" ON public.reading_plan_assignments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_plan_assignments_delete_own" ON public.reading_plan_assignments;
CREATE POLICY "reading_plan_assignments_delete_own" ON public.reading_plan_assignments
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assignments_plan_id ON public.reading_plan_assignments(plan_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_date ON public.reading_plan_assignments(user_id, assignment_date);


-- >>> START FILE: 00006_schedules.sql <<<
-- ==============================================================================
-- Charis PWA — Migration 00006: Schedules & Schedule Presets Table & RLS
-- ==============================================================================
-- Enforces Row Level Security (RLS) linked strictly to auth.users.
-- Supports client-generated UUIDs, health-neutral fasting, and prayer presets.
-- Per docs/DATA-MODEL.md and docs/SECURITY.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Schedules Table (Fasting & Prayer Sessions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('prayer','fasting')),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  start_at TIMESTAMPTZ NULL,
  end_at TIMESTAMPTZ NULL,
  local_start_time TIME NULL,
  local_end_time TIME NULL,
  recurrence JSONB NULL,
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
  preset_id UUID NULL,
  note TEXT NULL,
  target_hours NUMERIC NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Trigger for schedules.updated_at
DROP TRIGGER IF EXISTS set_schedules_updated_at ON public.schedules;
CREATE TRIGGER set_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Schedules RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "schedules_select_own" ON public.schedules;
CREATE POLICY "schedules_select_own" ON public.schedules
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "schedules_insert_own" ON public.schedules;
CREATE POLICY "schedules_insert_own" ON public.schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "schedules_update_own" ON public.schedules;
CREATE POLICY "schedules_update_own" ON public.schedules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "schedules_delete_own" ON public.schedules;
CREATE POLICY "schedules_delete_own" ON public.schedules
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_schedules_user_kind ON public.schedules(user_id, kind, status);

-- ------------------------------------------------------------------------------
-- 2. Schedule Presets Table (Contemplative Templates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_presets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('prayer','fasting')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  target_hours NUMERIC NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for schedule_presets.updated_at
DROP TRIGGER IF EXISTS set_schedule_presets_updated_at ON public.schedule_presets;
CREATE TRIGGER set_schedule_presets_updated_at
  BEFORE UPDATE ON public.schedule_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on schedule_presets
ALTER TABLE public.schedule_presets ENABLE ROW LEVEL SECURITY;

-- Presets RLS Policies: Strictly private to owning user
DROP POLICY IF EXISTS "schedule_presets_select_own" ON public.schedule_presets;
CREATE POLICY "schedule_presets_select_own" ON public.schedule_presets
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "schedule_presets_insert_own" ON public.schedule_presets;
CREATE POLICY "schedule_presets_insert_own" ON public.schedule_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "schedule_presets_update_own" ON public.schedule_presets;
CREATE POLICY "schedule_presets_update_own" ON public.schedule_presets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "schedule_presets_delete_own" ON public.schedule_presets;
CREATE POLICY "schedule_presets_delete_own" ON public.schedule_presets
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_presets_user_kind ON public.schedule_presets(user_id, kind);


