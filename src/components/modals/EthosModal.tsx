import React from 'react'
import { Modal } from '../ui/Modal'
import { Sparkles, Shield, Heart, BookOpen, Compass, Check } from 'lucide-react'

interface EthosModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EthosModal: React.FC<EthosModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="The Charis Ethos"
      description="Spiritual formation rooted in grace, not gamification."
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-charis-text">
        {/* Core Pillar 1: Grace Over Streaks */}
        <section className="p-4 rounded-xl bg-charis-primary/5 border border-charis-primary/15">
          <div className="flex items-center gap-2 text-charis-primary font-semibold text-sm">
            <Heart className="w-4 h-4 fill-current" />
            <span>Grace Over Streaks</span>
          </div>
          <p className="text-xs text-charis-text-muted mt-1.5 leading-relaxed font-sans">
            Most digital apps use red streak counters and guilt-driven notifications to manufacture daily active usage. In Charis, there are no broken streaks to fear. When life interrupts, your reading schedule gently recalibrates forward without shame. God&apos;s compassions never fail; they are new every morning.
          </p>
        </section>

        {/* Core Pillar 2: Five Interconnected Disciplines */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-text-muted">
            <Compass className="w-3.5 h-3.5 text-charis-primary" />
            <span>A Sanctuary of Five Disciplines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-charis-surface border border-charis-border text-xs">
              <span className="font-semibold text-charis-text flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-charis-primary" />
                Unhurried Scripture
              </span>
              <p className="text-charis-text-muted mt-1 text-[11px] leading-relaxed">
                Distraction-free reading across multiple translations with offline support.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charis-surface border border-charis-border text-xs">
              <span className="font-semibold text-charis-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-charis-secondary" />
                Prayer Stillness
              </span>
              <p className="text-charis-text-muted mt-1 text-[11px] leading-relaxed">
                528Hz contemplative acoustic chimes for breath prayer and petition.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charis-surface border border-charis-border text-xs">
              <span className="font-semibold text-charis-text flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-500" />
                SOAP Inductive Study
              </span>
              <p className="text-charis-text-muted mt-1 text-[11px] leading-relaxed">
                Scripture, Observation, Application, and Prayer deep workbench.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-charis-surface border border-charis-border text-xs">
              <span className="font-semibold text-charis-text flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-charis-primary" />
                Local & Sacred Privacy
              </span>
              <p className="text-charis-text-muted mt-1 text-[11px] leading-relaxed">
                IndexedDB offline-first architecture. Prayers are never sold or profiled.
              </p>
            </div>
          </div>
        </section>

        {/* Dismiss / Close Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-charis-primary hover:bg-charis-primary-hover text-white text-xs font-medium transition-colors shadow-subtle"
          >
            Enter the Sanctuary
          </button>
        </div>
      </div>
    </Modal>
  )
}
