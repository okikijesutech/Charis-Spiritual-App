/**
 * Canonical Protestant Bible Canon & Reference Parser
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md
 * Standardizes 66 books with chapter counts and reference parsing.
 */

import type { CanonicalBook, CanonicalReference, BibleTranslationMeta } from '../../types/bible';

export const SUPPORTED_TRANSLATIONS: BibleTranslationMeta[] = [
  {
    id: 'web',
    name: 'World English Bible',
    shortName: 'WEB',
    languageCode: 'en',
    licenseType: 'public_domain',
    attribution: 'Public Domain. A modern English translation produced by Rainbow Missions.',
    offlineDownloadable: true,
    approximateSizeBytes: 4700000,
  },
  {
    id: 'bsb',
    name: 'Berean Standard Bible',
    shortName: 'BSB',
    languageCode: 'en',
    licenseType: 'public_domain',
    attribution: 'Dedicated to the Public Domain (CC0) by Bible Hub (2023).',
    offlineDownloadable: true,
    approximateSizeBytes: 4600000,
  },
  {
    id: 'kjv',
    name: 'King James Version',
    shortName: 'KJV',
    languageCode: 'en',
    licenseType: 'public_domain',
    attribution: 'Public Domain worldwide (1611 tradition).',
    offlineDownloadable: true,
    approximateSizeBytes: 4400000,
  },
  {
    id: 'esv',
    name: 'English Standard Version',
    shortName: 'ESV',
    languageCode: 'en',
    licenseType: 'copyrighted_api',
    attribution: 'Scripture quotations are from the ESV® Bible, Copyright © 2001 by Crossway.',
    offlineDownloadable: false,
  },
  {
    id: 'niv',
    name: 'New International Version',
    shortName: 'NIV',
    languageCode: 'en',
    licenseType: 'copyrighted_api',
    attribution: 'Scripture quotations taken from The Holy Bible, New International Version® NIV®.',
    offlineDownloadable: false,
  },
];

export const CANONICAL_BOOKS: CanonicalBook[] = [
  // Old Testament
  { id: 'GEN', name: 'Genesis', testament: 'OT', order: 1, chapterCount: 50, aliases: ['gen', 'genesis'] },
  { id: 'EXO', name: 'Exodus', testament: 'OT', order: 2, chapterCount: 40, aliases: ['ex', 'exo', 'exod', 'exodus'] },
  { id: 'LEV', name: 'Leviticus', testament: 'OT', order: 3, chapterCount: 27, aliases: ['lev', 'leviticus'] },
  { id: 'NUM', name: 'Numbers', testament: 'OT', order: 4, chapterCount: 36, aliases: ['num', 'numbers'] },
  { id: 'DEU', name: 'Deuteronomy', testament: 'OT', order: 5, chapterCount: 34, aliases: ['deut', 'deu', 'deuteronomy'] },
  { id: 'JOS', name: 'Joshua', testament: 'OT', order: 6, chapterCount: 24, aliases: ['josh', 'jos', 'joshua'] },
  { id: 'JDG', name: 'Judges', testament: 'OT', order: 7, chapterCount: 21, aliases: ['judg', 'jdg', 'judges'] },
  { id: 'RUT', name: 'Ruth', testament: 'OT', order: 8, chapterCount: 4, aliases: ['ruth', 'rut'] },
  { id: '1SA', name: '1 Samuel', testament: 'OT', order: 9, chapterCount: 31, aliases: ['1sam', '1sa', '1 samuel'] },
  { id: '2SA', name: '2 Samuel', testament: 'OT', order: 10, chapterCount: 24, aliases: ['2sam', '2sa', '2 samuel'] },
  { id: '1KI', name: '1 Kings', testament: 'OT', order: 11, chapterCount: 22, aliases: ['1kings', '1ki', '1 kings'] },
  { id: '2KI', name: '2 Kings', testament: 'OT', order: 12, chapterCount: 25, aliases: ['2kings', '2ki', '2 kings'] },
  { id: '1CH', name: '1 Chronicles', testament: 'OT', order: 13, chapterCount: 29, aliases: ['1chron', '1ch', '1 chronicles'] },
  { id: '2CH', name: '2 Chronicles', testament: 'OT', order: 14, chapterCount: 36, aliases: ['2chron', '2ch', '2 chronicles'] },
  { id: 'EZR', name: 'Ezra', testament: 'OT', order: 15, chapterCount: 10, aliases: ['ezra', 'ezr'] },
  { id: 'NEH', name: 'Nehemiah', testament: 'OT', order: 16, chapterCount: 13, aliases: ['neh', 'nehemiah'] },
  { id: 'EST', name: 'Esther', testament: 'OT', order: 17, chapterCount: 10, aliases: ['est', 'esth', 'esther'] },
  { id: 'JOB', name: 'Job', testament: 'OT', order: 18, chapterCount: 42, aliases: ['job'] },
  { id: 'PSA', name: 'Psalms', testament: 'OT', order: 19, chapterCount: 150, aliases: ['ps', 'psa', 'psalm', 'psalms'] },
  { id: 'PRO', name: 'Proverbs', testament: 'OT', order: 20, chapterCount: 31, aliases: ['prov', 'pro', 'proverbs'] },
  { id: 'ECC', name: 'Ecclesiastes', testament: 'OT', order: 21, chapterCount: 12, aliases: ['eccl', 'ecc', 'ecclesiastes'] },
  { id: 'SNG', name: 'Song of Songs', testament: 'OT', order: 22, chapterCount: 8, aliases: ['song', 'sng', 'canticles'] },
  { id: 'ISA', name: 'Isaiah', testament: 'OT', order: 23, chapterCount: 66, aliases: ['isa', 'isaiah'] },
  { id: 'JER', name: 'Jeremiah', testament: 'OT', order: 24, chapterCount: 52, aliases: ['jer', 'jeremiah'] },
  { id: 'LAM', name: 'Lamentations', testament: 'OT', order: 25, chapterCount: 5, aliases: ['lam', 'lamentations'] },
  { id: 'EZK', name: 'Ezekiel', testament: 'OT', order: 26, chapterCount: 48, aliases: ['ezek', 'ezk', 'ezekiel'] },
  { id: 'DAN', name: 'Daniel', testament: 'OT', order: 27, chapterCount: 12, aliases: ['dan', 'daniel'] },
  { id: 'HOS', name: 'Hosea', testament: 'OT', order: 28, chapterCount: 14, aliases: ['hos', 'hosea'] },
  { id: 'JOL', name: 'Joel', testament: 'OT', order: 29, chapterCount: 3, aliases: ['joel', 'jol'] },
  { id: 'AMO', name: 'Amos', testament: 'OT', order: 30, chapterCount: 9, aliases: ['amos', 'amo'] },
  { id: 'OBA', name: 'Obadiah', testament: 'OT', order: 31, chapterCount: 1, aliases: ['obad', 'oba', 'obadiah'] },
  { id: 'JON', name: 'Jonah', testament: 'OT', order: 32, chapterCount: 4, aliases: ['jon', 'jonah'] },
  { id: 'MIC', name: 'Micah', testament: 'OT', order: 33, chapterCount: 7, aliases: ['mic', 'micah'] },
  { id: 'NAM', name: 'Nahum', testament: 'OT', order: 34, chapterCount: 3, aliases: ['nah', 'nam', 'nahum'] },
  { id: 'HAB', name: 'Habakkuk', testament: 'OT', order: 35, chapterCount: 3, aliases: ['hab', 'habakkuk'] },
  { id: 'ZEP', name: 'Zephaniah', testament: 'OT', order: 36, chapterCount: 3, aliases: ['zeph', 'zep', 'zephaniah'] },
  { id: 'HAG', name: 'Haggai', testament: 'OT', order: 37, chapterCount: 2, aliases: ['hag', 'haggai'] },
  { id: 'ZEC', name: 'Zechariah', testament: 'OT', order: 38, chapterCount: 14, aliases: ['zech', 'zec', 'zechariah'] },
  { id: 'MAL', name: 'Malachi', testament: 'OT', order: 39, chapterCount: 4, aliases: ['mal', 'malachi'] },

  // New Testament
  { id: 'MAT', name: 'Matthew', testament: 'NT', order: 40, chapterCount: 28, aliases: ['matt', 'mat', 'matthew'] },
  { id: 'MRK', name: 'Mark', testament: 'NT', order: 41, chapterCount: 16, aliases: ['mark', 'mrk', 'mk'] },
  { id: 'LUK', name: 'Luke', testament: 'NT', order: 42, chapterCount: 24, aliases: ['luke', 'luk', 'lk'] },
  { id: 'JHN', name: 'John', testament: 'NT', order: 43, chapterCount: 21, aliases: ['john', 'jhn', 'jn'] },
  { id: 'ACT', name: 'Acts', testament: 'NT', order: 44, chapterCount: 28, aliases: ['acts', 'act'] },
  { id: 'ROM', name: 'Romans', testament: 'NT', order: 45, chapterCount: 16, aliases: ['rom', 'romans'] },
  { id: '1CO', name: '1 Corinthians', testament: 'NT', order: 46, chapterCount: 16, aliases: ['1cor', '1co', '1 corinthians'] },
  { id: '2CO', name: '2 Corinthians', testament: 'NT', order: 47, chapterCount: 13, aliases: ['2cor', '2co', '2 corinthians'] },
  { id: 'GAL', name: 'Galatians', testament: 'NT', order: 48, chapterCount: 6, aliases: ['gal', 'galatians'] },
  { id: 'EPH', name: 'Ephesians', testament: 'NT', order: 49, chapterCount: 6, aliases: ['eph', 'ephesians'] },
  { id: 'PHP', name: 'Philippians', testament: 'NT', order: 50, chapterCount: 4, aliases: ['phil', 'php', 'philippians'] },
  { id: 'COL', name: 'Colossians', testament: 'NT', order: 51, chapterCount: 4, aliases: ['col', 'colossians'] },
  { id: '1TH', name: '1 Thessalonians', testament: 'NT', order: 52, chapterCount: 5, aliases: ['1thess', '1th', '1 thessalonians'] },
  { id: '2TH', name: '2 Thessalonians', testament: 'NT', order: 53, chapterCount: 3, aliases: ['2thess', '2th', '2 thessalonians'] },
  { id: '1TI', name: '1 Timothy', testament: 'NT', order: 54, chapterCount: 6, aliases: ['1tim', '1ti', '1 timothy'] },
  { id: '2TI', name: '2 Timothy', testament: 'NT', order: 55, chapterCount: 4, aliases: ['2tim', '2ti', '2 timothy'] },
  { id: 'TIT', name: 'Titus', testament: 'NT', order: 56, chapterCount: 3, aliases: ['titus', 'tit'] },
  { id: 'PHM', name: 'Philemon', testament: 'NT', order: 57, chapterCount: 1, aliases: ['philem', 'phm', 'philemon'] },
  { id: 'HEB', name: 'Hebrews', testament: 'NT', order: 58, chapterCount: 13, aliases: ['heb', 'hebrews'] },
  { id: 'JAS', name: 'James', testament: 'NT', order: 59, chapterCount: 5, aliases: ['jas', 'james', 'jam'] },
  { id: '1PE', name: '1 Peter', testament: 'NT', order: 60, chapterCount: 5, aliases: ['1pet', '1pe', '1 peter'] },
  { id: '2PE', name: '2 Peter', testament: 'NT', order: 61, chapterCount: 3, aliases: ['2pet', '2pe', '2 peter'] },
  { id: '1JN', name: '1 John', testament: 'NT', order: 62, chapterCount: 5, aliases: ['1john', '1jn', '1 john'] },
  { id: '2JN', name: '2 John', testament: 'NT', order: 63, chapterCount: 1, aliases: ['2john', '2jn', '2 john'] },
  { id: '3JN', name: '3 John', testament: 'NT', order: 64, chapterCount: 1, aliases: ['3john', '3jn', '3 john'] },
  { id: 'JUD', name: 'Jude', testament: 'NT', order: 65, chapterCount: 1, aliases: ['jude', 'jud'] },
  { id: 'REV', name: 'Revelation', testament: 'NT', order: 66, chapterCount: 22, aliases: ['rev', 'revelation', 'apocalypse'] },
];

export function getBookById(id: string): CanonicalBook | undefined {
  return CANONICAL_BOOKS.find((b) => b.id.toUpperCase() === id.toUpperCase());
}

export function findBook(query: string): CanonicalBook | undefined {
  const clean = query.trim().toLowerCase().replace(/\./g, '');
  return CANONICAL_BOOKS.find(
    (b) => b.id.toLowerCase() === clean || b.name.toLowerCase() === clean || b.aliases.includes(clean)
  );
}

/**
 * Parses user passage input e.g. "John 3:16", "Ps 23", "1 Cor 13:4-8"
 */
export function parseScriptureReference(input: string): CanonicalReference | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^((?:\d\s+)?[a-zA-Z\s]+?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;

  const [, bookStr, chapterStr, startVerseStr, endVerseStr] = match;
  const book = findBook(bookStr);
  if (!book) return null;

  const chapter = parseInt(chapterStr, 10);
  if (chapter < 1 || chapter > book.chapterCount) return null;

  return {
    bookId: book.id,
    chapter,
    startVerse: startVerseStr ? parseInt(startVerseStr, 10) : undefined,
    endVerse: endVerseStr ? parseInt(endVerseStr, 10) : undefined,
  };
}

export function formatScriptureReference(ref: CanonicalReference): string {
  const book = getBookById(ref.bookId);
  const bookName = book?.name || ref.bookId;
  if (!ref.startVerse) {
    return `${bookName} ${ref.chapter}`;
  }
  if (!ref.endVerse || ref.startVerse === ref.endVerse) {
    return `${bookName} ${ref.chapter}:${ref.startVerse}`;
  }
  return `${bookName} ${ref.chapter}:${ref.startVerse}–${ref.endVerse}`;
}
