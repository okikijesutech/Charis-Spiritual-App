/**
 * Scripture Reading Surface Component
 * Renders chapter heading, translation badge, interactive verses with bookmarks/highlights,
 * bottom stepper, and translation attribution.
 * Per docs/PRD.md FR-03, FR-04 and Cambium architectural health.
 */

import React from 'react'
import { Bookmark, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { BibleChapter, CanonicalBook, BibleTranslationMeta } from '../../types/bible'
import type { InteractiveVerse } from './VerseActionModal'

interface ScriptureReadingSurfaceProps {
  chapter: BibleChapter | null
  currentBook: CanonicalBook
  selectedChapterNumber: number
  targetVerseNumber?: number | null
  currentTranslationMeta: BibleTranslationMeta
  fontSize: number
  interactiveVerses: InteractiveVerse[]
  isLoading: boolean
  isChromeVisible: boolean
  onToggleChrome?: () => void
  onSelectVerse: (verse: InteractiveVerse) => void
  onPrevChapter: () => void
  onNextChapter: () => void
}

export const ScriptureReadingSurface: React.FC<ScriptureReadingSurfaceProps> = ({
  chapter,
  currentBook,
  selectedChapterNumber,
  targetVerseNumber,
  currentTranslationMeta,
  fontSize,
  interactiveVerses,
  isLoading,
  isChromeVisible,
  onToggleChrome,
  onSelectVerse,
  onPrevChapter,
  onNextChapter,
}) => {
  return (
    <article
      onClick={() => {
        if (!isChromeVisible && onToggleChrome) {
          onToggleChrome()
        }
      }}
      className="max-w-3xl mx-auto rounded-2xl bg-charis-surface border border-charis-border p-6 sm:p-10 shadow-card relative select-text cursor-default transition-colors"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-charis-surface/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-20">
          <div className="flex items-center gap-2 text-sm text-charis-primary font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading chapter...</span>
          </div>
        </div>
      )}

      {/* Animated Chapter Content Container */}
      <div key={`${currentBook.id}-${selectedChapterNumber}`} className="animate-view-transition">
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
            const isTarget = targetVerseNumber === v.verseNumber
            let highlightStyle = ''
            if (isTarget) {
              highlightStyle = 'ring-2 ring-charis-primary bg-charis-primary/10 px-1 rounded-lg'
            } else if (v.isHighlighted) {
              if (v.highlightColor === 'terracotta') highlightStyle = 'bg-charis-primary/15 px-1 rounded'
              else if (v.highlightColor === 'sage') highlightStyle = 'bg-charis-secondary/15 px-1 rounded'
              else highlightStyle = 'bg-amber-400/20 px-1 rounded'
            }

            return (
              <p
                key={v.verseNumber}
                id={`verse-${v.verseNumber}`}
                onClick={(e) => {
                  if (!isChromeVisible) {
                    e.stopPropagation()
                    onToggleChrome?.()
                    return
                  }
                  onSelectVerse(v)
                }}
                className={`group cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all duration-300 hover:bg-charis-border-subtle/70 ${highlightStyle}`}
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

        {/* Chapter Bottom Stepper */}
        <div className="mt-10 pt-6 border-t border-charis-border/60 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrevChapter()
            }}
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
            onClick={(e) => {
              e.stopPropagation()
              onNextChapter()
            }}
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
      </div>
    </article>
  )
}
