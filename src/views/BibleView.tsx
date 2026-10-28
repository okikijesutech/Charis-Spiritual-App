import React, { useState, useEffect } from 'react';
import { bibleProvider } from '../lib/bible/provider';
import { CANONICAL_BOOKS, getBookById, SUPPORTED_TRANSLATIONS } from '../lib/bible/canon';
import { scriptureSearchService, type BibleSearchResult } from '../lib/bible/search';
import { VerseActionModal, type InteractiveVerse } from '../components/bible/VerseActionModal';
import { BibleToolbar } from '../components/bible/BibleToolbar';
import { ScriptureSearchModal } from '../components/bible/ScriptureSearchModal';
import { FloatingChapterBar } from '../components/bible/FloatingChapterBar';
import { BookChapterPickerModal } from '../components/bible/BookChapterPickerModal';
import { ScriptureReadingSurface } from '../components/bible/ScriptureReadingSurface';
import { getLastBiblePosition, saveLastBiblePosition } from '../lib/bible/persistence';
import type { BibleChapter } from '../types/bible';

interface BibleViewProps {
  onAttachStudyNote?: (verseRef: string) => void;
  isChromeVisible?: boolean;
  onToggleChrome?: () => void;
}

export const BibleView: React.FC<BibleViewProps> = ({
  onAttachStudyNote,
  isChromeVisible = true,
  onToggleChrome,
}) => {
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
  const [targetVerseNumber, setTargetVerseNumber] = useState<number | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
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

  // Smooth scroll and focus target verse
  useEffect(() => {
    if (!targetVerseNumber || !chapter) return;
    const timeoutId = setTimeout(() => {
      const el = document.getElementById(`verse-${targetVerseNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [chapter, targetVerseNumber]);

  useEffect(() => {
    if (targetVerseNumber) {
      const timer = setTimeout(() => setTargetVerseNumber(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [targetVerseNumber]);

  const currentBook = getBookById(selectedBookId) || CANONICAL_BOOKS[0];
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
    if (res.reference.startVerse) {
      setTargetVerseNumber(res.reference.startVerse);
    }
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
      {/* 1. Reader Navigation Toolbar - Slides away in immersive reading mode */}
      <div className={`transition-all duration-300 ease-in-out ${
        isChromeVisible ? 'translate-y-0 opacity-100 max-h-48' : '-translate-y-4 opacity-0 max-h-0 pointer-events-none overflow-hidden'
      }`}>
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
      </div>

      {/* 2. Scripture Reading Surface */}
      <ScriptureReadingSurface
        chapter={chapter}
        currentBook={currentBook}
        selectedChapterNumber={selectedChapterNumber}
        targetVerseNumber={targetVerseNumber}
        currentTranslationMeta={currentTranslationMeta}
        fontSize={fontSize}
        interactiveVerses={interactiveVerses}
        isLoading={isLoading}
        isChromeVisible={isChromeVisible}
        onToggleChrome={onToggleChrome}
        onSelectVerse={setActiveVerse}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
      />

      {/* 3. Floating Quick Chapter Stepper on Mobile (above bottom nav) */}
      <FloatingChapterBar
        bookName={chapter ? chapter.bookName : currentBook.name}
        chapterNumber={selectedChapterNumber}
        chapterCount={currentBook.chapterCount}
        translationShortName={currentTranslationMeta.shortName}
        isVisible={Boolean(isChromeVisible)}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        onOpenPicker={() => setIsPickerOpen(true)}
      />

      {/* 4. Book, Chapter & Verse Quick Picker Modal */}
      <BookChapterPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedBookId={selectedBookId}
        selectedChapterNumber={selectedChapterNumber}
        selectedVerseNumber={targetVerseNumber}
        onSelectPassage={(bookId, chapterNum, verseNum) => {
          setSelectedBookId(bookId);
          setSelectedChapterNumber(chapterNum);
          setTargetVerseNumber(verseNum ?? null);
          saveLastBiblePosition({ translation: selectedTranslation, bookId, chapterNumber: chapterNum });
        }}
      />

      {/* 5. Scripture Search Modal */}
      <ScriptureSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectResult={handleSelectSearchResult}
      />

      {/* 5. Verse Interaction Modal */}
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
