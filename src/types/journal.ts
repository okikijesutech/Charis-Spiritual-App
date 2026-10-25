/**
 * Journal Domain Types (Prayer & Study)
 * Per docs/DATA-MODEL.md and brand-governance/SKILL.md
 * Separate domain entities to prevent monolithic coupling.
 */

import type { BaseEntity } from './sync';

export interface ScriptureReference {
  translationId?: string;
  bookId: string;
  bookName: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  formatted: string;
}

/**
 * Prayer Entry Entity
 * Private, contemplative space for personal prayers and praise.
 */
export interface PrayerEntry extends BaseEntity {
  title?: string;
  body: string;
  entryAt: string;                       // ISO 8601 UTC timestamp of prayer event
  tags: string[];
  scriptureReferences: ScriptureReference[];
  isAnswered?: boolean;
  answeredAt?: string | null;
  answeredNote?: string | null;
}

/**
 * Study Entry Entity
 * Inductive or reflective Bible study notes.
 */
export interface StudyEntry extends BaseEntity {
  title?: string;
  body?: string;
  passageRef?: ScriptureReference;
  observations?: string;
  questionsContext?: string;
  interpretation?: string;
  application?: string;
  crossReferences: ScriptureReference[];
}
