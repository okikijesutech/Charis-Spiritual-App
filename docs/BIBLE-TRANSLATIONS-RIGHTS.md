# Bible Translation Rights & Provider Governance

**Product:** Charis Spiritual Discipline PWA  
**Version:** 1.0  
**Status:** Canonical Licensing Specification (Phase 4, Step 1)  
**References:** `docs/PRD.md` FR-02 & `docs/DATA-MODEL.md` Section 2

---

## 1. Executive Summary

Charis is designed as an offline-first spiritual companion. To uphold strict ethical, legal, and intellectual property standards, Bible translations are divided into two distinct distribution tiers:
1. **Tier 1: Fully Downloadable Offline Translations (Public Domain / CC0)**
2. **Tier 2: Cloud / API-Accessed Translations (Proprietary / Copyrighted)**

Under no circumstances will Charis bundle or bulk-download proprietary translations without an active publisher contract.

---

## 2. Translation Catalogue & Legal Classification

| Translation ID | Full Name | Language | Legal Status | Offline Download | Attribution Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`web`** | World English Bible | English | **Public Domain** | **Yes (Full)** | None required; provided for clarity: *"World English Bible is in the Public Domain."* |
| **`bsb`** | Berean Standard Bible | English | **Public Domain (CC0)** | **Yes (Full)** | Dedicated to public domain (2023) by Bible Hub. Free for all digital and offline applications. |
| **`kjv`** | King James Version | English | **Public Domain** | **Yes (Full)** | Public domain worldwide (crown rights in the UK do not apply to open digital distribution outside the Crown's printing office). |
| **`asv`** | American Standard Version (1901) | English | **Public Domain** | **Yes (Full)** | Expired copyright worldwide. |
| **`esv`** | English Standard Version | English | **Copyrighted (Crossway)** | **No (Online API Only)** | Requires Crossway API integration and attribution: *"Scripture quotations are from the ESV® Bible... Copyright © 2001 by Crossway."* |
| **`niv`** | New International Version | English | **Copyrighted (Biblica)** | **No (Online API Only)** | Requires Biblica / API.Bible developer token. Bulk offline caching restricted to active session cache. |
| **`nlt`** | New Living Translation | English | **Copyrighted (Tyndale House)** | **No (Online API Only)** | Requires Tyndale House / API.Bible developer token and attribution: *"Scripture quotations marked (NLT) are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers."* |

---

## 3. Offline Storage & Integrity Policy

1. **Transactional Download:** When a user initiates an offline download for a Tier 1 translation (e.g. `web` ~ 4.5 MB), the payload is verified against a signed manifest before being written to IndexedDB.
2. **Zero Incomplete State:** If a download is interrupted or corrupt, the staging area is rolled back. The app never marks a partial download as complete.
3. **Storage Quota Awareness:** Before initiating a bulk translation download, Charis checks `navigator.storage.estimate()` to verify sufficient device storage.
4. **User Delete Action:** Users can delete any downloaded translation from device storage at any time via Settings to reclaim space.

---

## 4. Canonical Scripture Reference Standards

All internal storage (bookmarks, highlights, journal links, reading plans) references Scripture via **canonical identifiers** rather than translation-dependent text:
- Book: 3-character uppercase identifier (e.g. `GEN`, `PSA`, `JHN`, `ROM`)
- Chapter: 1-based integer
- Verse range: optional integer boundaries `startVerse` and `endVerse`

This decoupling ensures that if a user switches translations from WEB to KJV or ESV, all bookmarks, highlights, and journal notes remain perfectly aligned.
