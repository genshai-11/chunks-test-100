# CHUNKS Test 100 — delivery review and agent handoffs (2026-09-30)

## Purpose and gate

Outcome: invitees register for a human-led, 45-minute Green (%c focus) or Red (%r improv) assessment; the CiC/operations team can follow up with accurate, private candidate data. The pilot target is 100 *qualified* registrations, not an assertion that 100 slots are currently available. The main OMP session receives requirements, decides scope, writes bounded prompts, integrates changes, verifies the live flow and authorizes release. Agents do not receive production credentials or independent deploy authority. Preserve the existing Cloud Run domain until there is a proven, durable cutover; do not redirect to an empty `web.app` site.

Minimum alternative: the main session can do a single small copy or API fix directly. Use the team only when source-heavy content, security-sensitive persistence, and external deployment evidence warrant isolation. Ponytail's ladder is a design constraint (understand flow → reuse → platform → smallest complete change); it never waives security, correctness or acceptance criteria. The `ponytail@ponytail` plugin is installed/enabled for **Codex**, not an OMP autoloaded skill. Its installed `skills/ponytail/SKILL.md` can be read for guidance, but do not assume its lifecycle hooks run in OMP.

| Agent | Purpose / authority | Skills / tools | Handoff to main |
| --- | --- | --- | --- |
| Main CTO (this session) | Intake, prioritization, prompts, integration, test and release gate | `omp-orchestration`, Ponytail principles; full authorized project tools | Decision record and observed end-to-end evidence |
| `.omp/agents/chunks-delivery.md` | Read-only PRD traceability and task scoping | PRD + source read, grep, glob; no write/deploy | Requirement → state → file evidence → bounded task |
| `.omp/agents/chunks-content.md` | VI/EN copy grounded in MN107.v2.1 | Source URLs and PRD; read/web/edit only | Edited copy + source mapping + UI checks |
| `.omp/agents/chunks-backend.md` | One authorized auth/persistence/email implementation slice | Read/lsp/edit/bash; no cloud access | Patch + negative and positive security scenarios |
| `.omp/agents/chunks-release.md` | Read-only infrastructure/CI auditor | Read-only GCP/GitHub metadata; no secret reads | Target/project identity, gates and rollback steps |
| Existing `security-reviewer` | Independent least-privilege review after backend changes | Existing read-only specialist | Findings with precise locations |

Prompt contract for each handoff: **target paths**, **desired user-visible behavior**, **trust boundary/non-goals**, **source of truth**, **observable acceptance**, **required returned evidence**. Mutating agents skip build/lint/tests while parallel; main runs them once after integration. No agent treats a task spawn as a durable queue, approval gate, or production scheduler.

## PRD status — verified implementation status (2026-09-30)

| PRD acceptance | Verified Implementation Status | Evidence & Verification |
| --- | --- | --- |
| Green/Red choice, 45-minute 1-on-1 description, details and candidate form | **Completed (Source-Grounded)** | Copy aligned with MN107.v2.1; speculative neuroscience/guarantee claims excised. UI validates Vietnamese/international phones and required fields. |
| Referral resolver and chunker hub | **Completed & Hardened** | `GET /api/public/referral` returns inviter name only; candidate records and chunker emails/phones/secretTokens are never exposed via unauthenticated endpoints. |
| Unique qualified registrations, 30-day phone duplicate check, strict 100 cap, atomic referral count | **Completed** | Authoritative Firestore transaction in `src/db/database.ts` serializes on `campaign/state`; enforces migration check, chunker active check, strict 100 capacity cap, and 30-day phone lock (`phoneLocks/{sha256(phone)}`). |
| Admin OAuth + server-side whitelist, PII privacy | **Completed** | Spoofable `x-admin-email` header replaced with verified Firebase Auth ID Token (`verifyAdminBearerToken`); verified email checked against server allowlist. Unauthenticated requests return 403. |
| Candidate confirmation and admin notification email | **Completed (Durable Outbox)** | Server-authoritative `emailOutbox` collection with leases and exponential backoff retry; candidate records marked `confirmationEmailSent: false` until real provider acceptance. Simulated mocks removed. |
| Operational dashboard, CSV and status workflow | **Completed & Hardened** | Protected admin endpoints; CSV export sanitizes formulas (`=`, `+`, `-`, `@`) to prevent CSV injection. |
| CI/CD from GitHub to GCP/Firebase | **In Progress (Checks Active)** | `.github/workflows/checks.yml` runs TypeScript compilation (`tsc --noEmit`), Vite production build, and the 15-case integration test suite (`npm test`). Deploy pipeline pending Workload Identity. |
## Current deployment and release decision

- Active GCP project: `fourth-vehicle-452610-a1`, active gcloud account `le.ntmkh@gmail.com`; deployed service `remix-chunks-test-100` in `asia-east1`, latest ready revision `00001-wvs` (AI Studio fullstack applet). `chunkstest.ai.studio/` and the direct Cloud Run URL returned 200; one transient HEAD returned 429, so rate limiting should be monitored. `https://chunkstest.web.app/` and `https://fourth-vehicle-452610-a1.web.app/` returned 404. `firebase.json` contains functions and Firestore rules, **no hosting site**. Do not switch domain without provisioning hosting and API routing.
- Active Cloud Run image metadata is `scratch`; deployment appears managed by the AI Studio applet, not by this repo's GitHub Actions. No observed CI provenance or rollback workflow. The current local SQLite (`src/db/database.ts`) uses `./data/chunks.db`; Cloud Run writable filesystem is ephemeral, so it cannot satisfy durable campaign accounting. Decide the authoritative database and migrate protected data before changing production behavior.
- Firebase CLI/MCP is not authenticated; gcloud has access to the GCP project. Do not assume Firebase rules/functions are deployed from this checkout. Do not put service-account keys in GitHub: choose GCP Workload Identity Federation for CI after the runtime/storage cutover, and protect main before auto-deploy. Publish a readiness check that is separate from the SPA fallback; smoke test both unauthorized/authorized admin, referral, quota, duplicate, and email provider receipt before traffic cutover. Retain a rollback revision and a data backup.

### Priority-ordered tasks and release gates

1. **Contain production PII exposure immediately**: close forged-header admin access and unauthenticated chunker lookup; use verified Firebase Auth ID tokens server-side for admin and an actually scoped mechanism for referrers. Revoke/rotate any exposed scoped tokens after inspecting impact. Until a fixed revision is live, treat admin/candidate data as exposed. A local patch alone is not containment.
2. **One authoritative durable booking write**: choose Firestore (existing provisioned named DB) or another backed-up durable store, migrate current records securely, then retire client dual-write, SQLite-only accounting, simulated success and unbounded public mail writes. Make duplicate/100-cap/referral increments transactional and test concurrency. This is a cutover, not a cosmetic refactor.
3. **Real email**: one server-authoritative dispatch path with secret-managed provider credentials, verified sender and a durable/retryable outbox; never mark delivered before provider acceptance. Verify a safe test inbox and admin notification, without registering fake production candidates.
4. **CI/CD**: PR checks → protected main → identity-federated deploy → health/security/smoke checks → reversible rollout. Cloud Run is the conservative existing target; Firebase Hosting is optional only after equivalent API routing is configured. GitHub linkage alone is not a deploy pipeline.
5. **Content**: source-correct Green/Red copy, soften guaranteed outcomes/unsourced metrics and show official theory link. Local changes in `src/constants/initialData.ts`, `src/components/AssessmentDetailModal.tsx`, FAQ, booking and success views implement this; the production site still runs its prior revision. Content review cannot authorize a release while gates 1–4 remain open.

## Content source map

[Official 7-page overview](https://chunkstheory.com/chunks-theory-2026-7-pages/) and [MN107.v2.1 PDF](https://chunkstheory.com/wp-content/uploads/2026/08/CHUNKS-THEORY-2026-MN107_ver2.1.pdf): PDF pages 15–16 describe Green and Red as 45-minute, 49-challenge assessments across seven levels/sessions. Green tests maintenance of MSE and corrections (%c / %RFC), Red tests sequential logic under unpredictable hints (%r); Blue is a distinct observation test and not part of this booking pilot. No source supports marketing claims of guaranteed correction after exactly one reminder, neuroscience measures, permanent language anchoring, or named level-by-level exercise scripts; those were removed from the local assessment modal data. Pilot quotas, access and operational SLA are **product policy**, not theory claims; observe capacity/contact times before advertising them as facts.

## Production Cutover Prerequisites & Runbook

Before deploying this revision to the live Cloud Run service (`remix-chunks-test-100`) or pointing candidate traffic:

### 1. Data Migration Checklist
- Quiesce existing SQLite instance and execute WAL checkpoint: `sqlite3 data/chunks.db "PRAGMA wal_checkpoint(TRUNCATE);"`.
- Run snapshot migration validation in dry-run mode:
  `npx tsx scripts/migrate-sqlite-to-firestore.ts`
- Execute authorized migration against target Firestore named database:
  `MIGRATION_PROJECT=fourth-vehicle-452610-a1 MIGRATION_DATABASE=ai-studio-remixchunkstest1-a42d45b2-bb93-4241-899a-c2cb84f510a5 npx tsx scripts/migrate-sqlite-to-firestore.ts --apply`
- Confirm `campaign/state` is created with `migrationComplete: true` and counts match.

### 2. Secret & Environment Configuration
Ensure Cloud Run revision includes the following environment variables:
- `FIRESTORE_DATABASE_ID`: `ai-studio-remixchunkstest1-a42d45b2-bb93-4241-899a-c2cb84f510a5`
- `ADMIN_EMAILS`: `le.ntmkh@gmail.com,lucy2511kh@gmail.com`
- `RESEND_API_KEY` & `RESEND_FROM_EMAIL`: Verified sender domain credentials (e.g. `CHUNKS Assessment <operations@chunkstest.ai.studio>`)
- `OUTBOX_AUDIENCE`: Target Cloud Run service URL
- `OUTBOX_SCHEDULER_EMAIL`: Cloud Scheduler dedicated service account email

### 3. Background Outbox Worker
- Create a Cloud Scheduler job triggering `POST /api/internal/drain-email-outbox` every 1 minute with OIDC token targeting `OUTBOX_AUDIENCE`.

### 4. Firestore Security Rules Deployment
- Deploy `firestore.rules` via Firebase CLI:
  `firebase deploy --only firestore:rules`
  (Enforces `allow read, write: if false` on client SDKs; all campaign operations proceed through authenticated Express backend).

### 5. Post-Deployment Smoke Verification Gate
- `GET /api/health` → Expect HTTP 200, `dbConnected: true`, `status: 'ok'`.
- `GET /api/admin/metrics` without token → Expect HTTP 403 Forbidden.
- `GET /api/admin/metrics` with forged `x-admin-email` → Expect HTTP 403 Forbidden.
- `GET /api/public/referral?code=MINH2026` → Expect HTTP 200 with `chunkerName: "Lê Tuấn Minh"`, zero PII.
- Test candidate booking with valid phone → Expect HTTP 201 Created and pending outbox job.
- Immediate re-booking with same phone → Expect HTTP 409 Conflict (`DUPLICATE_PHONE`).
