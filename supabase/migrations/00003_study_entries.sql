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
