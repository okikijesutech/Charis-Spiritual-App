import type { Json } from './user-tables';

export interface SchedulesTable {
  Row: {
    id: string;
    user_id: string;
    kind: 'prayer' | 'fasting';
    name: string;
    timezone: string;
    start_at: string | null;
    end_at: string | null;
    local_start_time: string | null;
    local_end_time: string | null;
    recurrence: Json | null;
    reminder_enabled: boolean;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    preset_id: string | null;
    note: string | null;
    target_hours: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    kind: 'prayer' | 'fasting';
    name: string;
    timezone?: string;
    start_at?: string | null;
    end_at?: string | null;
    local_start_time?: string | null;
    local_end_time?: string | null;
    recurrence?: Json | null;
    reminder_enabled?: boolean;
    status?: 'active' | 'paused' | 'completed' | 'cancelled';
    preset_id?: string | null;
    note?: string | null;
    target_hours?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    kind?: 'prayer' | 'fasting';
    name?: string;
    timezone?: string;
    start_at?: string | null;
    end_at?: string | null;
    local_start_time?: string | null;
    local_end_time?: string | null;
    recurrence?: Json | null;
    reminder_enabled?: boolean;
    status?: 'active' | 'paused' | 'completed' | 'cancelled';
    preset_id?: string | null;
    note?: string | null;
    target_hours?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}

export interface SchedulePresetsTable {
  Row: {
    id: string;
    user_id: string;
    kind: 'prayer' | 'fasting';
    name: string;
    description: string;
    target_hours: number | null;
    configuration: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    user_id: string;
    kind: 'prayer' | 'fasting';
    name: string;
    description: string;
    target_hours?: number | null;
    configuration?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    kind?: 'prayer' | 'fasting';
    name?: string;
    description?: string;
    target_hours?: number | null;
    configuration?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}
