import { 
  UserProfile, 
  ScriptureVerse, 
  PrayerEntry, 
  StudyEntry, 
  ActivityLog, 
  ReadingPlan, 
  FastingSchedule 
} from '../types'

export const mockUserProfile: UserProfile = {
  name: 'Julian Vance',
  email: 'julian@example.com',
  timeZone: 'Europe/London (UTC+1)',
  preferredTranslation: 'BSB — Berean Standard Bible',
  downloadedTranslations: ['BSB — Berean Standard Bible', 'KJV — King James Version']
}

export const mockScripturePsalm23: ScriptureVerse[] = [
  {
    book: 'Psalm',
    chapter: 23,
    verse: 1,
    text: 'The LORD is my shepherd; I shall not want.',
    isBookmarked: true,
    isHighlighted: true,
    highlightColor: 'sage'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 2,
    text: 'He makes me lie down in green pastures; He leads me beside quiet waters.',
    isHighlighted: true,
    highlightColor: 'terracotta'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 3,
    text: 'He restores my soul; He guides me in the paths of righteousness for the sake of His name.'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 4,
    text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me.'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 5,
    text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 6,
    text: 'Surely goodness and mercy will follow me all the days of my life, and I will dwell in the house of the LORD forever.'
  }
]

export const mockScriptureJohn15: ScriptureVerse[] = [
  {
    book: 'John',
    chapter: 15,
    verse: 1,
    text: 'I am the true vine, and My Father is the vinedresser.'
  },
  {
    book: 'John',
    chapter: 15,
    verse: 2,
    text: 'He cuts off every branch in Me that bears no fruit, and every branch that does bear fruit He prunes to make it even more fruitful.'
  },
  {
    book: 'John',
    chapter: 15,
    verse: 3,
    text: 'You are already clean because of the word I have spoken to you.'
  },
  {
    book: 'John',
    chapter: 15,
    verse: 4,
    text: 'Remain in Me, and I will remain in you. Just as no branch can bear fruit by itself unless it remains in the vine, neither can you bear fruit unless you remain in Me.',
    isBookmarked: true,
    isHighlighted: true,
    highlightColor: 'terracotta'
  },
  {
    book: 'John',
    chapter: 15,
    verse: 5,
    text: 'I am the vine; you are the branches. The one who remains in Me, and I in him, will bear much fruit. For apart from Me you can do nothing.'
  }
]

export const mockPrayerEntries: PrayerEntry[] = [
  {
    id: 'prayer-1',
    title: 'Peace in life transitions and steady trust',
    body: 'Father, thank You for holding the seasons that feel unsettled. Teach my heart not to run ahead of Your grace today. Give me patience with incomplete answers and help me remain present to those around me.',
    date: 'Today at 7:30 AM',
    tags: ['Peace', 'Trust', 'Morning'],
    scriptureRef: 'Psalm 23:2',
    promptType: 'thanksgiving',
    syncStatus: 'synced'
  },
  {
    id: 'prayer-2',
    title: 'Wisdom and gentleness for challenging conversations',
    body: 'Grant me clarity of thought and kindness of tongue. Let my words build up and not tear down. Remove any latent defensiveness so that truth is spoken in sincere love.',
    date: 'Yesterday at 8:15 PM',
    tags: ['Wisdom', 'Relationships'],
    promptType: 'supplication',
    syncStatus: 'synced'
  },
  {
    id: 'prayer-3',
    title: 'Quiet gratitude for health and family shelter',
    body: 'Remembering all the quiet gifts that went unnoticed this week—the morning air, quiet moments with Scripture, shared laughter around the evening table.',
    date: '2 days ago',
    tags: ['Gratitude', 'Family'],
    scriptureRef: 'Psalm 23:6',
    promptType: 'adoration',
    syncStatus: 'local'
  }
]

export const mockStudyEntries: StudyEntry[] = [
  {
    id: 'study-1',
    title: 'The Organic Fruitfulness of Abiding',
    scriptureRef: 'John 15:1-5',
    observation: 'Jesus uses the metaphor of the vine and branches right before Gethsemane. The key repeated imperative is "remain" or "abide" (Greek: menō). Fruit is described as a byproduct of connection, not autonomous exertion.',
    questionsContext: 'How would 1st-century disciples hearing Isaiah 5 (the unfruitful vineyard) perceive Christ claiming Himself as the "true" vine?',
    interpretation: 'Spiritual vitality is relational before it is functional. Striving without abiding results in dry exhaustion, but union with Christ naturally produces lasting character and love.',
    application: 'Guard morning unhurried stillness. When anxiety manifests at work, pause for two deep breaths and re-anchor in the truth that apart from Him I can do nothing.',
    crossReferences: ['Galatians 5:22-23', 'Psalm 1:1-3', 'Colossians 2:6-7'],
    notes: 'Pruning (kathairō) cleanses what is already living to produce greater fruitfulness.',
    date: 'Oct 23, 2026',
    syncStatus: 'synced'
  },
  {
    id: 'study-2',
    title: 'The Valley and the Shepherd’s Presence',
    scriptureRef: 'Psalm 23:4',
    observation: 'In verses 1–3 David speaks *about* God ("He leads, He restores"). In verse 4, when the valley is entered, the pronoun shifts to *You* ("for You are with me"). The valley transforms theological abstraction into intimate communion.',
    questionsContext: 'What were the ancient Judean ravines like where shepherds walked with their flocks?',
    interpretation: 'The valley of deep darkness is not a sign of the Shepherd’s abandonment; it is where His presence is most directly and personally experienced.',
    application: 'Do not panic when circumstances grow dark; look for the rod and staff that protect and guide.',
    crossReferences: ['Isaiah 43:2', 'Matthew 28:20'],
    notes: 'The rod protects against predators; the staff gently nudges wandering sheep back to the path.',
    date: 'Oct 20, 2026',
    syncStatus: 'synced'
  }
]

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'reading',
    label: 'Scripture Reading',
    timestamp: 'Today, 7:10 AM',
    durationMinutes: 20,
    note: 'Read Psalm 23 and John 15:1-5'
  },
  {
    id: 'act-2',
    type: 'prayer',
    label: 'Morning Prayer',
    timestamp: 'Today, 7:35 AM',
    durationMinutes: 15,
    note: 'Silence and prayer of thanksgiving'
  },
  {
    id: 'act-3',
    type: 'study',
    label: 'Bible Study',
    timestamp: 'Yesterday, 6:45 PM',
    durationMinutes: 25,
    note: 'Inductive study notes on John 15'
  },
  {
    id: 'act-4',
    type: 'worship',
    label: 'Worship & Stillness',
    timestamp: '2 days ago',
    durationMinutes: 15,
    note: 'Dwell in peace and instrumental contemplation'
  }
]

export const mockReadingPlans: ReadingPlan[] = [
  {
    id: 'plan-1',
    title: 'Gospels in 40 Days',
    description: 'A gentle, unhurried journey through the life, teachings, and miracles of Jesus across the four Gospels.',
    totalDays: 40,
    completedDays: 14,
    isFeatured: true,
    status: 'active',
    assignments: [
      { day: 13, dateLabel: 'Yesterday', passage: 'Matthew 13:24-52', isCompleted: true },
      { day: 14, dateLabel: 'Today (Day 14)', passage: 'Matthew 14:13-36 & Psalm 23', isCompleted: false },
      { day: 15, dateLabel: 'Tomorrow', passage: 'Matthew 15:1-28', isCompleted: false },
      { day: 16, dateLabel: 'Day 16', passage: 'Matthew 16:13-28', isCompleted: false },
      { day: 17, dateLabel: 'Day 17', passage: 'Matthew 17:1-27', isCompleted: false }
    ]
  },
  {
    id: 'plan-2',
    title: 'The Wisdom Journey: Proverbs & Ecclesiastes',
    description: 'Practical daily discernment for decision-making, speech, stewardship, and inner composure.',
    totalDays: 30,
    completedDays: 7,
    isFeatured: false,
    status: 'active',
    assignments: [
      { day: 7, dateLabel: 'Today', passage: 'Proverbs 7:1-27', isCompleted: false },
      { day: 8, dateLabel: 'Day 8', passage: 'Proverbs 8:1-36', isCompleted: false }
    ]
  },
  {
    id: 'plan-3',
    title: 'Summer in the Psalms',
    description: 'Praying through the poetry of worship, grief, lament, and adoration.',
    totalDays: 50,
    completedDays: 50,
    isFeatured: false,
    status: 'completed',
    assignments: []
  }
]

export const mockFastingSchedule: FastingSchedule = {
  isActive: true,
  title: 'Intermittent Rhythm',
  type: '16:8 Evening to Midday',
  startTime: '8:00 PM yesterday',
  targetHours: 16,
  elapsedHours: 14.5,
  note: 'A quiet posture of physical simplicity and spiritual attentiveness.'
}
