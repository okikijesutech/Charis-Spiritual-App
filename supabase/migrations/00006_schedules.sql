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
