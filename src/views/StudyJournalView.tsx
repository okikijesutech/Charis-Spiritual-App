import React, { useState } from 'react'
import { 
  BookMarked, 
  Plus, 
  Search, 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Link
} from 'lucide-react'
import { mockStudyEntries } from '../data/mockData'
import { StudyEntry } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

interface StudyJournalViewProps {
  initialScriptureRef?: string
}

export const StudyJournalView: React.FC<StudyJournalViewProps> = ({
  initialScriptureRef
}) => {
  const [studies, setStudies] = useState<StudyEntry[]>(mockStudyEntries)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedStudyId, setExpandedStudyId] = useState<string | null>(mockStudyEntries[0].id)
  const [isEditorOpen, setIsEditorOpen] = useState(!!initialScriptureRef)

  // Editor form state
  const [title, setTitle] = useState('')
  const [scriptureRef, setScriptureRef] = useState(initialScriptureRef || '')
  const [observation, setObservation] = useState('')
  const [questionsContext, setQuestionsContext] = useState('')
  const [interpretation, setInterpretation] = useState('')
  const [application, setApplication] = useState('')
  const [crossRefs, setCrossRefs] = useState('')
  const [notes, setNotes] = useState('')

  const handleSaveStudy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() && !scriptureRef.trim()) return

    const newStudy: StudyEntry = {
      id: `study-${Date.now()}`,
      title: title.trim() || `Study on ${scriptureRef}`,
      scriptureRef: scriptureRef.trim() || 'General Reflection',
      observation: observation.trim(),
      questionsContext: questionsContext.trim(),
      interpretation: interpretation.trim(),
      application: application.trim(),
      crossReferences: crossRefs.split(',').map(s => s.trim()).filter(Boolean),
      notes: notes.trim(),
      date: 'Today',
      syncStatus: 'local'
    }

    setStudies([newStudy, ...studies])
    setExpandedStudyId(newStudy.id)
    setIsEditorOpen(false)
    setTitle('')
    setScriptureRef('')
    setObservation('')
    setQuestionsContext('')
    setInterpretation('')
    setApplication('')
    setCrossRefs('')
    setNotes('')
  }

  const filteredStudies = studies.filter(s => {
    return s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.scriptureRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.observation.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-primary">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Inductive & Thematic Study</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Bible Study Journal
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Deep dive into Scripture structure, historical context, and thoughtful personal application.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsEditorOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Study</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-charis-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study titles, scriptures, or observations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text placeholder:text-charis-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
        />
      </div>

      {/* Studies List (Expandable Inductive Cards) */}
      <div className="space-y-4">
        {filteredStudies.map((study) => {
          const isExpanded = expandedStudyId === study.id

          return (
            <article
              key={study.id}
              className="rounded-2xl bg-charis-surface border border-charis-border shadow-card overflow-hidden transition-all"
            >
              {/* Collapsible Card Header */}
              <div
                onClick={() => setExpandedStudyId(isExpanded ? null : study.id)}
                className="p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-charis-border-subtle/40 transition-colors"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 mt-0.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-charis-primary">
                        {study.scriptureRef}
                      </span>
                      <span className="text-xs text-charis-text-muted">· {study.date}</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-charis-text mt-0.5">
                      {study.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="sage" size="sm">
                    {study.syncStatus === 'synced' ? 'Synced' : 'Saved locally'}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-charis-text-muted" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-charis-text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded SOAP / Inductive Details */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-charis-border/60 space-y-4 text-sm animate-in fade-in duration-200">
                  {/* Observation */}
                  {study.observation && (
                    <div className="p-4 rounded-xl bg-charis-border-subtle/50 border border-charis-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-primary mb-1">
                        1. Observation (What does it say?)
                      </h4>
                      <p className="font-serif text-charis-text leading-relaxed">
                        {study.observation}
                      </p>
                    </div>
                  )}

                  {/* Context & Questions */}
                  {study.questionsContext && (
                    <div className="p-4 rounded-xl bg-charis-border-subtle/50 border border-charis-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted mb-1">
                        2. Context & Questions (Historical / Literary)
                      </h4>
                      <p className="font-serif text-charis-text leading-relaxed">
                        {study.questionsContext}
                      </p>
                    </div>
                  )}

                  {/* Interpretation */}
                  {study.interpretation && (
                    <div className="p-4 rounded-xl bg-charis-border-subtle/50 border border-charis-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-primary mb-1">
                        3. Interpretation (What does it mean?)
                      </h4>
                      <p className="font-serif text-charis-text leading-relaxed">
                        {study.interpretation}
                      </p>
                    </div>
                  )}

                  {/* Application */}
                  {study.application && (
                    <div className="p-4 rounded-xl bg-[#78866B]/10 dark:bg-[#8E9E80]/15 border border-[#78866B]/20">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5A684F] dark:text-[#A7B798] mb-1">
                        4. Application (How does it shape my walk?)
                      </h4>
                      <p className="font-serif text-charis-text leading-relaxed font-medium">
                        {study.application}
                      </p>
                    </div>
                  )}

                  {/* Cross References & Linguistic notes */}
                  {study.crossReferences.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-charis-text-muted flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        Cross References:
                      </span>
                      {study.crossReferences.map((ref) => (
                        <Badge key={ref} variant="neutral" size="sm">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* New Study Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="New Inductive Study"
        description="Structured SOAP exploration (All fields except reference are optional)."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveStudy} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-charis-text-muted block mb-1">
                Scripture Reference *
              </label>
              <input
                required
                type="text"
                value={scriptureRef}
                onChange={(e) => setScriptureRef(e.target.value)}
                placeholder="e.g. John 15:1-5"
                className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-charis-text-muted block mb-1">
                Study Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Abiding in the True Vine"
                className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
              />
            </div>
          </div>

          {/* Observation */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Observation (What does the text say?)
            </label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Repeated words, contrasts, grammatical markers..."
              className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
            />
          </div>

          {/* Interpretation */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Interpretation (What did it mean to the original hearers?)
            </label>
            <textarea
              rows={2}
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              placeholder="Core theological meaning and context..."
              className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
            />
          </div>

          {/* Application */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Application (How does this transform my thoughts and actions?)
            </label>
            <textarea
              rows={2}
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              placeholder="Specific, gracious, actionable response..."
              className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
            />
          </div>

          {/* Cross References */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Cross References (comma separated)
            </label>
            <input
              type="text"
              value={crossRefs}
              onChange={(e) => setCrossRefs(e.target.value)}
              placeholder="e.g. Galatians 5:22, Psalm 1:3"
              className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-charis-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Study
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
