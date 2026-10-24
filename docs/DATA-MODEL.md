# Data Model and Database Specification

**Product:** Spiritual-discipline PWA  
**Version:** 1.0  
**Database:** Supabase PostgreSQL  
**Status:** Logical model; final SQL migrations require engineering review

## 1. Design rules

- Supabase Auth is the identity authority. Do not duplicate passwords or credential hashes in application tables.
- Every private cloud record has an owner (`user_id`) tied to `auth.users`.
- RLS is mandatory on all user-private tables.
- Use UUID primary keys for user-owned records.
- Store timestamps in UTC (`timestamptz`) and retain an IANA time-zone identifier for schedules and user preferences.
- Store Bible content in a translation/library domain, not duplicated inside journal records.
- Scripture references should use stable identifiers: translation ID where relevant, book ID, chapter, and verse range.
- Local-only sync metadata is not necessarily a cloud table; persist only what is needed for recovery and cross-device sync.
- Use explicit foreign keys, unique constraints, and indexes.
- Avoid premature polymorphic relations where a normal foreign key is possible.

## 2. Entities

### Identity and preferences

#### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `avatar_url text nullable` (optional; validate provider URLs and avoid trusting arbitrary HTML)
- `created_at timestamptz`
- `updated_at timestamptz`

#### `user_settings`
- `user_id uuid primary key references auth.users(id) on delete cascade`
- `theme text check in ('system','light','dark')`
- `timezone text` (IANA zone)
- `locale text`
- `featured_reading_plan_id uuid nullable`
- `dashboard_layout jsonb` (validated schema; no secrets)
- `reminder_preferences jsonb` (validated, versioned shape)
- `created_at`, `updated_at`

Use foreign-key design carefully for `featured_reading_plan_id` to avoid circular creation dependencies; validate that a featured plan belongs to the same user in application logic and, if possible, with a database constraint/trigger.

### Bible library and personal annotations

#### `bible_translations`
Catalogue metadata only:
- `id text primary key` (stable provider/translation identifier)
- `name text`
- `language_code text`
- `provider text`
- `license_name text nullable`
- `license_url text nullable`
- `attribution text`
- `offline_allowed boolean`
- `redistribution_allowed boolean`
- `searchable_locally boolean`
- `metadata jsonb`
- `created_at`, `updated_at`

Do not store full copyrighted text in this table. Download manifests and translation content should be handled separately and only when licensing permits. A public catalogue may be readable by all users; only trusted server workflows may modify it.

#### `scripture_bookmarks`
- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `translation_id text references bible_translations(id)`
- `book_id text`
- `chapter integer`
- `start_verse integer nullable`
- `end_verse integer nullable`
- `label text nullable`
- `created_at`, `updated_at`
- Optional unique constraint on a canonical reference if duplicate bookmarks should be prevented.

#### `scripture_highlights`
- `id uuid primary key`
- `user_id uuid`
- `translation_id text`
- `book_id text`
- `chapter integer`
- `start_verse integer`
- `end_verse integer`
- `colour_key text` (token name, not arbitrary CSS)
- `created_at`, `updated_at`

### Journals

#### `prayer_entries`
- `id uuid primary key`
- `user_id uuid`
- `title text nullable`
- `body text`
- `entry_at timestamptz`
- `tags text[]` or normalised tag tables if filtering complexity grows
- `scripture_references jsonb` with validated schema, or a normalised child table
- `created_at`, `updated_at`
- `deleted_at timestamptz nullable` for sync tombstones where required

#### `study_entries`
- `id uuid primary key`
- `user_id uuid`
- `title text nullable`
- `body text nullable`
- `observations text nullable`
- `questions_context text nullable`
- `interpretation text nullable`
- `application text nullable`
- `cross_references jsonb` with validated schema
- `created_at`, `updated_at`
- `deleted_at timestamptz nullable`

A study entry may be incomplete; do not require all structured fields.

#### Optional normalised journal references
If users need robust filtering by passage, use a `journal_scripture_references` table with:
- `id uuid primary key`
- `user_id uuid`
- `journal_type text check in ('prayer','study')`
- `journal_entry_id uuid`
- `translation_id text`
- `book_id text`
- `chapter integer`
- `start_verse integer nullable`
- `end_verse integer nullable`

Because a normalised reference to one of two journal tables can weaken foreign-key enforcement, prefer separate child tables (`prayer_scripture_references` and `study_scripture_references`) if referential integrity is important. Do not implement the polymorphic version without a deliberate constraint strategy.

### Activity tracking

#### `activity_types`
- `id uuid primary key`
- `user_id uuid`
- `name text`
- `category text nullable`
- `is_archived boolean default false`
- `created_at`, `updated_at`

Seed optional starter types through an explicit onboarding action. Starter types must become user-owned records, not shared mutable global defaults.

#### `activity_logs`
- `id uuid primary key`
- `user_id uuid`
- `activity_type_id uuid references activity_types(id)`
- `started_at timestamptz`
- `duration_seconds integer nullable check >= 0`
- `note text nullable`
- `created_at`, `updated_at`
- `deleted_at timestamptz nullable`

Do not add a unique constraint on user/type/date; multiple sessions per day are valid.

### Reading plans

#### `reading_plans`
- `id uuid primary key`
- `user_id uuid`
- `name text`
- `description text nullable`
- `scope_type text check in ('canon','books','chapter_range','custom_passages')`
- `status text check in ('draft','active','paused','completed','archived')`
- `start_date date`
- `target_end_date date nullable`
- `timezone text`
- `distribution_mode text check in ('automatic','manual')`
- `reading_days smallint[]` (validated weekdays, documented convention)
- `featured boolean default false`
- `created_at`, `updated_at`
- `deleted_at timestamptz nullable`

Use a database-level strategy or transaction to ensure at most one featured plan per user, if the setting is stored on plans. Alternatively store the featured plan only in `user_settings` and validate ownership.

#### `reading_plan_assignments`
- `id uuid primary key`
- `user_id uuid`
- `plan_id uuid references reading_plans(id) on delete cascade`
- `assignment_date date`
- `sequence integer`
- `passages jsonb` with a strict schema for one or more Scripture ranges
- `status text check in ('pending','partial','completed','skipped')`
- `progress jsonb nullable` for partial reading progress, with a strict schema
- `completed_at timestamptz nullable`
- `created_at`, `updated_at`
- `deleted_at timestamptz nullable`

Add a unique constraint that reflects the intended schedule model, e.g. `(plan_id, assignment_date, sequence)`. Ensure retries do not create duplicate assignments. Use transactions for plan generation/rescheduling.

### Prayer and fasting schedules

#### `schedules`
- `id uuid primary key`
- `user_id uuid`
- `kind text check in ('prayer','fasting')`
- `name text`
- `timezone text`
- `start_at timestamptz nullable`
- `end_at timestamptz nullable`
- `local_start_time time nullable`
- `local_end_time time nullable`
- `recurrence jsonb nullable` (versioned schema for weekdays/recurrence)
- `reminder_enabled boolean`
- `status text check in ('active','paused','completed','cancelled')`
- `preset_id uuid nullable`
- `created_at`, `updated_at`
- `deleted_at timestamptz nullable`

Represent one-off intervals and recurring local-time schedules distinctly in application validation. Avoid relying on ambiguous timestamps alone for recurring schedules.

#### `schedule_presets`
- `id uuid primary key`
- `user_id uuid`
- `kind text check in ('prayer','fasting')`
- `name text`
- `configuration jsonb` with versioned validation
- `created_at`, `updated_at`

Presets are user-owned in v1. Built-in examples can be copied into a user's account, not edited globally.

### Notifications and push subscriptions

#### `push_subscriptions`
- `id uuid primary key`
- `user_id uuid`
- `endpoint text`
- `key_p256dh text`
- `key_auth text`
- `user_agent_summary text nullable`
- `created_at`, `updated_at`
- `revoked_at timestamptz nullable`

Treat endpoints and keys as sensitive operational data. Validate subscription ownership and revoke stale subscriptions. Never include journal bodies or sensitive prayer details in push payloads.

### Sync metadata

A local sync queue should contain:
- `operation_id` (UUID)
- `entity_type` (allow-listed)
- `entity_id`
- `operation` (`upsert` or `delete`)
- `base_version` / `base_updated_at`
- `payload`
- `created_at`
- `attempt_count`
- `last_error_code` (sanitised)
- `status`

Do not store access tokens in the queue. Cloud-side idempotency can use a dedicated mutation RPC or operation receipt table if the selected sync protocol requires it. Validate payloads server-side.

## 3. Relationships

- One auth user → one profile and one settings row.
- One user → many prayer entries, study entries, bookmarks, highlights, activity types, activity logs, reading plans, schedules, and presets.
- One reading plan → many assignments.
- One translation catalogue entry → many bookmarks/highlights/references.
- One user → multiple push subscriptions (e.g. devices/browsers).

## 4. RLS policy requirements

Enable RLS for every private table. For tables with `user_id`:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id` in both `USING` and `WITH CHECK`
- DELETE: `auth.uid() = user_id`

For `profiles` and `user_settings`, compare the row's owner to `auth.uid()`. For child records, also validate that parent records belong to the same user; do not trust a client-supplied `user_id` or parent ID without constraints/policies.

Public Bible catalogue metadata can be readable by all users, but write access must be restricted to trusted administration/migrations. Private translation files must never be served to users who lack the required rights.

RLS is necessary but not sufficient: use foreign keys, validation, safe functions, and integration tests. Never place the service-role key in the browser.

## 5. Indexes

Add indexes based on expected queries:
- `(user_id, entry_at desc)` on prayer entries.
- `(user_id, updated_at desc)` on journal tables.
- `(user_id, started_at desc)` on activity logs.
- `(user_id, status)` on reading plans.
- `(plan_id, assignment_date, sequence)` on assignments.
- `(user_id, kind, status)` on schedules.
- Scripture-reference indexes for passage lookups where normalised references are used.
- Unique/indexed push endpoint with careful handling of endpoint sensitivity.

Use `EXPLAIN` and actual query patterns before adding complex indexes. Avoid indexing every JSON field by default.

## 6. Migration and portability requirements

- Keep all schema changes in versioned Supabase migrations.
- Use standard PostgreSQL features where practical.
- Document extensions, triggers, functions, and RLS assumptions.
- Keep provider-specific code in a small adapter.
- Maintain export formats for personal data.
- Test a logical PostgreSQL export/restore in a non-production environment before any future migration.
- Treat auth-user migration separately: passwords, OAuth identities, and sessions may not migrate directly to another provider.

## 7. Data lifecycle

- Account deletion revokes sessions/access promptly and schedules deletion of cloud records, push subscriptions, and associated private data.
- Local records on devices must be cleared or clearly marked as orphaned after account deletion/sign-out, with an explicit warning before removing unsynced content.
- Tombstones must eventually be purged only after sync and retention rules permit.
- Backups and retention windows must be documented.
- Do not retain deleted journal contents indefinitely without a documented reason.

## 8. Schema review checklist

- [ ] Every private table has RLS enabled and tested.
- [ ] Every child row has correct owner and parent constraints.
- [ ] Multiple activity sessions per day are allowed.
- [ ] Plan generation is transactional and idempotent.
- [ ] Schedule recurrence schema is versioned and validated.
- [ ] Bible text licensing is represented in catalogue metadata.
- [ ] Account deletion covers cloud records, subscriptions, and local-data guidance.
- [ ] Export can be parsed without access to the live database.
- [ ] Migrations can be applied to an empty database and upgraded from the previous version.
