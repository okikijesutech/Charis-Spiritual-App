/**
 * Activity Domain Types
 * Per docs/DATA-MODEL.md and docs/PRD.md
 * Reflective spiritual tracking with grace over streaks.
 */

import type { BaseEntity } from './sync';

export type ActivityCategory =
  | 'prayer'
  | 'reading'
  | 'study'
  | 'worship'
  | 'fasting'
  | 'gratitude';

export interface ActivityType extends BaseEntity {
  name: string;
  category: ActivityCategory;
  isArchived: boolean;
}

export interface ActivityLog extends BaseEntity {
  activityTypeId?: string;
  category: ActivityCategory;
  label: string;
  startedAt: string;          // ISO 8601 UTC timestamp
  durationSeconds?: number;
  note?: string;
}
