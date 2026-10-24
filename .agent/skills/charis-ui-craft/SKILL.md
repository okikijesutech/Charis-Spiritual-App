---
name: charis-ui-craft
description: >-
  Enforces Charis-specific UI design tokens, warm editorial aesthetics, typography hierarchy,
  mobile touch ergonomics, and the "grace over gamification" philosophy. Use whenever designing,
  building, reviewing, or styling interface components, screens, or themes for the Charis PWA.
---

# Charis UI Craft & Visual Identity Guide

This skill governs the visual language, component aesthetics, and brand ethos of **Charis**. All visual work must align with these guidelines to preserve the calm, contemplative, and editorial spirit of the product.

---

## 1. Core Philosophy: Grace Over Gamification

1. **No Punitive Streaks:** Never design streak flames, failure banners, or "days missed" alerts. A break in rhythm is met with quiet welcome, not guilt.
2. **No Spiritual Scoring:** Never calculate or display "spiritual scores", user rankings, leaderboards, or productivity metrics for prayer or reading.
3. **Quiet, Not Empty:** Surfaces should feel spacious, calm, and deliberate rather than cluttered with cards or void of character.
4. **Permanent Domain Separation:** The **Prayer Journal** and **Bible Study Journal** are distinct spiritual practices. Never merge them into a single polymorphic list.

---

## 2. Color Palette & Token System

Design tokens must be implemented as semantic CSS variables and applied through Tailwind CSS.

### Light Theme Tokens
- `--color-bg: #F8F2E8` — Warm cream/ivory backdrop.
- `--color-surface: #FFFCF7` — Primary ivory surface.
- `--color-surface-elevated: #FFFFFF` — Elevated cards and dialog surfaces.
- `--color-text: #292D3E` — Deep indigo / charcoal high-contrast text.
- `--color-muted-text: #636A7E` — Contrast-safe secondary text.
- `--color-primary: #D95740` — Restrained terracotta for primary actions.
- `--color-primary-hover: #C24B36` — Darker terracotta for hover states.
- `--color-secondary: #78866B` — Muted sage for contemplative accents and tags.
- `--color-border: #E8DFD4` — Delicate warm border tone.
- `--color-border-subtle: #F3ECE3` — Subtle divider tone.

### Dark Theme Tokens
- `--color-bg: #13151D` — Deep charcoal/indigo night backdrop.
- `--color-surface: #1B1E2B` — Elevated dark surface.
- `--color-surface-elevated: #242838` — Modals and flyout surfaces.
- `--color-text: #F3EFEA` — Warm off-white primary text.
- `--color-muted-text: #9EA6B8` — Soft grey-blue secondary text.
- `--color-primary: #E06D58` — Softened terracotta for dark surfaces.
- `--color-primary-hover: #E8806D` — Brightened terracotta hover state.
- `--color-secondary: #8E9E80` — Softened sage for dark surfaces.
- `--color-border: #2A2F42` — Deep indigo-tinted border tone.
- `--color-border-subtle: #1F2332` — Subtle dark divider tone.

---

## 3. Typographic Hierarchy

Charis employs a strict two-family typographic system:

1. **Editorial Serif (`Newsreader`, `Merriweather`, `Lora`, `Georgia`):**
   - Reserved for Scripture verses, biblical chapter titles, and contemplative reflections.
   - Reading line-height: `1.6` to `1.75` for comfortable sustained reading.
   - Reading measure (column width): constrained to $55\text{--}75\text{ characters}$ on larger viewports.
2. **Interface Sans-Serif (`Inter`, system UI stack):**
   - Used for all interface controls, labels, buttons, navigation items, and metadata badges.
   - Clean, geometric, and neutral; never distracts from Scripture.

---

## 4. Mobile Ergonomics & Navigation

Charis is built Android-first and mobile-responsive:

1. **Touch Targets:** All clickable and tappable elements (buttons, bottom nav tabs, chapter selectors) must be at least $44 \times 44\text{ CSS pixels}$.
2. **Thumb Zones:** Primary interactive elements (navigation bar, verse actions) must be reachable in the lower two-thirds of the mobile viewport.
3. **Safe-Area Insets:** Always incorporate `pb-safe` (`env(safe-area-inset-bottom)`) on fixed bottom navigation bars and sheets to avoid gesture interference on modern mobile devices.
4. **Desktop Elevation:** On tablet and desktop screens, transition the mobile bottom bar into a responsive side rail navigation (`hidden md:flex`) with constrained reading width. Never stretch mobile card layouts across full-width monitors.

---

## 5. Visual Quality Checklist

When reviewing any component or screen:
- [ ] Contrast meets WCAG 2.2 AA in both light and dark modes.
- [ ] Scripture text uses editorial serif with comfortable line height.
- [ ] Touch targets measure $\ge 44\text{px}$.
- [ ] No punitive streak or guilt copy is present.
- [ ] Both light and dark theme tokens are intentionally defined (no simple auto-inversion).
- [ ] Safe-area padding is respected for mobile navigation.
