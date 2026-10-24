---
name: brand-governance
description: >-
  Enforces structural health, architectural boundaries, and drift prevention inspired by Cambium.
  Use when planning modules, auditing code complexity, reviewing component fan-in, checking file size,
  or preventing AI-agent scope creep from diluting project conventions.
---

# Brand Governance & Structural Health Guide (Cambium-Inspired)

This skill operationalizes the structural health and codebase governance principles of **Cambium** (`@okikijesutech/cambium`). It guards the Charis codebase against architectural drift, responsibility bloat, and calcified tech debt as features evolve.

---

## 1. The Core Cambium Premise

> *"Cambium watches your codebase grow and tells you when a module's scope has outgrown its original shape — before the debt calcifies into a rewrite."*

AI coding agents excel at adding working code, but frequently accumulate unrelated responsibilities in existing files—one commit at a time—until a clean module becomes an entangled monolith.

To prevent this in Charis:
1. **Explicit Responsibility Contract:** Every module, component, and utility must have a single, documented responsibility.
2. **Drift Detection:** If a file starts doing things beyond its original name and declared scope, it must be split immediately rather than expanded.
3. **Guard Against AI Scope Creep:** Cross-check every proposed modification against the module's declared exports and domain boundaries.

---

## 2. Structural Health Signals & Thresholds

When adding, editing, or refactoring code in Charis, monitor these four Cambium signals:

```text
┌─────────────────┐     ┌──────────────────┐
│ 1. File Length  │     │ 2. Fan-In Risk   │
│ Max 250-300 lines│    │ Avoid catch-alls │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ 3. Complexity   │     │ 4. Single Domain │
│ Max 10 per fn   │     │ No leaky bounds  │
└─────────────────┘     └──────────────────┘
```

### Signal A: File Size & Line Count
- **Threshold:** Target $\le 200\text{ lines}$; hard ceiling at $300\text{ lines}$ per file.
- **Remedy:** When a component or repository exceeds $250\text{ lines}$, extract subcomponents, hooks, or pure helper functions into focused submodules.

### Signal B: Fan-In (Dependency Ingestion)
- **Problem:** Files with high fan-in (imported by almost every other file) become high-risk chokepoints.
- **Rule:** Never create generic `utils.ts`, `helpers.ts`, or `common.tsx` files. Instead, create domain-specific units:
  - `src/lib/bible/reference-parser.ts`
  - `src/lib/time/timezone-helpers.ts`
  - `src/lib/sync/conflict-resolver.ts`

### Signal C: Cyclomatic & Branching Complexity
- **Threshold:** Cyclomatic complexity per function should not exceed $10$.
- **Rule:** Avoid deep nesting of ternary operators and complex conditional ladders in JSX. Use early returns or lookup maps for clean execution.

### Signal D: Git Touch Frequency (Churn)
- **Problem:** A file that is modified in nearly every commit is usually suffering from mixed concerns.
- **Rule:** Keep presentation components decoupled from remote persistence and data models.

---

## 3. Strict Domain Boundaries for Charis

The following domain separations are mandatory and must never be merged:

1. **`prayer` vs. `study`:**
   - The **Prayer Journal** represents private conversation with God (petitions, confessions, thanks).
   - The **Study Journal** represents inductive biblical analysis (observation, context, interpretation, application).
   - *Rule:* They use separate database tables, separate local repositories, and separate UI views.
2. **`reader` vs. `annotations`:**
   - The Scripture text domain (translations, books, verses) is purely read-only and cached.
   - Highlights, bookmarks, and personal notes are user-owned domain records referencing canonical verse IDs.
3. **`auth` vs. `profiles`:**
   - Identity authority belongs to Supabase Auth (`auth.users`).
   - Application preferences and user settings belong to `profiles` and `user_settings`. Client bundles must never handle password hashes or service-role keys.

---

## 4. Pre-Commit Structural Governance Audit

Before committing code changes or completing a development turn, verify:
- [ ] No file exceeds $300\text{ lines}$.
- [ ] No new exports were added that drift outside the file's primary responsibility.
- [ ] No generic catch-all `utils.ts` files were created.
- [ ] High fan-in dependencies were avoided.
- [ ] Domain boundaries between prayer, study, reader, and sync remain strictly separated.
