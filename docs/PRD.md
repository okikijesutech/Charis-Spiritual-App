# Product Requirements Document (PRD)

**Product:** Spiritual-discipline PWA (working title; public name undecided)  
**Version:** 1.0  
**Status:** Product decisions confirmed; ready for engineering review  
**Primary platform:** Android-first installable PWA  
**Launch budget:** Free-tier infrastructure and open-source tooling where practical

## 1. Product vision

Help people build a consistent, personal rhythm of prayer, Scripture reading, study, reflection, and fasting—with privacy, offline access, and grace when life interrupts their plans.

The product is a public, multi-user application. Each user's journals, activity records, reading plans, schedules, bookmarks, and preferences are private by default.

## 2. Confirmed decisions

- **Public app name:** Not selected. Use a neutral internal project identifier until naming and availability checks are complete.
- **Authentication:** Email/password and Google sign-in through Supabase Auth.
- **Frontend:** React, TypeScript, Vite.
- **Backend/data:** Supabase Auth and PostgreSQL, with Row Level Security (RLS).
- **Bible data:** AO Lab downloads for supported offline translations; Open Bible API for online full-text search, behind provider adapters.
- **Journals:** Separate Prayer Journal and Bible Study Journal.
- **Activity tracking:** Gentle and reflective; no guilt-based streaks or spiritual scores.
- **Theme:** Warm light and carefully designed dark themes; follow system preference by default.
- **Reading plans:** Fully custom builder.
- **Active plans:** Multiple active plans allowed; user chooses one featured plan on Home.
- **Reading completion:** Explicit completion with optional partial progress.
- **Fasting:** Custom schedules plus reusable presets.
- **Journal attachments:** Text and Scripture references for v1; attachments deferred.
- **Bible downloads:** Multiple translations may be downloaded where licensing, provider terms, and device storage allow.
- **Local journal privacy:** Standard local storage for v1, with clear shared-device warnings; optional local encryption is a later enhancement.
- **Widgets:** Configurable in-app dashboard widgets in v1. Native Android home-screen widget is a later phase after PWA stability.
- **Reminders:** In-app reminders plus web push where supported and permission is granted; no guarantee of exact-time delivery on all browsers/devices.
- **Audience:** Public, multi-user.
- **Cost:** Aim for a usable free launch; no assumption that third-party free tiers remain unlimited or free forever.

## 3. Goals

1. Make prayer and Bible reading easy to begin and return to.
2. Provide private, searchable prayer and study journals.
3. Support custom reading plans, including six-month and one-year schedules.
4. Record activity frequency and optional duration without judging spiritual worth.
5. Keep core personal workflows useful offline.
6. Protect private records with server-enforced access control.
7. Keep Bible providers, persistence implementations, and authentication usage sufficiently isolated to support future migration.

## 4. Non-goals for v1

- Public journal sharing, social feeds, leaderboards, or church administration.
- AI-generated spiritual counsel or claims about God's intentions.
- Paid subscriptions, advertisements, or complex monetisation.
- Native Android home-screen widgets.
- Journal image/document attachments.
- Building a custom authentication system.
- Building or redistributing Bible translations without verified rights.
- Guaranteed background execution or exact-time notification delivery in every browser.

## 5. Target users and primary journeys

### Primary user
A person who wants a private, mobile-first place to read Scripture, keep prayer and study notes, organise spiritual activities, and reflect on their own rhythm.

### Journey A: first use
1. Visit the public app and understand its purpose and privacy stance.
2. Register with email/password or Google.
3. Set time zone, theme, optional prayer schedule, and Bible preferences.
4. Choose a Bible translation and download it if offline access is desired.
5. Start reading or create a first journal entry.

### Journey B: daily use
1. Open Home and see today's selected reading and upcoming schedule.
2. Open the passage, read, and explicitly mark the assigned reading complete or partially complete.
3. Record an activity or open a journal.
4. Leave the app; local changes remain saved.
5. When online, pending changes synchronise and the app shows sync status.

### Journey C: custom reading plan
1. Name the plan.
2. Select the scope: whole supported canon, selected books, chapter range, or custom passages.
3. Choose start/end dates and reading days.
4. Choose automatic chapter-based distribution or manual assignment.
5. Review workload and warnings, then save.
6. Adjust future assignments later without erasing completed history.

### Journey D: private journaling offline
1. Open a journal while offline.
2. Create or edit a text entry and optionally link Scripture.
3. See a clear “Saved on this device” state.
4. Reconnect and sync.
5. If a conflicting edit exists, retain recoverable versions and ask the user to resolve it.

## 6. Functional requirements

### FR-01 Authentication and account
- Support email/password and Google OAuth using Supabase Auth.
- Support sign-out, password recovery, and account deletion.
- Use Supabase Auth as the credential/session authority; never store passwords in application tables.
- Protect all private data with RLS, not merely frontend route guards.
- Do not expose the Supabase service-role key in client code.
- Account deletion must revoke access promptly and run a documented deletion workflow for cloud and local data.

### FR-02 Bible library and reader
- Browse the 66-book Protestant canon for the initial release.
- Navigate books, chapters, and verses.
- Switch between supported translations.
- Adjust font size and reading presentation.
- Bookmark passages and create highlights.
- Attach study-note references to passages.
- Show translation identity, attribution, and offline availability.
- Read downloaded translations offline.
- Do not fabricate or generate missing Bible text.

### FR-03 Bible search
- Integrate Open Bible API for online full-text search through a provider adapter.
- Search locally in downloaded/indexed translations when offline.
- Clearly distinguish local search results from online results where capabilities differ.
- Validate API response shape and handle unavailable providers gracefully.
- Do not claim that every translation is searchable unless its text is available and indexed.

### FR-04 Prayer Journal
- Create, view, edit, search, and delete private text entries.
- Optional title, body, date/time, tags, and Scripture references.
- Allow blank-page and optional prompt-based entry.
- Autosave safely and expose local/sync state.
- Do not require a user to label a prayer “answered” or infer spiritual outcomes.

### FR-05 Bible Study Journal
- Separate from the Prayer Journal.
- Support passage references, observations, questions/context, interpretation, application, cross-references, and free-form notes.
- All structured fields except the minimum needed to save an entry remain optional.
- Save drafts and revisit studies.
- Link a study entry to the Bible reader.

### FR-06 Activity tracking
- Allow user-defined activity types (e.g. prayer, reading, study, worship, gratitude, fasting).
- Record timestamp, optional duration, and optional note.
- Support multiple sessions of the same activity on the same day.
- Display weekly/monthly history and frequency patterns.
- Allow corrections and deletion.
- Avoid guilt language, ranking, punitive streaks, and spiritual-worth scores.

### FR-07 Reading plans
- Provide a custom plan builder.
- Support entire canon, selected books, chapter ranges, and custom passages.
- Support start/end dates, chosen reading days, rest days, and automatic/manual distribution.
- Support multiple active plans and one featured plan on Home.
- Preserve completed assignments when future schedules change.
- Support partial progress and explicit completion.
- Warn when the requested workload and date range conflict.
- Prevent duplicate assignment slots within a plan.

### FR-08 Prayer and fasting schedules
- Support multiple prayer schedules, including weekday-specific schedules.
- Support custom fasting schedules and reusable user-owned presets.
- Include start/end dates and times, recurrence where applicable, and optional reminders.
- Allow pause, edit, and cancel.
- Store time zone explicitly and handle local-time changes.
- Use neutral, non-prescriptive language; do not provide medical claims or pressure users to fast.

### FR-09 Reminders and notifications
- Support in-app reminders and web push where supported.
- Request notification permission only after explaining the benefit.
- Let users configure reminder categories and quiet periods.
- Do not include private journal contents in notification payloads.
- Gracefully handle denied permissions, unsupported browsers, and expired push subscriptions.
- Document that browser delivery and background execution are not guaranteed.

### FR-10 Dashboard widgets
- Configurable cards for selected reading, next prayer, fasting schedule, quick journal, recent activity, plan progress, and selected Scripture.
- Allow hide/reorder/reset.
- Keep useful defaults when offline.
- In-app dashboard widgets are v1; native launcher widgets are deferred.

### FR-11 Offline operation and sync
- Cache application shell and essential assets.
- Store downloaded translations, journals, bookmarks, highlights, plans, schedules, and activity records locally as appropriate.
- Queue changes for sync.
- Show saved/syncing/synced/needs-attention states.
- Make retries idempotent.
- Detect conflicting edits and preserve recoverable content.
- Use deletion tombstones or equivalent for offline deletes.
- Avoid caching private API responses in a way that leaks data across accounts.
- Do not imply that IndexedDB is encrypted or a secure vault.

### FR-12 Account and data management
- Manage profile, time zone, theme, and preferences.
- Export personal journals and activity history in a documented format.
- Manage downloaded translations.
- Delete account and associated cloud data through a documented process.
- Explain local-storage risks and offer sign-out/clear-local-data controls.

## 7. Non-functional requirements

- Mobile-first responsive layout; Android Chrome is the primary validation target.
- Keyboard accessibility, screen-reader labels, visible focus, reduced-motion support, and accessible contrast.
- Core reading/journaling workflows remain available offline after initial setup and relevant downloads.
- No private record can be accessed by another user, including via direct API requests.
- No secret keys in frontend bundles.
- Provider failures must not crash unrelated features.
- Errors should be actionable and avoid losing user-written content.
- Automated tests cover business rules, access boundaries, offline persistence, sync retry, and reading-plan generation.

## 8. MVP release scope

### Release 1: core companion
- Email/Google authentication.
- Responsive app shell, light/dark themes, configurable Home cards.
- One or more legally verified Bible translations, subject to rights and storage.
- Reader, bookmarks, highlights, basic online search, and local search for downloaded text where feasible.
- Separate Prayer and Study Journals.
- Gentle activity tracking.
- Custom reading-plan builder.
- Prayer and fasting schedules with in-app reminders.
- IndexedDB persistence, offline workflows, and sync queue.
- Basic web push where supported may be feature-flagged if delivery infrastructure is not ready.
- Export, account deletion, privacy information, and RLS tests.

### Release 1.x
- Broader translation catalogue and better local search indexing.
- Web push reliability improvements.
- Better conflict-resolution UX and sync diagnostics.
- Calendar export if validated by user demand.

### Release 2
- Optional local encryption.
- Native Android companion and launcher widget, only after validating demand and platform constraints.
- Additional features based on user feedback.

## 9. Success measures

Measure usefulness, not spiritual worth:
- Activation: users who complete onboarding and start a reading or journal entry.
- Reliability: percentage of queued changes synced without data loss.
- Offline success: completion of key workflows in airplane-mode tests.
- Privacy: cross-user access tests pass.
- Retention: voluntary return usage, reported in aggregate and with privacy safeguards.
- Usability: successful completion of reading-plan creation and journal retrieval tasks.

Do not use individual activity frequency to shame, rank, or make claims about a person's faith.

## 10. Release acceptance checklist

- [ ] User can register and sign in by email or Google.
- [ ] User A cannot access User B's private records through UI or direct API.
- [ ] Downloaded Scripture opens in airplane mode.
- [ ] Prayer and study entries can be created offline and survive app restart.
- [ ] Offline changes sync without duplicate records.
- [ ] Conflicting journal edits are recoverable.
- [ ] Reading plans generate valid, non-duplicated assignments.
- [ ] Completed readings remain complete after future schedule edits.
- [ ] Activity history supports multiple sessions per day.
- [ ] Theme and dashboard preferences persist.
- [ ] Account export and deletion flows are tested.
- [ ] No service-role key or provider secret is included in client assets.
- [ ] Accessibility and supported Android PWA install flows are tested.

## 11. Explicit assumptions requiring future validation

- The initial canon is the 66-book Protestant canon.
- Exact Bible translation availability and redistribution rights must be verified before shipping.
- Open Bible API availability, usage limits, and terms must be verified against the chosen deployment.
- Free hosting/auth/database quotas must be monitored; “free launch” is a budget goal, not a guarantee of permanent free service.
- Native Android widgets and guaranteed alarms are not part of the PWA MVP.
