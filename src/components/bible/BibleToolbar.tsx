/**
 * Bible Reader Navigation Toolbar
 * Book selector, chapter stepper, translation select, search trigger, and font adjuster.
 * Per docs/PRD.md FR-03.
 */

import React from 'react';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Type 
} from 'lucide-react';
import { CANONICAL_BOOKS, SUPPORTED_TRANSLATIONS } from '../../lib/bible/canon';

interface BibleToolbarProps {
  selectedBookId: string;
  selectedChapterNumber: number;
  selectedTranslation: string;
  chapterCount: number;
  fontSize: number;
  onBookChange: (bookId: string) => void;
  onChapterChange: (chapter: number) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onTranslationChange: (translationId: string) => void;
  onOpenSearch: () => void;
  onFontSizeChange: (updater: (prev: number) => number) => void;
}

export const BibleToolbar: React.FC<BibleToolbarProps> = ({
  selectedBookId,
  selectedChapterNumber,
  selectedTranslation,
  chapterCount,
  fontSize,
  onBookChange,
  onChapterChange,
  onPrevChapter,
  onNextChapter,
  onTranslationChange,
  onOpenSearch,
  onFontSizeChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-charis-surface border border-charis-border shadow-subtle">
      <div className="flex flex-wrap items-center gap-2">
        {/* Book Selector (All 66 Books) */}
        <div className="relative inline-block">
          <select
            value={selectedBookId}
            onChange={(e) => onBookChange(e.target.value)}
            aria-label="Select book of the Bible"
            className="appearance-none font-serif font-bold text-sm sm:text-base bg-charis-surface text-charis-text border border-charis-border rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer shadow-subtle"
          >
            <optgroup label="Old Testament">
              {CANONICAL_BOOKS.filter((b) => b.testament === 'OT').map((b) => (
                <option key={b.id} value={b.id} className="bg-charis-surface text-charis-text py-1.5">
                  {b.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="New Testament">
              {CANONICAL_BOOKS.filter((b) => b.testament === 'NT').map((b) => (
                <option key={b.id} value={b.id} className="bg-charis-surface text-charis-text py-1.5">
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-charis-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Chapter Selector & Stepper */}
        <div className="flex items-center gap-1 border border-charis-border rounded-xl px-1.5 py-1 bg-charis-surface">
          <button
            onClick={onPrevChapter}
            disabled={selectedChapterNumber <= 1}
            className="p-1 rounded text-charis-text hover:bg-charis-border-subtle disabled:opacity-30 disabled:pointer-events-none"
            title="Previous chapter"
            aria-label="Previous chapter"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <select
            value={selectedChapterNumber}
            onChange={(e) => onChapterChange(parseInt(e.target.value, 10))}
            aria-label="Select chapter"
            className="appearance-none font-sans font-semibold text-xs bg-transparent text-charis-text px-2 py-0.5 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch} className="bg-charis-surface text-charis-text">
                Ch {ch}
              </option>
            ))}
          </select>
          <button
            onClick={onNextChapter}
            disabled={selectedChapterNumber >= chapterCount}
            className="p-1 rounded text-charis-text hover:bg-charis-border-subtle disabled:opacity-30 disabled:pointer-events-none"
            title="Next chapter"
            aria-label="Next chapter"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Translation Select */}
        <div className="relative inline-block shrink-0">
          <select
            value={selectedTranslation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className="appearance-none font-sans font-semibold text-xs bg-charis-surface text-charis-text border border-charis-border rounded-xl px-2.5 sm:px-3 py-2 pr-6 sm:pr-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer shadow-subtle max-w-[100px] sm:max-w-none truncate"
            aria-label="Select Bible translation"
          >
            {SUPPORTED_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id} className="bg-charis-surface text-charis-text py-1.5">
                {t.shortName} — {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-charis-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch}
          className="p-2 sm:px-2.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text-muted hover:text-charis-text transition-colors flex items-center gap-1.5 text-xs shadow-subtle shrink-0"
          title="Search all 66 books or topics (Ctrl+K / ⌘K)"
          aria-label="Search Scripture (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-charis-primary" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-charis-border-subtle text-charis-text-muted border border-charis-border">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Font Size Adjuster */}
      <div className="flex items-center gap-1 border border-charis-border rounded-xl px-2 py-1 bg-charis-border-subtle/40">
        <Type className="w-3.5 h-3.5 text-charis-text-muted mr-1" />
        <button
          onClick={() => onFontSizeChange((prev) => Math.max(15, prev - 1))}
          aria-label="Decrease font size"
          className="w-7 h-7 flex items-center justify-center rounded text-xs font-semibold hover:bg-charis-border text-charis-text transition-colors"
        >
          A-
        </button>
        <span className="text-xs text-charis-text-muted font-mono px-1">{fontSize}</span>
        <button
          onClick={() => onFontSizeChange((prev) => Math.min(26, prev + 1))}
          aria-label="Increase font size"
          className="w-7 h-7 flex items-center justify-center rounded text-sm font-semibold hover:bg-charis-border text-charis-text transition-colors"
        >
          A+
        </button>
      </div>
    </div>
  );
};
