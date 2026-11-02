/**
 * Bundled KJV Scripture Store
 * Provides instant 0ms offline access to all 66 canonical books (1,189 chapters)
 * of the public domain King James Version packaged directly with Charis.
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md
 */

import { getDB } from '../db/indexeddb';
import { getBookById } from './canon';
import type { BibleChapter, BibleVerse } from '../../types/bible';

type CompactKjvData = Record<string, string[]>;

let memoryCache: CompactKjvData | null = null;
let fetchPromise: Promise<CompactKjvData | null> | null = null;

/**
 * Fetch and parse the bundled KJV dataset from public/bible/kjv.json
 */
async function loadKjvData(): Promise<CompactKjvData | null> {
  if (memoryCache) return memoryCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const response = await fetch('/bible/kjv.json');
      if (!response.ok) {
        console.warn(`[bundled-kjv] Failed to load /bible/kjv.json: HTTP ${response.status}`);
        return null;
      }
      const data: CompactKjvData = await response.json();
      memoryCache = data;
      return data;
    } catch (err) {
      console.warn('[bundled-kjv] Network/file load error for bundled KJV:', err);
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Retrieve a chapter from the packaged KJV Bible.
 */
export async function getBundledKjvChapter(
  bookId: string,
  chapterNumber: number
): Promise<BibleChapter | null> {
  const normBookId = bookId.toUpperCase();
  const key = `${normBookId}:${chapterNumber}`;

  const data = await loadKjvData();
  if (!data || !data[key]) {
    return null;
  }

  const rawVerses = data[key];
  const book = getBookById(normBookId);
  const bookName = book?.name || normBookId;

  const verses: BibleVerse[] = rawVerses.map((text, idx) => ({
    verseNumber: idx + 1,
    text,
    isParagraphStart: idx === 0,
  }));

  const chapter: BibleChapter = {
    id: `kjv:${normBookId}:${chapterNumber}`,
    translationId: 'kjv',
    bookId: normBookId,
    bookName,
    chapterNumber,
    title: `${bookName} ${chapterNumber}`,
    attribution: 'Public Domain worldwide (1611 tradition).',
    isOfflinePlaceholder: false,
    isCachedLocally: true,
    verses,
  };

  // Write through to IndexedDB for offline persistence
  try {
    const db = await getDB();
    await db.put('bible_chapters', chapter);
  } catch (e) {
    console.debug('[bundled-kjv] IndexedDB write-through skipped:', e);
  }

  return chapter;
}

/**
 * Register KJV as installed offline and seed metadata in IndexedDB.
 */
export async function seedBundledKjv(): Promise<void> {
  try {
    const db = await getDB();
    const installed = await db.get('installed_translations', 'kjv');
    if (!installed) {
      await db.put('installed_translations', {
        translationId: 'kjv',
        installedAt: new Date().toISOString(),
        sizeBytes: 4220000,
      });
    }
  } catch (err) {
    console.debug('[bundled-kjv] Seed registration skipped:', err);
  }
}
