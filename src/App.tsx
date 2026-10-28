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
import { NavDestination } from './types'
import type { ActivityLog } from './types/activity'
import { useAuth } from './context/AuthContext'
import { activityRepository } from './lib/db/activity-repository'
import { syncQueueManager } from './lib/sync/sync-queue'
import { syncEngine } from './lib/sync/sync-engine'
import { generateUUID } from './lib/id'

export const AppContent: React.FC = () => {
  const { user } = useAuth()
  const activeUserId = user?.id || 'demo-user-id'

  const [currentTab, setCurrentTab] = useState<NavDestination>('home')
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false)
  const [isReaderChromeVisible, setIsReaderChromeVisible] = useState<boolean>(true)
  
  // Link state between Bible and Study Journal
  const [studyInitialRef, setStudyInitialRef] = useState<string | undefined>(undefined)

  const handleSelectTab = (tab: NavDestination) => {
    setCurrentTab(tab)
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
    syncEngine.processQueue(activeUserId).catch(() => {})
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
      isReaderChromeVisible={currentTab === 'bible' ? isReaderChromeVisible : true}
      onSetReaderChromeVisible={setIsReaderChromeVisible}
    >
      {currentTab === 'home' && (
        <HomeView
          onNavigate={handleSelectTab}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
        />
      )}

      {currentTab === 'bible' && (
        <BibleView
          onAttachStudyNote={handleAttachStudyNote}
          isChromeVisible={isReaderChromeVisible}
          onToggleChrome={() => setIsReaderChromeVisible(prev => !prev)}
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
        <PlansView onOpenPassage={() => setCurrentTab('bible')} />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Direct Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Quick Action Activity Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAddActivity={handleAddActivity}
        userId={activeUserId}
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
