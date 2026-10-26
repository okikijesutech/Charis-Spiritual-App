/**
 * Bible Domain Types & Canonical Scripture References
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md and docs/DATA-MODEL.md
 */

export type Testament = 'OT' | 'NT';

export type TranslationLicenseType = 'public_domain' | 'creative_commons' | 'copyrighted_api';

export interface BibleTranslationMeta {
  id: string;                       // e.g. 'web', 'kjv', 'bsb', 'esv', 'niv'
  name: string;                     // e.g. 'World English Bible'
  shortName: string;                // e.g. 'WEB'
  languageCode: string;             // e.g. 'en'
  licenseType: TranslationLicenseType;
  attribution: string;
  offlineDownloadable: boolean;
  approximateSizeBytes?: number;
  isInstalledOffline?: boolean;
}

export interface CanonicalBook {
  id: string;                       // e.g. 'GEN', 'PSA', 'JHN', 'ROM'
  name: string;                     // e.g. 'Genesis', 'Psalms', 'John'
  testament: Testament;
  order: number;                    // 1 to 66
  chapterCount: number;
  aliases: string[];                // Search parser aliases, e.g. ['jn', 'john', 'jhn']
}

export interface CanonicalReference {
  bookId: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}

export interface BibleVerse {
  verseNumber: number;
  text: string;
  isParagraphStart?: boolean;
}

export interface BibleChapter {
  id?: string;                      // e.g. 'web:PSA:23'
  translationId: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verses: BibleVerse[];
  attribution?: string;
  title?: string;
}

export interface ScriptureBookmark {
  id: string;
  userId: string;
  translationId: string;
  bookId: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptureHighlight {
  id: string;
  userId: string;
  translationId: string;
  bookId: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  colourKey: 'terracotta' | 'sage' | 'amber' | 'slate';
  createdAt: string;
  updatedAt: string;
}
