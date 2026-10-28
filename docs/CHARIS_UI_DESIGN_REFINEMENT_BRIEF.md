# Charis UI Design Refinement & Implementation Brief
**Document type:** Coding-agent implementation specification  
**Product:** Charis — Spiritual Discipline & Scripture App  
**Repository:** https://github.com/okikijesutech/Charis-Spiritual-App.git  
**Live app:** https://charis-six.vercel.app/  
**Recommended repository path:** `docs/CHARIS_UI_DESIGN_REFINEMENT_BRIEF.md`  
**Status:** Implementation guidance; verify against the current codebase before making changes.

---

## 1. Mission

Refine the existing Charis interface into a polished, calm, editorial, mobile-first experience without redesigning the product from scratch.

Charis helps people build a consistent personal spiritual life through Scripture reading, prayer, Bible study, reflection, and other spiritual practices. The guiding product principle is:

> **Grace over streaks.** Encourage consistency without guilt, pressure, punitive streaks, or turning spiritual practice into a score.

The design should feel warm, thoughtful, peaceful, human, and intentional—not like a generic SaaS dashboard or a collection of fashionable effects.

### Core design direction

- Warm editorial cream and terracotta as the light-theme foundation.
- A calm, legible dark theme with warm tonal surfaces and restrained terracotta accents.
- Elegant serif headings, with readable body text and Scripture typography.
- Disciplined spacing, clear hierarchy, and a restrained icon system.
- Purposeful interactions and accurate status feedback.
- Glassmorphism used only where it helps explain layering or navigation.
- Scripture and user-authored journal content remain the visual priority.

**Do not replace the current visual identity or redesign every screen from scratch.** Preserve the strengths already present in the application and improve the implementation incrementally.

---

## 2. Non-negotiable engineering constraints

1. **Inspect before editing.** Review repository instructions, package scripts, routes, components, styles, themes, state management, data persistence, and existing tests before proposing code changes.
2. Keep the current stack unless code inspection reveals a compelling, documented reason to change it:
   - React
   - TypeScript
   - Vite
   - Supabase Auth and PostgreSQL
   - Tailwind CSS
   - shadcn/ui
   - Lucide icons
3. Follow KISS, DRY, and SOLID. Reuse the existing component and token systems.
4. Do not add a dependency for an effect that can be achieved safely with existing CSS or installed components.
5. Do not perform broad rewrites or unrelated feature development.
6. Preserve routes, existing user data, schema, persistence behavior, and working functionality.
7. Do not invent or imply functionality that does not exist.
8. Do not claim a save, sync, offline, privacy, or encryption guarantee without verifying the implementation.
9. Do not use streaks, punitive colors, guilt-inducing messages, or competitive scoring to motivate spiritual activity.
10. Keep changes reviewable. Prefer small, coherent changes over a large one-shot redesign.
11. Follow repository-specific instructions and coding conventions where they do not conflict with these requirements.
12. If repository access or necessary files are unavailable, report the limitation and request the required material instead of pretending to have inspected it.

---

## 3. Product surfaces in scope

Inspect the actual implementation of these areas and confirm which are present and functional:

1. Home
2. Bible reader
3. Prayer journal
4. Bible study journal
5. Reading plans
6. Practice/activity logging
7. Verse reflection
8. Fasting-related flows
9. Settings, appearance, reminders, offline storage, privacy, export, and account actions
10. Shared navigation, dialogs, forms, empty states, loading states, and notifications

Do not assume an item is implemented merely because it appears in a screenshot or navigation label. Record its actual route, component, data source, and behavior where practical.

---

## 4. Design principles and visual hierarchy

### 4.1 Editorial warmth is the foundation

Prioritize:
- Clear, expressive headings.
- A deliberate type scale.
- Comfortable line length and line height.
- Generous but purposeful whitespace.
- Strong alignment and consistent spacing.
- Warm, restrained colors.
- Content-led layouts.

Use serif typography for expressive headings and, where it improves the reading experience, Scripture. Use a highly legible text face for controls, labels, metadata, forms, and dense supporting content. Do not introduce additional font families without a clear reason.

### 4.2 Design hierarchy before decoration

On each screen, establish:
1. The user's current context.
2. The most important content.
3. One clear primary action when a primary action is appropriate.
4. Secondary actions.
5. Optional settings, metadata, and advanced controls.

Use progressive disclosure for infrequently used controls. Do not hide essential actions behind unexplained icons or make important tasks require unnecessary extra steps.

### 4.3 Design tokens and consistency

Inspect the existing theme and token system before adding tokens. Reuse or consolidate existing definitions for:
- Background and surface colors.
- Primary, secondary, muted, and destructive actions.
- Text and muted text.
- Borders and focus rings.
- Spacing.
- Typography sizes and line heights.
- Corner radii.
- Elevation/shadows.
- Motion durations and easing, if already tokenized.

Prefer semantic tokens such as `background`, `surface`, `foreground`, `muted`, `primary`, `border`, `ring`, and `destructive` over repeated hard-coded colors. Adapt naming to the current project rather than forcing a new naming scheme.

Light and dark themes must be intentionally designed, not generated by blindly inverting colors. Check contrast and states in both themes.

### 4.4 Cards are a tool, not the default answer

Use cards when grouping information or actions improves comprehension. Do not wrap every section in a separate card. Use whitespace, dividers, headings, and tonal changes where those communicate structure more simply.

Avoid a dashboard made of equally prominent panels. The Home screen should have a clear reading and action priority.

---

## 5. Glassmorphism and surface treatment

### Guiding decision

Use **editorial design + tonal surfaces** as the main system. Glassmorphism is an optional accent, not the core visual language.

### Appropriate initial candidates

Consider subtle glassmorphism for:
- The persistent bottom navigation, if scrolling content beneath it remains legible.
- A secondary floating reading toolbar, if one exists and layering improves orientation.
- A transient overlay where translucent layering genuinely helps the user understand depth.

Start with **one or two components at most**. Verify the effect at real mobile widths before expanding it.

### Avoid glassmorphism for

- The main Scripture passage or its reading background.
- Prayer and study writing surfaces.
- Dense forms, settings, filters, or data tables.
- Every card or every navigation element.
- Any surface where changing content behind it reduces text contrast.
- Dialogs that need a stable, high-contrast reading surface.

### Implementation guidance

- Prefer a subtle, translucent surface with a thin border and restrained blur.
- Provide a sufficiently opaque fallback when `backdrop-filter` is unsupported or causes readability/performance issues.
- Keep contrast compliant with the accessibility target in both themes and over all realistic backgrounds.
- Avoid bright glowing borders, excessive shadows, multiple competing blur layers, and decorative gradients without a clear purpose.
- Do not add a new dependency just for blur, shadows, or translucent surfaces.
- Respect `prefers-reduced-motion`; do not make blur or parallax depend on motion.
- Verify performance on a modest mobile device or a realistic browser performance profile where possible.

### Decision test

For each glass effect, document:
1. What usability problem it solves.
2. Why a solid tonal surface is insufficient.
3. How readability is maintained.
4. What fallback exists.
5. How it behaves during scroll, theme changes, and text enlargement.

If the effect does not provide a clear benefit, use a simpler surface.

---

## 6. Screen-by-screen guidance

These are design hypotheses and evaluation criteria, not permission to assume defects. Inspect the implementation and screenshots before changing behavior.

### 6.1 Home

Goals:
- Welcome the user without creating pressure.
- Make the next meaningful action easy to find.
- Distinguish configured practices from completed activity.
- Keep Scripture and reflection prominent.

Evaluate:
- Whether the greeting, daily Scripture, practice overview, and quick actions have a clear order.
- Whether “active rhythms,” configured practices, and recorded sessions are defined distinctly.
- Whether counts show loading and error states rather than incorrectly displaying zero.
- Whether primary actions use consistent hierarchy.
- Whether the page contains too many competing cards or actions.
- Whether the layout remains clear at 360–430 CSS-pixel widths.

Potential direction:
- One clear daily focus.
- A compact practice summary with precise labels.
- A small number of purposeful quick actions.
- Gentle progress information without streak pressure or guilt.

### 6.2 Bible reader

Goals:
- Make Scripture the primary visual focus.
- Make navigation and reading controls easy to use without crowding the passage.

Evaluate:
- Book, chapter, and translation selection.
- Search and font controls.
- Previous/next chapter behavior.
- Scroll position after changing chapter or translation.
- Translation attribution and any licensing requirements.
- Loading, empty, offline, and error states.
- Text resizing and narrow viewport behavior.
- Whether controls can wrap, collapse, or move into a secondary menu without hiding essential tasks.

Requirements:
- Do not shrink Scripture text simply to fit all controls on one row.
- Preserve comfortable reading width and line height.
- Avoid translucent backgrounds behind the Scripture text itself.
- Do not imply a translation is available offline unless verified.
- Preserve attribution and existing licensing behavior.

### 6.3 Prayer journal

Goals:
- Make it easy to create, find, and continue personal prayer entries.
- Keep writing and reflection calm and focused.

Evaluate:
- Empty state and “Write a Prayer” action, if consistent with existing data concepts.
- Search and ongoing/answered filters.
- Entry creation, editing, deletion, and persistence behavior.
- Form labels, validation, save feedback, and keyboard overlap.
- Whether privacy or encryption claims are supported by actual code.

Requirements:
- Keep the writing surface visually quiet and readable.
- Do not rename or restructure records until the data model and existing terminology are understood.
- Do not claim local-first storage or encryption unless implementation details support it.

### 6.4 Bible study journal

Goals:
- Support structured study without overwhelming the user.
- Make the next step obvious.

Evaluate:
- New Study action visibility and label wrapping.
- Inductive, thematic, SOAP, or other supported study types.
- Field order and grouping.
- Empty state and save feedback.
- Whether study records are separate from prayer entries and verse reflections.

Requirements:
- Use a consistent primary-action style.
- Prevent awkward two-line button labels where a better layout or shorter accurate label solves the issue.
- Do not change the data model merely to simplify the UI.

### 6.5 Reading plans

Goals:
- Help users understand a plan and continue reading without shame or pressure.

Evaluate:
- Plan title, duration, schedule, next reading, and progress.
- Create, edit, pause, resume, and delete behavior, but only where supported.
- Primary and secondary action consistency.
- Empty, loading, error, and completed states.
- How missed readings are represented.

Requirements:
- Avoid guilt-inducing copy and punitive streak visuals.
- Do not add unsupported plan capabilities.
- Make the primary action visually clear without making secondary actions inaccessible.

### 6.6 Practice logging, fasting, and reminders

Goals:
- Make these tasks discoverable without creating unnecessary navigation complexity.

Evaluate:
- How a user discovers practice logging, fasting, and reminder setup.
- Whether Home quick actions are sufficient for common tasks.
- Whether the existing route structure supports better grouping.
- Whether adding another bottom-navigation destination is actually justified by task frequency and user testing.

Requirements:
- Do not add a sixth bottom-navigation item by default.
- Map actual user tasks and routes before proposing an information-architecture change.
- Preserve flexible plans and the “Grace over streaks” philosophy.

### 6.7 Settings and destructive actions

Goals:
- Make settings understandable and safe on mobile.

Evaluate:
- Grouping, labels, and navigation.
- Appearance and reminder controls.
- Translation and offline-storage settings.
- Privacy, export, and account-management controls.
- “Clear Cache,” “Sign Out,” and “Delete Account & Data” consequences.
- Dialog size, scroll behavior, focus management, and keyboard overlap.

Requirements:
- Keep distinct actions and consequences clearly distinct.
- Use confirmation for destructive operations where appropriate.
- Do not imply that clearing a cache deletes account data or that signing out deletes local data unless the code confirms that behavior.
- Prefer a full-screen mobile view or dedicated route only if supported by the existing architecture and shown to improve usability.

---

## 7. Interaction, motion, and feedback

Use small, purposeful interactions to make the interface feel responsive and trustworthy.

Good candidates:
- Clear pressed and focus states.
- Gentle transitions between navigation states.
- Expand/collapse behavior for secondary controls.
- A concise confirmation after a successful save.
- Loading indicators when an operation is genuinely in progress.
- An accurate offline or synchronization indicator based on real application state.

Avoid:
- Animations that delay routine tasks.
- Large spring effects on every card.
- Decorative motion that competes with Scripture.
- Confetti, streak celebrations, or guilt-inducing progress animations.
- Motion that ignores reduced-motion preferences.

Use the project's existing animation approach. If none exists, prefer simple CSS transitions for small effects rather than introducing a new animation library without a compelling need.

### Status and persistence messages

Inspect the actual storage and synchronization implementation before changing labels such as:
- “Saved on this device”
- “Sync pending”
- “Synced”
- “Offline”
- “Online”

Show a status only when application state proves it. Distinguish:
- Loading.
- Saved locally.
- Pending synchronization.
- Successfully synchronized.
- Offline.
- Failed save/sync.

Use only states that the current implementation can reliably determine. If it cannot determine a state, do not present a false certainty; report the gap and propose the smallest safe improvement.

---

## 8. Responsive design requirements

Test at minimum:
- 360 × 800 CSS pixels.
- 390 × 844 CSS pixels.
- 430 × 932 CSS pixels.
- A larger tablet or desktop viewport.

Evaluate:
- Bottom navigation and safe-area spacing.
- Home quick actions and card grouping.
- Bible toolbar and passage width.
- Prayer search and filters.
- Study heading and New Study action.
- Reading plan cards and controls.
- Dialogs and settings.
- Virtual keyboard overlap in forms.
- Long labels, large text, and empty/error states.

Use responsive rearrangement and progressive disclosure where appropriate. Do not use fixed widths that create horizontal overflow. Account for device safe areas where the existing layout requires it. Verify that bottom navigation does not cover content or form actions.

Do not claim device testing if only browser emulation was used; state the test method accurately.

---

## 9. Accessibility acceptance criteria

Target WCAG 2.2 AA where applicable. Automated tools are useful but do not prove full accessibility.

Verify:
- Text contrast, including muted labels, borders needed to identify controls, and both themes.
- Keyboard navigation and visible focus.
- Logical focus order.
- Semantic headings and landmarks.
- Accessible names for icon-only buttons.
- Labels, instructions, and useful form errors.
- Dialog focus handling and focus return.
- Touch target sizing and adequate spacing.
- Text zoom and resizing without content loss.
- Reduced-motion preferences.
- Screen-reader announcements for important save, error, and status changes.
- That color is not the only way status is communicated.

Do not claim full accessibility compliance from an automated scan alone. Record remaining manual checks.

---

## 10. Implementation strategy

Work in small phases and inspect the project before selecting exact files.

### Phase 0 — Reconnaissance and baseline

1. Read repository instructions (`AGENTS.md`, README, contribution guides, and relevant docs).
2. Inspect `package.json` and available scripts.
3. Identify routes, page components, shared components, theme definitions, CSS, Tailwind configuration, shadcn/ui configuration, icon conventions, and state/persistence services.
4. Determine the existing design-token strategy and how light/dark mode is implemented.
5. Identify current test, lint, type-check, build, and accessibility tooling.
6. Run the available baseline checks before editing, where practical.
7. Review the live app or supplied screenshots only to the extent access allows. Clearly separate visual observations from code-confirmed behavior.
8. Produce a concise baseline report with statuses:
   - **Confirmed**
   - **Partially confirmed**
   - **Not present**
   - **Unable to verify**

### Phase 1 — Foundation and consistency

1. Reuse or consolidate existing semantic tokens.
2. Fix clear typography, spacing, hierarchy, and surface inconsistencies.
3. Ensure light and dark themes are intentionally styled.
4. Standardize primary, secondary, and destructive action treatments where the same intent exists.
5. Preserve intentional differences and explain them.

### Phase 2 — High-value screen refinements

Prioritize confirmed issues by user impact and risk:
1. Incorrect or ambiguous status/count messaging.
2. Unclear actions and content types.
3. Responsive layout defects.
4. Bible reading ergonomics.
5. Journal and plan action hierarchy.
6. Settings and destructive-action clarity.

Only implement a behavior change when its data and state semantics are understood. If the issue is uncertain, document it rather than guessing.

### Phase 3 — Selective visual polish

1. Add subtle tonal surfaces where they improve grouping.
2. Evaluate one or two glassmorphism candidates.
3. Add restrained motion and interaction feedback.
4. Check that effects do not harm performance, contrast, or readability.
5. Remove decorative complexity that does not serve a clear user goal.

### Phase 4 — Verification and report

Run available:
- Lint.
- Type-check.
- Unit and integration tests.
- Production build.
- Responsive viewport checks.
- Automated accessibility checks.
- Manual keyboard and text-resize checks, where possible.

Compare before and after behavior. Report failures and environmental blockers honestly. Do not say checks passed unless they actually ran and passed.

---

## 11. Prioritization model

Classify each finding as a confirmed defect, a design opportunity, or an unresolved product decision.

### P0 — Trust and task clarity
- Misleading save, sync, offline, privacy, or security status.
- Misleading dashboard metrics.
- A core task that cannot be completed or whose action is ambiguous.
- A confirmed data-loss or destructive-action risk.

### P1 — High-impact usability
- Mobile overflow or blocked controls.
- Bible reading controls that interfere with reading.
- Unclear primary actions.
- Broken keyboard behavior or major accessibility barriers.
- Poor navigation discoverability confirmed by task mapping or testing.

### P2 — Refinement
- Minor spacing, surface, icon, or typography inconsistencies.
- Optional visual effects.
- Small motion and transition improvements.

Do not elevate a preference to a confirmed defect without evidence. Record severity, evidence, affected route/component, user impact, proposed change, and verification method.

---

## 12. Definition of done

The work is complete only when:

- [ ] The current implementation was inspected before edits.
- [ ] The existing brand direction and core navigation remain recognizable.
- [ ] No unnecessary dependency or architecture change was introduced.
- [ ] Typography, hierarchy, spacing, and surface treatments are more consistent.
- [ ] Glassmorphism, if used, is restrained, justified, accessible, and has a fallback.
- [ ] Scripture and journal content remain the visual priority.
- [ ] Light and dark themes have been checked.
- [ ] Core layouts have been checked at 360px, 390px, and 430px widths and a larger viewport.
- [ ] Important interaction states and errors are accurate.
- [ ] “Grace over streaks” is preserved in visuals and copy.
- [ ] Available checks have been run and their results recorded.
- [ ] No unsupported privacy, encryption, offline, or sync claims were added.
- [ ] The report identifies changed files, known limitations, and decisions still required.

---

## 13. Required final report from the coding agent

Return the following sections:

### A. Baseline
- Routes and components inspected.
- Existing design system and theme implementation.
- Current behavior and persistence observations.
- Findings categorized as Confirmed / Partially confirmed / Not present / Unable to verify.

### B. Changes made
For each change:
- User problem addressed.
- Exact file paths.
- What changed and why.
- Whether the change is visual-only or affects behavior/data.

### C. Design decisions
- Which design concepts were applied.
- Where glassmorphism was used, or why it was rejected.
- How editorial typography, tonal surfaces, spacing, and hierarchy were improved.
- How light and dark themes were handled.

### D. Verification
- Commands actually run.
- Pass/fail results.
- Viewports and methods used.
- Accessibility checks and remaining manual checks.
- Any blocked or unverified checks.

### E. Risks and outstanding decisions
- Potential regressions.
- Product decisions requiring owner input.
- Features or claims that could not be verified.
- Suggested next small iteration, not an unrelated roadmap.

---

## 14. Copy-and-paste coding-agent prompt

Use this prompt when assigning the work:

> You are the senior UI/UX engineer responsible for incrementally refining Charis, an existing React + TypeScript + Vite spiritual-discipline and Scripture app.
>
> Read `docs/CHARIS_UI_DESIGN_REFINEMENT_BRIEF.md` and the repository's own agent instructions first. Inspect the actual implementation before editing. Do not assume screenshots or labels prove a feature works.
>
> Preserve the existing Charis brand, core navigation, data model, routes, persistence behavior, and the “Grace over streaks” philosophy. Do not redesign from scratch, add unrelated features, or introduce unnecessary dependencies.
>
> Use editorial warmth, strong typography, disciplined spacing, semantic design tokens, tonal surfaces, and accessible interactions as the foundation. Glassmorphism is optional and should be limited to one or two justified components; never sacrifice Scripture or journal readability for an effect.
>
> Establish a baseline, classify findings by evidence and severity, and implement confirmed P0 issues and safe high-value P1 improvements in small reviewable changes. Do not make uncertain data, privacy, sync, or product-semantics changes by guessing. Report uncertain items instead.
>
> Test light and dark themes, responsive widths of 360px, 390px, and 430px plus a larger viewport, and the available lint/type-check/test/build/accessibility workflows. Run only commands supported by the repository. Report exact files changed and actual verification results. Never claim a test passed unless it ran and passed.
>
> Finish with the required report in Section 13 of the brief. Keep the work focused on the existing UI.

---

## 15. Reference principles

Use these as diagnostic lenses rather than rigid laws:
- Laws of UX: https://lawsofux.com/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Material Design guidance for typography, color, shape, and surfaces: https://m3.material.io/

These references do not replace repository inspection, real-device checks, or usability testing.
