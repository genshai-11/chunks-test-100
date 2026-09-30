# PRODUCT REQUIREMENTS DOCUMENT (PRD) & TECHNICAL SPECIFICATION
# Project: "Chunks Test 100" (Conscious Performance Booking & Referral System)
**Document Version:** 1.0.0  
**Framework Baseline:** CHUNKS Theory MN107.v2.1 (Conscious Learning Framework)  
**Author:** Principal Product Manager & System Architect  
**Target Completion:** 100 Qualified Candidate Registrations  

---

## Table of Contents
1. [Executive Summary & Pilot Success Metrics](#1-executive-summary--pilot-success-metrics)
2. [Detailed Feature Specifications & User Stories](#2-detailed-feature-specifications--user-stories)
3. [Exact Copywriting & Content Guide (Bilingual VI/EN)](#3-exact-copywriting--content-guide-bilingual-vien)
4. [Information Architecture & UI/UX Wireframe Guidelines](#4-information-architecture--uiux-wireframe-guidelines)
5. [Database Schema & Data Models (Prisma/PostgreSQL & Firestore)](#5-database-schema--data-models)
6. [Technical Architecture & API Specifications](#6-technical-architecture--api-specifications)
7. [Security, Validation & Edge Cases](#7-security-validation--edge-cases)

---

## 1. Executive Summary & Pilot Success Metrics

### 1.1 Program Mission & Context
**Chunks Test 100** is a controlled, invite-only assessment pilot designed by **CHUNKS (Conscious Learning Framework)** based on **CHUNKS Theory MN107.v2.1**.

Unlike conventional EdTech platforms that deploy multiple-choice grammar quizzes or automated voice bots, CHUNKS tests **conscious human performance under real-time psychological pressure** through the tri-fold vector of **Motion, Sound, Emotion (MSE)**. The assessment is executed strictly as a **1-on-1, 45-minute live diagnostic session** administered by an authorized **Chunker-in-Charge (CiC)**.

### 1.2 Target Audience & Exclusivity Constraint
- **Capacity Constraint:** The campaign is strictly capped at **exactly 100 qualified candidate registrations**.
- **Distribution Mechanism:** 100% invite-only referral mechanism. Prospective candidates can only access the registration system via verified personal referral codes generated for existing active learners (**"Chunkers"**).
- **Core Priority Assessments:**
  1. **Green Test (Focus Test - %c):** Attention & concentration durability. Measures resistance to habitual slips and Requests Forgotten Coefficient (**%RFC**) across 49 progressive challenges in 7 levels.
  2. **Red Test (Improvisation Test - %r):** Intention agility & cognitive pivot. Measures real-time idea redirection under random lexical constraints while preserving sequential logic across 49 challenges in 7 levels.

### 1.3 Key Success Metrics (Pilot KPIs)
| Category | Metric | Baseline / Target | Measurement Method |
|---|---|---|---|
| **Acquisition** | Capped Registrations | **Exactly 100 Qualified Candidates** | Automated real-time registration counter |
| **Referral Velocity** | Time-to-100 | **<= 14 Calendar Days** from public link broadcast | Chunker referral velocity log |
| **Friction / Drop-off** | Form Completion Rate | **>= 68%** of referral page visitors | Landing page analytics (Visits vs Submissions) |
| **Test Distribution** | Green vs. Red Ratio | **Balanced (~50% Green : 50% Red)** | Live split tracking in Admin Dashboard |
| **Operational SLA** | Contacted SLA | **< 24 Hours** from registration to first Zalo/Call touch | Operations status timestamp tracking |
| **Attendance** | Assessment Show-up Rate | **>= 85%** of scheduled candidates | CiC verified session attendance log |
| **Advocacy Quality** | Chunker Participation Rate | **>= 75%** of active Chunkers driving >= 2 candidates | Chunker referral leaderboard distribution |

---

## 2. Detailed Feature Specifications & User Stories

### 2.1 Epic: Candidate Booking & Referral Ingestion

#### User Story 2.1.1: Referral Code Resolution & Personalized Ingestion
*As an invited prospective candidate,*  
*I want to see who invited me as soon as I arrive at the booking page,*  
*So that I feel trust, recognized community belonging, and immediate clarity.*

```gherkin
Scenario: Arriving via valid referral code
  Given a candidate navigates to "/?ref=TUNG2026"
  And "TUNG2026" belongs to active Chunker "Tùng Lê (CiC Lead)"
  When the page finishes rendering
  Then a prominent banner displays: "You have been invited by Tùng Lê (CiC Lead) to take the 1-on-1 CHUNKS Test."
  And the hidden field "chunkerCode" is auto-populated with "TUNG2026"
  And the candidate can view the test selection form immediately in the primary viewport.

Scenario: Arriving via invalid or missing referral code
  Given a candidate navigates to "/" or "/?ref=UNKNOWN99"
  When the page resolves referral validity
  Then a graceful notice informs the user: "General Invitation Mode: You are accessing the priority pilot queue."
  And a lightweight input allows entering a known referral code, or proceeding with default pilot allocation "PILOT100".
```

#### User Story 2.1.2: Form-First Frictionless Registration
*As a candidate,*  
*I want to complete my assessment preference in under 60 seconds,*  
*So that I do not abandon the registration process.*

```gherkin
Scenario: Successful candidate booking submission
  Given the candidate fills in:
    | Field | Sample Value |
    | Full Name | "Hoàng Bảo Long" |
    | Phone | "0903124567" |
    | Email | "baolong.hoang@techcorp.io" |
    | Age Range | "25-34" |
    | Occupation | "Senior Product Manager" |
    | Test Selection | "Green Test (%c Focus)" |
    | Preferred Window | "Weekday Evening (19:00 - 21:00)" |
  When the candidate clicks "Xác nhận Đặt lịch / Confirm Registration"
  Then the system validates phone syntax and duplicate records within 30 days
  And records the candidate in the database with status "new"
  And increments the referring Chunker's referralCount by 1
  And presents an instant confirmation card with Zalo/Phone follow-up instructions.
```

#### User Story 2.1.3: Interactive Assessment Deep-Dive Modals
*As an undecided candidate,*  
*I want to read the precise difference between Green Test (%c) and Red Test (%r),*  
*So that I choose the diagnostic that best exposes my communicative bottlenecks.*

```gherkin
Scenario: Expanding Green Test details
  Given the candidate views the Test Selection cards
  When they click "[Đọc chi tiết về Green Test] / [Read Green Test Details]"
  Then an interactive modal opens displaying:
    - 45 minutes duration with 1-on-1 CiC format
    - 49 challenges across 7 progressive calibration levels
    - Explanation of %RFC (Requests Forgotten Coefficient) and anti-habitual error elimination
    - Core Question: "Can you preserve a given idea and its grammatical structure under anti-habitual pressure?"
```

---

## 3. Exact Copywriting & Content Guide (Bilingual VI/EN)

### 3.1 Hero & Navigation Copy
| Element | Tiếng Việt (VI) | English (EN) |
|---|---|---|
| **Brand Title** | **CHUNKS Test 100** — Kỳ khảo sát Năng lực Tỉnh thức | **CHUNKS Test 100** — Conscious Performance Pilot |
| **Referral Banner** | *"Bạn nhận được thư mời trực tiếp từ **{chunker_name}** để tham gia buổi kiểm tra 1-on-1 độc quyền cùng Chunker-in-Charge."* | *"You have been personally invited by **{chunker_name}** to take the exclusive 1-on-1 CHUNKS Assessment."* |
| **Hero Headline** | **Đo lường năng lực nói tiếng Anh dưới áp lực tâm lý thực tế.** | **Measure spoken English under real-time psychological pressure.** |
| **Hero Subtitle** | Không phải bài thi trắc nghiệm ngữ pháp. Đây là 45 phút đối thoại trực diện 1-1 theo lý thuyết CHUNKS MN107.v2.1 để bóc tách phản xạ ngôn ngữ vô thức qua Motion, Sound, Emotion. | Not a generic grammar quiz. A 45-minute live 1-on-1 diagnostic based on CHUNKS Theory MN107.v2.1 to expose subconscious speech reflexes via Motion, Sound, and Emotion. |
| **Quota Pill** | Giới hạn duy nhất 100 ứng viên qua mã giới thiệu | Strictly limited to 100 invite-only registrations |

### 3.2 Form Labels & Interactive Input Copy
| Field | Tiếng Việt (VI) | English (EN) |
|---|---|---|
| **Full Name** | Họ và tên ứng viên * | Full Name * |
| **Full Name Placeholder** | Ví dụ: Nguyễn Văn An | e.g. Alexander Vance |
| **Phone Number** | Số điện thoại (kết nối Zalo) * | Mobile Phone Number (for WhatsApp/Zalo) * |
| **Phone Placeholder** | 09xx xxx xxx | +84 9xx xxx xxx |
| **Email Address** | Địa chỉ Email công việc / cá nhân * | Professional / Personal Email * |
| **Email Placeholder** | name@company.com | name@company.com |
| **Age Range** | Độ tuổi * | Age Bracket * |
| **Occupation** | Nghề nghiệp / Lĩnh vực công tác * | Occupation / Industry * |
| **Time Slot Label** | Khung giờ phỏng vấn ưu tiên * | Preferred 45-Min Interview Window * |
| **Submit Button** | **Xác nhận Giữ chỗ Đánh giá (45 Phút) →** | **Confirm Assessment Reservation (45 Min) →** |

---

## 4. Information Architecture & UI/UX Wireframe Guidelines

### 4.1 Global Information Architecture (IA)
```
Root Application
├── Public Candidate Experience
│   ├── Referral Resolver (/?ref={code})
│   ├── Sticky Invitation Banner (Chunker Attribution)
│   ├── Campaign Target Progress Pill (e.g. "42 / 100 spots booked")
│   ├── Form-First Primary Viewport:
│   │   ├── Candidate Contact Inputs (Name, Phone, Email, Age, Occupation)
│   │   ├── Test Selection Radio Matrix (Green Test vs. Red Test)
│   │   │   ├── Inline Modal Trigger -> Green Test Deep-Dive
│   │   │   └── Inline Modal Trigger -> Red Test Deep-Dive
│   │   ├── Time Window Preference Grid
│   │   └── Anti-Spam Submit CTA
│   └── Success Modal (Candidate ID, Next Steps, Preparation Checklist)
│
├── Chunker Referral Hub
│   ├── Personalized Referral Link Generator (?ref=CODE)
│   ├── QR Code Generator for In-Person Invites
│   └── Personal Referral Counter & Candidate Status Tracker
│
├── Admin Operations & Tracking Portal (Google Auth Protected)
│   ├── Campaign Milestone Gauge (100 Target Tracker)
│   ├── Test Split Chart (Green %c vs. Red %r)
│   ├── Chunker Performance Leaderboard
│   ├── Chunker Management Panel (Create, Deactivate, Copy Link)
│   └── Candidate Data Table (Filtering, Search, Status Workflow, UTF-8 CSV Export)
│
└── In-App PRD & Technical Spec Viewer
```

---

## 5. Database Schema & Data Models

### 5.1 Relational Schema: Prisma ORM / PostgreSQL
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  OPS_ADMIN
}

enum TestType {
  GREEN  // Focus Test (%c)
  RED    // Improvisation Test (%r)
}

enum CandidateStatus {
  NEW
  CONTACTED
  SCHEDULED
  COMPLETED
  NO_SHOW
}

enum AgeRange {
  UNDER_18
  AGE_18_24
  AGE_25_34
  AGE_35_44
  AGE_45_PLUS
}

model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  role      Role     @default(OPS_ADMIN)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("admins")
}

model Chunker {
  id            String      @id @default(uuid())
  code          String      @unique @db.VarChar(20)
  name          String      @db.VarChar(100)
  email         String      @unique @db.VarChar(120)
  active        Boolean     @default(true)
  referralCount Int         @default(0) @map("referral_count")
  notes         String?     @db.VarChar(500)
  createdAt     DateTime    @default(now()) @map("created_at")
  candidates    Candidate[]

  @@index([code])
  @@map("chunkers")
}

model Candidate {
  id              String          @id @default(uuid())
  fullName        String          @map("full_name") @db.VarChar(120)
  phone           String          @db.VarChar(20)
  email           String          @db.VarChar(120)
  ageRange        AgeRange        @map("age_range")
  occupation      String          @db.VarChar(100)
  testType        TestType        @map("test_type")
  preferredSlots  String          @map("preferred_slots") @db.VarChar(250)
  chunkerCode     String          @map("chunker_code") @db.VarChar(20)
  chunkerId       String?         @map("chunker_id")
  chunker         Chunker?        @relation(fields: [chunkerId], references: [id], onDelete: SetNull)
  status          CandidateStatus @default(NEW)
  notes           String?         @db.VarChar(500)
  scheduledAt     DateTime?       @map("scheduled_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([phone])
  @@index([email])
  @@index([status])
  @@index([chunkerCode])
  @@index([createdAt(sort: Desc)])
  @@map("candidates")
}
```

---

## 6. Technical Architecture & API Specifications

### 6.1 Access Control Matrix (Role-Based View Permission)

| Data Field / Resource | Candidate (Public) | Chunker (Referrer) | Admin |
| :--- | :---: | :---: | :---: |
| **Chunker Name (for greeting)** | ✅ (Only the inviter) | ✅ (Own name) | ✅ (All) |
| **Referral Code validation** | ✅ (`isValid: true/false`) | ✅ (Own code) | ✅ (All) |
| **Registration Form Submission** | ✅ (Write only) | ❌ | ✅ |
| **Success Confirmation Receipt** | ✅ (Own submission only) | ❌ | ✅ |
| **Personal Referral Count** | ❌ | ✅ (e.g. "You invited 4") | ✅ (All Chunkers) |
| **Candidate List (Masked)** | ❌ | ⚠️ Optional (`Nguy** A`) | ✅ (Full Name) |
| **Candidate Phone / Email (PII)** | ❌ | ❌ **FORBIDDEN** | ✅ (Full PII) |
| **Global Metrics (Target 100, %)** | ❌ | ❌ | ✅ (Full Dashboard) |
| **CSV / Excel Export** | ❌ | ❌ | ✅ |

---

### 6.2 Architectural Topology & Route Isolation
```
[ Route / (Candidate) ]        [ Route /ref-status (Chunker) ]      [ Route /admin (Admin) ]
          |                                   |                                |
  (Public Validation & Form)          (Scoped Secret Token)           (Google Auth Whitelist)
          |                                   |                                |
          +-----------------+-----------------+--------------------------------+
                            |
                     (HTTPS / Express)
                            v
   +----------------------------------------------------+
   |         API GATEWAY & ROLE-BASED ACCESS CONTROL    |
   |                                                    |
   |  [Group A: Public APIs]                            |
   |  • GET  /api/public/referral?code={code}           |
   |  • POST /api/public/candidates/register            |
   |                                                    |
   |  [Group B: Chunker Scoped APIs]                    |
   |  • GET  /api/chunker/stats?code={code}&token={sec} |
   |    ↳ DTO Sanitize: MaskedName + Zero Phone/Email   |
   |                                                    |
   |  [Group C: Protected Admin APIs]                   |
   |  • GET   /api/admin/metrics                        |
   |  • GET   /api/admin/candidates                     |
   |  • PATCH /api/admin/candidates/:id/status          |
   |  • POST  /api/admin/chunkers                       |
   |  • GET   /api/admin/export (UTF-8 CSV)             |
   +----------------------------------------------------+
                            |
                      (Database Layer)
                            v
             +------------------------------+
             | Cloud Firestore / PostgreSQL |
             +------------------------------+
```

---

### 6.3 Detailed End-to-End API Specifications

#### [GROUP A: Public / Candidate APIs]

##### 1. `GET /api/public/referral?code={code}`
- **Purpose:** Validate code when Candidate opens `/?ref={code}` to show greeting banner.
- **Auth:** None (Public)
- **Response (200 OK):**
```json
{
  "valid": true,
  "chunkerName": "Hoàng Nam",
  "referralCode": "NAM2026"
}
```
*(Strict Rule: NEVER expose chunker email, phone, ID, or how many people they have invited).*

##### 2. `POST /api/public/candidates/register`
- **Purpose:** Submit registration form.
- **Auth:** None (Public + Rate-limited by IP)
- **Request Body:**
```json
{
  "referralCode": "NAM2026",
  "fullName": "Nguyễn Văn B",
  "phone": "0912345678",
  "email": "vanb@example.com",
  "ageRange": "25-34",
  "occupation": "Software Engineer",
  "testType": "GREEN_TEST",
  "preferredTimeSlot": "WEEKDAY_EVENING"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "registrationId": "cand_xyz789",
  "message": "Đăng ký thành công! Đội ngũ Chunks sẽ liên hệ qua Zalo/SĐT để xếp lịch."
}
```
*(Strict Rule: Response returns ONLY an acknowledgment. Never return list of previous submissions or current target counts).*

---

#### [GROUP B: Chunker Scoped APIs]

##### `GET /api/chunker/stats?code={code}&token={secret_token}`
- **Purpose:** Chunker views their own referral stats without a full account login.
- **Auth:** Scoped Token (or secure hash assigned to that Chunker).
- **Response (200 OK):**
```json
{
  "chunkerName": "Hoàng Nam",
  "referralLink": "https://chunks.edu.vn/?ref=NAM2026",
  "totalReferred": 5,
  "breakdown": {
    "greenTest": 3,
    "redTest": 2
  },
  "candidates": [
    { "maskedName": "Nguyễn V** B", "testType": "GREEN_TEST", "status": "Registered" },
    { "maskedName": "Trần T** C", "testType": "RED_TEST", "status": "Scheduled" }
  ]
}
```
*(Strict Rule: Phone numbers and emails MUST be masked or completely omitted. No access to other Chunkers).*

---

#### [GROUP C: Protected Admin APIs]
*(All endpoints protected by Server-Side Session check: Google OAuth + Whitelist Email Array)*

##### 1. `GET /api/admin/metrics`
- **Response (200 OK):**
```json
{
  "target": 100,
  "totalRegistered": 68,
  "greenCount": 40,
  "redCount": 28,
  "topChunkers": [
    { "name": "Tùng Lê", "code": "TUNG2026", "referralCount": 18 }
  ]
}
```

##### 2. `GET /api/admin/candidates?page=1&limit=20&testType=ALL&status=ALL&search=`
- **Response (200 OK):** Full raw candidate objects including raw Phone, Email, Referral Chunker details, and Status.

##### 3. `PATCH /api/admin/candidates/:id/status`
- **Request Body:**
```json
{
  "status": "SCHEDULED",
  "notes": "Confirmed for Thursday 19:30 with CiC Tùng"
}
```

##### 4. `POST /api/admin/chunkers`
- **Request Body:**
```json
{
  "fullName": "Lê Mai",
  "email": "mai@chunks.vn",
  "code": "MAI2026",
  "secretToken": "SEC-MAI-2026"
}
```

##### 5. `GET /api/admin/export`
- **Response:** Binary Stream `text/csv` with UTF-8 encoding BOM.

---

### 6.4 DTO / Data Masking Layer Implementation
```typescript
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] ? parts[0][0] + '**' : '***';
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1);
  if (middle.length > 0) {
    return `${first} ${middle.map(m => m[0] + '**').join(' ')} ${last}`;
  }
  return `${first} ${last[0]}**`;
}

export function maskPhone(phone: string): string {
  const clean = phone.trim();
  return clean.length >= 7 ? `${clean.slice(0, 3)}****${clean.slice(-3)}` : '***';
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}
```

---

## 7. Security, Validation & Edge Cases
- **Referral Code Fallback:** When missing or invalid, system routes to `PILOT100` general queue without breaking user flow.
- **Anti-Spam & Rate Limiting:** Honeypot field, 5 submissions per IP per hour, local storage submission throttle.
- **PII Protection:** Strict Firestore Security Rules ensuring candidate contact data cannot be read by public visitors.
