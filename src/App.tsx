import React, { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SyncProvider } from './context/SyncContext'
import { AppShell } from './components/layout/AppShell'
import { HomeView } from './views/HomeView'
import { BibleView } from './views/BibleView'
import { PrayerJournalView } from './views/PrayerJournalView'
import { StudyJournalView } from './views/StudyJournalView'
import { PlansView } from './views/PlansView'
import { SettingsModal } from './components/modals/SettingsModal'
import { QuickActionModal } from './components/modals/QuickActionModal'
import { AuthModal } from './components/modals/AuthModal'
import { EthosModal } from './components/modals/EthosModal'
import { ReminderAlertBanner } from './components/notifications/ReminderAlertBanner'
import { NavDestination } from './types'
import type { ActivityLog } from './types/activity'
import { useAuth } from './context/AuthContext'
import { useUserSettings } from './hooks/useUserSettings'
import { useReminderScheduler } from './hooks/useReminderScheduler'
import { activityRepository } from './lib/db/activity-repository'
import { syncQueueManager } from './lib/sync/sync-queue'
import { syncEngine } from './lib/sync/sync-engine'
import { generateUUID } from './lib/id'
import { parseScriptureReference } from './lib/bible/canon'

export interface ActiveJourneyContext {
  planId: string;
  planName: string;
  assignmentId: string;
  dayNumber: number;
  passages?: string[];
}

export const AppContent: React.FC = () => {
  const { user } = useAuth()
  const activeUserId = user?.id || 'demo-user-id'

  const { reminderPreferences, settings } = useUserSettings(activeUserId)
  const { activeAlert, dismissAlert } = useReminderScheduler(reminderPreferences, settings?.timezone)

  const [currentTab, setCurrentTab] = useState<NavDestination>('home')
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false)
  const [isEthosOpen, setIsEthosOpen] = useState<boolean>(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false)
  const [isReaderChromeVisible, setIsReaderChromeVisible] = useState<boolean>(true)
  
  // Link state between Bible, Study Journal, and Journey plans
  const [studyInitialRef, setStudyInitialRef] = useState<string | undefined>(undefined)
  const [activePassageTarget, setActivePassageTarget] = useState<{
    bookId: string;
    chapterNumber: number;
    verseNumber?: number;
  } | null>(null)
  const [activeJourneyContext, setActiveJourneyContext] = useState<ActiveJourneyContext | null>(null)

  const handleSelectTab = (tab: NavDestination) => {
    setCurrentTab(tab)
    setIsReaderChromeVisible(true)
  }

  const handleOpenPassage = (
    passageRef?: string,
    journeyMeta?: { planId: string; planName: string; assignmentId: string; dayNumber: number }
  ) => {
    if (passageRef) {
      const firstRef = passageRef.split(',')[0].trim()
      const parsed = parseScriptureReference(firstRef)
      if (parsed) {
        setActivePassageTarget({
          bookId: parsed.bookId,
          chapterNumber: parsed.chapter,
          verseNumber: parsed.startVerse,
        })
      }
    }
    if (journeyMeta) {
      setActiveJourneyContext({
        ...journeyMeta,
        passages: passageRef ? passageRef.split(',').map((s) => s.trim()) : undefined,
      })
    } else {
      setActiveJourneyContext(null)
    }
    setCurrentTab('bible')
    setIsReaderChromeVisible(true)
  }

  const handleAttachStudyNote = (verseRef: string) => {
    setStudyInitialRef(verseRef)
    handleSelectTab('study')
  }

  const handleAddActivity = async (activity: ActivityLog) => {
    await activityRepository.save(activity)
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'activity_log',
      entityId: activity.id,
      action: 'create',
      baseVersion: 0,
      payload: activity,
    })
    syncEngine.triggerAutoSync(activeUserId)
  }

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      isOffline={isOffline}
      onToggleOffline={() => setIsOffline(prev => !prev)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenAuth={() => setIsAuthOpen(true)}
      onQuickAction={() => setIsQuickActionOpen(true)}
      onOpenEthos={() => setIsEthosOpen(true)}
      isReaderChromeVisible={currentTab === 'bible' ? isReaderChromeVisible : true}
      onSetReaderChromeVisible={setIsReaderChromeVisible}
    >
      <div key={currentTab} className="animate-view-transition">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={handleSelectTab}
            onOpenPassage={handleOpenPassage}
            onOpenQuickAction={() => setIsQuickActionOpen(true)}
            onOpenEthos={() => setIsEthosOpen(true)}
          />
        )}

        {currentTab === 'bible' && (
          <BibleView
            onAttachStudyNote={handleAttachStudyNote}
            isChromeVisible={isReaderChromeVisible}
            onToggleChrome={() => setIsReaderChromeVisible(prev => !prev)}
            targetPassage={activePassageTarget}
            onClearTargetPassage={() => setActivePassageTarget(null)}
            journeyContext={activeJourneyContext}
            onClearJourneyContext={() => setActiveJourneyContext(null)}
          />
        )}

        {currentTab === 'prayer' && (
          <PrayerJournalView />
        )}

        {currentTab === 'study' && (
          <StudyJournalView
            initialScriptureRef={studyInitialRef}
            onClearInitialScriptureRef={() => setStudyInitialRef(undefined)}
          />
        )}

        {currentTab === 'plans' && (
          <PlansView onOpenPassage={handleOpenPassage} />
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Direct Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* The Charis Ethos Modal */}
      <EthosModal
        isOpen={isEthosOpen}
        onClose={() => setIsEthosOpen(false)}
      />

      {/* Quick Action Activity Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAddActivity={handleAddActivity}
        userId={activeUserId}
      />

      {/* Contemplative Reminder Sound & Notification Banner */}
      <ReminderAlertBanner
        alert={activeAlert}
        onDismiss={dismissAlert}
        onNavigate={handleSelectTab}
      />
    </AppShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
