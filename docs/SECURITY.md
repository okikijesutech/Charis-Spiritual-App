# Security, Privacy, and Account Specification

**Product:** Spiritual-discipline PWA  
**Version:** 1.0  
**Status:** Security requirements for design and implementation

## 1. Security goals

The app stores highly personal reflections. The security objective is to prevent unauthorised access, minimise unnecessary data collection, and be honest about the limitations of browser storage and notifications.

Priorities:
1. Confidentiality of journals and private schedules.
2. Integrity of journal content and reading/activity history.
3. Account/session security.
4. Safe offline behaviour on shared devices.
5. Reliable deletion and export.
6. Minimal exposure through logs, notifications, analytics, and support tooling.

## 2. Authentication

- Use Supabase Auth for email/password and Google OAuth.
- Do not implement password hashing, reset tokens, or session management from scratch.
- Use the supported Supabase client and recommended OAuth redirect flow.
- Configure allowed redirect URLs and production origins explicitly.
- Enable email confirmation as appropriate for the chosen launch configuration.
- Use password recovery and sign-out flows supplied by Supabase Auth.
- Never log passwords, access tokens, refresh tokens, OAuth codes, or complete auth callback URLs containing secrets.
- Treat frontend route guards as UX only; server-side RLS remains the data boundary.
- Apply rate limits and abuse controls available in the selected platform; document remaining limits.

## 3. Authorisation and RLS

- RLS is enabled on every private table.
- Each request must be scoped to the authenticated user.
- Use both `USING` and `WITH CHECK` for updates.
- Child records must not reference another user's parent records.
- Public catalogue reads must be separated from private user data.
- Privileged service credentials may only be used in trusted server environments and must never be bundled into Vite assets.
- Add negative tests that attempt to read, modify, and delete another user's records through direct API calls.

## 4. Private content and data minimisation

- Journal bodies, prayer notes, fasting notes, and personal schedule details are private.
- Do not put journal text into push payloads, email subject lines, analytics events, crash reports, or ordinary logs.
- Use generic notification text such as “Your scheduled reminder is ready.”
- Do not collect precise location; it is not required by the product.
- Avoid advertising trackers and behavioural profiling.
- Analytics, if introduced, should be privacy-preserving, minimal, and opt-in or otherwise transparently configured according to applicable law.
- Do not use personal journal entries for model training or external AI processing.
- Do not share or publish journals in v1.

## 5. Browser storage and offline privacy

IndexedDB and Cache Storage are not secure vaults. They may be readable by anyone with access to the unlocked browser profile, and XSS can expose accessible client data.

For v1:
- Explain the shared-device risk.
- Offer sign-out and clear-local-data controls.
- Warn before clearing unsynchronised content.
- Partition local records by authenticated user ID.
- On account switch, do not display the previous account's local data.
- Avoid caching authenticated API responses in the service worker by default.
- Cache only static assets and explicitly approved public content.
- Do not cache auth callback responses or token-bearing URLs.
- Validate cached records and schema versions before use.
- Provide a recovery path for failed migrations of local data.

Later optional local encryption requires a reviewed key-management and recovery design; do not implement home-grown cryptography. Encryption keys must not be stored beside ciphertext in a way that provides no meaningful protection.

## 6. XSS, injection, and browser security

- Render journal content as text by default.
- Do not use unsafe HTML injection for user-authored text.
- Validate and constrain any rich text feature if introduced.
- Use Zod or equivalent schema validation at boundaries.
- Keep dependencies limited and updated.
- Use a Content Security Policy appropriate to the final deployment, accounting for Supabase and approved Bible API origins.
- Use HTTPS in production.
- Avoid exposing secrets through source maps or build-time environment variables.
- Treat Bible API content and external provider responses as untrusted input.
- Do not allow arbitrary external URLs from user data to be fetched by privileged server functions.

## 7. Sync security and integrity

- Queue records by owner and stable entity ID.
- Never place access tokens in queued operation payloads.
- Validate owner, operation type, schema, and parent relationships on the server.
- Use idempotency keys or operation receipts to prevent duplicate writes on retries.
- Reject updates where the authenticated user does not own the record.
- Detect stale base versions and conflicting journal edits.
- Keep deletion tombstones until the sync protocol guarantees other devices cannot resurrect deleted records.
- Do not trust client timestamps alone for authorisation.
- Sanitise sync error logs; avoid including journal bodies.

## 8. Notifications

- Ask permission in context, not on first page load.
- Keep payloads generic.
- Allow users to disable categories and revoke subscriptions.
- Treat push endpoints and subscription keys as sensitive.
- Remove expired subscriptions and handle permission revocation.
- Do not promise exact delivery on all Android devices.
- For future native alarms, review platform permissions and Play policy separately.

## 9. Bible content and provider security

- Verify the licence for each translation and the rights to download, cache, index, and redistribute it.
- Keep API keys out of client bundles unless the provider explicitly documents a safe public key model.
- If a provider requires a secret, call it through a controlled backend proxy.
- Use timeouts, bounded retries, and response validation.
- Avoid logging full search queries if they could reveal sensitive user interests.
- Attribute Bible text according to provider requirements.
- Do not use one provider's data to populate another provider's catalogue without permission.

## 10. Account deletion and export

### Deletion
1. Confirm intent and explain the consequences.
2. Re-authenticate if required by platform policy.
3. Revoke access/sessions where supported.
4. Delete or schedule deletion of user-owned cloud records and push subscriptions.
5. Ensure child records are deleted through constraints/cascade policies or a documented workflow.
6. Clear local data for the account, warning about unsynchronised content.
7. Show completion only after the server confirms the relevant workflow state.
8. Document backup retention limits and any unavoidable delay.

### Export
- Export journals and activity records in a documented machine-readable format such as JSON; consider CSV for activity logs.
- Include schema/version metadata and timestamps.
- Exclude auth secrets, access tokens, and other users' data.
- Clearly state that downloaded exports are no longer protected by the app.

## 11. Threat model summary

| Threat | Primary mitigations |
|---|---|
| User reads another user's journal | RLS, owner constraints, negative API tests |
| XSS reads local journals | Safe rendering, CSP, dependency hygiene, input validation |
| Shared phone exposes cached journal | Clear warnings, account partitioning, sign-out/clear-data controls |
| Network loss loses an entry | Local-first persistence, sync queue, retry and conflict recovery |
| Retry creates duplicates | Idempotency keys and unique constraints |
| Deleted entry reappears | Tombstones and sync protocol |
| Secret leaks from frontend | No service-role/provider secrets in Vite build |
| Notification exposes prayer content | Generic payloads only |
| Licence violation | Per-translation rights review and metadata |
| Account deletion leaves data behind | Documented deletion workflow and tests |

## 12. Security release gate

- [ ] RLS enabled on all private tables.
- [ ] Cross-user read/write/delete tests pass.
- [ ] No service-role key or private provider key in frontend bundle.
- [ ] OAuth redirects are allow-listed.
- [ ] Journal content is absent from logs and push payloads.
- [ ] Service worker does not cache private API responses by default.
- [ ] Offline account switching does not leak cached records.
- [ ] Sync retries are idempotent and conflicts preserve content.
- [ ] Export and deletion workflows are tested.
- [ ] Dependency and production security headers reviewed.
- [ ] Bible translation rights are documented.
