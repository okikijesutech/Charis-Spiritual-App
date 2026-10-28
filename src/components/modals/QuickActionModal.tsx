import React, { useState } from 'react'
import { 
  Heart, 
  BookOpen, 
  BookMarked, 
  Sparkles,
  Clock,
  Sun
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { ActivityLog, ActivityCategory } from '../../types/activity'
import { generateUUID } from '../../lib/id'

interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddActivity: (activity: ActivityLog) => void
  userId?: string
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
  userId = 'demo-user-id'
}) => {
  const [category, setCategory] = useState<ActivityCategory>('prayer')
  const [durationMinutes, setDurationMinutes] = useState('15')
  const [note, setNote] = useState('')

  const activityOptions: { type: ActivityCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'prayer', label: 'Prayer & Stillness', icon: Heart },
    { type: 'reading', label: 'Scripture Reading', icon: BookOpen },
    { type: 'study', label: 'Bible Study', icon: BookMarked },
    { type: 'worship', label: 'Worship / Music', icon: Sparkles },
    { type: 'fasting', label: 'Contemplative Fast', icon: Clock },
    { type: 'gratitude', label: 'Quiet Gratitude', icon: Sun }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selected = activityOptions.find(o => o.type === category)
    const now = new Date().toISOString()
    const durationNum = parseInt(durationMinutes, 10)

    const newActivity: ActivityLog = {
      id: generateUUID(),
      userId,
      category,
      label: selected?.label || 'Spiritual Rhythm',
      startedAt: now,
      durationSeconds: !isNaN(durationNum) && durationNum > 0 ? durationNum * 60 : undefined,
      note: note.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      sync: {
        syncStatus: 'pending',
        localVersion: 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      }
    }

    onAddActivity(newActivity)
    onClose()
    setNote('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Reflection"
      description="Reflective tracking with grace. No streaks or judgment."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rhythm Type Grid */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-2">
            Discipline Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activityOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = category === opt.type
              return (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setCategory(opt.type)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium text-left transition-all ${
                    isSelected
                      ? 'border-charis-primary bg-charis-primary/10 text-charis-primary font-semibold shadow-sm'
                      : 'border-charis-border bg-charis-border-subtle/50 text-charis-text hover:bg-charis-border-subtle'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Duration (Minutes, optional)
          </label>
          <input
            type="number"
            min="0"
            step="5"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            placeholder="e.g. 15"
          />
        </div>

        {/* Personal Note */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Reflective Note (optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A quiet thought, prayer focus, or Scripture passage..."
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text font-serif focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-charis-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Save Reflection
          </Button>
        </div>
      </form>
    </Modal>
  )
}
