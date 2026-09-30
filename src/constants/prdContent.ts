export interface PrdSection {
  id: string;
  number: string;
  title: string;
  badge?: string;
  summary: string;
  contentMarkdown: string;
}

export const PRD_SECTIONS: PrdSection[] = [
  {
    id: 'executive-summary',
    number: '01',
    title: 'Executive Summary & Pilot Success Metrics',
    badge: 'Strategic Context',
    summary: 'High-level campaign charter, theoretical foundation (MN107.v2.1), and concrete KPIs for the 100-tester pilot.',
    contentMarkdown: `### 1.1 Program Mission & Context
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
| **Advocacy Quality** | Chunker Participation Rate | **>= 75%** of active Chunkers driving >= 2 candidates | Chunker referral leaderboard distribution |`
  },
  {
    id: 'feature-specifications',
    number: '02',
    title: 'Detailed Feature Specifications & User Stories',
    badge: 'BDD Acceptance Criteria',
    summary: 'Given-When-Then behavioral specifications for Candidates, Referrers (Chunkers), and Operations Admins.',
    contentMarkdown: `### 2.1 Epic: Candidate Booking & Referral Ingestion

#### User Story 2.1.1: Referral Code Resolution & Personalized Ingestion
*As an invited prospective candidate,*
*I want to see who invited me as soon as I arrive at the booking page,*
*So that I feel trust, recognized community belonging, and immediate clarity.*

\`\`\`gherkin
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
\`\`\`

#### User Story 2.1.2: Form-First Frictionless Registration
*As a candidate,*
*I want to complete my assessment preference in under 60 seconds,*
*So that I do not abandon the registration process.*

\`\`\`gherkin
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
\`\`\`

#### User Story 2.1.3: Interactive Assessment Deep-Dive Modals
*As an undecided candidate,*
*I want to read the precise difference between Green Test (%c) and Red Test (%r),*
*So that I choose the diagnostic that best exposes my communicative bottlenecks.*

\`\`\`gherkin
Scenario: Expanding Green Test details
  Given the candidate views the Test Selection cards
  When they click "[Đọc chi tiết về Green Test] / [Read Green Test Details]"
  Then an interactive modal opens displaying:
    - 45 minutes duration with 1-on-1 CiC format
    - 49 challenges across 7 progressive calibration levels
    - Explanation of %RFC (Requests Forgotten Coefficient) and anti-habitual error elimination
    - Core Question: "Can you preserve a given idea and its grammatical structure under anti-habitual pressure?"
\`\`\`

---

### 2.2 Epic: Chunker Referral Management & Operations

#### User Story 2.2.1: Chunker Link Generation & Sharing Hub
*As an active Chunker,*
*I want a 1-click shareable link with QR code and pre-composed invite message,*
*So that I can smoothly invite my colleagues without manual explanation.*

\`\`\`gherkin
Scenario: Copying personal referral link
  Given Chunker "Mai Anh" with code "MAIANH26" accesses the Chunker Hub
  When she clicks "Copy Link"
  Then the clipboard receives "https://chunks.edu.vn/?ref=MAIANH26"
  And a toast confirms "Referral link copied to clipboard!"
  And she can preview a pre-written bilingual message for Zalo, LinkedIn, and Messenger.
\`\`\`

---

### 2.3 Epic: Admin Operations, Analytics & Logistics

#### User Story 2.3.1: 100-Candidate Target & Split Analytics
*As an Operations Lead,*
*I want a live dashboard tracking total registrations against the 100 limit and Green/Red ratio,*
*So that our team can proactively allocate CiC examiner shifts.*

\`\`\`gherkin
Scenario: Viewing live campaign metrics
  Given 42 valid candidate registrations have been submitted
  When the admin navigates to the Admin Operations Panel
  Then the Target Progress Bar shows "42 / 100 (42%)"
  And the test split shows visual proportions (e.g., 23 Green : 19 Red)
  And the Chunker Leaderboard highlights top referrers by candidate volume.
\`\`\`

#### User Story 2.3.2: Candidate Status Workflow & Export to CSV
*As an Operations Coordinator,*
*I want to update candidate statuses and export scheduling sheets to CSV,*
*So that our logistics team can coordinate calendars in Google Sheets / Zalo.*

\`\`\`gherkin
Scenario: Updating status and exporting data
  Given a candidate "Hoàng Bảo Long" in status "new"
  When the admin calls the candidate and updates status to "scheduled" with notes "Thu 19:30"
  Then the status instantly reflects in the database
  And when clicking "Export CSV", a sanitized UTF-8 file containing all candidate contact and slot preferences downloads immediately.
\`\`\` `
  },
  {
    id: 'copywriting-guide',
    number: '03',
    title: 'Exact Copywriting & Content Guide (Bilingual VI/EN)',
    badge: 'Conversion Copy',
    summary: 'Exact production copy for Hero banners, form fields, radio cards, and detailed modal explanations.',
    contentMarkdown: `### 3.1 Hero & Navigation Copy
| Element | Tiếng Việt (VI) | English (EN) |
|---|---|---|
| **Brand Title** | **CHUNKS Test 100** — Kỳ khảo sát Năng lực Tỉnh thức | **CHUNKS Test 100** — Conscious Performance Pilot |
| **Referral Banner** | *"Bạn nhận được thư mời trực tiếp từ **{chunker_name}** để tham gia buổi kiểm tra 1-on-1 độc quyền cùng Chunker-in-Charge."* | *"You have been personally invited by **{chunker_name}** to take the exclusive 1-on-1 CHUNKS Assessment."* |
| **Hero Headline** | **Đo lường năng lực nói tiếng Anh dưới áp lực tâm lý thực tế.** | **Measure spoken English under real-time psychological pressure.** |
| **Hero Subtitle** | Không phải bài thi trắc nghiệm ngữ pháp. Đây là 45 phút đối thoại trực diện 1-1 theo lý thuyết CHUNKS MN107.v2.1 để bóc tách phản xạ ngôn ngữ vô thức qua Motion, Sound, Emotion. | Not a generic grammar quiz. A 45-minute live 1-on-1 diagnostic based on CHUNKS Theory MN107.v2.1 to expose subconscious speech reflexes via Motion, Sound, and Emotion. |
| **Quota Pill** | Giới hạn duy nhất 100 ứng viên qua mã giới thiệu | Strictly limited to 100 invite-only registrations |

---

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
| **Occupation Placeholder** | Ví dụ: Kỹ sư phần mềm, Quản lý sản phẩm | e.g. Software Architect, Product Lead |
| **Time Slot Label** | Khung giờ phỏng vấn ưu tiên * | Preferred 45-Min Interview Window * |
| **Time Slot Hint** | Đội ngũ CiC sẽ liên hệ điều phối lịch chính xác trong khung giờ bạn chọn. | Operations will confirm your exact slot within your selected time window. |
| **Submit Button** | **Xác nhận Giữ chỗ Đánh giá (45 Phút) →** | **Confirm Assessment Reservation (45 Min) →** |
| **Privacy Guarantee** | Dữ liệu cá nhân chỉ dùng cho điều phối lịch thi 1-1, tuân thủ bảo mật tuyệt đối. | Personal information is strictly used for 1-on-1 coordination and privacy-guaranteed. |

---

### 3.3 Test Selection Radio Cards & Deep-Dive Modals

#### Card A: Green Test (Focus Test - %c)
- **Tag:** \`TẬP TRUNG & PHẢN QUÁN TÍNH / FOCUS & ANTI-HABIT\`
- **Core Summary (VI):** "45 phút | 49 thử thách | 7 cấp độ. Kiểm tra năng lực duy trì hiện diện, không trôi ý niệm và triệt tiêu lỗi phát âm/ngữ pháp thói quen ngay sau 1 lần nhắc nhở."
- **Core Summary (EN):** "45 mins | 49 challenges | 7 progressive levels. Measures conscious presence, idea preservation, and zero-lapse elimination of habitual speech errors after 1 correction."
- **Expandable Trigger:** \`[Đọc chi tiết về Green Test] / [Read Green Test Details]\`
- **Core Question Highlight:** 
  > *"Liệu bạn có thể bảo toàn một ý niệm và cấu trúc ngữ pháp dưới áp lực phản-thói-quen? Bạn có thể ở lại trọn vẹn với yêu cầu?"*
  > *"Can you preserve a given idea and its grammatical structure under anti-habitual pressure? Can you stay with the request?"*

#### Card B: Red Test (Improvisation Test - %r)
- **Tag:** \`ỨNG BIẾN & BẺ LÁI LOGIC / IMPROV & LOGIC REDIRECTION\`
- **Core Summary (VI):** "45 phút | 49 thử thách | 7 cấp độ. Kiểm tra năng lực bẻ lái ý niệm tức thời trước các gợi ý từ vựng ngẫu nhiên mà vẫn giữ tính mạch lạc chặt chẽ."
- **Core Summary (EN):** "45 mins | 49 challenges | 7 progressive levels. Assesses real-time cognitive redirection under sudden, random linguistic hints while preserving sequential narrative logic."
- **Expandable Trigger:** \`[Đọc chi tiết về Red Test] / [Read Red Test Details]\`
- **Core Question Highlight:**
  > *"Bạn có thể lập tức chuyển hướng dòng suy nghĩ khi nhận gợi ý ngôn ngữ bất ngờ mà câu chuyện vẫn hoàn toàn hợp lý?"*
  > *"Can you instantly redirect your idea under random logic hints while remaining coherent?"*

---

### 3.4 Success State Copy
- **Headline (VI):** 🎉 Đăng ký Giữ chỗ Thành công! (Mã hồ sơ: #{candidate_id})
- **Headline (EN):** 🎉 Assessment Registration Confirmed! (Candidate ID: #{candidate_id})
- **Instruction Step 1:** Chuyên viên Điều phối CHUNKS sẽ liên hệ qua Số điện thoại / Zalo trong vòng **24 giờ làm việc** để chốt lịch cụ thể.
- **Instruction Step 2:** Buổi đánh giá diễn ra trên Google Meet / Zoom chất lượng cao, yêu cầu ứng viên bật Camera, sử dụng tai nghe có mic và chuẩn bị không gian yên tĩnh.
- **Instruction Step 3:** Nguyên lý MSE (Motion, Sound, Emotion) yêu cầu trạng thái năng lượng mở. Hãy nghỉ ngơi đầy đủ trước giờ thi.`
  },
  {
    id: 'architecture-and-wireframes',
    number: '04',
    title: 'Information Architecture & UI/UX Wireframe Guidelines',
    badge: 'UX Design Blueprint',
    summary: 'Component breakdown, mobile-first responsive grid, drawer/modal interactions, and operational layouts.',
    contentMarkdown: `### 4.1 Global Information Architecture (IA)
\`\`\`
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
│   ├── Pre-composed Social/Zalo Share Message Templates
│   └── Personal Referral Counter & Candidate Status Tracker
│
├── Admin Operations & Tracking Portal (Google Auth Protected)
│   ├── Campaign Milestone Gauge (100 Target Tracker)
│   ├── Test Split Chart (Green %c vs. Red %r)
│   ├── Chunker Performance Leaderboard
│   ├── Chunker Management Panel (Create, Deactivate, Copy Link)
│   └── Candidate Data Table:
│       ├── Multi-filter: Status, Test Type, Referring Chunker
│       ├── Real-time Search by Name / Phone / Email
│       ├── Inline Status Workflow Editor (New -> Contacted -> Scheduled -> Completed -> No-Show)
│       ├── Examiner Notes Drawer
│       └── UTF-8 CSV Export Engine
│
└── In-App PRD & Technical Spec Viewer
    ├── Interactive 7-Section Document Navigator
    ├── Code / Schema Copy Buttons
    └── Export Complete Spec to Markdown (.md)
\`\`\`

### 4.2 UI/UX Wireframe Guidelines

#### Candidate Viewport (Mobile-First 375px & Desktop 1280px)
1. **Immediate Form Accessibility:** In mobile view, the candidate sees the referral banner and the first input fields *above the fold* without having to scroll past giant hero graphics.
2. **Visual Hierarchy of Radio Cards:** 
   - Green Test Card uses subtle emerald borders (\`emerald-500/20\`), emerald badge, and clear emphasis on "Sự Tập trung / Focus".
   - Red Test Card uses subtle rose/crimson borders (\`rose-500/20\`), rose badge, and emphasis on "Bẻ lái Logic / Improv".
   - Active selection provides a 2px highlight border with glowing indicator ring.
3. **Modal & Drawer Interaction Specification:**
   - Clicking \`[Đọc chi tiết]\` opens an overlay with backdrop blur (\`backdrop-blur-md\`).
   - Content includes a 7-level progressive timeline showing how challenges ramp up from Level 1 Calibration to Level 7 Master Run.
   - Smooth keyboard ESC and touch swipe-down dismiss behavior.

#### Admin Operations Layout
- **High Information Density:** Compact data tables with sticky headers, colored status badges (\`New: Blue\`, \`Contacted: Amber\`, \`Scheduled: Purple\`, \`Completed: Emerald\`, \`No-Show: Gray\`).
- **One-Click Quick Actions:** Direct click on phone number invokes \`tel:\` or opens Zalo web chat; direct click on Chunker code filters candidate table.`
  },
  {
    id: 'database-schemas',
    number: '05',
    title: 'Database Schema & Data Models',
    badge: 'Prisma & Firestore Schemas',
    summary: 'Full production relational schema (Prisma/PostgreSQL) and NoSQL Document schema (Firestore) with constraints and indexes.',
    contentMarkdown: `### 5.1 Relational Schema: Prisma ORM / PostgreSQL
\`\`\`prisma
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
\`\`\`

---

### 5.2 Document Schema: Google Cloud Firestore
\`\`\`json
{
  "/admins/{adminId}": {
    "email": "lucy2511kh@gmail.com",
    "role": "super_admin",
    "createdAt": "2026-09-29T19:00:00Z"
  },
  "/chunkers/{chunkerId}": {
    "name": "Tùng Lê (CiC Lead)",
    "code": "TUNG2026",
    "email": "tung.le@chunks.edu.vn",
    "active": true,
    "referralCount": 18,
    "createdAt": "2026-09-01T08:00:00Z"
  },
  "/candidates/{candidateId}": {
    "fullName": "Hoàng Bảo Long",
    "phone": "0903124567",
    "email": "baolong.hoang@techcorp.io",
    "ageRange": "25-34",
    "occupation": "Senior Product Manager",
    "testType": "green",
    "preferredSlots": "Weekday Evening (19:00 - 21:00)",
    "chunkerCode": "TUNG2026",
    "chunkerName": "Tùng Lê (CiC Lead)",
    "status": "new",
    "notes": "",
    "createdAt": "ServerTimestamp()",
    "updatedAt": "ServerTimestamp()"
  }
}
\`\`\` `
  },
  {
    id: 'technical-architecture',
    number: '06',
    title: 'Technical Architecture, RBAC Matrix & API Specifications',
    badge: 'Full-Stack Specs',
    summary: 'Next.js / Express Architecture, Access Control Matrix (RBAC), Data Masking Layer, and End-to-End API Specifications.',
    contentMarkdown: `### 6.1 Access Control Matrix (Role-Based View Permission)

| Data Field / Resource | Candidate (Public) | Chunker (Referrer) | Admin |
| :--- | :---: | :---: | :---: |
| **Chunker Name (for greeting)** | ✅ (Only the inviter) | ✅ (Own name) | ✅ (All) |
| **Referral Code validation** | ✅ (\`isValid: true/false\`) | ✅ (Own code) | ✅ (All) |
| **Registration Form Submission** | ✅ (Write only) | ❌ | ✅ |
| **Success Confirmation Receipt** | ✅ (Own submission only) | ❌ | ✅ |
| **Personal Referral Count** | ❌ | ✅ (e.g. "You invited 4") | ✅ (All Chunkers) |
| **Candidate List (Masked)** | ❌ | ⚠️ Optional (\`Nguy** A\`) | ✅ (Full Name) |
| **Candidate Phone / Email (PII)** | ❌ | ❌ **FORBIDDEN** | ✅ (Full PII) |
| **Global Metrics (Target 100, %)** | ❌ | ❌ | ✅ (Full Dashboard) |
| **CSV / Excel Export** | ❌ | ❌ | ✅ |

---

### 6.2 Architectural Topology & Route Isolation
\`\`\`
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
\`\`\`

---

### 6.3 Detailed End-to-End API Specifications

#### [GROUP A: Public / Candidate APIs]

##### 1. \`GET /api/public/referral?code={code}\`
- **Purpose:** Validate code when Candidate opens \`/?ref={code}\` to show greeting banner.
- **Auth:** None (Public)
- **Response (200 OK):**
\`\`\`json
{
  "valid": true,
  "chunkerName": "Hoàng Nam",
  "referralCode": "NAM2026"
}
\`\`\`
*(Strict Rule: NEVER expose chunker email, phone, ID, or how many people they have invited).*

##### 2. \`POST /api/public/candidates/register\`
- **Purpose:** Submit registration form.
- **Auth:** None (Public + Rate-limited by IP)
- **Request Body:**
\`\`\`json
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
\`\`\`
- **Response (201 Created):**
\`\`\`json
{
  "success": true,
  "registrationId": "cand_xyz789",
  "message": "Đăng ký thành công! Đội ngũ Chunks sẽ liên hệ qua Zalo/SĐT để xếp lịch."
}
\`\`\`
*(Strict Rule: Response returns ONLY an acknowledgment. Never return list of previous submissions or current target counts).*

---

#### [GROUP B: Chunker Scoped APIs]

##### \`GET /api/chunker/stats?code={code}&token={secret_token}\`
- **Purpose:** Chunker views their own referral stats without a full account login.
- **Auth:** Scoped Token (or secure hash assigned to that Chunker).
- **Response (200 OK):**
\`\`\`json
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
\`\`\`
*(Strict Rule: Phone numbers and emails MUST be masked or completely omitted. No access to other Chunkers).*

---

#### [GROUP C: Protected Admin APIs]
*(All endpoints protected by Server-Side Session check: Google OAuth + Whitelist Email Array)*

##### 1. \`GET /api/admin/metrics\`
- **Response (200 OK):**
\`\`\`json
{
  "target": 100,
  "totalRegistered": 68,
  "greenCount": 40,
  "redCount": 28,
  "topChunkers": [
    { "name": "Tùng Lê", "code": "TUNG2026", "referralCount": 18 }
  ]
}
\`\`\`

##### 2. \`GET /api/admin/candidates?page=1&limit=20&testType=ALL&status=ALL&search=\`
- **Response (200 OK):** Full raw candidate objects including raw Phone, Email, Referral Chunker details, and Status.

##### 3. \`PATCH /api/admin/candidates/:id/status\`
- **Request Body:**
\`\`\`json
{
  "status": "SCHEDULED",
  "notes": "Confirmed for Thursday 19:30 with CiC Tùng"
}
\`\`\`

##### 4. \`POST /api/admin/chunkers\`
- **Request Body:**
\`\`\`json
{
  "fullName": "Lê Mai",
  "email": "mai@chunks.vn",
  "code": "MAI2026",
  "secretToken": "SEC-MAI-2026"
}
\`\`\`

##### 5. \`GET /api/admin/export\`
- **Response:** Binary Stream \`text/csv\` with UTF-8 encoding BOM.

---

### 6.4 DTO / Data Masking Layer Implementation
\`\`\`typescript
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\\s+/);
  if (parts.length <= 1) return parts[0] ? parts[0][0] + '**' : '***';
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1);
  if (middle.length > 0) {
    return \`\${first} \${middle.map(m => m[0] + '**').join(' ')} \${last}\`;
  }
  return \`\${first} \${last[0]}**\`;
}

export function maskPhone(phone: string): string {
  const clean = phone.trim();
  return clean.length >= 7 ? \`\${clean.slice(0, 3)}****\${clean.slice(-3)}\` : '***';
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return \`\${local[0]}***@\${domain}\`;
}
\`\`\` `
  },
  {
    id: 'security-and-edge-cases',
    number: '07',
    title: 'Security, Validation & Edge Cases',
    badge: 'Hardening & Edge Cases',
    summary: 'Referral fallback logic, duplicate prevention, rate limiting, and PII protection.',
    contentMarkdown: `### 7.1 Fallback Handling for Referral Codes
| Scenario | Detection Trigger | Fallback Protocol |
|---|---|---|
| **Missing \`ref\` parameter** | URL is \`/\` with no query string | Display banner: *"Thư mời Thử nghiệm Độc quyền / Exclusive Pilot Invitation"*. Use default routing \`PILOT100\`. Allow candidate to optionally type their friend's code. |
| **Invalid / Inactive \`ref\` code** | Database lookup returns null or \`active: false\` | Display non-blocking notice: *"Mã giới thiệu không tồn tại hoặc đã hết hạn. Hồ sơ của bạn sẽ được chuyển vào danh sách chờ tiêu chuẩn."* |
| **Tampered / Malformed Code** | String with symbols or > 20 characters | Cleanse input to \`^[A-Z0-9_-]{3,20}$\` or fallback to \`PILOT100\`. |

---

### 7.2 Anti-Bot & Spam Prevention
1. **Honeypot Trap:** Hidden form field \`website_url\` invisible to human users via \`display: none; tabIndex: -1\`. If filled, the submission is silently dropped with a mock HTTP 200 to starve bot operators.
2. **Client-Side Anti-Spam Throttling:** 
   - LocalStorage stamp prevents multiple submissions from the same browser within 5 minutes.
   - Dynamic token generated on form focus and verified at submit time to prevent automated POST headless attacks.
3. **Volumetric Rate Limiting:**
   - 5 registrations per IP address per hour.
   - Max 2 duplicate phone number attempts within 30 days.

---

### 7.3 Data Privacy & PII Hardening
1. **Zero Public Reads on Candidate Database:** 
   - Enforced by Firestore Security Rules and backend API middleware.
   - Public users can ONLY write new candidate documents with strictly whitelisted keys. They can NEVER read or list candidates.
2. **Audit Logging:** Every status change by an admin logs the Admin UID, previous status, next status, and timestamp.
3. **Data Retention & Sanitization:** Phone numbers and emails are masked in demo exports; full unmasked data is strictly confined to authenticated CiC operations.`
  },
];
