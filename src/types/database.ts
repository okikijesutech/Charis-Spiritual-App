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
