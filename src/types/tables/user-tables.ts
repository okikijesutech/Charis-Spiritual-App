export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ProfilesTable {
  Row: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}

export interface UserSettingsTable {
  Row: {
    user_id: string;
    theme: 'system' | 'light' | 'dark';
    timezone: string;
    locale: string;
    featured_reading_plan_id: string | null;
    dashboard_layout: Json | null;
    reminder_preferences: Json | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    user_id: string;
    theme?: 'system' | 'light' | 'dark';
    timezone?: string;
    locale?: string;
    featured_reading_plan_id?: string | null;
    dashboard_layout?: Json | null;
    reminder_preferences?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    user_id?: string;
    theme?: 'system' | 'light' | 'dark';
    timezone?: string;
    locale?: string;
    featured_reading_plan_id?: string | null;
    dashboard_layout?: Json | null;
    reminder_preferences?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}

export interface SyncReceiptsTable {
  Row: {
    operation_id: string;
    user_id: string;
    entity_type: string;
    entity_id: string;
    server_version: number | null;
    applied_at: string;
  };
  Insert: {
    operation_id: string;
    user_id: string;
    entity_type: string;
    entity_id: string;
    server_version?: number | null;
    applied_at?: string;
  };
  Update: {
    operation_id?: string;
    user_id?: string;
    entity_type?: string;
    entity_id?: string;
    server_version?: number | null;
    applied_at?: string;
  };
  Relationships: [];
}
