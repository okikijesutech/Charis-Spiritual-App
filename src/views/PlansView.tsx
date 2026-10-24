import React, { useState } from 'react'
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Star, 
  AlertCircle 
} from 'lucide-react'
import { mockReadingPlans } from '../data/mockData'
import { ReadingPlan } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export const PlansView: React.FC = () => {
  const [plans, setPlans] = useState<ReadingPlan[]>(mockReadingPlans)
  const [activePlanId, setActivePlanId] = useState<string>(mockReadingPlans[0].id)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  // Builder form state
  const [builderTitle, setBuilderTitle] = useState('')
  const [builderScope, setBuilderScope] = useState('Gospels')
  const [builderDuration, setBuilderDuration] = useState('60')

  const currentPlan = plans.find(p => p.id === activePlanId) || plans[0]

  const handleToggleAssignment = (dayNum: number) => {
    setPlans(prev => prev.map(p => {
      if (p.id === activePlanId) {
        const updatedAssignments = p.assignments.map(a => {
          if (a.day === dayNum) {
            return { ...a, isCompleted: !a.isCompleted }
          }
          return a
        })
        const newCompleted = updatedAssignments.filter(a => a.isCompleted).length
        return {
          ...p,
          completedDays: newCompleted,
          assignments: updatedAssignments
        }
      }
      return p
    }))
  }

  const handleSetFeatured = (planId: string) => {
    setPlans(prev => prev.map(p => ({
      ...p,
      isFeatured: p.id === planId
    })))
  }

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!builderTitle.trim()) return

    const durationNum = parseInt(builderDuration, 10) || 30
    const newPlan: ReadingPlan = {
      id: `plan-${Date.now()}`,
      title: builderTitle.trim(),
      description: `Custom reading plan covering ${builderScope} over ${durationNum} days.`,
      totalDays: durationNum,
      completedDays: 0,
      isFeatured: plans.length === 0,
      status: 'active',
      assignments: [
        { day: 1, dateLabel: 'Day 1', passage: `${builderScope} 1-2`, isCompleted: false },
        { day: 2, dateLabel: 'Day 2', passage: `${builderScope} 3-4`, isCompleted: false },
        { day: 3, dateLabel: 'Day 3', passage: `${builderScope} 5-6`, isCompleted: false }
      ]
    }

    setPlans([...plans, newPlan])
    setActivePlanId(newPlan.id)
    setIsBuilderOpen(false)
    setBuilderTitle('')
  }

  // Workload estimate
  const estimatedChaptersPerDay = Math.round((89 / (parseInt(builderDuration, 10) || 30)) * 10) / 10

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-primary">
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom Rhythm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Reading Plans
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Build unhurried Scripture schedules with grace for skipped days and custom distribution.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsBuilderOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Plan</span>
        </Button>
      </div>

      {/* Plan Selector Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plans.map((p) => {
          const isSelected = p.id === activePlanId

          return (
            <button
              key={p.id}
              onClick={() => setActivePlanId(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-charis-surface border-charis-primary text-charis-primary shadow-subtle'
                  : 'bg-charis-surface border-charis-border text-charis-text-muted hover:text-charis-text'
              }`}
            >
              {p.isFeatured && (
                <Star className="w-3.5 h-3.5 fill-[#D95740] text-[#D95740]" />
              )}
              <span>{p.title}</span>
              <span className="opacity-75">({p.completedDays}/{p.totalDays}d)</span>
            </button>
          )
        })}
      </div>

      {/* Active Plan Detail Card */}
      <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-charis-border/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-xl text-charis-text">
                {currentPlan.title}
              </h3>
              {currentPlan.isFeatured ? (
                <Badge variant="terracotta" size="sm">Featured on Home</Badge>
              ) : (
                <button
                  onClick={() => handleSetFeatured(currentPlan.id)}
                  className="text-xs text-charis-text-muted hover:text-charis-primary flex items-center gap-1 font-medium"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Set as Featured</span>
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-charis-text-muted mt-1 leading-relaxed">
              {currentPlan.description}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-serif font-bold text-charis-text">
              {Math.round((currentPlan.completedDays / (currentPlan.totalDays || 1)) * 100)}%
            </span>
            <div className="text-xs text-charis-text-muted">
              {currentPlan.completedDays} of {currentPlan.totalDays} days finished
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-charis-border overflow-hidden mb-6">
          <div
            className="h-full bg-charis-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentPlan.completedDays / (currentPlan.totalDays || 1)) * 100}%` }}
          />
        </div>

        {/* Assignments List */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted mb-3">
            Schedule Assignments
          </h4>
          <div className="divide-y divide-charis-border/60 border border-charis-border rounded-xl overflow-hidden">
            {currentPlan.assignments.map((assignment) => (
              <div
                key={assignment.day}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-charis-surface hover:bg-charis-border-subtle/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleAssignment(assignment.day)}
                    className="p-1 rounded-lg text-charis-text-muted hover:text-charis-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
                    aria-label={`Mark day ${assignment.day} as ${assignment.isCompleted ? 'incomplete' : 'complete'}`}
                  >
                    {assignment.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-charis-text-muted" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-charis-text">
                        {assignment.dateLabel}
                      </span>
                      {assignment.isCompleted && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Done
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-charis-text-muted font-serif">
                      {assignment.passage}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" size="sm">
                  Day {assignment.day}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Custom Reading Plan Builder"
        description="Select scope, duration, and workload pace."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Plan Title *
            </label>
            <input
              required
              type="text"
              value={builderTitle}
              onChange={(e) => setBuilderTitle(e.target.value)}
              placeholder="e.g. Journey Through the Pauline Epistles"
              className="w-full px-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-charis-text-muted block mb-1">
                Scripture Scope
              </label>
              <select
                value={builderScope}
                onChange={(e) => setBuilderScope(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer"
              >
                <option value="Gospels">The Four Gospels (89 Ch)</option>
                <option value="Psalms">The Book of Psalms (150 Ch)</option>
                <option value="Epistles">New Testament Epistles (86 Ch)</option>
                <option value="Wisdom">Wisdom Books (Job–Song)</option>
                <option value="Whole Bible">Whole Protestant Canon (1,189 Ch)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-charis-text-muted block mb-1">
                Duration (Days)
              </label>
              <select
                value={builderDuration}
                onChange={(e) => setBuilderDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary cursor-pointer"
              >
                <option value="30">30 Days (1 Month)</option>
                <option value="40">40 Days (Lenten rhythm)</option>
                <option value="60">60 Days (2 Months)</option>
                <option value="90">90 Days (Quarter)</option>
                <option value="180">180 Days (6 Months)</option>
                <option value="365">365 Days (1 Year)</option>
              </select>
            </div>
          </div>

          {/* Workload Warning / Calculation Box */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Pacing Calculation:</span>
              <span>
                Estimated workload: ~{estimatedChaptersPerDay} chapters per day. Paced for reflective contemplation rather than rushed reading.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-charis-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBuilderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Generate Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
