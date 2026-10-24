import React, { useState } from 'react'
import { 
  Heart, 
  BookOpen, 
  BookMarked, 
  Sparkles 
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ActivityLog } from '../../types'

interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddActivity: (activity: ActivityLog) => void
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onAddActivity
}) => {
  const [activityType, setActivityType] = useState<ActivityLog['type']>('prayer')
  const [durationMinutes, setDurationMinutes] = useState('15')
  const [note, setNote] = useState('')

  const activityOptions: { type: ActivityLog['type']; label: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'prayer', label: 'Prayer & Stillness', icon: Heart },
    { type: 'reading', label: 'Scripture Reading', icon: BookOpen },
    { type: 'study', label: 'Bible Study', icon: BookMarked },
    { type: 'worship', label: 'Worship / Music', icon: Sparkles }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selected = activityOptions.find(o => o.type === activityType)

    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: activityType,
      label: selected?.label || 'Spiritual Rhythm',
      timestamp: 'Today, Just now',
      durationMinutes: parseInt(durationMinutes, 10) || undefined,
      note: note.trim() || undefined
    }

    onAddActivity(newActivity)
    onClose()
    setNote('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Spiritual Rhythm"
      description="Reflective tracking with grace. No streaks or judgment."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Category */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted block mb-2">
            Activity Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activityOptions.map(opt => {
              const Icon = opt.icon
              const isSelected = activityType === opt.type

              return (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setActivityType(opt.type)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-charis-surface border-charis-primary text-charis-primary shadow-subtle'
                      : 'bg-charis-border-subtle/50 border-charis-border text-charis-text-muted hover:text-charis-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Optional Duration */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Duration in minutes (optional)
          </label>
          <input
            type="number"
            min="1"
            max="300"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
          />
        </div>

        {/* Optional Note */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Gentle Reflection Note (optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Quiet contemplation before starting the workday."
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-charis-border">
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
            Save Session
          </Button>
        </div>
      </form>
    </Modal>
  )
}
