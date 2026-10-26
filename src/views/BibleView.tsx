import React, { useState, useEffect } from 'react'
import { 
  Bookmark, 
  Type, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Loader2
} from 'lucide-react'
import { bibleProvider } from '../lib/bible/provider'
import { CANONICAL_BOOKS, getBookById, SUPPORTED_TRANSLATIONS } from '../lib/bible/canon'
import { scriptureSearchService, type BibleSearchResult } from '../lib/bible/search'
import { VerseActionModal, type InteractiveVerse } from '../components/bible/VerseActionModal'
import type { BibleChapter } from '../types/bible'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

interface BibleViewProps {
  onAttachStudyNote?: (verseRef: string) => void
}

export const BibleView: React.FC<BibleViewProps> = ({ onAttachStudyNote }) => {
  const [selectedTranslation, setSelectedTranslation] = useState<string>('nlt')
  const [selectedBookId, setSelectedBookId] = useState<string>('PSA')
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(23)
  const [fontSize, setFontSize] = useState<number>(18)
  const [chapter, setChapter] = useState<BibleChapter | null>(null)
  const [interactiveVerses, setInteractiveVerses] = useState<InteractiveVerse[]>([])
  const [activeVerse, setActiveVerse] = useState<InteractiveVerse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([])

  const currentBook = getBookById(selectedBookId) || CANONICAL_BOOKS[18] // Psalm default
  const currentTranslationMeta = SUPPORTED_TRANSLATIONS.find((t) => t.id === selectedTranslation) || SUPPORTED_TRANSLATIONS[0]

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    bibleProvider.getChapter(selectedTranslation, selectedBookId, selectedChapterNumber).then((res) => {
      if (isMounted) {
        setChapter(res)
        setInteractiveVerses(res.verses.map((v) => ({ ...v })))
        setActiveVerse(null)
        setIsLoading(false)
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false)
    })

    return () => { isMounted = false }
  }, [selectedTranslation, selectedBookId, selectedChapterNumber])

  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId)
    setSelectedChapterNumber(1)
  }

  const handlePrevChapter = () => {
    if (selectedChapterNumber > 1) {
      setSelectedChapterNumber(prev => prev - 1)
    }
  }

  const handleNextChapter = () => {
    if (selectedChapterNumber < currentBook.chapterCount) {
      setSelectedChapterNumber(prev => prev + 1)
    }
  }

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    const results = await scriptureSearchService.search(q, selectedTranslation)
    setSearchResults(results)
  }

  const handleSelectSearchResult = (res: BibleSearchResult) => {
    setSelectedBookId(res.reference.bookId)
    setSelectedChapterNumber(res.reference.chapter)
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleToggleBookmark = (v: InteractiveVerse) => {
    setInteractiveVerses((prev) =>
      prev.map((item) => (item.verseNumber === v.verseNumber ? { ...item, isBookmarked: !item.isBookmarked } : item))
    )
    if (activeVerse) {
      setActiveVerse((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null))
    }
  }

  const handleHighlight = (color: 'terracotta' | 'sage' | 'amber' | 'none') => {
    if (!activeVerse) return
    setInteractiveVerses((prev) =>
      prev.map((item) =>
        item.verseNumber === activeVerse.verseNumber
          ? { ...item, isHighlighted: color !== 'none', highlightColor: color !== 'none' ? color : undefined }
          : item
      )
    )
    setActiveVerse(null)
  }

  const handleCopy = () => {
    if (!activeVerse || !chapter) return
    const textToCopy = `"${activeVerse.text}" — ${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber} (${currentTranslationMeta.shortName})`
    navigator.clipboard.writeText(textToCopy)
    setCopiedNotification(true)
    setTimeout(() => {
      setCopiedNotification(false)
      setActiveVerse(null)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* 1. Reader Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-charis-surface border border-charis-border shadow-subtle">
        <div className="flex flex-wrap items-center gap-2">
          {/* Book Selector (All 66 Books) */}
          <div className="relative inline-block">
            <select
              value={selectedBookId}
              onChange={(e) => handleBookChange(e.target.value)}
              className="appearance-none font-serif font-bold text-sm sm:text-base bg-charis-surface text-charis-text border border-charis-border rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer shadow-subtle dark:bg-[#1B1E2B] dark:text-[#F3EFEA]"
            >
              <optgroup label="Old Testament">
                {CANONICAL_BOOKS.filter((b) => b.testament === 'OT').map((b) => (
                  <option key={b.id} value={b.id} className="bg-charis-surface text-charis-text dark:bg-[#1B1E2B] dark:text-[#F3EFEA] py-1.5">
                    {b.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="New Testament">
                {CANONICAL_BOOKS.filter((b) => b.testament === 'NT').map((b) => (
                  <option key={b.id} value={b.id} className="bg-charis-surface text-charis-text dark:bg-[#1B1E2B] dark:text-[#F3EFEA] py-1.5">
                    {b.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-charis-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Chapter Selector & Stepper */}
          <div className="flex items-center gap-1 border border-charis-border rounded-xl px-1.5 py-1 bg-charis-surface dark:bg-[#1B1E2B]">
            <button
              onClick={handlePrevChapter}
              disabled={selectedChapterNumber <= 1}
              className="p-1 rounded text-charis-text hover:bg-charis-border-subtle disabled:opacity-30 disabled:pointer-events-none"
              title="Previous chapter"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select
              value={selectedChapterNumber}
              onChange={(e) => setSelectedChapterNumber(parseInt(e.target.value, 10))}
              className="appearance-none font-sans font-semibold text-xs bg-transparent text-charis-text px-2 py-0.5 focus:outline-none cursor-pointer dark:text-[#F3EFEA]"
            >
              {Array.from({ length: currentBook.chapterCount }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch} className="bg-charis-surface text-charis-text dark:bg-[#1B1E2B] dark:text-[#F3EFEA]">
                  Ch {ch}
                </option>
              ))}
            </select>
            <button
              onClick={handleNextChapter}
              disabled={selectedChapterNumber >= currentBook.chapterCount}
              className="p-1 rounded text-charis-text hover:bg-charis-border-subtle disabled:opacity-30 disabled:pointer-events-none"
              title="Next chapter"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Translation Select */}
          <div className="relative inline-block">
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="appearance-none font-sans font-semibold text-xs bg-charis-surface text-charis-text border border-charis-border rounded-xl px-3 py-2 pr-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer shadow-subtle dark:bg-[#1B1E2B] dark:text-[#F3EFEA]"
            >
              {SUPPORTED_TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id} className="bg-charis-surface text-charis-text dark:bg-[#1B1E2B] dark:text-[#F3EFEA] py-1.5">
                  {t.shortName} — {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-charis-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text-muted hover:text-charis-text transition-colors flex items-center gap-1.5 text-xs shadow-subtle dark:bg-[#1B1E2B]"
            title="Search all 66 books or topics"
          >
            <Search className="w-3.5 h-3.5 text-charis-primary" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        {/* Font Size Adjuster */}
        <div className="flex items-center gap-1 border border-charis-border rounded-xl px-2 py-1 bg-charis-border-subtle/40">
          <Type className="w-3.5 h-3.5 text-charis-text-muted mr-1" />
          <button
            onClick={() => setFontSize((prev) => Math.max(15, prev - 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-semibold hover:bg-charis-border text-charis-text transition-colors"
          >
            A-
          </button>
          <span className="text-xs text-charis-text-muted font-mono px-1">{fontSize}</span>
          <button
            onClick={() => setFontSize((prev) => Math.min(26, prev + 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-sm font-semibold hover:bg-charis-border text-charis-text transition-colors"
          >
            A+
          </button>
        </div>
      </div>

      {/* 2. Scripture Reading Surface */}
      <article className="rounded-2xl bg-charis-surface border border-charis-border p-6 sm:p-10 shadow-card relative">
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
            <Badge variant={currentTranslationMeta.offlineDownloadable ? "sage" : "outline"} size="sm">
              {currentTranslationMeta.offlineDownloadable ? "Offline Ready" : "Online API"}
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
            let highlightStyle = ''
            if (v.isHighlighted) {
              if (v.highlightColor === 'terracotta') highlightStyle = 'bg-[#D95740]/15 dark:bg-[#E06D58]/20 px-1 rounded'
              else if (v.highlightColor === 'sage') highlightStyle = 'bg-[#78866B]/15 dark:bg-[#8E9E80]/20 px-1 rounded'
              else highlightStyle = 'bg-amber-400/20 px-1 rounded'
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
            )
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
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Search All 66 Books & Topics"
        description="Search passages (e.g. 'John 3', 'Romans 8', 'Genesis 1') or topics"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type book, chapter, or topic..."
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-charis-text focus:outline-none focus:ring-2 focus:ring-charis-primary text-sm shadow-subtle dark:bg-[#1B1E2B] dark:text-[#F3EFEA]"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <button
                  key={`${res.formattedRef}-${idx}`}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full p-2.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-left transition-colors flex items-start gap-2.5 dark:bg-[#1B1E2B]"
                >
                  <Sparkles className="w-4 h-4 text-charis-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-charis-primary block">
                      {res.formattedRef} {res.topicLabel && `· ${res.topicLabel}`}
                    </span>
                    <p className="text-xs text-charis-text line-clamp-2 mt-0.5 font-serif italic">
                      “{res.text}”
                    </p>
                  </div>
                </button>
              ))
            ) : searchQuery.trim() ? (
              <p className="text-xs text-charis-text-muted text-center py-4">
                No matching passages found. Try &quot;peace&quot;, &quot;John 3&quot;, or &quot;Romans 8&quot;.
              </p>
            ) : (
              <div className="text-xs text-charis-text-muted space-y-1.5 p-2">
                <span className="font-semibold text-charis-text block">Suggested Topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['peace', 'comfort', 'love', 'abiding'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSearch(t)}
                      className="px-2.5 py-1 rounded-lg border border-charis-border bg-charis-surface hover:bg-charis-border-subtle capitalize dark:bg-[#1B1E2B]"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

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
  )
}
