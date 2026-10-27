/**
 * Bible Reader Position Persistence
 * Stores and retrieves the last opened book, chapter, and translation.
 * Defaults to Genesis 1 (NLT) for first-time readers.
 * Per PRD and user requirement.
 */

export interface LastBiblePosition {
  bookId: string;
  chapterNumber: number;
  translation: string;
}

export const STORAGE_KEY = 'charis_last_bible_position';

export const DEFAULT_FIRST_TIME_POSITION: LastBiblePosition = {
  bookId: 'GEN',
  chapterNumber: 1,
  translation: 'nlt',
};

/**
 * Retrieve the last read Bible position from local storage.
 * If first time opening the Bible, defaults to Genesis 1.
 */
export function getLastBiblePosition(): LastBiblePosition {
  if (typeof window === 'undefined') {
    return DEFAULT_FIRST_TIME_POSITION;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.bookId === 'string' &&
        typeof parsed.chapterNumber === 'number' &&
        typeof parsed.translation === 'string'
      ) {
        return {
          bookId: parsed.bookId,
          chapterNumber: parsed.chapterNumber,
          translation: parsed.translation,
        };
      }
    }
  } catch (err) {
    console.warn('[Bible Persistence] Error loading last position:', err);
  }
  return DEFAULT_FIRST_TIME_POSITION;
}

/**
 * Persist the current book, chapter, and translation to local storage.
 */
export function saveLastBiblePosition(pos: LastBiblePosition): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch (err) {
    console.warn('[Bible Persistence] Error saving position:', err);
  }
}
