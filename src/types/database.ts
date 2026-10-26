export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          user_id: string
          theme: 'system' | 'light' | 'dark'
          timezone: string
          locale: string
          featured_reading_plan_id: string | null
          dashboard_layout: Json | null
          reminder_preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'system' | 'light' | 'dark'
          timezone?: string
          locale?: string
          featured_reading_plan_id?: string | null
          dashboard_layout?: Json | null
          reminder_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: 'system' | 'light' | 'dark'
          timezone?: string
          locale?: string
          featured_reading_plan_id?: string | null
          dashboard_layout?: Json | null
          reminder_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          body: string
          entry_at: string
          tags: string[]
          scripture_references: Json
          is_answered: boolean
          answered_at: string | null
          answered_note: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          title?: string | null
          body: string
          entry_at?: string
          tags?: string[]
          scripture_references?: Json
          is_answered?: boolean
          answered_at?: string | null
          answered_note?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          body?: string
          entry_at?: string
          tags?: string[]
          scripture_references?: Json
          is_answered?: boolean
          answered_at?: string | null
          answered_note?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      study_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          body: string | null
          passage_ref: Json | null
          observations: string | null
          questions_context: string | null
          interpretation: string | null
          application: string | null
          notes: string | null
          cross_references: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          title?: string | null
          body?: string | null
          passage_ref?: Json | null
          observations?: string | null
          questions_context?: string | null
          interpretation?: string | null
          application?: string | null
          notes?: string | null
          cross_references?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          body?: string | null
          passage_ref?: Json | null
          observations?: string | null
          questions_context?: string | null
          interpretation?: string | null
          application?: string | null
          notes?: string | null
          cross_references?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      sync_receipts: {
        Row: {
          operation_id: string
          user_id: string
          entity_type: string
          entity_id: string
          server_version: number | null
          applied_at: string
        }
        Insert: {
          operation_id: string
          user_id: string
          entity_type: string
          entity_id: string
          server_version?: number | null
          applied_at?: string
        }
        Update: {
          operation_id?: string
          user_id?: string
          entity_type?: string
          entity_id?: string
          server_version?: number | null
          applied_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
