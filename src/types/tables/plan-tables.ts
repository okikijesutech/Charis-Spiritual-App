import type { Json } from './user-tables';

export interface ReadingPlansTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    scope_type: string;
    status: string;
    start_date: string;
    target_end_date: string | null;
    timezone: string;
    distribution_mode: string;
    reading_days: number[];
    featured: boolean;
    total_days: number | null;
    completed_days: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    name: string;
    description?: string | null;
    scope_type: string;
    status?: string;
    start_date: string;
    target_end_date?: string | null;
    timezone?: string;
    distribution_mode?: string;
    reading_days?: number[];
    featured?: boolean;
    total_days?: number | null;
    completed_days?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    scope_type?: string;
    status?: string;
    start_date?: string;
    target_end_date?: string | null;
    timezone?: string;
    distribution_mode?: string;
    reading_days?: number[];
    featured?: boolean;
    total_days?: number | null;
    completed_days?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}

export interface ReadingPlanAssignmentsTable {
  Row: {
    id: string;
    user_id: string;
    plan_id: string;
    assignment_date: string;
    sequence: number;
    day_number: number;
    passages: Json;
    status: string;
    progress: Json | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    plan_id: string;
    assignment_date: string;
    sequence: number;
    day_number: number;
    passages?: Json;
    status?: string;
    progress?: Json | null;
    completed_at?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    plan_id?: string;
    assignment_date?: string;
    sequence?: number;
    day_number?: number;
    passages?: Json;
    status?: string;
    progress?: Json | null;
    completed_at?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}
