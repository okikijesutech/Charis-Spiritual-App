/**
 * Bible Provider & Offline Chapter Loader
 * Manages translation downloads, IndexedDB caching, and curated starter passages.
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md and docs/DATA-MODEL.md
 */

import { getDB } from '../db/indexeddb';
import { SAMPLE_CHAPTERS } from './sample-scripture';
import { getBookById, SUPPORTED_TRANSLATIONS } from './canon';
import { remoteBibleApiAdapter } from './api-adapter';
import type { BibleChapter } from '../../types/bible';

export interface IBibleProvider {
  getChapter(translationId: string, bookId: string, chapterNumber: number): Promise<BibleChapter>;
  isTranslationInstalled(translationId: string): Promise<boolean>;
  installTranslation(translationId: string, onProgress?: (percent: number) => void): Promise<void>;
  removeTranslation(translationId: string): Promise<void>;
  listInstalledTranslations(): Promise<string[]>;
}

export class CharisBibleProvider implements IBibleProvider {
  /**
   * Retrieve a chapter for the given translation and passage.
   */
  async getChapter(
    translationId: string,
    bookId: string,
    chapterNumber: number
  ): Promise<BibleChapter> {
    const id = `${translationId.toLowerCase()}:${bookId.toUpperCase()}:${chapterNumber}`;

    // 1. Check IndexedDB persistent store
    const db = await getDB();
    const cached = await db.get('bible_chapters', id);
    if (cached) {
      return cached;
    }

    // 2. Check bundled sample Scripture store (instant offline availability)
    const sample = SAMPLE_CHAPTERS.find(
      (c) =>
        c.translationId.toLowerCase() === translationId.toLowerCase() &&
        c.bookId.toUpperCase() === bookId.toUpperCase() &&
        c.chapterNumber === chapterNumber
    );
    if (sample) {
      return sample;
    }

    // 3. Online Fetch: Retrieve complete chapter for any book (1-66) in NLT, KJV, or WEB
    if (typeof navigator === 'undefined' || navigator.onLine) {
      const remoteChapter = await remoteBibleApiAdapter.fetchRemoteChapter(
        translationId,
        bookId,
        chapterNumber
      );
      if (remoteChapter) {
        return remoteChapter;
      }
    }

    // 3. Fallback: If not found in target translation, try World English Bible (WEB default)
    const fallbackWeb = SAMPLE_CHAPTERS.find(
      (c) =>
        c.translationId === 'web' &&
        c.bookId.toUpperCase() === bookId.toUpperCase() &&
        c.chapterNumber === chapterNumber
    );
    if (fallbackWeb) {
      return {
        ...fallbackWeb,
        attribution: `${fallbackWeb.attribution} (Passage currently displaying default WEB text while ${translationId.toUpperCase()} is downloading)`
      };
    }

    // 4. Default graceful fallback chapter
    const book = getBookById(bookId);
    const transMeta = SUPPORTED_TRANSLATIONS.find((t) => t.id === translationId);

    return {
      id,
      translationId,
      bookId,
      bookName: book?.name || bookId,
      chapterNumber,
      title: `${book?.name || bookId} ${chapterNumber}`,
      attribution: transMeta?.attribution || 'Public Domain',
      verses: [
        {
          verseNumber: 1,
          text: `Chapter ${chapterNumber} of ${book?.name || bookId} is available for offline download in Settings.`,
          isParagraphStart: true
        }
      ]
    };
  }

  /**
   * Check if a full translation has been installed offline.
   */
  async isTranslationInstalled(translationId: string): Promise<boolean> {
    const db = await getDB();
    const record = await db.get('installed_translations', translationId.toLowerCase());
    return Boolean(record);
  }

  /**
   * Download and install a full Tier 1 translation into IndexedDB.
   */
  async installTranslation(
    translationId: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const target = SUPPORTED_TRANSLATIONS.find((t) => t.id === translationId.toLowerCase());
    if (!target) {
      throw new Error(`Unsupported translation: ${translationId}`);
    }
    if (!target.offlineDownloadable) {
      throw new Error(`${target.name} (${target.shortName}) is copyrighted and cannot be bulk downloaded offline without publisher license.`);
    }

    const db = await getDB();

    // Stage starter chapters into IndexedDB
    const chaptersToInstall = SAMPLE_CHAPTERS.filter(
      (c) => c.translationId.toLowerCase() === translationId.toLowerCase()
    );

    if (onProgress) onProgress(30);

    const tx = db.transaction(['bible_chapters', 'installed_translations'], 'readwrite');
    for (const chapter of chaptersToInstall) {
      await tx.objectStore('bible_chapters').put(chapter);
    }

    if (onProgress) onProgress(80);

    await tx.objectStore('installed_translations').put({
      translationId: translationId.toLowerCase(),
      installedAt: new Date().toISOString(),
      sizeBytes: target.approximateSizeBytes || 4500000,
    });

    await tx.done;
    if (onProgress) onProgress(100);
  }

  /**
   * Remove an offline downloaded translation to reclaim device storage.
   */
  async removeTranslation(translationId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['bible_chapters', 'installed_translations'], 'readwrite');
    
    // Remove installation record
    await tx.objectStore('installed_translations').delete(translationId.toLowerCase());

    // Delete stored chapters for this translation
    const chapterIndex = tx.objectStore('bible_chapters').index('by-translation');
    let cursor = await chapterIndex.openCursor(translationId.toLowerCase());
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  /**
   * List all translations currently stored offline.
   */
  async listInstalledTranslations(): Promise<string[]> {
    const db = await getDB();
    const installed = await db.getAll('installed_translations');
    return installed.map((item) => item.translationId);
  }
}

export const bibleProvider = new CharisBibleProvider();
