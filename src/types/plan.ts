/**
 * Reading Plan Domain Types
 * Per docs/DATA-MODEL.md and docs/PRD.md
 * Non-punitive plan generation, chapter distribution, and safe rescheduling.
 */

import type { BaseEntity } from './sync';
import type { ScriptureReference } from './journal';

export type PlanScopeType = 'canon' | 'books' | 'chapter_range' | 'custom_passages';
export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type DistributionMode = 'automatic' | 'manual';
export type AssignmentStatus = 'pending' | 'partial' | 'completed' | 'skipped';

export interface ReadingPlan extends BaseEntity {
  name: string;
  description?: string;
  scopeType: PlanScopeType;
  status: PlanStatus;
  startDate: string;              // YYYY-MM-DD
  targetEndDate?: string | null;  // YYYY-MM-DD
  timezone: string;
  distributionMode: DistributionMode;
  readingDays: number[];          // 0 = Sunday, 1 = Monday, etc.
  featured: boolean;
  totalDays?: number;
  completedDays?: number;
}

export interface ReadingPlanAssignment extends BaseEntity {
  planId: string;
  assignmentDate: string;         // YYYY-MM-DD
  sequence: number;
  dayNumber: number;
  passages: ScriptureReference[];
  status: AssignmentStatus;
  progress?: {
    readPassages?: number;
    totalPassages?: number;
  } | null;
  completedAt?: string | null;
}
