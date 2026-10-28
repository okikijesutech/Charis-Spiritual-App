import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { bibleProvider } from '../lib/bible/provider';
import { CANONICAL_BOOKS, getBookById, SUPPORTED_TRANSLATIONS } from '../lib/bible/canon';
import { scriptureSearchService, type BibleSearchResult } from '../lib/bible/search';
import { VerseActionModal, type InteractiveVerse } from '../components/bible/VerseActionModal';
import { BibleToolbar } from '../components/bible/BibleToolbar';
import { ScriptureSearchModal } from '../components/bible/ScriptureSearchModal';
import { getLastBiblePosition, saveLastBiblePosition } from '../lib/bible/persistence';
import type { BibleChapter } from '../types/bible';
import { Badge } from '../components/ui/Badge';

interface BibleViewProps {
  onAttachStudyNote?: (verseRef: string) => void;
}

export const BibleView: React.FC<BibleViewProps> = ({ onAttachStudyNote }) => {
  // Load saved position from previous session or Genesis 1 for first-time readers
  const initialPos = getLastBiblePosition();

  const [selectedTranslation, setSelectedTranslation] = useState<string>(initialPos.translation);
  const [selectedBookId, setSelectedBookId] = useState<string>(initialPos.bookId);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(initialPos.chapterNumber);
  const [fontSize, setFontSize] = useState<number>(18);
  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [interactiveVerses, setInteractiveVerses] = useState<InteractiveVerse[]>([]);
  const [activeVerse, setActiveVerse] = useState<InteractiveVerse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);

  // Desktop search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentBook = getBookById(selectedBookId) || CANONICAL_BOOKS[0]; // Genesis default
  const currentTranslationMeta =
    SUPPORTED_TRANSLATIONS.find((t) => t.id === selectedTranslation) || SUPPORTED_TRANSLATIONS[0];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    bibleProvider
      .getChapter(selectedTranslation, selectedBookId, selectedChapterNumber)
      .then((res) => {
        if (isMounted) {
          setChapter(res);
          setInteractiveVerses(res.verses.map((v) => ({ ...v })));
          setActiveVerse(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTranslation, selectedBookId, selectedChapterNumber]);

  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    setSelectedChapterNumber(1);
    saveLastBiblePosition({ translation: selectedTranslation, bookId, chapterNumber: 1 });
  };

  const handleChapterChange = (chapterNumber: number) => {
    setSelectedChapterNumber(chapterNumber);
    saveLastBiblePosition({ translation: selectedTranslation, bookId: selectedBookId, chapterNumber });
  };

  const handleTranslationChange = (translationId: string) => {
    setSelectedTranslation(translationId);
    saveLastBiblePosition({ translation: translationId, bookId: selectedBookId, chapterNumber: selectedChapterNumber });
  };

  const handlePrevChapter = () => {
    if (selectedChapterNumber > 1) {
      handleChapterChange(selectedChapterNumber - 1);
    }
  };

  const handleNextChapter = () => {
    if (selectedChapterNumber < currentBook.chapterCount) {
      handleChapterChange(selectedChapterNumber + 1);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const results = await scriptureSearchService.search(q, selectedTranslation);
    setSearchResults(results);
  };

  const handleSelectSearchResult = (res: BibleSearchResult) => {
    setSelectedBookId(res.reference.bookId);
    setSelectedChapterNumber(res.reference.chapter);
    saveLastBiblePosition({
      translation: selectedTranslation,
      bookId: res.reference.bookId,
      chapterNumber: res.reference.chapter,
    });
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleToggleBookmark = (v: InteractiveVerse) => {
    setInteractiveVerses((prev) =>
      prev.map((item) => (item.verseNumber === v.verseNumber ? { ...item, isBookmarked: !item.isBookmarked } : item))
    );
    if (activeVerse) {
      setActiveVerse((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null));
    }
  };

  const handleHighlight = (color: 'terracotta' | 'sage' | 'amber' | 'none') => {
    if (!activeVerse) return;
    setInteractiveVerses((prev) =>
      prev.map((item) =>
        item.verseNumber === activeVerse.verseNumber
          ? { ...item, isHighlighted: color !== 'none', highlightColor: color !== 'none' ? color : undefined }
          : item
      )
    );
    setActiveVerse(null);
  };

  const handleCopy = () => {
    if (!activeVerse || !chapter) return;
    const textToCopy = `"${activeVerse.text}" — ${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber} (${currentTranslationMeta.shortName})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
      setActiveVerse(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Reader Navigation Toolbar */}
      <BibleToolbar
        selectedBookId={selectedBookId}
        selectedChapterNumber={selectedChapterNumber}
        selectedTranslation={selectedTranslation}
        chapterCount={currentBook.chapterCount}
        fontSize={fontSize}
        onBookChange={handleBookChange}
        onChapterChange={handleChapterChange}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        onTranslationChange={handleTranslationChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        onFontSizeChange={setFontSize}
      />

      {/* 2. Scripture Reading Surface */}
      <article className="max-w-3xl mx-auto rounded-2xl bg-charis-surface border border-charis-border p-6 sm:p-10 shadow-card relative">
        {isLoading && (
          <div className="absolute inset-0 bg-charis-surface/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-20">
            <div className="flex items-center gap-2 text-sm text-charis-primary font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading chapter...</span>
            </div>
          </div>
        )}

        <header className="text-center pb-8 border-b border-charis-border/60">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-charis-primary">
              {currentTranslationMeta.name} ({currentTranslationMeta.shortName})
            </span>
            <Badge variant={currentTranslationMeta.offlineDownloadable ? 'sage' : 'outline'} size="sm">
              {currentTranslationMeta.offlineDownloadable ? 'Offline Ready' : 'Online API'}
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charis-text mt-1">
            {chapter ? `${chapter.bookName} ${chapter.chapterNumber}` : `${currentBook.name} ${selectedChapterNumber}`}
          </h2>
          {chapter?.title && (
            <p className="text-xs text-charis-text-muted font-serif italic mt-1.5">{chapter.title}</p>
          )}
        </header>

        {/* Verses Container */}
        <div
          className="mt-8 font-serif leading-[1.75] text-charis-text selection:bg-charis-primary/20 space-y-4"
          style={{ fontSize: `${fontSize}px` }}
        >
          {interactiveVerses.map((v) => {
            let highlightStyle = '';
            if (v.isHighlighted) {
              if (v.highlightColor === 'terracotta') highlightStyle = 'bg-charis-primary/15 px-1 rounded';
              else if (v.highlightColor === 'sage') highlightStyle = 'bg-charis-secondary/15 px-1 rounded';
              else highlightStyle = 'bg-amber-400/20 px-1 rounded';
            }

            return (
              <p
                key={v.verseNumber}
                onClick={() => setActiveVerse(v)}
                className={`group cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-charis-border-subtle/70 ${highlightStyle}`}
                tabIndex={0}
                role="button"
              >
                <sup className="text-xs font-sans font-bold text-charis-primary mr-2 select-none">
                  {v.verseNumber}
                </sup>
                <span>{v.text}</span>
                {v.isBookmarked && (
                  <Bookmark className="inline-block w-3.5 h-3.5 ml-1.5 text-charis-primary fill-current align-middle" />
                )}
              </p>
            );
          })}
        </div>

        {/* Chapter Bottom Navigation Stepper */}
        <div className="mt-10 pt-6 border-t border-charis-border/60 flex items-center justify-between">
          <button
            onClick={handlePrevChapter}
            disabled={selectedChapterNumber <= 1}
            className="flex items-center gap-1.5 text-xs font-medium text-charis-text-muted hover:text-charis-text disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Chapter</span>
          </button>
          <span className="text-xs text-charis-text-muted font-sans font-medium">
            {currentBook.name} {selectedChapterNumber} of {currentBook.chapterCount}
          </span>
          <button
            onClick={handleNextChapter}
            disabled={selectedChapterNumber >= currentBook.chapterCount}
            className="flex items-center gap-1.5 text-xs font-medium text-charis-text-muted hover:text-charis-text disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Translation Attribution Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-charis-text-muted leading-relaxed max-w-2xl mx-auto">
            {chapter?.attribution || currentTranslationMeta.attribution}
          </p>
        </footer>
      </article>

      {/* 3. Scripture Search Modal */}
      <ScriptureSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectResult={handleSelectSearchResult}
      />

      {/* 4. Verse Interaction Modal */}
      <VerseActionModal
        activeVerse={activeVerse}
        chapter={chapter}
        translationShortName={currentTranslationMeta.shortName}
        copiedNotification={copiedNotification}
        onClose={() => setActiveVerse(null)}
        onToggleBookmark={handleToggleBookmark}
        onCopy={handleCopy}
        onHighlight={handleHighlight}
        onAttachStudyNote={onAttachStudyNote}
      />
    </div>
  );
};
