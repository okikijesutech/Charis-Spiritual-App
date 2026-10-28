import React from 'react'
import { Bookmark, Copy, Check, Highlighter, FileText } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { BibleChapter, BibleVerse } from '../../types/bible'

export interface InteractiveVerse extends BibleVerse {
  isBookmarked?: boolean;
  isHighlighted?: boolean;
  highlightColor?: 'terracotta' | 'sage' | 'amber';
}

interface VerseActionModalProps {
  activeVerse: InteractiveVerse | null;
  chapter: BibleChapter | null;
  translationShortName: string;
  copiedNotification: boolean;
  onClose: () => void;
  onToggleBookmark: (v: InteractiveVerse) => void;
  onCopy: () => void;
  onHighlight: (color: 'terracotta' | 'sage' | 'amber' | 'none') => void;
  onAttachStudyNote?: (ref: string) => void;
}

export const VerseActionModal: React.FC<VerseActionModalProps> = ({
  activeVerse,
  chapter,
  translationShortName,
  copiedNotification,
  onClose,
  onToggleBookmark,
  onCopy,
  onHighlight,
  onAttachStudyNote,
}) => {
  if (!activeVerse || !chapter) return null;

  return (
    <Modal
      isOpen={Boolean(activeVerse)}
      onClose={onClose}
      title={`${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber}`}
      description={`Options for ${translationShortName}`}
    >
      <div className="space-y-5">
        <blockquote className="font-serif italic text-base text-charis-text bg-charis-border-subtle/60 p-4 rounded-xl border-l-2 border-charis-primary">
          “{activeVerse.text}”
        </blockquote>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onToggleBookmark(activeVerse)}
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
            onClick={onCopy}
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
              onClick={() => onHighlight('terracotta')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-charis-primary/15 text-charis-primary text-xs font-medium border border-charis-primary/30 hover:brightness-105"
            >
              Terracotta
            </button>
            <button
              onClick={() => onHighlight('sage')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-charis-secondary/15 text-charis-secondary text-xs font-medium border border-charis-secondary/30 hover:brightness-105"
            >
              Sage
            </button>
            <button
              onClick={() => onHighlight('none')}
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
            const ref = `${chapter.bookName} ${chapter.chapterNumber}:${activeVerse.verseNumber} (${translationShortName})`
            onClose()
            if (onAttachStudyNote) {
              onAttachStudyNote(ref)
            }
          }}
        >
          <FileText className="w-4 h-4" />
          <span>Create Inductive Study from Verse</span>
        </Button>
      </div>
    </Modal>
  )
}
