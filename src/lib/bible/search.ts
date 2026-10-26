/**
 * Scripture Search Engine & Open Bible Topic Adapter
 * Supports canonical reference parsing, local full-text search, and topical indexing.
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md and docs/IMPLEMENTATION-PLAN.md (Phase 4 Step 3)
 */

import { parseScriptureReference, formatScriptureReference } from './canon';
import { SAMPLE_CHAPTERS } from './sample-scripture';
import { getDB } from '../db/indexeddb';
import type { CanonicalReference, BibleChapter } from '../../types/bible';

export interface BibleSearchResult {
  reference: CanonicalReference;
  formattedRef: string;
  translationId: string;
  text: string;
  matchType: 'exact_passage' | 'keyword' | 'topic';
  topicLabel?: string;
}

// Curated Open Bible topic index for instant offline topical discovery
const TOPICAL_INDEX: Record<string, { label: string; refs: CanonicalReference[]; summary: string }> = {
  peace: {
    label: 'Peace & Anxiety',
    summary: 'Trusting God’s presence in times of turmoil.',
    refs: [
      { bookId: 'JHN', chapter: 15, startVerse: 4, endVerse: 7 },
      { bookId: 'PSA', chapter: 23, startVerse: 1, endVerse: 4 },
      { bookId: 'ROM', chapter: 8, startVerse: 31, endVerse: 39 },
    ],
  },
  comfort: {
    label: 'Comfort & Shepherd',
    summary: 'The Lord’s tender shepherding care through dark valleys.',
    refs: [
      { bookId: 'PSA', chapter: 23, startVerse: 1, endVerse: 6 },
      { bookId: 'ROM', chapter: 8, startVerse: 35, endVerse: 39 },
    ],
  },
  love: {
    label: 'God’s Inseparable Love',
    summary: 'Nothing in all creation can separate us from Christ.',
    refs: [
      { bookId: 'ROM', chapter: 8, startVerse: 35, endVerse: 39 },
      { bookId: 'JHN', chapter: 15, startVerse: 9, endVerse: 12 },
    ],
  },
  abiding: {
    label: 'Abiding in Christ',
    summary: 'Bearing fruit through union with the True Vine.',
    refs: [
      { bookId: 'JHN', chapter: 15, startVerse: 1, endVerse: 8 },
    ],
  },
};

export class ScriptureSearchService {
  /**
   * Search Scripture by passage reference, keyword, or spiritual topic.
   */
  async search(query: string, translationId = 'web'): Promise<BibleSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const results: BibleSearchResult[] = [];

    // 1. Check for canonical reference (e.g. "John 15", "Rom 8", "Psalm 23")
    const parsedRef = parseScriptureReference(cleanQuery);
    if (parsedRef) {
      const chapter = await this.findChapter(translationId, parsedRef.bookId, parsedRef.chapter);
      if (chapter) {
        const verse = parsedRef.startVerse
          ? chapter.verses.find((v) => v.verseNumber === parsedRef.startVerse)
          : chapter.verses[0];

        results.push({
          reference: parsedRef,
          formattedRef: formatScriptureReference(parsedRef),
          translationId: chapter.translationId,
          text: verse ? verse.text : `Passage in ${chapter.bookName} ${chapter.chapterNumber}`,
          matchType: 'exact_passage',
        });
        return results;
      }
    }

    // 2. Check for curated spiritual topic match (e.g. "peace", "comfort", "love", "vine")
    const lowerQuery = cleanQuery.toLowerCase();
    for (const [key, topic] of Object.entries(TOPICAL_INDEX)) {
      if (lowerQuery.includes(key) || topic.label.toLowerCase().includes(lowerQuery)) {
        for (const ref of topic.refs) {
          const chapter = await this.findChapter(translationId, ref.bookId, ref.chapter);
          if (chapter) {
            const verse = ref.startVerse
              ? chapter.verses.find((v) => v.verseNumber === ref.startVerse)
              : chapter.verses[0];

            results.push({
              reference: ref,
              formattedRef: formatScriptureReference(ref),
              translationId: chapter.translationId,
              text: verse ? verse.text : topic.summary,
              matchType: 'topic',
              topicLabel: topic.label,
            });
          }
        }
      }
    }

    // 3. Local full-text search across cached and bundled chapters
    const chapters = await this.getAllSearchableChapters(translationId);
    const keywords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);

    if (keywords.length > 0) {
      for (const ch of chapters) {
        for (const v of ch.verses) {
          const verseTextLower = v.text.toLowerCase();
          const matches = keywords.every((kw) => verseTextLower.includes(kw));
          if (matches) {
            const ref: CanonicalReference = {
              bookId: ch.bookId,
              chapter: ch.chapterNumber,
              startVerse: v.verseNumber,
            };
            results.push({
              reference: ref,
              formattedRef: formatScriptureReference(ref),
              translationId: ch.translationId,
              text: v.text,
              matchType: 'keyword',
            });
          }
        }
      }
    }

    return results;
  }

  private async findChapter(
    translationId: string,
    bookId: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    const id = `${translationId.toLowerCase()}:${bookId.toUpperCase()}:${chapterNumber}`;

    // Check IndexedDB
    try {
      const db = await getDB();
      const cached = await db.get('bible_chapters', id);
      if (cached) return cached;
    } catch {
      // IndexedDB not ready or running in mock environment
    }

    // Check bundled sample chapters
    const sample = SAMPLE_CHAPTERS.find(
      (c) =>
        c.translationId.toLowerCase() === translationId.toLowerCase() &&
        c.bookId.toUpperCase() === bookId.toUpperCase() &&
        c.chapterNumber === chapterNumber
    );
    if (sample) return sample;

    // Fallback to WEB sample if translation not available
    const webSample = SAMPLE_CHAPTERS.find(
      (c) =>
        c.translationId === 'web' &&
        c.bookId.toUpperCase() === bookId.toUpperCase() &&
        c.chapterNumber === chapterNumber
    );
    return webSample || null;
  }

  private async getAllSearchableChapters(translationId: string): Promise<BibleChapter[]> {
    const chaptersMap = new Map<string, BibleChapter>();

    // 1. Add bundled samples
    for (const ch of SAMPLE_CHAPTERS) {
      if (ch.translationId.toLowerCase() === translationId.toLowerCase()) {
        chaptersMap.set(`${ch.bookId}:${ch.chapterNumber}`, ch);
      }
    }

    // 2. Add IndexedDB chapters
    try {
      const db = await getDB();
      const stored = await db.getAllFromIndex('bible_chapters', 'by-translation', translationId.toLowerCase());
      for (const ch of stored) {
        chaptersMap.set(`${ch.bookId}:${ch.chapterNumber}`, ch);
      }
    } catch {
      // Graceful fallback
    }

    return Array.from(chaptersMap.values());
  }
}

export const scriptureSearchService = new ScriptureSearchService();
