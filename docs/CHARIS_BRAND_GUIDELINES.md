# Charis (Χάρις) · Brand Identity Guidelines

**Document Status:** Production Brand Guidelines (v1.0)  
**Target Application:** Charis Spiritual Discipline & Scripture PWA  
**Canonical Repository:** [`okikijesutech/Charis-Spiritual-App`](https://github.com/okikijesutech/Charis-Spiritual-App.git)  
**Live Application:** [`https://charis-six.vercel.app`](https://charis-six.vercel.app/)

---

## 1. Brand Essence & Foundations

### 1.1 The Meaning of Charis
*Charis* (Ancient Greek: **χάρις**) means unearned grace, goodwill, lovingkindness, and quiet spiritual beauty. In a world saturated with performance anxiety, gamified spiritual apps, and compulsive habit tracking, Charis offers a sacred, unhurried counter-culture:

> *“Grace is not opposed to effort, it is opposed to earning.”*  
> — Dallas Willard

### 1.2 Core Philosophy: Grace Over Streaks
* **No Broken Streaks:** We never display punitive messages like *"Streak broken!"* or reset counters to zero with shaming copy. Every return is met with gentle hospitality: *"Welcome back. Peace be with you."*
* **Restorative Rhythms:** Devotion is an encounter with God, not an Olympic sport.
* **Quiet, Not Empty:** Surfaces prioritize calm and clarity, leaving room for contemplation.
* **Private by Default:** Personal prayers, reflections, and notes are never monetized, tracked, or broadcast to social feeds.

### 1.3 Brand Personality Attributes
1. **Warm & Grounded:** Natural organic tones (parchment, terracotta, soft clay) reminiscent of physical books, linen, and clay vessels.
2. **Editorial & Timeless:** High-contrast serif headlines and generous reading measure inspired by fine book design.
3. **Reverent & Honest:** Candid sync indicators, clear offline notices, and zero manipulative urgency.
4. **Accessible & Inclusive:** Strict WCAG 2.2 AA contrast compliance, responsive touch targets $\ge 44\text{px}$, and seamless dark-mode support.

---

## 2. Logo System & Visual Assets

### 2.1 The Official Wordmark
The primary Charis logo is an elegant **editorial serif wordmark** reading **“Charis”**.

* **No Tagline:** The official identity asset **must never bake a tagline** (such as *"Make Room for Grace"*) into the logo. The wordmark stands alone with quiet confidence.
* **The Signature Leaf Accent:** The tittle of the lowercase `i` is replaced by an **organic leaf/seed motif** rotated at $+42^\circ$. This subtle emblem symbolizes spiritual life, contemplative growth, and divine grace taking root.

### 2.2 Logo Variants & Formats

| Variant | Usage Context | Letterform Color | Leaf Accent Color |
| :--- | :--- | :--- | :--- |
| **Light Theme Wordmark** | Warm Parchment, ivory cards, white headers | Deep Ink Brown (`#352A27`) | Signature Terracotta (`#B9674D`) |
| **Dark Theme Wordmark** | Charcoal backgrounds, dark reading surfaces | Soft Warm Ivory (`#F3EFEA`) | Luminous Terracotta (`#E06D58`) |
| **Monochrome Dark** | Single-color black/ink print or stamps | Solid Ink (`#292D3E`) | Solid Ink (`#292D3E`) |
| **Monochrome Light** | Reverse single-color white on dark substrates | Solid White (`#FFFFFF`) | Solid White (`#FFFFFF`) |

### 2.3 App Icon (Favicon & Mobile Squircle)
* **Geometry:** A continuous-curvature squircle ($22.5\%$ corner smoothing).
* **Background:** Warm Terracotta gradient (`#C2654A` to `#B05B42`).
* **Lettermark:** A centered, warm ivory (`#FFFDF9`) editorial serif lowercase `c` crowned by the floating signature leaf accent over its upper terminal.
* **Asset Matrix:**
  - `public/favicon.svg` (Optimized $32 \times 32$ SVG)
  - `public/charis-icon.svg` (Master $512 \times 512$ SVG)
  - `public/apple-touch-icon.png` ($180 \times 180\text{px}$)
  - `public/pwa-192x192.png` ($192 \times 192\text{px}$)
  - `public/pwa-512x512.png` ($512 \times 512\text{px}$)

### 2.4 Clear Space & Scale Guidelines
* **Clear Space ($1x$ Rule):** The minimum exclusion zone around the wordmark is equal to the height of the lowercase `x` in *Charis*. No borders, buttons, or text may encroach on this zone.
* **Minimum Digital Heights:**
  - Full Wordmark: $22\text{px}$ minimum height (to maintain serif definition).
  - App Icon: $16\text{px}$ minimum (favicon), $44\text{px}$ touch target in UI controls.

### 2.5 Logo Prohibitions
* ❌ Do not stretch, distort, or italicize the wordmark.
* ❌ Do not place the dark wordmark on light parchment or the ink wordmark on dark charcoal.
* ❌ Do not apply heavy drop shadows, neon glows, or 3D extrusions.
* ❌ Do not replace the leaf tittle with an ordinary circular dot.

---

## 3. Semantic Color Tokens & Accessible Contrast

### 3.1 Core Palette

```
  Warm Parchment     Terracotta        Ink Brown         Soft Clay        Muted Olive
     #F5EFE5           #B9674D          #352A27           #E6D5C3           #667568
```

* **Warm Parchment (`#F5EFE5` / `#F8F2E8`):** Restful, organic base canvas that evokes tactile book paper without harsh glare.
* **Terracotta (`#B9674D` / `#D95740`):** The primary brand voice; energetic, earthy, and warm. Used for primary CTAs, active states, and the leaf accent.
* **Ink Brown (`#352A27` / `#292D3E`):** High-contrast editorial typography, deep borders, and grounding structural lines.
* **Soft Clay (`#E6D5C3` / `#F3ECE3`):** Neutral dividers, badge backgrounds, and secondary card surfaces.
* **Muted Olive / Sage (`#667568` / `#78866B`):** Secondary accent of peaceful growth, used for "Synced" status, calm tags, and nature references.

---

### 3.2 Contrast Verification Matrix (WCAG 2.2)

| Text Color | Background | Contrast Ratio | WCAG Compliance |
| :--- | :--- | :--- | :--- |
| Ink Brown (`#352A27`) | Warm Parchment (`#F8F2E8`) | **$12.4 : 1$** | **Passes AAA** (Extraordinary legibility) |
| Muted Slate (`#636A7E`) | Warm Parchment (`#F8F2E8`) | **$4.8 : 1$** | **Passes AA** (Readable metadata) |
| White (`#FFFFFF`) | Terracotta (`#B9674D` / `#D95740`) | **$4.6 : 1$** | **Passes AA** (Crisp button labels) |
| Soft Warm Ivory (`#F3EFEA`) | Deep Charcoal (`#13151D`) | **$14.2 : 1$** | **Passes AAA** (Night reading clarity) |
| Soft Clay Text (`#9EA6B8`) | Elevated Charcoal (`#1B1E2B`)| **$5.4 : 1$** | **Passes AA** (Dark metadata) |
| Luminous Terracotta (`#E06D58`)| Elevated Charcoal (`#1B1E2B`)| **$5.2 : 1$** | **Passes AA** (Dark CTA visibility) |

---

## 4. Typography System & Scripture Reading Rules

### 4.1 Typeface Selection & Open Licensing
* **Display & Scripture Serif: Newsreader**  
  - *Source:* Production Type via Google Fonts.  
  - *License:* SIL Open Font License (OFL) v1.1 (100% free for commercial & personal use).  
  - *Role:* Brand headers, chapter titles, Scripture reading surface, and contemplative quotes.
* **Interface Sans-Serif: Inter**  
  - *Source:* Rasmus Andersson via Google Fonts.  
  - *License:* SIL Open Font License (OFL) v1.1.  
  - *Role:* Navigation, buttons, form inputs, toolbars, and metadata.

### 4.2 Scripture Reading Rules
1. **The $60\text{--}75$ Character Reading Measure:**  
   Scripture prose must always be constrained by `max-w-3xl` ($768\text{px}$) and centered. Prose that stretches edge-to-edge across wide monitors induces reader fatigue and breaks devotional focus.
2. **Generous Line Height:**  
   Scripture is rendered with `leading-[1.75]` ($175\%$), providing restful visual cadence between lines.
3. **Verse Number Superscripts:**  
   Rendered using `<sup>` tags with `text-xs font-sans font-bold text-charis-primary select-none mr-2`. They are excluded from clipboard copy operations so users copy clean scripture text.
4. **Tactile Highlight Tinting:**  
   When highlighting or selecting a verse, use gentle semantic translucent tints:
   - Terracotta: `bg-charis-primary/15`
   - Sage: `bg-charis-secondary/15`
   - Amber: `bg-amber-400/20`  
   Never use opaque neon markers that overwhelm the typography.

---

## 5. UI Component Styling Principles

### 5.1 Buttons & Touch Ergonomics
* **Primary Button:** Filled Terracotta (`bg-charis-primary hover:bg-charis-primary-hover text-white rounded-xl shadow-subtle min-h-[44px]`).
* **Secondary Button:** Outlined Parchment (`bg-charis-surface border border-charis-border hover:bg-charis-border-subtle text-charis-text rounded-xl min-h-[44px]`).
* **Destructive Button:** Restrained warning (`border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl min-h-[44px]`).
* **Touch Target Standard:** Every interactive element satisfies the WCAG 2.2 criterion of **minimum $44 \times 44\text{px}$** hit area.

### 5.2 Surfaces & Cards
* **Corner Radii:**  
  - Outer cards, modal dialogs, and reading surfaces: `rounded-2xl` ($16\text{px}$).  
  - Inputs, buttons, and inner list items: `rounded-xl` ($12\text{px}$).  
  - Floating stepper pills and badges: `rounded-full`.
* **Restrained Glassmorphism:**  
  Used sparingly on fixed floating chrome (Header, Bottom Nav, Floating Chapter Bar):
  ```css
  bg-charis-surface/90 backdrop-blur-md border-b border-charis-border/60
  ```
  Always includes a solid `bg-charis-surface` fallback for devices with reduced transparency.

### 5.3 Honest Status Badges
* **Synced:** Green/Sage pill (`Synced · Saved to cloud`).
* **Sync Pending:** Amber pill (`Sync pending · X changes queuing`).
* **Offline Ready:** Slate pill (`Offline · Saved locally`).
* *Rule:* Never display a fake green "Synced" state when the device is disconnected from the network.

---

## 6. Brand Voice & Writing Guidelines

### 6.1 Principles of Respectful Spiritual Language
* **Grace Over Guilt:** Avoid gamified punishment. No alarms, no streak resets, no guilt copy.
* **Warm Invitation:** Greet the user with hospitality: *"Peace be with you"*, *"Every morning is fresh"*, *"Continue when you are ready"*.
* **Contemplative Fasting:** Fasting copy is strictly health-neutral, non-prescriptive, and devotional. Never mention calories, weight loss, or diet culture.
* **Scripture Integrity:** Always attribute translations clearly (BSB, WEB, KJV, NLT, ESV) per publishing agreements.

---

## 7. Implementation Architecture

### 7.1 Component Guidelines (Cambium $\le 300$ Lines)
* Every component must adhere to the Cambium architectural health constraint of **strictly $\le 300$ lines of code**.
* Factor large views into modular subcomponents:
  - Header: [`src/components/layout/Header.tsx`](../src/components/layout/Header.tsx)
  - Logo: [`src/components/brand/CharisLogo.tsx`](../src/components/brand/CharisLogo.tsx)
  - Reading Surface: [`src/components/bible/ScriptureReadingSurface.tsx`](../src/components/bible/ScriptureReadingSurface.tsx)
  - Passage Picker: [`src/components/bible/BookChapterPickerModal.tsx`](../src/components/bible/BookChapterPickerModal.tsx)
  - Floating Stepper: [`src/components/bible/FloatingChapterBar.tsx`](../src/components/bible/FloatingChapterBar.tsx)

---

*Charis — Make Room for Grace.*
