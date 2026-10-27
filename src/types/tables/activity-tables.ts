export interface ActivityTypesTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    category: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    name: string;
    category: string;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    category?: string;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}

export interface ActivityLogsTable {
  Row: {
    id: string;
    user_id: string;
    activity_type_id: string | null;
    category: string;
    label: string;
    started_at: string;
    duration_seconds: number | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  Insert: {
    id: string;
    user_id: string;
    activity_type_id?: string | null;
    category: string;
    label: string;
    started_at?: string;
    duration_seconds?: number | null;
    note?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    activity_type_id?: string | null;
    category?: string;
    label?: string;
    started_at?: string;
    duration_seconds?: number | null;
    note?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
  Relationships: [];
}
