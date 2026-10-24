export type NavDestination = 'home' | 'bible' | 'prayer' | 'study' | 'plans'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface ScriptureVerse {
  book: string
  chapter: number
  verse: number
  text: string
  isBookmarked?: boolean
  isHighlighted?: boolean
  highlightColor?: string
}

export interface PrayerEntry {
  id: string
  title: string
  body: string
  date: string
  tags: string[]
  scriptureRef?: string
  promptType?: 'adoration' | 'confession' | 'thanksgiving' | 'supplication' | 'freeform'
  syncStatus: 'synced' | 'local' | 'syncing'
}

export interface StudyEntry {
  id: string
  title: string
  scriptureRef: string
  observation: string
  questionsContext: string
  interpretation: string
  application: string
  crossReferences: string[]
  notes: string
  date: string
  syncStatus: 'synced' | 'local'
}

export interface ActivityLog {
  id: string
  type: 'prayer' | 'reading' | 'study' | 'worship' | 'fasting' | 'gratitude'
  label: string
  timestamp: string
  durationMinutes?: number
  note?: string
}

export interface ReadingAssignment {
  day: number
  dateLabel: string
  passage: string
  isCompleted: boolean
  isPartial?: boolean
}

export interface ReadingPlan {
  id: string
  title: string
  description: string
  totalDays: number
  completedDays: number
  isFeatured: boolean
  status: 'active' | 'completed' | 'paused'
  assignments: ReadingAssignment[]
}

export interface FastingSchedule {
  isActive: boolean
  title: string
  type: string
  startTime: string
  targetHours: number
  elapsedHours: number
  note?: string
}

export interface UserProfile {
  name: string
  email: string
  timeZone: string
  preferredTranslation: string
  downloadedTranslations: string[]
}
