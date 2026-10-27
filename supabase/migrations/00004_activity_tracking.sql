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
