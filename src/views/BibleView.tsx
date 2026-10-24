import React, { useState } from 'react'
import { 
  Bookmark, 
  Highlighter, 
  Copy, 
  FileText, 
  Check, 
  Type, 
  ChevronDown, 
  CheckCircle2
} from 'lucide-react'
import { mockScripturePsalm23, mockScriptureJohn15 } from '../data/mockData'
import { ScriptureVerse } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'

interface BibleViewProps {
  onAttachStudyNote?: (verseRef: string) => void
}

export const BibleView: React.FC<BibleViewProps> = ({ onAttachStudyNote }) => {
  const [selectedBook, setSelectedBook] = useState<'Psalm 23' | 'John 15'>('Psalm 23')
  const [fontSize, setFontSize] = useState<number>(18) // in px
  const [verses, setVerses] = useState<ScriptureVerse[]>(mockScripturePsalm23)
  
  // Verse context action state
  const [activeVerse, setActiveVerse] = useState<ScriptureVerse | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)

  const handleSelectPassage = (passage: 'Psalm 23' | 'John 15') => {
    setSelectedBook(passage)
    setVerses(passage === 'Psalm 23' ? mockScripturePsalm23 : mockScriptureJohn15)
    setActiveVerse(null)
  }

  const handleToggleBookmark = (targetVerse: ScriptureVerse) => {
    setVerses(prev => prev.map(v => {
      if (v.book === targetVerse.book && v.chapter === targetVerse.chapter && v.verse === targetVerse.verse) {
        return { ...v, isBookmarked: !v.isBookmarked }
      }
      return v
    }))
    if (activeVerse) {
      setActiveVerse(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null)
    }
  }

  const handleHighlight = (color: 'terracotta' | 'sage' | 'yellow' | 'none') => {
    if (!activeVerse) return
    setVerses(prev => prev.map(v => {
      if (v.book === activeVerse.book && v.chapter === activeVerse.chapter && v.verse === activeVerse.verse) {
        return { 
          ...v, 
          isHighlighted: color !== 'none',
          highlightColor: color !== 'none' ? color : undefined
        }
      }
      return v
    }))
    setActiveVerse(null)
  }

  const handleCopy = () => {
    if (!activeVerse) return
    const textToCopy = `"${activeVerse.text}" — ${activeVerse.book} ${activeVerse.chapter}:${activeVerse.verse} (BSB)`
    navigator.clipboard.writeText(textToCopy)
    setCopiedNotification(true)
    setTimeout(() => {
      setCopiedNotification(false)
      setActiveVerse(null)
    }, 1200)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Bible Reader Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-charis-surface border border-charis-border shadow-subtle">
        {/* Book & Chapter Selector */}
        <div className="flex items-center gap-2">
          <div className="relative inline-block">
            <select
              value={selectedBook}
              onChange={(e) => handleSelectPassage(e.target.value as 'Psalm 23' | 'John 15')}
              className="appearance-none font-serif font-bold text-base sm:text-lg bg-charis-border-subtle/70 text-charis-text border border-charis-border rounded-xl px-3.5 py-1.5 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer"
            >
              <option value="Psalm 23">Psalm 23</option>
              <option value="John 15">John 15:1–5</option>
            </select>
            <ChevronDown className="w-4 h-4 text-charis-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Badge variant="sage" size="sm" className="hidden sm:inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>BSB · Offline</span>
          </Badge>
        </div>

        {/* Font Size Adjuster */}
        <div className="flex items-center gap-1.5 border border-charis-border rounded-xl px-2 py-1 bg-charis-border-subtle/40">
          <Type className="w-3.5 h-3.5 text-charis-text-muted mr-1" />
          <button
            onClick={() => setFontSize(prev => Math.max(15, prev - 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-semibold hover:bg-charis-border text-charis-text transition-colors"
            title="Decrease font size"
            aria-label="Decrease text size"
          >
            A-
          </button>
          <span className="text-xs text-charis-text-muted font-mono px-1">
            {fontSize}
          </span>
          <button
            onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-sm font-semibold hover:bg-charis-border text-charis-text transition-colors"
            title="Increase font size"
            aria-label="Increase text size"
          >
            A+
          </button>
        </div>
      </div>

      {/* 2. Scripture Reading Surface */}
      <article className="rounded-2xl bg-charis-surface border border-charis-border p-6 sm:p-10 shadow-card">
        {/* Chapter Header */}
        <header className="text-center pb-8 border-b border-charis-border/60">
          <span className="text-xs font-semibold tracking-wider uppercase text-charis-primary">
            Berean Standard Bible
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charis-text mt-1">
            {selectedBook}
          </h2>
          <p className="text-xs text-charis-text-muted font-serif italic mt-1.5">
            {selectedBook === 'Psalm 23' ? 'A Psalm of David.' : 'The Vine and the Branches.'}
          </p>
        </header>

        {/* Verses Container */}
        <div 
          className="mt-8 font-serif leading-[1.75] text-charis-text selection:bg-charis-primary/20 space-y-4"
          style={{ fontSize: `${fontSize}px` }}
        >
          {verses.map((v) => {
            let highlightStyle = ''
            if (v.isHighlighted) {
              if (v.highlightColor === 'terracotta') {
                highlightStyle = 'bg-[#D95740]/15 dark:bg-[#E06D58]/20 px-1 rounded'
              } else if (v.highlightColor === 'sage') {
                highlightStyle = 'bg-[#78866B]/15 dark:bg-[#8E9E80]/20 px-1 rounded'
              } else {
                highlightStyle = 'bg-amber-400/20 px-1 rounded'
              }
            }

            return (
              <p
                key={v.verse}
                onClick={() => setActiveVerse(v)}
                className={`group cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-charis-border-subtle/70 ${highlightStyle}`}
                tabIndex={0}
                role="button"
                aria-label={`Verse ${v.verse}: ${v.text}. Tap for actions.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveVerse(v)
                  }
                }}
              >
                <sup className="text-xs font-sans font-bold text-charis-primary mr-2 select-none">
                  {v.verse}
                </sup>
                <span>{v.text}</span>
                {v.isBookmarked && (
                  <Bookmark className="inline-block w-3.5 h-3.5 ml-1.5 text-charis-primary fill-current align-middle" />
                )}
              </p>
            )
          })}
        </div>

        {/* Translation Attribution Footer */}
        <footer className="mt-12 pt-6 border-t border-charis-border/60 text-center">
          <p className="text-xs text-charis-text-muted">
            Scripture quotations marked (BSB) are from The Holy Bible, Berean Standard Bible, BSB. Copyright ©2016–2020 by Bible Hub. Used by Permission. All Rights Reserved.
          </p>
        </footer>
      </article>

      {/* 3. Verse Interaction Bottom Sheet / Modal */}
      <Modal
        isOpen={!!activeVerse}
        onClose={() => setActiveVerse(null)}
        title={activeVerse ? `${activeVerse.book} ${activeVerse.chapter}:${activeVerse.verse}` : 'Verse Actions'}
        description="Select an action for this passage"
      >
        {activeVerse && (
          <div className="space-y-5">
            {/* Verse snippet */}
            <blockquote className="font-serif italic text-base text-charis-text bg-charis-border-subtle/60 p-4 rounded-xl border-l-2 border-charis-primary">
              “{activeVerse.text}”
            </blockquote>

            {/* Actions list */}
            <div className="grid grid-cols-2 gap-3">
              {/* Bookmark */}
              <button
                onClick={() => handleToggleBookmark(activeVerse)}
                className="flex items-center gap-2 p-3 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-left"
              >
                <Bookmark className={`w-4 h-4 ${activeVerse.isBookmarked ? 'text-charis-primary fill-current' : 'text-charis-text-muted'}`} />
                <div>
                  <span className="text-xs font-semibold text-charis-text block">
                    {activeVerse.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </span>
                  <span className="text-[10px] text-charis-text-muted">Save to library</span>
                </div>
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 p-3 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-left"
              >
                {copiedNotification ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-charis-text-muted" />
                )}
                <div>
                  <span className="text-xs font-semibold text-charis-text block">
                    {copiedNotification ? 'Copied!' : 'Copy Verse'}
                  </span>
                  <span className="text-[10px] text-charis-text-muted">With attribution</span>
                </div>
              </button>
            </div>

            {/* Highlighter selector */}
            <div className="p-3.5 rounded-xl border border-charis-border bg-charis-surface">
              <span className="text-xs font-medium text-charis-text-muted block mb-2 flex items-center gap-1.5">
                <Highlighter className="w-3.5 h-3.5 text-charis-primary" />
                Highlight Accent
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHighlight('terracotta')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#D95740]/15 dark:bg-[#E06D58]/20 text-[#D95740] dark:text-[#E06D58] text-xs font-medium border border-[#D95740]/30 hover:brightness-105"
                >
                  Terracotta
                </button>
                <button
                  onClick={() => handleHighlight('sage')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#78866B]/15 dark:bg-[#8E9E80]/20 text-[#78866B] dark:text-[#8E9E80] text-xs font-medium border border-[#78866B]/30 hover:brightness-105"
                >
                  Sage
                </button>
                <button
                  onClick={() => handleHighlight('none')}
                  className="py-1.5 px-3 rounded-lg border border-charis-border text-charis-text-muted text-xs hover:bg-charis-border-subtle"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Attach Study Note button */}
            <Button
              variant="primary"
              className="w-full gap-2 text-sm"
              onClick={() => {
                const ref = `${activeVerse.book} ${activeVerse.chapter}:${activeVerse.verse}`
                setActiveVerse(null)
                if (onAttachStudyNote) {
                  onAttachStudyNote(ref)
                }
              }}
            >
              <FileText className="w-4 h-4" />
              <span>Create Inductive Study from Verse</span>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
