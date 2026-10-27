/**
 * Schedule & Fasting Domain Types
 * Per docs/DATA-MODEL.md and docs/PRD.md
 * Health-neutral, contemplative schedules and prayer presets.
 */

import type { BaseEntity } from './sync';

export type ScheduleKind = 'prayer' | 'fasting';
export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Schedule extends BaseEntity {
  kind: ScheduleKind;
  name: string;
  timezone: string;
  startAt?: string | null;        // ISO 8601 UTC
  endAt?: string | null;          // ISO 8601 UTC
  localStartTime?: string | null; // HH:mm
  localEndTime?: string | null;   // HH:mm
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'custom';
    weekdays?: number[];
  } | null;
  reminderEnabled: boolean;
  status: ScheduleStatus;
  presetId?: string | null;
  note?: string;
  targetHours?: number;
}

export interface SchedulePreset {
  id: string;
  userId: string;
  kind: ScheduleKind;
  name: string;
  description: string;
  targetHours?: number;
  configuration: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
