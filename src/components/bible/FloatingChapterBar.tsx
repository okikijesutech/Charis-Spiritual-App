/**
 * Floating Quick Chapter Stepper Bar
 * Mobile-first floating pill positioned above bottom navigation in Bible reader.
 * Enables 1-handed chapter stepping and reflects immersive reading visibility.
 */

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FloatingChapterBarProps {
  bookName: string
  chapterNumber: number
  chapterCount: number
  translationShortName: string
  isVisible: boolean
  onPrevChapter: () => void
  onNextChapter: () => void
}

export const FloatingChapterBar: React.FC<FloatingChapterBarProps> = ({
  bookName,
  chapterNumber,
  chapterCount,
  translationShortName,
  isVisible,
  onPrevChapter,
  onNextChapter,
}) => {
  return (
    <aside
      aria-label="Quick Chapter Navigation"
      className={`md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-charis-surface/95 backdrop-blur-md border border-charis-border/80 shadow-card text-xs font-medium">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevChapter()
          }}
          disabled={chapterNumber <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-charis-text hover:bg-charis-border-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Previous chapter"
          aria-label="Previous chapter"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-charis-primary" />
          <span className="hidden xs:inline text-[11px]">Prev</span>
        </button>

        <div className="flex items-center gap-1.5 px-2">
          <span className="font-serif font-bold text-charis-text text-xs whitespace-nowrap">
            {bookName} {chapterNumber}
          </span>
          <span className="text-[10px] text-charis-primary uppercase font-mono bg-charis-primary/10 px-1.5 py-0.5 rounded">
            {translationShortName}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onNextChapter()
          }}
          disabled={chapterNumber >= chapterCount}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-charis-text hover:bg-charis-border-subtle disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Next chapter"
          aria-label="Next chapter"
        >
          <span className="hidden xs:inline text-[11px]">Next</span>
          <ChevronRight className="w-3.5 h-3.5 text-charis-primary" />
        </button>
      </div>
    </aside>
  )
}
