# Design System and UX Specification

**Product:** Spiritual-discipline PWA  
**Version:** 1.0  
**Status:** Initial design contract; visual prototype required before broad implementation

## 1. Design principles

1. **Quiet, not empty:** create calm space while keeping important actions discoverable.
2. **Mobile-app feel:** use responsive app navigation, touch-friendly controls, bottom sheets, and persistent state.
3. **Scripture readability first:** reading surfaces prioritise typography, line length, and contrast over decorative cards.
4. **Grace over gamification:** no guilt copy, punitive streaks, ranking, or spiritual score.
5. **Private by default:** never surface journal content in public feeds, notifications, or shared UI.
6. **Consistent, not generic:** use a small coherent design system and deliberate layouts rather than repeated template cards everywhere.
7. **Accessible by default:** keyboard, screen-reader, contrast, focus, and reduced-motion support are required.

## 2. Visual direction

The visual direction combines:
- Warm cream/ivory surfaces and restrained terracotta accents.
- Deep indigo or charcoal text.
- Muted sage as a secondary accent.
- Editorial serif typography for Scripture and selected headings.
- Clean sans-serif typography for controls and interface text.
- Thin borders, modest radii, restrained shadows, and generous spacing.
- Lucide React icons with consistent stroke and size.

Avoid literal factory imagery, excessive gradients, glowing borders, excessive glassmorphism, generic AI-generated dashboard patterns, and decorative elements that reduce reading space.

## 3. Initial design tokens

Treat these as proposed tokens; check contrast before finalising.

### Light theme
- `--color-bg: #F8F2E8`
- `--color-surface: #FFFCF7`
- `--color-text: #292D3E`
- `--color-primary: #D95740`
- `--color-secondary: #78866B`
- `--color-border: #E8DFD4`
- `--color-muted-text`: choose and test a contrast-safe value during implementation.

### Dark theme
Use a deep charcoal/indigo background, elevated surfaces with distinguishable borders, warm off-white text, and softened terracotta accents. Do not simply invert the light theme. Define tokens for background, surface, elevated surface, primary text, secondary text, border, primary action, focus, success, warning, and error.

### Theme behaviour
- Preference options: System, Light, Dark.
- Default: System.
- Persist preference locally and sync it to the user's settings.
- Apply theme before rendering the main UI where feasible to reduce flashing.
- Respect contrast and forced-colour settings.
- All semantic colours must remain distinguishable in both themes.

## 4. Typography

Use one interface sans-serif and one readable serif for Scripture/display text. Select fonts with suitable licensing and avoid requiring network access after initial install if local font assets are practical.

Define tokens for:
- Display heading
- Page heading
- Section heading
- Body
- Secondary/body-small
- Label
- Caption
- Scripture body
- Scripture reference

Requirements:
- Adjustable Scripture font size.
- Comfortable line height, initially around 1.6 for Scripture body.
- A controlled reading column width on desktop.
- No excessively long lines.
- Avoid all-caps for long labels.
- Never use colour alone to convey state.

## 5. Layout and navigation

### Mobile
Five primary destinations:
1. Home
2. Bible
3. Prayer
4. Study
5. Plans

Profile/settings are accessed from a secondary header/menu. Bottom navigation must respect safe-area insets and remain usable with large text.

### Tablet/desktop
Use a responsive side navigation or rail where it improves navigation, with a constrained reading column and optional supporting panel. Do not simply stretch mobile cards across the whole desktop viewport.

### Spacing and touch targets
- Use a consistent spacing scale (e.g. 4, 8, 12, 16, 24, 32, 40).
- Primary interactive targets should aim for at least 44×44 CSS pixels.
- Keep destructive actions visually distinct and require confirmation where data loss is possible.
- Provide visible focus rings.

## 6. Core screen contracts

### Home
Sections, in priority order:
1. Greeting/date and account/settings access.
2. Featured reading from the selected plan, if any.
3. Next prayer reminder, if configured.
4. Quick actions: Read, New Prayer, New Study, Log Activity.
5. Optional widgets: fasting schedule, activity summary, recent entries, plan progress, selected Scripture.

Rules:
- Widgets can be hidden/reordered and reset to defaults.
- One reading plan is featured even if several are active.
- Empty states explain how to begin.
- Do not show false completion or fabricated Scripture.
- Offline state must not make the screen unusable.

### Bible reader
- Reading-first typography and clear book/chapter controls.
- Verse tap opens a mobile bottom sheet or equivalent contextual menu.
- Actions: bookmark, highlight, copy/share reference, attach study note.
- Show translation and download status.
- Chapter navigation should not unexpectedly discard reading position.
- Search results distinguish online and local capabilities.

### Prayer Journal
- Separate list, search/filter, detail/editor, and new-entry states.
- Blank-page mode and optional prompts.
- Clear local-save/sync indicator.
- Private content is not displayed in notification text.
- Unsaved-change handling must protect writing.

### Study Journal
- Separate from Prayer Journal.
- Optional structured sections for observation, questions, interpretation, application, and cross-references.
- Passage selector can open the Bible reader.
- Save incomplete studies without forcing all fields.

### Plans
- Reading-plan list with status (active, paused, completed, archived).
- Plan builder as a multi-step flow with progress and a review step.
- Day-by-day schedule view.
- Clear workload warnings.
- Editing future assignments must preserve completed history.

### Activity history
- Weekly and monthly views.
- Use counts and neutral labels, not spiritual grades.
- Allow correction of logged events.
- Empty state encourages a small next step without guilt.

### Settings
- Account/security, theme, time zone, Bible downloads, notifications, privacy/export, and account deletion.
- Explain permission requests before triggering them.
- Warn before clearing local data that has not synced.

## 7. Components to standardise

Build only as needed, but keep visual and behavioural contracts consistent:
- AppShell, BottomNavigation, DesktopNavigation
- Button, IconButton, TextField, TextArea, Select, Checkbox, Switch
- Card, SectionHeader, EmptyState, ErrorState, LoadingState
- BottomSheet/Dialog, Toast/InlineNotice
- ScriptureVerse, ScriptureReference, TranslationSelector
- JournalEntryCard, JournalEditor, SaveStatus
- ActivityLogRow, WeekSummary
- ReadingPlanCard, ReadingAssignmentRow, PlanStepIndicator
- ScheduleEditor, ReminderPermissionPrompt
- OfflineStatus, SyncStatus, ConflictResolutionPanel
- ThemeSelector, DownloadProgress

Use `lucide-react` for icons. Avoid adding a separate icon pack. Prefer accessible, tested primitives; shadcn/ui and Radix may be used where helpful, but do not generate every screen as a collection of identical shadcn cards.

## 8. Interaction and motion

- Prefer immediate, predictable feedback.
- Use subtle transitions; avoid motion that delays reading or saving.
- Respect `prefers-reduced-motion`.
- Autosave status should be explicit.
- Do not auto-mark readings complete simply because a user opens a passage.
- Destructive actions must be undoable where practical or confirmed.
- Offline operations should succeed locally first and communicate pending sync.
- Never silently replace a journal draft.

## 9. Accessibility acceptance criteria

- Text and controls meet WCAG 2.2 AA contrast targets where applicable.
- Every interactive control has an accessible name.
- Keyboard users can reach and operate all functionality.
- Focus remains sensible after dialogs and bottom sheets close.
- Errors are associated with their inputs.
- Status changes are announced without excessive screen-reader chatter.
- Scripture font size can be increased without clipping.
- Layout works at 200% zoom and with large system text where supported.
- Colour is not the sole indicator of selected, complete, failed, or pending states.
- Touch targets and bottom navigation are usable on Android.

## 10. Design review checklist

- [ ] Home shows a clear next action without a cluttered dashboard.
- [ ] Bible text remains the visual priority in reader mode.
- [ ] Prayer and Study journals are visibly separate.
- [ ] Light and dark themes both have intentional surface hierarchy.
- [ ] Offline and sync states are visible but unobtrusive.
- [ ] Empty, loading, error, permission-denied, and offline states are designed.
- [ ] All primary screens have mobile and desktop layouts.
- [ ] No fabricated Scripture or misleading progress is shown.
- [ ] Accessibility checks are part of component and end-to-end testing.
