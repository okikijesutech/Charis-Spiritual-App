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
import { NavDestination, ActivityLog } from './types'

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavDestination>('home')
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false)
  
  // Link state between Bible and Study Journal
  const [studyInitialRef, setStudyInitialRef] = useState<string | undefined>(undefined)

  const handleAttachStudyNote = (verseRef: string) => {
    setStudyInitialRef(verseRef)
    setCurrentTab('study')
  }

  const handleAddActivity = (_activity: ActivityLog) => {
    // Activity logged
  }

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      isOffline={isOffline}
      onToggleOffline={() => setIsOffline(prev => !prev)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onQuickAction={() => setIsQuickActionOpen(true)}
    >
      {currentTab === 'home' && (
        <HomeView
          onNavigate={setCurrentTab}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
        />
      )}

      {currentTab === 'bible' && (
        <BibleView
          onAttachStudyNote={handleAttachStudyNote}
        />
      )}

      {currentTab === 'prayer' && (
        <PrayerJournalView />
      )}

      {currentTab === 'study' && (
        <StudyJournalView
          initialScriptureRef={studyInitialRef}
        />
      )}

      {currentTab === 'plans' && (
        <PlansView />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Quick Action Activity Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAddActivity={handleAddActivity}
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
