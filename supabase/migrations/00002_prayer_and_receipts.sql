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
