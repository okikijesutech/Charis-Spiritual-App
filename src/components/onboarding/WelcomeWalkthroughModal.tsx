/**
 * Welcome Walkthrough Modal (FTUE)
 * Introduces new pilgrims to the unhurried ethos, "Grace Over Streaks",
 * and invites them to create a free private account with zero pressure.
 * Per docs/PRD.md and Charis Contemplative Design Principles.
 */

import React, { useState } from 'react';
import { Sparkles, Heart, ShieldCheck, ArrowRight, ChevronLeft, Check } from 'lucide-react';

interface WelcomeWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignUp: () => void;
}

interface WalkthroughSlide {
  subtitle: string;
  headline: string;
  body: string[];
  icon: React.ReactNode;
  themeColor: string;
}

const SLIDES: WalkthroughSlide[] = [
  {
    subtitle: 'An Unhurried Sanctuary',
    headline: 'Silence the noise. Make room for what matters.',
    body: [
      'Charis is a quiet digital space designed to help you dwell with God in an unhurried rhythm.',
      'Whether you have two quiet minutes in the morning or an hour at dusk, this is a sanctuary for scripture, prayer, and stillness.',
    ],
    icon: <Sparkles className="w-7 h-7 text-charis-primary" />,
    themeColor: 'bg-charis-primary/10',
  },
  {
    subtitle: 'Our Foundation',
    headline: 'Spiritual rhythm is fellowship, not a score.',
    body: [
      'You won’t find gamified red dots, guilt-inducing notifications, or rigid streaks here.',
      'If you miss a day, a week, or a season, grace is already waiting. You simply pick up right where you left off.',
    ],
    icon: <Heart className="w-7 h-7 text-charis-secondary" />,
    themeColor: 'bg-charis-secondary/10',
  },
  {
    subtitle: 'Your Private Space',
    headline: 'Save your rhythm across all your devices.',
    body: [
      'You can explore and read the full Bible completely offline on this device right now.',
      'If you’d like your prayers, reflections, and reading plans to stay automatically synced between your phone, tablet, and computer, you can create a free private account. No spam, no marketing—just your quiet journey preserved.',
    ],
    icon: <ShieldCheck className="w-7 h-7 text-charis-primary" />,
    themeColor: 'bg-charis-primary/10',
  },
];

export const WelcomeWalkthroughModal: React.FC<WelcomeWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onOpenSignUp,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleFinishGuest = () => {
    try {
      localStorage.setItem('charis_onboarding_completed', 'true');
    } catch {}
    onClose();
  };

  const handleFinishSignUp = () => {
    try {
      localStorage.setItem('charis_onboarding_completed', 'true');
    } catch {}
    onClose();
    onOpenSignUp();
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed Calm Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={handleFinishGuest}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-charis-surface border border-charis-border rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col transition-all">
        {/* Subtle Top Bar: Step Indicator & Skip */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-6 bg-charis-primary'
                    : 'w-2 bg-charis-border-subtle'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleFinishGuest}
            className="text-xs text-charis-text-muted hover:text-charis-text transition-colors py-1 px-2 rounded-lg hover:bg-charis-border-subtle"
          >
            Skip to Sanctuary
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 sm:p-8 space-y-5 animate-view-transition min-h-[300px] flex flex-col justify-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-subtle border border-charis-border/60">
            {slide.icon}
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-charis-primary uppercase tracking-wider">
              {slide.subtitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-charis-text leading-snug">
              {slide.headline}
            </h2>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-charis-text-muted leading-relaxed font-sans">
            {slide.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-5 sm:p-6 bg-charis-border-subtle/40 border-t border-charis-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {currentSlide > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1 text-xs font-medium text-charis-text-muted hover:text-charis-text px-3 py-2 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {!isLast ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-charis-primary hover:bg-charis-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-subtle inline-flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={handleFinishGuest}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-charis-text-muted hover:text-charis-text transition-colors border border-charis-border hover:bg-charis-surface text-center"
              >
                Explore as Guest
              </button>

              <button
                type="button"
                onClick={handleFinishSignUp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-charis-primary hover:bg-charis-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-subtle inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Create Free Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
