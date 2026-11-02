import React, { useState, useEffect, useCallback } from 'react';
import { bibleProvider } from '../lib/bible/provider';
import { CANONICAL_BOOKS, getBookById, SUPPORTED_TRANSLATIONS } from '../lib/bible/canon';
import { scriptureSearchService, type BibleSearchResult } from '../lib/bible/search';
import { VerseActionModal, type InteractiveVerse } from '../components/bible/VerseActionModal';
import { BibleToolbar } from '../components/bible/BibleToolbar';
import { ScriptureSearchModal } from '../components/bible/ScriptureSearchModal';
import { FloatingChapterBar } from '../components/bible/FloatingChapterBar';
import { BookChapterPickerModal } from '../components/bible/BookChapterPickerModal';
import { ScriptureReadingSurface } from '../components/bible/ScriptureReadingSurface';
import { AssistedSOAPDrawer } from '../components/bible/AssistedSOAPDrawer';
import { TranslationPickerModal } from '../components/bible/TranslationPickerModal';
import { bibleDownloadManager } from '../lib/bible/download-manager';
import { getLastBiblePosition, saveLastBiblePosition } from '../lib/bible/persistence';
import { completeJourneyAssignment } from '../lib/plans/plan-progress';
import { useAuth } from '../context/AuthContext';
import type { BibleChapter } from '../types/bible';

export interface ActiveJourneyContext {
  planId: string;
  planName: string;
  assignmentId: string;
  dayNumber: number;
  passages?: string[];
}

interface BibleViewProps {
  onAttachStudyNote?: (verseRef: string) => void;
  isChromeVisible?: boolean;
  onToggleChrome?: () => void;
  targetPassage?: { bookId: string; chapterNumber: number; verseNumber?: number } | null;
  onClearTargetPassage?: () => void;
  journeyContext?: ActiveJourneyContext | null;
  onClearJourneyContext?: () => void;
}

export const BibleView: React.FC<BibleViewProps> = ({
  onAttachStudyNote,
  isChromeVisible = true,
  onToggleChrome,
  targetPassage,
  onClearTargetPassage,
  journeyContext,
  onClearJourneyContext,
}) => {
  const initialPos = getLastBiblePosition();

  const [selectedTranslation, setSelectedTranslation] = useState<string>(initialPos.translation);
  const [selectedBookId, setSelectedBookId] = useState<string>(initialPos.bookId);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(initialPos.chapterNumber);
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('charis_reader_font_size');
      return saved ? Math.min(26, Math.max(15, Number(saved))) : 18;
    } catch {
      return 18;
    }
  });

  const handleFontSizeChange = (updater: (prev: number) => number) => {
    setFontSize((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('charis_reader_font_size', String(next));
      } catch {}
      return next;
    });
  };

  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [interactiveVerses, setInteractiveVerses] = useState<InteractiveVerse[]>([]);
  const [activeVerse, setActiveVerse] = useState<InteractiveVerse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [targetVerseNumber, setTargetVerseNumber] = useState<number | null>(null);

  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  // Search, Picker & Assisted SOAP drawer state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isTranslationPickerOpen, setIsTranslationPickerOpen] = useState(false);
  const [isInstalledLocally, setIsInstalledLocally] = useState(false);
  const [isSOAPDrawerOpen, setIsSOAPDrawerOpen] = useState(false);
  const [soapRef, setSoapRef] = useState<string | undefined>();
  const [soapVerseText, setSoapVerseText] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);

  useEffect(() => {
    bibleDownloadManager.isTranslationInstalled(selectedTranslation).then(setIsInstalledLocally);
  }, [selectedTranslation, isTranslationPickerOpen]);

  const handleOpenSOAPAssistant = (ref: string, verseText?: string) => {
    setSoapRef(ref);
    setSoapVerseText(verseText);
    setIsSOAPDrawerOpen(true);
    if (onAttachStudyNote) onAttachStudyNote(ref);
  };

  const currentBook = getBookById(selectedBookId) || CANONICAL_BOOKS[0];
  const currentTranslationMeta =
    SUPPORTED_TRANSLATIONS.find((t) => t.id === selectedTranslation) || SUPPORTED_TRANSLATIONS[0];

  // Desktop keyboard shortcuts (ArrowLeft/Right for chapters, Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (isSearchOpen || isPickerOpen || Boolean(activeVerse)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'ArrowLeft' && selectedChapterNumber > 1) {
        e.preventDefault();
        handleChapterChange(selectedChapterNumber - 1);
      } else if (e.key === 'ArrowRight' && selectedChapterNumber < currentBook.chapterCount) {
        e.preventDefault();
        handleChapterChange(selectedChapterNumber + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isPickerOpen, activeVerse, selectedChapterNumber, currentBook.chapterCount]);

  // Scroll to top on chapter change (unless deep-linking to target verse)
  useEffect(() => {
    if (!targetVerseNumber) {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedBookId, selectedChapterNumber, targetVerseNumber]);

  // Smooth scroll and focus target verse, auto-dismissing highlight after 3s
  useEffect(() => {
    if (!targetVerseNumber) return;
    if (chapter) {
      const scrollTimer = setTimeout(() => {
        document.getElementById(`verse-${targetVerseNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      const dismissTimer = setTimeout(() => setTargetVerseNumber(null), 3000);
      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [chapter, targetVerseNumber]);

  // Deep-link to target passage from Journey or cross-links
  useEffect(() => {
    if (targetPassage) {
      setSelectedBookId(targetPassage.bookId);
      setSelectedChapterNumber(targetPassage.chapterNumber);
      if (targetPassage.verseNumber) setTargetVerseNumber(targetPassage.verseNumber);
      saveLastBiblePosition({ translation: selectedTranslation, bookId: targetPassage.bookId, chapterNumber: targetPassage.chapterNumber });
      onClearTargetPassage?.();
    }
  }, [targetPassage, selectedTranslation, onClearTargetPassage]);

  const [journeyCompletedDay, setJourneyCompletedDay] = useState<number | null>(null);

  const handleCompleteJourney = async () => {
    if (!journeyContext) return;
    try {
      await completeJourneyAssignment(journeyContext.assignmentId, journeyContext.planId, activeUserId);
      setJourneyCompletedDay(journeyContext.dayNumber);
    } catch (e) {
      console.warn('[BibleView] Complete journey failed:', e);
    }
  };

  const loadChapter = useCallback(() => {
    let isMounted = true;
    setIsLoading(true);
    bibleProvider.getChapter(selectedTranslation, selectedBookId, selectedChapterNumber)
      .then((res) => {
        if (isMounted) {
          setChapter(res);
          setInteractiveVerses(res.verses.map((v) => ({ ...v })));
          setActiveVerse(null);
          setIsLoading(false);
        }
      })
      .catch(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [selectedTranslation, selectedBookId, selectedChapterNumber]);

  useEffect(() => {
    return loadChapter();
  }, [loadChapter]);

  const handleBookChange = (bookId: string) => { onClearJourneyContext?.(); setSelectedBookId(bookId); setSelectedChapterNumber(1); saveLastBiblePosition({ translation: selectedTranslation, bookId, chapterNumber: 1 }); };
  const handleChapterChange = (chapterNumber: number) => { setSelectedChapterNumber(chapterNumber); saveLastBiblePosition({ translation: selectedTranslation, bookId: selectedBookId, chapterNumber }); };
  const handleTranslationChange = (translationId: string) => { setSelectedTranslation(translationId); saveLastBiblePosition({ translation: translationId, bookId: selectedBookId, chapterNumber: selectedChapterNumber }); };
  const handlePrevChapter = () => { if (selectedChapterNumber > 1) handleChapterChange(selectedChapterNumber - 1); };
  const handleNextChapter = () => { if (selectedChapterNumber < currentBook.chapterCount) handleChapterChange(selectedChapterNumber + 1); };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchResults(await scriptureSearchService.search(q, selectedTranslation));
  };

  const handleSelectSearchResult = (res: BibleSearchResult) => {
    setSelectedBookId(res.reference.bookId); setSelectedChapterNumber(res.reference.chapter);
    if (res.reference.startVerse) setTargetVerseNumber(res.reference.startVerse);
    saveLastBiblePosition({ translation: selectedTranslation, bookId: res.reference.bookId, chapterNumber: res.reference.chapter });
    setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]);
  };

  const handleSelectPassage = (bookId: string, chapterNum: number, verseNum?: number) => {
    setSelectedBookId(bookId);
    setSelectedChapterNumber(chapterNum);
    setTargetVerseNumber(verseNum ?? null);
    saveLastBiblePosition({ translation: selectedTranslation, bookId, chapterNumber: chapterNum });
  };

  const handleToggleBookmark = (v: InteractiveVerse) => {
    setInteractiveVerses((prev) => prev.map((item) => (item.verseNumber === v.verseNumber ? { ...item, isBookmarked: !item.isBookmarked } : item)));
    if (activeVerse) setActiveVerse((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null));
  };

  const handleHighlight = (color: 'terracotta' | 'sage' | 'amber' | 'none') => {
    if (!activeVerse) return;
    setInteractiveVerses((prev) => prev.map((item) => item.verseNumber === activeVerse.verseNumber ? { ...item, isHighlighted: color !== 'none', highlightColor: color !== 'none' ? color : undefined } : item));
    setActiveVerse(null);
  };

  const handleCopy = () => {
    if (!activeVerse || !chapter) return;
    navigator.clipboard.writeText(`"${activeVerse.text}" — ${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber} (${currentTranslationMeta.shortName})`);
    setCopiedNotification(true);
    setTimeout(() => { setCopiedNotification(false); setActiveVerse(null); }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Reader Navigation Toolbar - Slides away in immersive reading mode */}
      <div className={`transition-all duration-300 ease-in-out ${
        isChromeVisible ? 'translate-y-0 opacity-100 max-h-48' : '-translate-y-4 opacity-0 max-h-0 pointer-events-none overflow-hidden'
      }`}>
        <BibleToolbar
          selectedBookId={selectedBookId} selectedChapterNumber={selectedChapterNumber} selectedTranslation={selectedTranslation}
          chapterCount={currentBook.chapterCount} fontSize={fontSize} currentBookName={currentBook.name}
          onBookChange={handleBookChange} onChapterChange={handleChapterChange} onPrevChapter={handlePrevChapter} onNextChapter={handleNextChapter}
          onTranslationChange={handleTranslationChange} onOpenSearch={() => setIsSearchOpen(true)} onOpenPicker={() => setIsPickerOpen(true)}
          onOpenTranslationPicker={() => setIsTranslationPickerOpen(true)}
          onOpenSOAP={() => handleOpenSOAPAssistant(`${chapter ? chapter.bookName : currentBook.name} ${selectedChapterNumber}`)}
          onFontSizeChange={handleFontSizeChange} isTranslationInstalled={isInstalledLocally}
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
        onAttachStudyNote={handleOpenSOAPAssistant}
        onRetry={loadChapter}
        onSwitchTranslation={handleTranslationChange}
        journeyContext={journeyContext}
        isJourneyCompleted={Boolean(journeyCompletedDay === journeyContext?.dayNumber)}
        onCompleteJourney={handleCompleteJourney}
      />

      {/* 3. Floating Quick Chapter Stepper on Mobile (above bottom nav) */}
      <FloatingChapterBar bookName={chapter ? chapter.bookName : currentBook.name} chapterNumber={selectedChapterNumber} chapterCount={currentBook.chapterCount} translationShortName={currentTranslationMeta.shortName} isVisible={Boolean(isChromeVisible)} onPrevChapter={handlePrevChapter} onNextChapter={handleNextChapter} onOpenPicker={() => setIsPickerOpen(true)} onOpenTranslationPicker={() => setIsTranslationPickerOpen(true)} />

      {/* 4. Book, Chapter & Verse Quick Picker Modal */}
      <BookChapterPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} selectedBookId={selectedBookId} selectedChapterNumber={selectedChapterNumber} selectedVerseNumber={targetVerseNumber} onSelectPassage={handleSelectPassage} />

      {/* 5. Translation Selector & Device Offline Download Modal */}
      <TranslationPickerModal isOpen={isTranslationPickerOpen} onClose={() => setIsTranslationPickerOpen(false)} selectedTranslation={selectedTranslation} onSelectTranslation={handleTranslationChange} />

      {/* 6. Scripture Search Modal */}
      <ScriptureSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} searchQuery={searchQuery} searchResults={searchResults} onSearch={handleSearch} onSelectResult={handleSelectSearchResult} />

      {/* 7. Verse Interaction Modal */}
      <VerseActionModal activeVerse={activeVerse} chapter={chapter} translationShortName={currentTranslationMeta.shortName} copiedNotification={copiedNotification} onClose={() => setActiveVerse(null)} onToggleBookmark={handleToggleBookmark} onCopy={handleCopy} onHighlight={handleHighlight} onAttachStudyNote={handleOpenSOAPAssistant} />

      {/* 8. In-Context Assisted SOAP Study Companion Drawer */}
      <AssistedSOAPDrawer isOpen={isSOAPDrawerOpen} onClose={() => setIsSOAPDrawerOpen(false)} bookId={selectedBookId} bookName={chapter ? chapter.bookName : currentBook.name} chapterNumber={selectedChapterNumber} initialVerseRef={soapRef} initialVerseText={soapVerseText} activeUserId={activeUserId} />
    </div>
  );
};
