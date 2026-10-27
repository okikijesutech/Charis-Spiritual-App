/**
 * Remote Bible API Adapter
 * Fetches complete Scripture chapters (all 66 books) across supported translations:
 * NLT, BSB, ESV, KJV, WEB, and NIV.
 * Automatically persists retrieved chapters into IndexedDB for offline reading.
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md
 */

import { getBookById, SUPPORTED_TRANSLATIONS } from './canon';
import { getDB } from '../db/indexeddb';
import type { BibleChapter, BibleVerse } from '../../types/bible';

interface BibleGoVerseItem {
  id: number;
  book: { id: number; name: string; testament: string };
  chapterId: number;
  verseId: number;
  verse: string;
}

interface BibleApiVerseItem {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleApiResponse {
  reference: string;
  verses: BibleApiVerseItem[];
  translation_id: string;
  translation_name: string;
  translation_note?: string;
}

export class RemoteBibleApiAdapter {
  /**
   * Fetch complete chapter online for any book (1-66) across supported translations.
   */
  async fetchRemoteChapter(
    translationId: string,
    bookId: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    const book = getBookById(bookId);
    if (!book) return null;

    const tid = translationId.toLowerCase();
    const meta = SUPPORTED_TRANSLATIONS.find((t) => t.id === tid);
    const attribution = meta?.attribution || `${translationId.toUpperCase()} Scripture`;

    try {
      if (tid === 'nlt') {
        return (
          (await this.fetchBollsChapter('NLT', book.order, book.id, book.name, chapterNumber, attribution)) ||
          (await this.fetchBibleGoChapter('NLT', book.order, book.id, book.name, chapterNumber, attribution))
        );
      } else if (tid === 'bsb') {
        return await this.fetchBollsChapter('BSB', book.order, book.id, book.name, chapterNumber, attribution);
      } else if (tid === 'esv') {
        return (
          (await this.fetchBollsChapter('ESV', book.order, book.id, book.name, chapterNumber, attribution)) ||
          (await this.fetchBibleGoChapter('ESV', book.order, book.id, book.name, chapterNumber, attribution))
        );
      } else if (tid === 'kjv') {
        return (
          (await this.fetchKjvChapter(book.order, book.id, book.name, chapterNumber)) ||
          (await this.fetchBollsChapter('KJV', book.order, book.id, book.name, chapterNumber, attribution))
        );
      } else if (tid === 'web') {
        return (
          (await this.fetchWebChapter(book.order, book.id, book.name, chapterNumber)) ||
          (await this.fetchBollsChapter('WEB', book.order, book.id, book.name, chapterNumber, attribution))
        );
      } else if (tid === 'niv') {
        return await this.fetchBibleGoChapter('NIV', book.order, book.id, book.name, chapterNumber, attribution);
      }
      return null;
    } catch (err) {
      console.warn(`[Remote Bible] Failed to fetch ${book.name} ${chapterNumber} (${translationId}):`, err);
      return null;
    }
  }

  /**
   * Fetch chapter from Bolls.life API (Provides Access-Control-Allow-Origin: * for browser PWAs).
   */
  private async fetchBollsChapter(
    translationKey: string,
    bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number,
    attribution: string
  ): Promise<BibleChapter | null> {
    try {
      const url = `https://bolls.life/get-chapter/${translationKey.toUpperCase()}/${bookOrder}/${chapterNumber}/`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const verses: BibleVerse[] = data.map((item: any, index: number) => ({
        verseNumber: item.verse,
        text: (item.text || '').replace(/<[^>]*>/g, '').trim(),
        isParagraphStart: index === 0 || index % 4 === 0,
      }));

      const chapter: BibleChapter = {
        id: `${translationKey.toLowerCase()}:${bookId.toUpperCase()}:${chapterNumber}`,
        translationId: translationKey.toLowerCase(),
        bookId,
        bookName,
        chapterNumber,
        title: `${bookName} ${chapterNumber}`,
        attribution,
        verses,
      };

      await this.cacheChapterLocally(chapter);
      return chapter;
    } catch {
      return null;
    }
  }

  /**
   * Fetch KJV chapter via Bible-API.com
   */
  private async fetchKjvChapter(
    _bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    try {
      const formattedName = encodeURIComponent(bookName);
      const url = `https://bible-api.com/${formattedName}+${chapterNumber}?translation=kjv`;
      const response = await fetch(url);

      if (response.ok) {
        const data: BibleApiResponse = await response.json();
        if (data.verses && data.verses.length > 0) {
          const verses: BibleVerse[] = data.verses.map((v, index) => ({
            verseNumber: v.verse,
            text: v.text.trim(),
            isParagraphStart: index === 0 || index % 4 === 0,
          }));

          const chapter: BibleChapter = {
            id: `kjv:${bookId.toUpperCase()}:${chapterNumber}`,
            translationId: 'kjv',
            bookId,
            bookName,
            chapterNumber,
            title: `${bookName} ${chapterNumber}`,
            attribution: 'King James Version (Public Domain)',
            verses,
          };

          await this.cacheChapterLocally(chapter);
          return chapter;
        }
      }
    } catch {
      // Ignored
    }
    return null;
  }

  /**
   * Fetch WEB chapter via Bible-API.com
   */
  private async fetchWebChapter(
    _bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    try {
      const formattedName = encodeURIComponent(bookName);
      const url = `https://bible-api.com/${formattedName}+${chapterNumber}?translation=web`;
      const response = await fetch(url);

      if (response.ok) {
        const data: BibleApiResponse = await response.json();
        if (data.verses && data.verses.length > 0) {
          const verses: BibleVerse[] = data.verses.map((v, index) => ({
            verseNumber: v.verse,
            text: v.text.trim(),
            isParagraphStart: index === 0 || index % 4 === 0,
          }));

          const chapter: BibleChapter = {
            id: `web:${bookId.toUpperCase()}:${chapterNumber}`,
            translationId: 'web',
            bookId,
            bookName,
            chapterNumber,
            title: `${bookName} ${chapterNumber}`,
            attribution: 'World English Bible (Public Domain)',
            verses,
          };

          await this.cacheChapterLocally(chapter);
          return chapter;
        }
      }
    } catch {
      // Ignored
    }
    return null;
  }

  /**
   * Fetch chapter from Bible-Go API (with dev proxy support for CORS)
   */
  private async fetchBibleGoChapter(
    translationKey: string,
    bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number,
    attribution: string
  ): Promise<BibleChapter | null> {
    try {
      const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const baseUrl = isDev ? '/api/bible-go' : 'https://bible-go-api.rkeplin.com';
      const url = `${baseUrl}/v1/books/${bookOrder}/chapters/${chapterNumber}?translation=${translationKey.toUpperCase()}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data: BibleGoVerseItem[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const verses: BibleVerse[] = data.map((item, index) => ({
        verseNumber: item.verseId,
        text: item.verse.replace(/^["'\s]+|["'\s]+$/g, ''),
        isParagraphStart: index === 0 || index % 4 === 0,
      }));

      const chapter: BibleChapter = {
        id: `${translationKey.toLowerCase()}:${bookId.toUpperCase()}:${chapterNumber}`,
        translationId: translationKey.toLowerCase(),
        bookId,
        bookName,
        chapterNumber,
        title: `${bookName} ${chapterNumber}`,
        attribution,
        verses,
      };

      await this.cacheChapterLocally(chapter);
      return chapter;
    } catch {
      return null;
    }
  }

  private async cacheChapterLocally(chapter: BibleChapter): Promise<void> {
    try {
      const db = await getDB();
      await db.put('bible_chapters', chapter);
    } catch {
      // Non-browser or quota error ignored
    }
  }
}

export const remoteBibleApiAdapter = new RemoteBibleApiAdapter();
