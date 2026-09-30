# Security Specification: Chunks Test 100

## 1. Data Invariants
1. **Unauthenticated Candidate Submission**: Anyone with a valid referral link can submit a new candidate record (`candidates/{candidateId}`) during the registration window, provided all schema bounds are respected (no ghost fields, valid phone/email format, valid test type, status initialized strictly to `"new"`).
2. **Read Protection on Candidate PII**: Candidates contain sensitive PII (Phone, Email, Occupation). Candidates cannot be listed or read by the general public. Only verified Admins can read or query the `candidates` collection.
3. **Admin Exclusivity**: Write/update access to `candidates` status, notes, or scheduling belongs exclusively to verified administrators listed in `/admins/{adminId}` or with verified bootstrap email `le.ntmkh@gmail.com` or `lucy2511kh@gmail.com`.
4. **Referral Code & Settings Integrity**: Referral codes in `chunkers` and system configurations in `/settings/{settingId}` (e.g. notification emails) can only be read/modified by authorized Admins. Public visitors may read `chunkers` to validate incoming referral codes and display referrer names.
5. **No Self-Assigned Elevation**: Regular users or candidates cannot create an `/admins` record or promote themselves.
6. **Immutable Submission Timestamps**: Once created, `createdAt` in candidate records cannot be changed by updates.
7. **Test Level Boundary**: Candidate `testLevel` must strictly be either `'easy'` or `'hard'`. Any unknown levels are rejected.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Public Reading Candidates Collection**: Unauthenticated or non-admin user queries `GET /candidates` -> PERMISSION_DENIED.
2. **Admin Self-Promotion**: Unauthenticated or normal user writes `POST /admins/{userId}` with `{ role: "super_admin" }` -> PERMISSION_DENIED.
3. **Shadow Update on Candidate**: Attacker posts candidate creation with extra field `{ isVipPass: true, bypassQueue: true }` -> PERMISSION_DENIED.
4. **Status Hijacking on Creation**: Attacker registers candidate with status `"completed"` or `"scheduled"` instead of `"new"` -> PERMISSION_DENIED.
5. **Modification of Referral Count by Public**: Attacker sends `UPDATE /chunkers/{id}` with `{ referralCount: 9999 }` -> PERMISSION_DENIED.
6. **PII Harvesting via Single Doc Get**: Unauthenticated client executes `GET /candidates/{someId}` without admin credentials -> PERMISSION_DENIED.
7. **Chunker Code Spoofing/Deletion**: Non-admin attempts `DELETE /chunkers/{id}` -> PERMISSION_DENIED.
8. **Oversized Payload / Denial of Wallet**: Attacker submits candidate with 2MB string in `fullName` -> PERMISSION_DENIED.
9. **Invalid Test Type Injection**: Attacker submits `{ testType: "blue" }` or `{ testType: "exam" }` instead of `"green"` or `"red"` -> PERMISSION_DENIED.
10. **Candidate Record Modification by Stranger**: Non-admin attempts `UPDATE /candidates/{candidateId}` with `{ status: "scheduled" }` -> PERMISSION_DENIED.
11. **Email Spoofing without Verification**: Attacker creates session with unverified email matching admin but `email_verified == false` -> PERMISSION_DENIED.
12. **Candidate Deletion by Public**: Non-admin executes `DELETE /candidates/{candidateId}` -> PERMISSION_DENIED.
