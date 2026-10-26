/**
 * Remote Bible API Adapter
 * Fetches complete Scripture chapters (all 66 books) for KJV, NLT, and WEB.
 * Automatically persists retrieved chapters into IndexedDB for offline reading.
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md
 */

import { getBookById } from './canon';
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
   * Fetch complete chapter online for any book (1-66) in NLT, KJV, or WEB.
   */
  async fetchRemoteChapter(
    translationId: string,
    bookId: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    const book = getBookById(bookId);
    if (!book) return null;

    const tid = translationId.toLowerCase();

    try {
      if (tid === 'nlt') {
        return await this.fetchNltChapter(book.order, book.id, book.name, chapterNumber);
      } else if (tid === 'kjv') {
        return await this.fetchKjvChapter(book.order, book.id, book.name, chapterNumber);
      } else if (tid === 'web') {
        return await this.fetchWebChapter(book.order, book.id, book.name, chapterNumber);
      }
      return null;
    } catch (err) {
      console.warn(`[Remote Bible] Failed to fetch ${book.name} ${chapterNumber} (${translationId}):`, err);
      return null;
    }
  }

  /**
   * Fetch NLT chapter via Bible-Go API
   */
  private async fetchNltChapter(
    bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    const url = `https://bible-go-api.rkeplin.com/v1/books/${bookOrder}/chapters/${chapterNumber}?translation=NLT`;
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
      id: `nlt:${bookId.toUpperCase()}:${chapterNumber}`,
      translationId: 'nlt',
      bookId,
      bookName,
      chapterNumber,
      title: `${bookName} ${chapterNumber}`,
      attribution: 'Scripture quotations marked (NLT) are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers.',
      verses,
    };

    // Automatically cache locally in IndexedDB for offline reading
    await this.cacheChapterLocally(chapter);
    return chapter;
  }

  /**
   * Fetch KJV chapter via Bible-API.com
   */
  private async fetchKjvChapter(
    bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
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

    // Fallback to Bible-Go API if bible-api.com fails
    return await this.fetchBibleGoChapter('KJV', bookOrder, bookId, bookName, chapterNumber);
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

    return null;
  }

  private async fetchBibleGoChapter(
    translationKey: string,
    bookOrder: number,
    bookId: string,
    bookName: string,
    chapterNumber: number
  ): Promise<BibleChapter | null> {
    const url = `https://bible-go-api.rkeplin.com/v1/books/${bookOrder}/chapters/${chapterNumber}?translation=${translationKey}`;
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
      attribution: `${translationKey} Bible`,
      verses,
    };

    await this.cacheChapterLocally(chapter);
    return chapter;
  }

  private async cacheChapterLocally(chapter: BibleChapter): Promise<void> {
    try {
      const db = await getDB();
      await db.put('bible_chapters', chapter);
    } catch {
      // IndexedDB write failed or in non-browser context
    }
  }
}

export const remoteBibleApiAdapter = new RemoteBibleApiAdapter();
