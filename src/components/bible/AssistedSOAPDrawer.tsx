/**
 * Assisted SOAP Study Drawer Component
 * In-context slide-over study companion for scripture reading.
 * Strictly adheres to Cambium <= 300 line health.
 */

import React, { useState, useEffect } from 'react';
import { X, BookMarked, Sparkles, Check } from 'lucide-react';
import { getBookInsight } from '../../lib/bible/book-insights';
import { OBSERVATION_PROMPTS, APPLICATION_PROMPTS, PRAYER_PROMPTS } from '../../lib/bible/soap-prompts';
import { SOAPContextCard } from './SOAPContextCard';
import { SOAPSectionField } from './SOAPSectionField';
import { studyRepository } from '../../lib/db/study-repository';
import { prayerRepository } from '../../lib/db/prayer-repository';
import { syncQueueManager } from '../../lib/sync/sync-queue';
import { syncEngine } from '../../lib/sync/sync-engine';
import { soundAlarmService } from '../../lib/audio/sound-alarm';
import { generateUUID } from '../../lib/id';
import type { StudyEntry, PrayerEntry } from '../../types/journal';

interface AssistedSOAPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  initialVerseRef?: string;
  initialVerseText?: string;
  activeUserId: string;
  onSaved?: () => void;
}

const DRAWER_DRAFT_KEY = 'charis_soap_drawer_draft_v1';

export const AssistedSOAPDrawer: React.FC<AssistedSOAPDrawerProps> = ({
  isOpen,
  onClose,
  bookId,
  bookName,
  chapterNumber,
  initialVerseRef,
  initialVerseText,
  activeUserId,
  onSaved,
}) => {
  const [scriptureRef, setScriptureRef] = useState('');
  const [quotedVerse, setQuotedVerse] = useState('');
  const [observation, setObservation] = useState('');
  const [application, setApplication] = useState('');
  const [prayer, setPrayer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const insight = getBookInsight(bookId, bookName);

  useEffect(() => {
    if (!isOpen) return;
    const defaultRef = initialVerseRef || `${bookName} ${chapterNumber}`;
    setScriptureRef(defaultRef);
    if (initialVerseText) setQuotedVerse(initialVerseText);

    try {
      const saved = localStorage.getItem(DRAWER_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.scriptureRef === defaultRef) {
          if (parsed.observation) setObservation(parsed.observation);
          if (parsed.application) setApplication(parsed.application);
          if (parsed.prayer) setPrayer(parsed.prayer);
          if (parsed.quotedVerse && !initialVerseText) setQuotedVerse(parsed.quotedVerse);
        }
      }
    } catch {}
  }, [isOpen, bookName, chapterNumber, initialVerseRef, initialVerseText]);

  useEffect(() => {
    if (!isOpen) return;
    if (observation || application || prayer) {
      try {
        localStorage.setItem(DRAWER_DRAFT_KEY, JSON.stringify({ scriptureRef, quotedVerse, observation, application, prayer }));
      } catch {}
    }
  }, [isOpen, scriptureRef, quotedVerse, observation, application, prayer]);

  const handleAppendPrompt = (setter: React.Dispatch<React.SetStateAction<string>>, starterText: string) => {
    setter((prev) => (prev.trim() ? `${prev.trim()}\n• ${starterText}` : starterText));
  };

  const handleSave = async (withStillnessChime = false) => {
    if (!scriptureRef.trim() && !observation.trim() && !application.trim()) return;
    setIsSaving(true);
    const now = new Date().toISOString();
    const studyId = generateUUID();

    const studyEntry: StudyEntry = {
      id: studyId,
      userId: activeUserId,
      title: `SOAP Study: ${scriptureRef}`,
      passageRef: { bookId, bookName, chapter: chapterNumber, formatted: scriptureRef },
      observations: observation.trim() || undefined,
      application: application.trim() || undefined,
      notes: quotedVerse.trim() ? `Scripture Focus:\n"${quotedVerse.trim()}"` : undefined,
      crossReferences: [],
      sync: { syncStatus: 'pending', lastSyncedAt: null, localVersion: 1 },
      createdAt: now,
      updatedAt: now,
    };

    await studyRepository.save(studyEntry);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'study_entry',
      entityId: studyId,
      action: 'create',
      baseVersion: 0,
      payload: studyEntry,
    });

    if (prayer.trim() && withStillnessChime) {
      const prayerId = generateUUID();
      const prayerEntry: PrayerEntry = {
        id: prayerId,
        userId: activeUserId,
        title: `Prayer from ${scriptureRef}`,
        body: prayer.trim(),
        entryAt: now,
        tags: ['soap-study', 'scripture-prayer'],
        scriptureReferences: [{ bookId, bookName, chapter: chapterNumber, formatted: scriptureRef }],
        sync: { syncStatus: 'pending', lastSyncedAt: null, localVersion: 1 },
        createdAt: now,
        updatedAt: now,
      };
      await prayerRepository.save(prayerEntry);
      await syncQueueManager.enqueue({
        operationId: generateUUID(),
        userId: activeUserId,
        entityType: 'prayer_entry',
        entityId: prayerId,
        action: 'create',
        baseVersion: 0,
        payload: prayerEntry,
      });
      soundAlarmService.playTheme('bowl');
    }

    syncEngine.triggerAutoSync(activeUserId);
    try { localStorage.removeItem(DRAWER_DRAFT_KEY); } catch {}
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved?.();
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Assisted SOAP Study Companion"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-charis-surface/98 backdrop-blur-xl border-l border-charis-border shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-charis-border/70 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-charis-primary/10 text-charis-primary flex items-center justify-center">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-charis-text">Assisted SOAP Study</h3>
            <p className="text-[11px] text-charis-text-muted">{scriptureRef}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle transition-colors"
          aria-label="Close Study Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs text-charis-text">
        <SOAPContextCard bookName={bookName} insight={insight} />

        {/* S · Scripture */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-charis-text flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-charis-primary/10 text-charis-primary text-center leading-5 font-mono text-[10px] font-bold">S</span>
              <span>Scripture Passage</span>
            </span>
            <span className="text-[10px] text-charis-text-muted font-mono">{scriptureRef}</span>
          </div>
          {quotedVerse && (
            <blockquote className="p-3 rounded-lg bg-charis-border-subtle/70 border-l-2 border-charis-primary italic font-serif text-xs text-charis-text">
              &ldquo;{quotedVerse}&rdquo;
            </blockquote>
          )}
        </section>

        {/* O · Observation */}
        <SOAPSectionField
          badgeLetter="O"
          badgeStyle="bg-charis-secondary/15 text-charis-secondary"
          title="Observation (What does it say?)"
          prompts={OBSERVATION_PROMPTS}
          value={observation}
          onChange={setObservation}
          onAppendPrompt={(txt) => handleAppendPrompt(setObservation, txt)}
          placeholder="What words repeat? Who is speaking? What reveals God's nature?"
          rows={3}
        />

        {/* A · Application */}
        <SOAPSectionField
          badgeLetter="A"
          badgeStyle="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Application (How does this touch my life?)"
          prompts={APPLICATION_PROMPTS}
          value={application}
          onChange={setApplication}
          onAppendPrompt={(txt) => handleAppendPrompt(setApplication, txt)}
          placeholder="Is there a promise to claim? A shift of heart? How can I walk this out?"
          rows={3}
          hoverBorderColor="hover:border-amber-500/50"
          hoverTextColor="hover:text-amber-600"
        />

        {/* P · Prayer */}
        <SOAPSectionField
          badgeLetter="P"
          badgeStyle="bg-charis-primary/10 text-charis-primary"
          title="Prayer (Speak to God)"
          prompts={PRAYER_PROMPTS}
          value={prayer}
          onChange={setPrayer}
          onAppendPrompt={(txt) => handleAppendPrompt(setPrayer, txt)}
          placeholder="Turn your application into a quiet conversation with God..."
          rows={2}
        />
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-charis-border/70 bg-charis-surface shrink-0 flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving || savedSuccess}
          className="w-full sm:flex-1 py-2 px-3 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text text-xs font-medium transition-colors shadow-subtle flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <BookMarked className="w-3.5 h-3.5 text-charis-primary" />}
          <span>{savedSuccess ? 'Study Saved' : 'Save Study'}</span>
        </button>

        <button
          onClick={() => handleSave(true)}
          disabled={isSaving || savedSuccess}
          className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-charis-primary hover:bg-charis-primary-hover text-white text-xs font-medium transition-colors shadow-subtle flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Save &amp; Pray in Stillness</span>
        </button>
      </div>
    </aside>
  );
};
