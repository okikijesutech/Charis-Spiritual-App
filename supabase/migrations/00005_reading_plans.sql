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
