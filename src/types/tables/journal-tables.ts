import type { Json } from './user-tables';

export interface PrayerEntriesTable {
  Row: {
    id: string;
    user_id: string;
    title: string | null;
    body: string;
    entry_at: string;
    tags: string[];
    scripture_references: Json;
    is_answered: boolean;
    answered_at: string | null;
    answered_note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    title?: string | null;
    body: string;
    entry_at?: string;
    tags?: string[];
    scripture_references?: Json;
    is_answered?: boolean;
    answered_at?: string | null;
    answered_note?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    title?: string | null;
    body?: string;
    entry_at?: string;
    tags?: string[];
    scripture_references?: Json;
    is_answered?: boolean;
    answered_at?: string | null;
    answered_note?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}

export interface StudyEntriesTable {
  Row: {
    id: string;
    user_id: string;
    title: string | null;
    body: string | null;
    passage_ref: Json | null;
    observations: string | null;
    questions_context: string | null;
    interpretation: string | null;
    application: string | null;
    notes: string | null;
    cross_references: Json;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    title?: string | null;
    body?: string | null;
    passage_ref?: Json | null;
    observations?: string | null;
    questions_context?: string | null;
    interpretation?: string | null;
    application?: string | null;
    notes?: string | null;
    cross_references?: Json;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    title?: string | null;
    body?: string | null;
    passage_ref?: Json | null;
    observations?: string | null;
    questions_context?: string | null;
    interpretation?: string | null;
    application?: string | null;
    notes?: string | null;
    cross_references?: Json;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}
