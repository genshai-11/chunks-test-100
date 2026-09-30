# CHUNKS Test 100 — Agent Instructions & Architectural Guide

## 1. Project Context & Mission
**CHUNKS Test 100** is a controlled assessment booking and referral platform based on **CHUNKS Theory MN107.v2.1**.
- **Format**: **Mini-Test 21 câu ngắn (15 – 20 phút)** conducted **trực tiếp (Offline) 1-on-1** with an authorized Chunker-in-Charge (CiC) at a designated CHUNKS assessment center.
- **Calendar & Time Slot**: The slot selected on the landing page form records the candidate's **desired expected time** (thời gian mong muốn dự kiến). The operations team contacts the candidate via phone/Zalo to confirm the final in-person appointment.
- **Capacity**: Strictly capped at **100 qualified registrations** via atomic database transactions.
- **Referral System**: 100% invite-only referral mechanism. Chunkees can also self-provision their personal referral link & QR code directly from the main page via the Chunkee Gateway modal.

---

## 2. System Architecture & Domains
- **Live Domains**:
  - `https://chunkstest.web.app` & `https://chunkstest.firebaseapp.com`: Firebase Hosting serving the static Vite bundle with fast global CDN caching.
  - `https://chunkstest.ai.studio`: Cloud Run service (`remix-chunks-test-100` in region `asia-east1`, project `fourth-vehicle-452610-a1`) running the Node.js Express server (`server.ts` / `server.js`).
- **Storage Layer**:
  - Single authoritative database: Named Firestore database `ai-studio-remixchunkstest1-a42d45b2-bb93-4241-899a-c2cb84f510a5`.
  - Collections:
    - `campaign/state`: Holds `migrationComplete: true`, `totalRegistered`, `greenCount`, `redCount`. Contention on this document serializes the 100-registration cap.
    - `candidates`: Candidate records created atomically upon booking.
    - `chunkers`: Chunker referral accounts (e.g. `PILOT100`, `MINH2026`).
    - `phoneLocks/{sha256(normalizedPhone)}`: Enforces 30-day anti-duplicate phone lock.
    - `settings/notifications`: Admin email recipients for new candidate booking alerts.
    - `emailOutbox`: Durable queue for candidate confirmation and admin notification emails.
  - Client SDK rules: `firestore.rules` enforces `allow read, write: if false;` — zero direct client access; all writes go through backend transactions.

---

## 3. Email Outbox & Reliability
- **Provider**: Gmail SMTP configured with dedicated account `chunksstation@gmail.com` on port 465 SSL/TLS.
- **Outbox Architecture**:
  - Giao dịch đăng ký ghi job vào collection `emailOutbox` đồng thời với `candidates`.
  - Candidate record giữ trạng thái `confirmationEmailSent: false` cho đến khi provider chấp nhận gửi.
  - Exponential backoff retry (30s, 60s, 120s... tối đa 1 giờ) khi có sự cố mạng.
  - Endpoint nội bộ `/api/internal/drain-email-outbox` được bảo vệ bằng OIDC token từ Google Cloud Scheduler.

---

## 4. Security & Authentication Invariants
1. **Admin Authentication**:
   - `server.ts` enforces `verifyAdminBearerToken`: Requires a verified Firebase Auth ID Token (`Authorization: Bearer <token>`).
   - The token's email must be verified (`email_verified: true`) and present in the server allowlist `ADMIN_EMAILS` (default: `le.ntmkh@gmail.com,lucy2511kh@gmail.com`).
   - **NEVER** accept unverified client headers like `x-admin-email`.
2. **PII Protection**:
   - `GET /api/public/referral` returns ONLY `{ valid: boolean, chunkerName: string, referralCode: string }`.
   - Never expose chunker email, phone, or candidate lists on public endpoints.
   - CSV Export (`/api/admin/export`) sanitizes formula cells (`=`, `+`, `-`, `@`) to prevent CSV injection attacks.

---

## 5. Development & CI/CD Commands
- **Linting**: `npm run lint` (runs `tsc --noEmit`).
- **Testing**: `npm test` (executes 16 integration & security tests via `tsx tests/integration.test.ts`).
- **Building Frontend**: `npm run build` (runs `vite build`).
- **Container Build**: `gcloud builds submit --tag gcr.io/fourth-vehicle-452610-a1/remix-chunks-test-100:latest .`
- **Deploy Container**: `gcloud run services replace service.yaml` or `gcloud run deploy ...`
- **CI Workflow**: `.github/workflows/checks.yml` triggers on push to `main` and pull requests, running lint, build, and test.

---

## 6. Content Guardrails (MN107.v2.1)
- Never claim neuroscience brain scans, permanent linguistic rewiring, or guaranteed outcomes after a single session.
- Keep tone objective, observational, and diagnostic.
- Refer to the 1-on-1 evaluator as **Chunker-in-Charge (CiC)**.
