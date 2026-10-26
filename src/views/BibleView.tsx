import React, { useState, useEffect } from 'react'
import { 
  Bookmark, 
  Highlighter, 
  Copy, 
  FileText, 
  Check, 
  Type, 
  ChevronDown, 
  CheckCircle2,
  Globe
} from 'lucide-react'
import { bibleProvider } from '../lib/bible/provider'
import { SUPPORTED_TRANSLATIONS } from '../lib/bible/canon'
import type { BibleChapter, BibleVerse } from '../types/bible'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'

interface BibleViewProps {
  onAttachStudyNote?: (verseRef: string) => void
}

interface InteractiveVerse extends BibleVerse {
  isBookmarked?: boolean;
  isHighlighted?: boolean;
  highlightColor?: 'terracotta' | 'sage' | 'amber';
}

const AVAILABLE_PASSAGES: { id: string; label: string; bookId: string; chapter: number }[] = [
  { id: 'PSA:23', label: 'Psalm 23', bookId: 'PSA', chapter: 23 },
  { id: 'JHN:15', label: 'John 15', bookId: 'JHN', chapter: 15 },
  { id: 'ROM:8', label: 'Romans 8', bookId: 'ROM', chapter: 8 },
]

export const BibleView: React.FC<BibleViewProps> = ({ onAttachStudyNote }) => {
  const [selectedTranslation, setSelectedTranslation] = useState<string>('web')
  const [selectedPassageId, setSelectedPassageId] = useState<string>('PSA:23')
  const [fontSize, setFontSize] = useState<number>(18)
  const [chapter, setChapter] = useState<BibleChapter | null>(null)
  const [interactiveVerses, setInteractiveVerses] = useState<InteractiveVerse[]>([])
  const [activeVerse, setActiveVerse] = useState<InteractiveVerse | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)

  const activePassage = AVAILABLE_PASSAGES.find((p) => p.id === selectedPassageId) || AVAILABLE_PASSAGES[0]
  const currentTranslationMeta = SUPPORTED_TRANSLATIONS.find((t) => t.id === selectedTranslation) || SUPPORTED_TRANSLATIONS[0]

  useEffect(() => {
    let isMounted = true
    bibleProvider.getChapter(selectedTranslation, activePassage.bookId, activePassage.chapter).then((res) => {
      if (isMounted) {
        setChapter(res)
        setInteractiveVerses(res.verses.map((v) => ({ ...v })))
        setActiveVerse(null)
      }
    })
    return () => { isMounted = false }
  }, [selectedTranslation, activePassage.bookId, activePassage.chapter])

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
          ? {
              ...item,
              isHighlighted: color !== 'none',
              highlightColor: color !== 'none' ? color : undefined,
            }
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Reader Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-charis-surface border border-charis-border shadow-subtle">
        {/* Book, Chapter & Translation Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Passage Select */}
          <div className="relative inline-block">
            <select
              value={selectedPassageId}
              onChange={(e) => setSelectedPassageId(e.target.value)}
              className="appearance-none font-serif font-bold text-base bg-charis-border-subtle/70 text-charis-text border border-charis-border rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer"
            >
              {AVAILABLE_PASSAGES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-charis-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Translation Select */}
          <div className="relative inline-block">
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="appearance-none font-sans font-semibold text-xs bg-charis-border-subtle/70 text-charis-text border border-charis-border rounded-xl px-3 py-2 pr-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer"
            >
              {SUPPORTED_TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.shortName} — {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-charis-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Badge variant={currentTranslationMeta.offlineDownloadable ? "sage" : "outline"} size="sm" className="hidden sm:inline-flex items-center gap-1">
            {currentTranslationMeta.offlineDownloadable ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Offline Ready</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>API Licensed</span>
              </>
            )}
          </Badge>
        </div>

        {/* Font Size Adjuster */}
        <div className="flex items-center gap-1 border border-charis-border rounded-xl px-2 py-1 bg-charis-border-subtle/40">
          <Type className="w-3.5 h-3.5 text-charis-text-muted mr-1" />
          <button
            onClick={() => setFontSize((prev) => Math.max(15, prev - 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-semibold hover:bg-charis-border text-charis-text transition-colors"
            title="Decrease font size"
            aria-label="Decrease text size"
          >
            A-
          </button>
          <span className="text-xs text-charis-text-muted font-mono px-1">{fontSize}</span>
          <button
            onClick={() => setFontSize((prev) => Math.min(26, prev + 1))}
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
        <header className="text-center pb-8 border-b border-charis-border/60">
          <span className="text-xs font-semibold tracking-wider uppercase text-charis-primary">
            {currentTranslationMeta.name} ({currentTranslationMeta.shortName})
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charis-text mt-1">
            {chapter ? `${chapter.bookName} ${chapter.chapterNumber}` : activePassage.label}
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
                key={v.verseNumber}
                onClick={() => setActiveVerse(v)}
                className={`group cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-charis-border-subtle/70 ${highlightStyle}`}
                tabIndex={0}
                role="button"
                aria-label={`Verse ${v.verseNumber}: ${v.text}. Tap for actions.`}
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

        {/* Translation Attribution Footer */}
        <footer className="mt-12 pt-6 border-t border-charis-border/60 text-center">
          <p className="text-xs text-charis-text-muted leading-relaxed max-w-2xl mx-auto">
            {chapter?.attribution || currentTranslationMeta.attribution}
          </p>
        </footer>
      </article>

      {/* 3. Verse Interaction Modal */}
      <Modal
        isOpen={Boolean(activeVerse)}
        onClose={() => setActiveVerse(null)}
        title={activeVerse && chapter ? `${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber}` : 'Verse Actions'}
        description={`Options for ${currentTranslationMeta.shortName}`}
      >
        {activeVerse && chapter && (
          <div className="space-y-5">
            <blockquote className="font-serif italic text-base text-charis-text bg-charis-border-subtle/60 p-4 rounded-xl border-l-2 border-charis-primary">
              “{activeVerse.text}”
            </blockquote>

            <div className="grid grid-cols-2 gap-3">
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

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 p-3 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-left"
              >
                {copiedNotification ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-charis-text-muted" />}
                <div>
                  <span className="text-xs font-semibold text-charis-text block">
                    {copiedNotification ? 'Copied!' : 'Copy Verse'}
                  </span>
                  <span className="text-[10px] text-charis-text-muted">With attribution</span>
                </div>
              </button>
            </div>

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

            <Button
              variant="primary"
              className="w-full gap-2 text-sm"
              onClick={() => {
                const ref = `${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber} (${currentTranslationMeta.shortName})`
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
