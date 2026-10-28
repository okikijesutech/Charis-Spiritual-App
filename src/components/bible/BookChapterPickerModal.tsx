/**
 * Book, Chapter & Verse Passage Picker Modal
 * Three-tier selector for all 66 books, chapter grids, and verse grids.
 * Follows Jakob's Law, editorial typography, and WCAG touch target standards.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Search, ChevronLeft, BookOpen } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { CANONICAL_BOOKS, getBookById } from '../../lib/bible/canon'
import { getVerseCount } from '../../lib/bible/verse-counts'
import type { Testament } from '../../types/bible'

interface BookChapterPickerModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBookId: string
  selectedChapterNumber: number
  selectedVerseNumber?: number | null
  onSelectPassage: (bookId: string, chapterNumber: number, verseNumber?: number) => void
}

export const BookChapterPickerModal: React.FC<BookChapterPickerModalProps> = ({
  isOpen,
  onClose,
  selectedBookId,
  selectedChapterNumber,
  selectedVerseNumber,
  onSelectPassage,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'chapters' | 'verses'>('books')
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | Testament>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [tempBookId, setTempBookId] = useState<string>(selectedBookId)
  const [tempChapterNumber, setTempChapterNumber] = useState<number>(selectedChapterNumber)

  // Sync temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempBookId(selectedBookId)
      setTempChapterNumber(selectedChapterNumber)
      setActiveTab('books')
      setSearchQuery('')
    }
  }, [isOpen, selectedBookId, selectedChapterNumber])

  const currentSelectedBook = useMemo(() => {
    return getBookById(tempBookId) || CANONICAL_BOOKS[0]
  }, [tempBookId])

  const verseCount = useMemo(() => {
    return getVerseCount(tempBookId, tempChapterNumber)
  }, [tempBookId, tempChapterNumber])

  // Filtered books
  const filteredBooks = useMemo(() => {
    return CANONICAL_BOOKS.filter((book) => {
      const matchesTestament =
        testamentFilter === 'ALL' || book.testament === testamentFilter
      const q = searchQuery.trim().toLowerCase()
      if (!q) return matchesTestament

      const nameMatch = book.name.toLowerCase().includes(q)
      const aliasMatch = book.aliases.some((a) => a.toLowerCase().includes(q))
      return matchesTestament && (nameMatch || aliasMatch)
    })
  }, [testamentFilter, searchQuery])

  const handleBookClick = (bookId: string) => {
    setTempBookId(bookId)
    setTempChapterNumber(1)
    setActiveTab('chapters')
  }

  const handleChapterClick = (chapterNum: number) => {
    setTempChapterNumber(chapterNum)
    setActiveTab('verses')
  }

  const handleVerseClick = (verseNum?: number) => {
    onSelectPassage(tempBookId, tempChapterNumber, verseNum)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Passage"
      description={`${currentSelectedBook.name} ${tempChapterNumber}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Navigation Mode Segmented Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-charis-border-subtle/80 border border-charis-border/60">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'books'
                ? 'bg-charis-surface text-charis-primary shadow-subtle'
                : 'text-charis-text-muted hover:text-charis-text'
            }`}
          >
            1. Book
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chapters'
                ? 'bg-charis-surface text-charis-primary shadow-subtle'
                : 'text-charis-text-muted hover:text-charis-text'
            }`}
          >
            2. Ch {tempChapterNumber}
          </button>
          <button
            onClick={() => setActiveTab('verses')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'verses'
                ? 'bg-charis-surface text-charis-primary shadow-subtle'
                : 'text-charis-text-muted hover:text-charis-text'
            }`}
          >
            3. Verse
          </button>
        </div>

        {activeTab === 'books' && (
          <div className="space-y-3">
            {/* Search Input & Testament Pills */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-charis-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find book (e.g. Psalms, John, Rom)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text placeholder:text-charis-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
                />
              </div>

              <div className="flex items-center gap-1">
                {(['ALL', 'OT', 'NT'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTestamentFilter(t)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      testamentFilter === t
                        ? 'bg-charis-primary text-white'
                        : 'bg-charis-border-subtle text-charis-text-muted hover:text-charis-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredBooks.map((book) => {
                const isSelected = book.id === tempBookId

                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookClick(book.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      isSelected
                        ? 'bg-charis-primary/10 border-charis-primary text-charis-primary font-semibold'
                        : 'bg-charis-surface border-charis-border hover:bg-charis-border-subtle text-charis-text'
                    }`}
                  >
                    <span className="truncate font-serif">{book.name}</span>
                    <span className="text-[10px] text-charis-text-muted font-mono shrink-0 ml-1">
                      {book.chapterCount}ch
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-3">
            {/* Chapter Header with Back Link */}
            <div className="flex items-center justify-between pb-1 border-b border-charis-border/60">
              <button
                onClick={() => setActiveTab('books')}
                className="flex items-center gap-1 text-xs font-semibold text-charis-primary hover:underline"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Books</span>
              </button>
              <span className="font-serif font-bold text-sm text-charis-text">
                {currentSelectedBook.name} ({currentSelectedBook.chapterCount} Chs)
              </span>
            </div>

            {/* Chapter Numbers Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto p-1">
              {Array.from({ length: currentSelectedBook.chapterCount }, (_, i) => i + 1).map((ch) => {
                const isCurrent =
                  currentSelectedBook.id === selectedBookId && ch === selectedChapterNumber

                return (
                  <button
                    key={ch}
                    onClick={() => handleChapterClick(ch)}
                    className={`flex items-center justify-center h-10 rounded-xl font-sans text-xs font-semibold transition-all border ${
                      isCurrent
                        ? 'bg-charis-primary text-white border-charis-primary shadow-subtle'
                        : 'bg-charis-surface text-charis-text border-charis-border hover:bg-charis-border-subtle hover:border-charis-primary/40'
                    }`}
                  >
                    {ch}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'verses' && (
          <div className="space-y-3">
            {/* Verse Header with Back Link */}
            <div className="flex items-center justify-between pb-1 border-b border-charis-border/60">
              <button
                onClick={() => setActiveTab('chapters')}
                className="flex items-center gap-1 text-xs font-semibold text-charis-primary hover:underline"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Chapters</span>
              </button>
              <span className="font-serif font-bold text-sm text-charis-text">
                {currentSelectedBook.name} {tempChapterNumber} ({verseCount} Verses)
              </span>
            </div>

            {/* Read Entire Chapter Option */}
            <button
              onClick={() => handleVerseClick(undefined)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-charis-primary/10 border border-charis-primary/30 text-charis-primary text-xs font-semibold hover:bg-charis-primary/20 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Entire Chapter {tempChapterNumber} (from start)</span>
            </button>

            {/* Verse Numbers Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
              {Array.from({ length: verseCount }, (_, i) => i + 1).map((vNum) => {
                const isSelectedVerse =
                  currentSelectedBook.id === selectedBookId &&
                  tempChapterNumber === selectedChapterNumber &&
                  vNum === selectedVerseNumber

                return (
                  <button
                    key={vNum}
                    onClick={() => handleVerseClick(vNum)}
                    className={`flex items-center justify-center h-10 rounded-xl font-sans text-xs font-semibold transition-all border ${
                      isSelectedVerse
                        ? 'bg-charis-primary text-white border-charis-primary shadow-subtle'
                        : 'bg-charis-surface text-charis-text border-charis-border hover:bg-charis-border-subtle hover:border-charis-primary/40'
                    }`}
                  >
                    {vNum}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
