import React, { useState } from 'react'
import { 
  Heart, 
  Search, 
  Plus, 
  BookOpen, 
  Calendar
} from 'lucide-react'
import { mockPrayerEntries } from '../data/mockData'
import { PrayerEntry } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export const PrayerJournalView: React.FC = () => {
  const [prayers, setPrayers] = useState<PrayerEntry[]>(mockPrayerEntries)
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Editor form state
  const [entryTitle, setEntryTitle] = useState('')
  const [entryBody, setEntryBody] = useState('')
  const [entryTags, setEntryTags] = useState('Peace, Morning')
  const [entryScripture, setEntryScripture] = useState('')
  const [promptMode, setPromptMode] = useState<'freeform' | 'thanksgiving' | 'adoration' | 'supplication'>('thanksgiving')

  const promptGuidance = {
    freeform: 'Pour out your heart honestly without structured prompts.',
    adoration: 'Praise God for who He is—His holiness, patience, mercy, and majesty.',
    confession: 'Bring mistakes and burdens into the light of His unfailing forgiveness.',
    thanksgiving: 'Recall specific mercies, answers, and quiet gifts received recently.',
    supplication: 'Ask with humble trust for personal needs, healing, and guidance for others.'
  }

  const allTags = ['All', ...Array.from(new Set(mockPrayerEntries.flatMap(p => p.tags)))]

  const filteredPrayers = prayers.filter(p => {
    const matchesTag = selectedTag === 'All' || p.tags.includes(selectedTag)
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.body.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  const handleSavePrayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryBody.trim()) return

    const newPrayer: PrayerEntry = {
      id: `prayer-${Date.now()}`,
      title: entryTitle.trim() || 'Untitled Reflection',
      body: entryBody.trim(),
      date: 'Just now',
      tags: entryTags.split(',').map(t => t.trim()).filter(Boolean),
      scriptureRef: entryScripture.trim() || undefined,
      promptType: promptMode,
      syncStatus: 'local'
    }

    setPrayers([newPrayer, ...prayers])
    setIsEditorOpen(false)
    setEntryTitle('')
    setEntryBody('')
    setEntryScripture('')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & New Prayer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-primary">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Private Sanctuary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Prayer Journal
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Your personal prayers are private, encrypted in transit, and saved locally first.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsEditorOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Prayer</span>
        </Button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-charis-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prayer reflections, topics, or verses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text placeholder:text-charis-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
          />
        </div>

        {/* Tag chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-charis-primary text-white'
                  : 'bg-charis-surface border border-charis-border text-charis-text-muted hover:text-charis-text'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Prayer Entries List */}
      <div className="space-y-4">
        {filteredPrayers.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-charis-surface border border-charis-border p-6">
            <Heart className="w-8 h-8 text-charis-text-muted mx-auto mb-2 opacity-50" />
            <h3 className="font-serif font-bold text-base text-charis-text">No prayers found</h3>
            <p className="text-xs text-charis-text-muted mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search keyword.' : 'Begin by capturing your first quiet prayer or gratitude reflection.'}
            </p>
          </div>
        ) : (
          filteredPrayers.map((prayer) => (
            <article
              key={prayer.id}
              className="p-6 rounded-2xl bg-charis-surface border border-charis-border shadow-card hover:border-charis-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-serif font-bold text-lg text-charis-text">
                    {prayer.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-charis-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {prayer.date}
                    </span>
                    {prayer.scriptureRef && (
                      <span className="flex items-center gap-1 text-charis-primary font-medium">
                        <BookOpen className="w-3 h-3" />
                        {prayer.scriptureRef}
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant={prayer.syncStatus === 'synced' ? 'sage' : 'neutral'} size="sm">
                  {prayer.syncStatus === 'synced' ? 'Synced' : 'Saved locally'}
                </Badge>
              </div>

              <p className="text-sm text-charis-text font-serif leading-relaxed my-3 whitespace-pre-wrap">
                {prayer.body}
              </p>

              {prayer.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-charis-border/60">
                  {prayer.tags.map(tag => (
                    <Badge key={tag} variant="neutral" size="sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* New Prayer Modal / Bottom Sheet */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="Compose Prayer Reflection"
        description="Private to your account. Autosaved to your device."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSavePrayer} className="space-y-4">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1.5">
              Rhythm Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['thanksgiving', 'adoration', 'supplication', 'freeform'] as const).map(mode => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPromptMode(mode)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-xl border capitalize transition-all ${
                    promptMode === mode
                      ? 'bg-charis-primary text-white border-charis-primary'
                      : 'bg-charis-border-subtle/70 border-charis-border text-charis-text-muted hover:text-charis-text'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-charis-text-muted mt-2 italic bg-charis-border-subtle/50 p-2 rounded-lg">
              {promptGuidance[promptMode]}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="e.g. Peace in this morning's decisions"
              className="w-full px-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Prayer Content
            </label>
            <textarea
              required
              rows={5}
              value={entryBody}
              onChange={(e) => setEntryBody(e.target.value)}
              placeholder="Speak honestly and unhurriedly..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text font-serif leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
            />
          </div>

          {/* Scripture & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-charis-text-muted block mb-1">
                Scripture Reference (optional)
              </label>
              <input
                type="text"
                value={entryScripture}
                onChange={(e) => setEntryScripture(e.target.value)}
                placeholder="e.g. Psalm 23:1"
                className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-charis-text-muted block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={entryTags}
                onChange={(e) => setEntryTags(e.target.value)}
                placeholder="e.g. Peace, Family, Morning"
                className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
              />
            </div>
          </div>

          {/* Form Actions */}
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
              Save Prayer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
