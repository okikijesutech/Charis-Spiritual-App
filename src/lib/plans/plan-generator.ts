/**
 * Reading Plan Generator & Safe Rescheduling Engine
 * Chapter-based automatic distribution with "Grace Over Streaks" philosophy.
 * Per docs/IMPLEMENTATION-PLAN.md Section 9 and docs/PRD.md
 */

import { CANONICAL_BOOKS } from '../bible/canon';
import { generateUUID } from '../id';
import type { 
  ReadingPlanAssignment, 
  PlanScopeType,
  AssignmentStatus 
} from '../../types/plan';
import type { ScriptureReference } from '../../types/journal';

export interface PlanScopeOption {
  id: PlanScopeType;
  label: string;
  description: string;
  totalChapters: number;
  bookIds: string[];
}

export const PLAN_SCOPES: PlanScopeOption[] = [
  {
    id: 'canon',
    label: 'Entire Bible',
    description: 'All 66 books of the Old and New Testaments',
    totalChapters: 1189,
    bookIds: CANONICAL_BOOKS.map((b) => b.id),
  },
  {
    id: 'books', // Used for New Testament scope
    label: 'New Testament',
    description: 'The Gospels, Acts, Epistles, and Revelation (27 books)',
    totalChapters: 260,
    bookIds: CANONICAL_BOOKS.filter((b) => b.testament === 'NT').map((b) => b.id),
  },
  {
    id: 'chapter_range', // Used for Gospels
    label: 'The Four Gospels',
    description: 'Matthew, Mark, Luke, and John (Life & Ministry of Jesus)',
    totalChapters: 89,
    bookIds: ['MAT', 'MRK', 'LUK', 'JHN'],
  },
  {
    id: 'custom_passages', // Used for Wisdom & Psalms
    label: 'Wisdom Literature & Psalms',
    description: 'Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon',
    totalChapters: 243,
    bookIds: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'],
  },
];

export interface GeneratePlanOptions {
  planId: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  targetDays: number;
  scopeType: PlanScopeType;
  customBookIds?: string[];
  readingDays?: number[]; // e.g. [0, 1, 2, 3, 4, 5, 6] (0 = Sunday)
}

export interface GenerationResult {
  assignments: ReadingPlanAssignment[];
  totalChapters: number;
  avgChaptersPerDay: number;
  warning?: string;
}

/**
 * Expand selected books into an ordered list of all chapters.
 */
function expandChapters(bookIds: string[]): ScriptureReference[] {
  const chapters: ScriptureReference[] = [];

  for (const bookId of bookIds) {
    const book = CANONICAL_BOOKS.find((b) => b.id === bookId);
    if (!book) continue;

    for (let c = 1; c <= book.chapterCount; c++) {
      chapters.push({
        bookId: book.id,
        bookName: book.name,
        chapter: c,
        formatted: `${book.name} ${c}`,
      });
    }
  }

  return chapters;
}

/**
 * Generates reading plan assignments with balanced chapter distribution.
 */
export function generatePlanAssignments(options: GeneratePlanOptions): GenerationResult {
  const { planId, userId, startDate, targetDays, scopeType, customBookIds } = options;

  let bookIds: string[] = [];
  if (customBookIds && customBookIds.length > 0) {
    bookIds = customBookIds;
  } else {
    const matchedScope = PLAN_SCOPES.find((s) => s.id === scopeType);
    bookIds = matchedScope ? matchedScope.bookIds : PLAN_SCOPES[0].bookIds;
  }

  const allChapters = expandChapters(bookIds);
  const totalChapters = allChapters.length;
  const numDays = Math.max(1, targetDays);
  const avgChaptersPerDay = Math.round((totalChapters / numDays) * 10) / 10;

  // Impossible workload warning (> 25 chapters per day)
  let warning: string | undefined;
  if (avgChaptersPerDay > 25) {
    warning = `At ~${Math.round(avgChaptersPerDay)} chapters per day, this pace may feel demanding. Consider choosing a longer timeline for a gentler, more unhurried rhythm.`;
  }

  const assignments: ReadingPlanAssignment[] = [];
  const baseDate = new Date(startDate);
  const now = new Date().toISOString();

  // Distribute chapters across days evenly without duplicates
  let chapterIndex = 0;
  for (let day = 1; day <= numDays && chapterIndex < totalChapters; day++) {
    const remainingDays = numDays - day + 1;
    const remainingChapters = totalChapters - chapterIndex;
    const chaptersForThisDay = Math.ceil(remainingChapters / remainingDays);

    const dayPassages: ScriptureReference[] = [];
    for (let i = 0; i < chaptersForThisDay && chapterIndex < totalChapters; i++) {
      dayPassages.push(allChapters[chapterIndex]);
      chapterIndex++;
    }

    const assignmentDate = new Date(baseDate);
    assignmentDate.setDate(baseDate.getDate() + (day - 1));
    const dateStr = assignmentDate.toISOString().slice(0, 10);

    assignments.push({
      id: generateUUID(),
      userId,
      planId,
      sequence: day,
      dayNumber: day,
      assignmentDate: dateStr,
      passages: dayPassages,
      status: 'pending',
      progress: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      sync: {
        syncStatus: 'pending',
        localVersion: 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    });
  }

  return {
    assignments,
    totalChapters,
    avgChaptersPerDay,
    warning,
  };
}

/**
 * Safe Rescheduling ("Grace Over Streaks"):
 * Preserves completed assignments and gently redistributes all uncompleted chapters
 * starting from a new start date without guilt or resetting progress.
 */
export function reschedulePlan(
  existingAssignments: ReadingPlanAssignment[],
  newStartDate: string, // YYYY-MM-DD
  additionalDays: number
): ReadingPlanAssignment[] {
  const completed = existingAssignments.filter((a) => a.status === 'completed');
  const uncompleted = existingAssignments.filter((a) => a.status !== 'completed');

  // Collect all unread chapters in original sequence
  const remainingChapters: ScriptureReference[] = [];
  for (const a of uncompleted) {
    for (const p of a.passages) {
      remainingChapters.push(p);
    }
  }

  if (remainingChapters.length === 0) {
    return existingAssignments; // All finished
  }

  const numDays = Math.max(1, additionalDays);
  const baseDate = new Date(newStartDate);
  const now = new Date().toISOString();
  const rescheduledUncompleted: ReadingPlanAssignment[] = [];

  let startSeq = completed.length + 1;
  let chapterIndex = 0;

  for (let day = 1; day <= numDays && chapterIndex < remainingChapters.length; day++) {
    const remainingDaysCount = numDays - day + 1;
    const remainingCount = remainingChapters.length - chapterIndex;
    const chaptersForDay = Math.ceil(remainingCount / remainingDaysCount);

    const dayPassages: ScriptureReference[] = [];
    for (let i = 0; i < chaptersForDay && chapterIndex < remainingChapters.length; i++) {
      dayPassages.push(remainingChapters[chapterIndex]);
      chapterIndex++;
    }

    const assignmentDate = new Date(baseDate);
    assignmentDate.setDate(baseDate.getDate() + (day - 1));

    rescheduledUncompleted.push({
      id: generateUUID(),
      userId: existingAssignments[0]?.userId || 'demo-user-id',
      planId: existingAssignments[0]?.planId || 'demo-plan-id',
      sequence: startSeq,
      dayNumber: startSeq,
      assignmentDate: assignmentDate.toISOString().slice(0, 10),
      passages: dayPassages,
      status: 'pending' as AssignmentStatus,
      progress: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      sync: {
        syncStatus: 'pending',
        localVersion: 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    });

    startSeq++;
  }

  return [...completed, ...rescheduledUncompleted];
}
