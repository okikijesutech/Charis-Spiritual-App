# Charis — Project Instructions & Architectural Constraints

**Product:** Charis (Spiritual-Discipline PWA)  
**Target Platform:** Google Antigravity & Portable Coding Agent Standards  
**Status:** Milestone 0 / Planning & Skill Governance Baseline  

---

## 1. Product Vision & Philosophy

Charis is a mobile-first, installable Progressive Web App (PWA) designed to help individuals cultivate a quiet, personal rhythm of Scripture reading, prayer, inductive study, and fasting.

### Core Tenets
1. **Grace Over Gamification:** Explicitly reject punitive streaks, spiritual scores, leaderboards, and guilt-inducing copy. A missed day is an invitation to return with grace, not a broken streak.
2. **Private by Default:** Journals, petitions, and personal reflections are strictly confidential. All cloud records must be guarded by PostgreSQL Row Level Security (RLS). No sensitive journal content may appear in push notification titles or previews.
3. **Offline Resilience:** The app must remain completely functional offline after initial setup and translation downloads. Reading, journaling, and activity logging succeed locally first (IndexedDB) and synchronize gracefully when connectivity returns.
4. **Quiet Visual Craft:** Visual identity is warm, editorial, and contemplative (warm ivory/cream surfaces, terracotta accents, sage highlights, and editorial serif typography for Scripture).

---

## 2. Technical Stack & Boundaries

- **Runtime & Build:** React 18+, TypeScript (strict mode), Vite, pnpm.
- **Styling & UI:** Tailwind CSS, Radix UI / shadcn/ui primitives, and `lucide-react` icons.
- **Data & Auth:** Supabase Auth (Email/password and Google OAuth) + Supabase PostgreSQL.
- **Local Persistence:** IndexedDB (via a lightweight repository pattern) + Cache Storage via `vite-plugin-pwa`.
- **Bible Data:** AO Lab provider adapter for offline translation downloads; Open Bible API provider adapter for online search.
- **Testing:** Vitest, React Testing Library, and Playwright for critical end-to-end journeys.

### Hard Constraints
- **Zero Secrets on Client:** The Supabase `service_role` key or private provider secrets must NEVER be present in client-side code or environment configurations.
- **No Fabricated Scripture:** Missing verses, translation fallbacks, or search results must never be hallucinated or mocked in production adapters.
- **No Custom Auth:** Use Supabase Auth as the identity authority; never store passwords or credential hashes in custom application tables.
- **No Monolithic Kitchen-Sink Modules:** Adhere strictly to the Cambium structural health principle: keep file complexity low, avoid high fan-in utility catch-alls, and separate distinct bounded contexts (e.g., Prayer Journal and Study Journal are permanently distinct).

---

## 3. Directory Layout & Governance

```text
Charis/
├── GEMINI.md                            # Shared project instructions and architectural constraints
├── .agent/
│   └── skills/
│       ├── charis-ui-craft/SKILL.md     # Charis-specific design tokens and UI craft rules
│       ├── visual-design/SKILL.md       # Taste-inspired design critique & anti-slop guidelines
│       └── brand-governance/SKILL.md    # Cambium-inspired structural health & drift prevention
├── docs/
│   ├── PRD.md                           # Product Requirements Document
│   ├── DESIGN-SYSTEM.md                 # Design System & UX Specification
│   ├── DATA-MODEL.md                    # Database Schema & RLS Policies
│   ├── OFFLINE-SYNC.md                  # IndexedDB & Conflict Resolution Protocols
│   ├── SECURITY.md                      # Security, Privacy, and Account Specification
│   └── IMPLEMENTATION-PLAN.md           # Phased Engineering Roadmap & Work Protocol
└── src/                                 # Application Source (Deferred until implementation milestone)
```

---

## 4. Quality Gates & Acceptance Protocol

Before graduating any future implementation phase, the following four gates must be verified:

1. **Accessibility Gate:**
   - Meets WCAG 2.2 AA contrast standards across both Light and Dark themes.
   - Primary interactive touch targets measure at least $44 \times 44\text{ CSS pixels}$ for mobile ergonomics.
   - Screen-reader accessible names on all icon buttons and interactive controls.
   - Fully operable via keyboard with visible focus rings.

2. **Privacy & Security Gate:**
   - Every user table in PostgreSQL has active Row Level Security (`ENABLE ROW LEVEL SECURITY`).
   - Cross-user data isolation verified with negative security tests.
   - Shared-device awareness and clear local storage advisory.

3. **Offline & Sync Gate:**
   - Core reading and journaling actions succeed without network access.
   - Clear visual status for sync state (`Saved on this device` vs. `Synced`).
   - Conflict resolution retains recoverable drafts and never silently overwrites text.

4. **Visual Craft & Anti-Slop Gate (Taste Standards):**
   - No generic "AI-template" styling (no purple gradients, no identical 3-card landing patterns).
   - Layout variance and comfortable typographic hierarchy.
   - Proper serif/sans pairing respecting reading line-lengths (55–75 characters per line for Scripture).

---

## 5. Working Protocol for Coding Agents

- Work in small, reviewable vertical slices.
- Do not generate code ahead of the approved phase gate.
- Maintain documentation integrity: do not silently alter product rules or specifications.
- Verify commands and tests by executing them and reporting actual results; never assume or claim a test passed without execution.
