import React from 'react'
import { BookOpen, Heart, BookMarked, Sparkles, HelpCircle, ArrowRight } from 'lucide-react'
import { NavDestination } from '../../types'

interface SanctuaryCompassHeroProps {
  onNavigate: (tab: NavDestination) => void
  onOpenEthos: () => void
}

export const SanctuaryCompassHero: React.FC<SanctuaryCompassHeroProps> = ({
  onNavigate,
  onOpenEthos
}) => {
  return (
    <section className="space-y-4">
      {/* 1. Grace Over Streaks Sanctuary Anchor Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-charis-primary/10 via-charis-surface to-charis-secondary/10 border border-charis-border/80 p-4 sm:p-5 shadow-card transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-charis-primary/15 text-charis-primary shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-serif font-bold text-charis-text">
                  Grace Over Streaks
                </h3>
                <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-charis-primary/15 text-charis-primary">
                  Sanctuary Ethos
                </span>
              </div>
              <p className="text-xs text-charis-text-muted mt-1 leading-relaxed max-w-xl font-sans">
                No broken streaks, no guilt badges. When life interrupts, your spiritual rhythm meets you with unhurried warmth.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEthos}
            className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text text-xs font-medium transition-colors shadow-subtle"
          >
            <HelpCircle className="w-3.5 h-3.5 text-charis-primary" />
            <span>Why Grace?</span>
          </button>
        </div>
      </div>

      {/* 2. The Daily Compass: Three Core Pathways */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pathway 1: Scripture */}
        <button
          onClick={() => onNavigate('bible')}
          className="group text-left p-4 rounded-2xl bg-charis-surface hover:bg-charis-border-subtle/60 border border-charis-border transition-all duration-200 shadow-subtle hover:shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-charis-primary/10 text-charis-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-charis-text group-hover:text-charis-primary transition-colors">
              Unhurried Scripture
            </h4>
            <p className="text-[11px] text-charis-text-muted mt-1 leading-relaxed">
              Quiet reading across NLT, KJV &amp; ESV with offline readiness.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-charis-border/50 flex items-center justify-between text-[11px] font-medium text-charis-primary">
            <span>Open Reader</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Pathway 2: Prayer Stillness */}
        <button
          onClick={() => onNavigate('prayer')}
          className="group text-left p-4 rounded-2xl bg-charis-surface hover:bg-charis-border-subtle/60 border border-charis-border transition-all duration-200 shadow-subtle hover:shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-charis-secondary/15 text-charis-secondary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-charis-text group-hover:text-charis-secondary transition-colors">
              Prayer &amp; Stillness
            </h4>
            <p className="text-[11px] text-charis-text-muted mt-1 leading-relaxed">
              Contemplative 528Hz chimes, petitions, and sacred quietness.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-charis-border/50 flex items-center justify-between text-[11px] font-medium text-charis-secondary">
            <span>Enter Stillness</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Pathway 3: SOAP Study */}
        <button
          onClick={() => onNavigate('study')}
          className="group text-left p-4 rounded-2xl bg-charis-surface hover:bg-charis-border-subtle/60 border border-charis-border transition-all duration-200 shadow-subtle hover:shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookMarked className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-charis-text group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              SOAP Inductive Study
            </h4>
            <p className="text-[11px] text-charis-text-muted mt-1 leading-relaxed">
              Scripture, Observation, Application &amp; Prayer depth.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-charis-border/50 flex items-center justify-between text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <span>Deepen Passage</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </section>
  )
}
