/**
 * Supabase Database Schema Definition
 * Per docs/DATA-MODEL.md and docs/SECURITY.md
 * Modularly composed across domain tables to respect Cambium line limits.
 */

import type { ProfilesTable, UserSettingsTable, SyncReceiptsTable, Json } from './tables/user-tables';
import type { PrayerEntriesTable, StudyEntriesTable } from './tables/journal-tables';
import type { ActivityTypesTable, ActivityLogsTable } from './tables/activity-tables';
import type { ReadingPlansTable, ReadingPlanAssignmentsTable } from './tables/plan-tables';

export type { Json };

export interface Database {
  public: {
    Tables: {
      profiles: ProfilesTable;
      user_settings: UserSettingsTable;
      prayer_entries: PrayerEntriesTable;
      study_entries: StudyEntriesTable;
      activity_types: ActivityTypesTable;
      activity_logs: ActivityLogsTable;
      reading_plans: ReadingPlansTable;
      reading_plan_assignments: ReadingPlanAssignmentsTable;
      sync_receipts: SyncReceiptsTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
