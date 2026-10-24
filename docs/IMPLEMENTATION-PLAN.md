# Implementation Plan and Coding-Agent Work Protocol

**Product:** Spiritual-discipline PWA  
**Version:** 1.0  
**Status:** No implementation started by this document; plan only

## 1. Engineering principles

- Build one coherent vertical slice at a time.
- Keep changes small and reviewable.
- Use React + TypeScript + Vite, pnpm, Tailwind CSS, `lucide-react`, Supabase Auth/Postgres, and the selected Bible provider adapters.
- Do not invent a new auth system.
- Do not put service-role or private API secrets in the frontend.
- Prefer clear, boring code over premature abstractions.
- Keep business rules outside presentation components.
- Write tests with the feature, not at the end.
- Do not claim a test passed unless it was run and its result is reported.
- Do not silently alter confirmed product decisions.
- Ask for review at phase gates.

## 2. Proposed repository setup

Use:
- React + TypeScript + Vite.
- pnpm.
- Tailwind CSS.
- `lucide-react`.
- React Router.
- TanStack Query where remote server state needs it.
- Zod for validation.
- Supabase JS client.
- IndexedDB through a thin maintained wrapper if useful.
- `vite-plugin-pwa`.
- Vitest and Testing Library.
- Playwright for key browser journeys.

Use shadcn/ui/Radix only where they add accessibility and speed; customise their styling to the product design system. Avoid adding packages for trivial utilities or introducing multiple competing state-management libraries.

## 3. Phase 0 — Planning and repository review

Tasks:
1. Inspect repository and existing conventions before editing.
2. Confirm package manager and scripts.
3. Create/maintain the six planning documents.
4. Record unresolved external prerequisites: Supabase project, Google OAuth configuration, Bible translation licence/provider verification, Open Bible API terms, deployment host.
5. Define environment variable names and safe example file without secrets.
6. Create a decision log for future changes.

Deliverables:
- Approved docs.
- Dependency plan.
- Environment setup guide.
- No feature code beyond necessary project scaffolding.

Gate: user reviews scope and repository baseline.

## 4. Phase 1 — Design system and app shell

Tasks:
1. Set up Vite/React/TypeScript if not already present.
2. Configure Tailwind and theme tokens.
3. Add `lucide-react`.
4. Build responsive AppShell and mobile bottom navigation.
5. Build light/dark/system theme switching.
6. Build accessible primitives and empty/loading/error states.
7. Add installability manifest and service-worker baseline.
8. Create static prototype screens using mock data only.

Tests:
- Theme persistence.
- Responsive navigation.
- Keyboard and accessible names.
- Reduced motion and basic contrast review.
- PWA manifest/service worker smoke test.

Gate: visual review on Android-sized viewport and desktop.

## 5. Phase 2 — Supabase foundation and security

Tasks:
1. Create Supabase client using only public project URL and anon/publishable key.
2. Configure email/password and Google OAuth flows.
3. Add migrations for profiles/settings and initial private tables.
4. Enable RLS and create policies.
5. Add test users and negative cross-user access tests.
6. Add account/profile basics and sign-out.
7. Document OAuth redirect setup and local development.

Tests:
- Registration/sign-in/recovery flow where environment is configured.
- User A cannot read/write/delete User B data.
- Client bundle contains no service-role key.
- RLS works through direct API calls, not just UI.

Gate: security review before adding real personal content.

## 6. Phase 3 — Local persistence and sync foundation

Tasks:
1. Define repository contracts.
2. Add IndexedDB schema and migrations.
3. Implement local CRUD for a simple private record.
4. Add sync state model and queue.
5. Decide and document the concrete server idempotency protocol.
6. Implement safe retries and conflict representation.
7. Add account partitioning and sign-out behaviour.
8. Add tombstone handling.

Tests:
- Offline persistence across reload.
- Retry idempotency.
- Concurrent-edit preservation.
- Account switching.
- Storage quota/error handling.

Gate: prove a local edit survives offline restart and synchronises safely before implementing all feature modules.

## 7. Phase 4 — Bible provider and reader

Tasks:
1. Verify provider/API terms and translation rights.
2. Implement AO Lab adapter for supported downloadable translations.
3. Implement Open Bible search adapter.
4. Define canonical book/chapter/verse reference model.
5. Implement download manifest validation and transactional local storage.
6. Build reader, translation selector, bookmarks and highlights.
7. Add online search and local search for downloaded content.
8. Add attribution and offline availability states.

Tests:
- Known references map to correct book/chapter/verse.
- Download corruption/interruption handling.
- Offline reading.
- Local search returns only indexed translations.
- API failure does not break reader access to downloaded text.
- Licensing metadata is visible as required.

Gate: confirm one legally distributable offline translation works end-to-end.

## 8. Phase 5 — Journals

Tasks:
1. Implement Prayer Journal list/editor/detail/search.
2. Implement separate Study Journal list/editor/detail/search.
3. Add optional Scripture references and prompt mode.
4. Add autosave and sync status.
5. Add conflict recovery UI.
6. Add export of journal records.

Tests:
- Create/edit/delete online and offline.
- Draft survives reload.
- Search and filters.
- Conflicting edits preserve both versions.
- Private data never appears in notifications or logs.

Gate: user can create and recover entries without data loss.

## 9. Phase 6 — Activity, plans, schedules

Tasks:
1. Add user-owned activity types and activity logs.
2. Build neutral weekly/monthly history.
3. Implement reading-plan scope selection.
4. Implement chapter-based automatic distribution and manual assignment.
5. Add partial/complete states and safe rescheduling.
6. Support multiple active plans and featured plan selection.
7. Implement prayer schedules and custom fasting schedules/presets.
8. Add in-app reminder presentation and timezone-aware recurrence model.

Tests:
- Multiple activity sessions per day.
- Plan generation has no duplicate assignments.
- Impossible workload produces a warning.
- Completed assignments survive rescheduling.
- Multiple plans coexist.
- Recurrence behaves across timezone changes.
- Fasting copy remains neutral and non-prescriptive.

Gate: end-to-end test for creating a plan and logging activities offline.

## 10. Phase 7 — Notifications and dashboard widgets

Tasks:
1. Build configurable in-app dashboard cards.
2. Add reminder preferences and quiet periods.
3. Add web push where supported and configured.
4. Use generic notification payloads.
5. Handle denied permission, subscription revocation, and unsupported browser.
6. Add widget reorder/hide/reset.

Tests:
- Preferences persist.
- No journal content in push payload.
- Permission-denied UX works.
- Dashboard works offline.

Gate: verify supported-browser behaviour and document limitations.

## 11. Phase 8 — Export, deletion, accessibility, release

Tasks:
1. Implement documented data export.
2. Implement account deletion and local-data cleanup workflow.
3. Audit RLS and ownership relationships.
4. Test Android install/update/offline lifecycle.
5. Test desktop responsive experience.
6. Run accessibility checks and keyboard navigation.
7. Run dependency audit and review security headers/CSP.
8. Verify production env configuration and backup/export procedure.
9. Create user-facing privacy, licence, and support pages.

Release gates:
- Cross-user access tests pass.
- Offline workflows pass.
- No known silent data-loss path.
- No secrets in client bundle.
- Bible rights and attributions reviewed.
- Account deletion/export tested.
- PWA install/update smoke test passes.

## 12. Coding-agent work protocol

For each task, the agent must:
1. State the task goal and relevant requirements.
2. Inspect related files before editing.
3. Propose a concise plan.
4. Make only the changes required for that task.
5. Add/update tests.
6. Run relevant checks and report exact commands/results.
7. List changed files and any migration/environment requirements.
8. Identify assumptions, limitations, and follow-up work.
9. Stop at the phase gate and wait for review.

The agent must not:
- Generate the entire app in one response.
- silently change dependencies or architecture.
- weaken RLS to make a feature work.
- invent Bible text or ignore translation licences.
- store secrets in client code.
- use `any` broadly to bypass TypeScript.
- add unrequested AI features.
- claim a feature works offline without testing it in airplane-mode conditions.
- mark work complete when tests were not run.

## 13. Definition of done for each feature

A feature is done when:
- Requirements and edge cases are documented.
- UI states include loading, empty, error, offline, and permission-denied where relevant.
- Input is validated at trust boundaries.
- Authorisation is enforced by the server.
- Local persistence and sync behaviour are defined.
- Tests cover normal and failure paths.
- Accessibility has been considered.
- Documentation and migrations are updated.
- Actual test outcomes are reported honestly.

## 14. First implementation task after approval

Do not begin with Bible API integration or the complete dashboard. First inspect the repository and deliver a small design-system/app-shell prototype using mock data:
- responsive navigation,
- light/dark/system theme,
- Scripture reading surface,
- separate journal entry surfaces,
- Home widget cards,
- Plans entry point,
- empty/offline states.

This lets the product's visual direction be reviewed before the data and sync complexity expands.
