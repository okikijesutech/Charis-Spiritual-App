# Charis (Χάρις) · Spiritual Discipline PWA

[![Version](https://img.shields.io/badge/version-1.0.0-D95740.svg)](package.json)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-78866B.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-offline--first-292D3E.svg)](vite.config.ts)
[![Security Gates](https://img.shields.io/badge/Security-25%2F25%20passed-22c55e.svg)](scripts/security-check.mjs)
[![Offline Tests](https://img.shields.io/badge/Offline%20Tests-35%2F35%20passed-22c55e.svg)](scripts/test-offline-sync.mjs)

> *“Grace is not opposed to effort, it is opposed to earning.”*  
> — Dallas Willard

Charis is a contemplative, offline-first spiritual discipline Progressive Web Application (PWA) crafted for personal devotion, Scripture reading, reflective journaling, and prayer rhythm.

Designed from first principles to counteract the guilt, addictive gamification, and invasive tracking common to modern lifestyle apps, Charis anchors every interaction in **Grace Over Streaks**.

---

## 🕊️ Core Tenets & Philosophy

1. **Grace Over Streaks:** Spiritual formation is an invitation into quiet fellowship, not a high-stress score to defend. If you miss days or need rest, plans reschedule forward with grace. There are zero punitive streak resets, zero guilt badges, and zero manipulative alerts.
2. **Quiet, Not Empty:** A deliberate editorial aesthetic featuring warm ivory and parchment tones (`#F8F2E8`), deep indigo/charcoal typography (`#292D3E`), restrained terracotta accents (`#D95740`), and muted sage (`#78866B`). No glowing borders, noisy gradients, or visual clutter.
3. **Private by Default:** Your prayers, studies, and journals remain strictly between you and God. Content is encrypted in transit, isolated at the database level by Supabase Row Level Security (`auth.uid() = user_id`), and never surfaced in push notifications or analytics.
4. **Offline Resilience:** All disciplines work without a network connection. Reads, writes, and updates are committed instantly to local IndexedDB storage, enqueued in an idempotent sync queue, and harmoniously reconciled when connectivity resumes.

---

## ✨ Features

- **📖 Scripture Reader:**
  - Complete 66 canonical books (31,102 verses) across multiple translations:
    - **NLT** (New Living Translation — Tyndale House)
    - **ESV** (English Standard Version — Crossway)
    - **KJV** (King James Version — Public Domain)
    - **BSB** (Berean Standard Bible — Public Domain)
    - **WEB** (World English Bible — Public Domain)
    - **NIV** (New International Version — Online Proxy Ready)
  - Full-Bible search engine supporting exact canonical references (e.g., `Romans 8:28`, `John 3`, `Genesis 1`), spiritual topics, and online keyword search.
  - Interactive verse modal with terracotta/sage highlights, bookmarks, instant clipboard citation, and direct study note attachment.
  - Persistent reading memory: resumes where you left off across sessions, defaulting first-time readers gently to Genesis 1.

- **🙏 Private Prayer Sanctuary:**
  - Tagged prayer cards with status filtering (`All`, `Ongoing`, `Answered`).
  - Answered prayer praise notes and dates.
  - Local-first conflict resolution modal for multi-device concurrent edits.
  - One-click formatted Markdown prayer export.

- **📝 Inductive & Thematic Study Journal:**
  - Structured fields for **Observation**, **Interpretation**, **Application**, and **Cross-References**.
  - Seamless two-way integration with the Scripture reader.
  - Formatted Markdown export.

- **📅 Structured Reading Plans with Grace:**
  - Multi-step custom plan builder (New Testament, Gospels, Psalms, Custom book range).
  - Intelligent workload warnings to prevent devotional burnout.
  - Grace Rescheduling: forward-shifts remaining readings without resetting completed history.

- **🕊️ Contemplative Fasting & Quiet Hours:**
  - Health-neutral, non-prescriptive fasting timer.
  - Quiet Hours filter suppressing notifications during nocturnal and early-morning hours.
  - Fully customizable dashboard widget layout with drag/reorder controls.

- **🔒 Data Sovereignty & Account Lifecycle:**
  - Comprehensive GDPR-compliant JSON & Markdown data export covering all six disciplines.
  - Permanent account deletion workflow: purges all remote Supabase tables and local IndexedDB caches.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   Charis PWA Layer                     │
│  React 18 · TypeScript · Tailwind CSS · Lucide Icons   │
│  Responsive AppShell (Desktop Sidebar / Mobile Bar)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              Local Offline Persistence                 │
│  IndexedDB (Local Store) · Service Worker (Workbox)    │
│  Idempotent Sync Queue · Versioned Tombstones          │
└───────────────────────────┬────────────────────────────┘
                            │ (When Online)
┌───────────────────────────▼────────────────────────────┐
│              Backend & Cloud Sync                      │
│  Supabase PostgreSQL · Row Level Security (RLS)        │
│  Strict auth.uid() Isolation · Bolls Life & Bible APIs │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, TypeScript (strict mode), Tailwind CSS, Vite.
- **PWA:** `vite-plugin-pwa`, Workbox service worker caching.
- **Local Persistence:** IndexedDB (`charis-local-db`) with versioned stores for activities, prayers, studies, plans, schedules, and cached Bible chapters.
- **Cloud Backend:** Supabase PostgreSQL with strict Row Level Security (RLS) on all user tables.
- **Code Standard:** Cambium architecture rule ($\le 300$ lines per file).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- `pnpm` (v9 or v11+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/charis.git
   cd charis
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your public Supabase credentials:
   ```ini
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Note: Never place `service_role` keys or private secrets in `.env`)*

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

---

## 🧪 Quality & Security Gates

Charis enforces strict automated quality gates prior to any deployment:

```bash
# 1. Run architecture & security checks (RLS, secrets scan, env hygiene)
pnpm run security:check

# 2. Run offline resilience & sync tests (35 test assertions)
pnpm run test:offline

# 3. Verify TypeScript compilation and production PWA build
pnpm run build
```

---

## 📜 Translation Rights & Licences

- **BSB:** Berean Standard Bible text is in the public domain.
- **WEB:** World English Bible text is in the public domain.
- **KJV:** King James Version text is in the public domain.
- **NLT:** New Living Translation copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188.
- **ESV:** The Holy Bible, English Standard Version® copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission.

For complete licensing terms, see [`docs/BIBLE-TRANSLATIONS-RIGHTS.md`](docs/BIBLE-TRANSLATIONS-RIGHTS.md) or the in-app **Translation Licences** modal.

---

## 📄 License & Commercial Restrictions

This project is licensed under the [Charis Non-Commercial License](LICENSE).

- **Personal & Devotional Use:** Free for personal use, private study, small groups, and non-profit church ministries.
- **Commercial Use Restriction:** No entity or individual may sell, monetize, bundle, re-license, or profit commercially from Charis, its derivatives, or hosted offerings without prior express written permission from the copyright holder(s).
