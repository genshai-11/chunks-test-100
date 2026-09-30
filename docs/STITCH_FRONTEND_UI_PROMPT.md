# STITCH UI GENERATION & CUSTOMIZATION PROMPT: CHUNKS TEST 100

> **Target Tool**: Stitch (Google Stitch / AI UI Design Generator)  
> **Use Case**: Paste this exact prompt into Stitch to generate, inspect, or iterate on the full high-fidelity frontend interface for **CHUNKS Test 100**.

---

```text
Design a world-class, ultra-clean web application landing page and booking interface for "CHUNKS TEST 100" — an exclusive 1-on-1 speech reflex diagnostic assessment platform based on CHUNKS Theory.

### 1. DESIGN SYSTEM & VISUAL IDENTITY
- Aesthetic: Swiss International Typographic Style (Josef Müller-Brockmann inspired) fused with modern minimalist craftsmanship (Linear / Apple / Vercel elegance).
- Grid: Strict 12-column responsive layout with max-width 1180px, generous whitespace, mathematical alignment, and razor-sharp hairline borders (1px solid rgba(10, 10, 10, 0.14)).
- Typography:
  - Font Family: High-legibility sans-serif ('Inter', system-ui) with tabular figures for numbers ('tabular-nums').
  - Hierarchy: Giant bold display headlines with tight tracking (-0.03em), elegant medium subheadings, and crisp monospace uppercase micro-eyebrows with wide tracking (+0.22em).
- Color Palette:
  - Background: Crisp Pure White (#FFFFFF) with subtle Slate tints (#F8FAFC) for card containers.
  - Ink Typography: Deep Neutral Onyx (#0A0A0A) for headings, Slate Charcoal (#0A0A0A/65) for body copy.
  - Accent / Signal: Signature Ferrari Crimson (#C81E16 / #FF3B30) used deliberately for pulse dots, key emphasis, and primary conversion buttons.
  - Secondary Accent: Soft slate borders and clean minimal neutrals.
  - Dark Theme Contrast: Deep Obsidian (#0A0A0A) with dark glassmorphism for the bottom CTA band.

---

### 2. PAGE LAYOUT & SECTIONS (TOP-TO-BOTTOM)

#### HEADER (STICKY NAVBAR)
- Height: 82px, sticky at top with pure white semi-transparent background (bg-white/90 backdrop-blur-md) and subtle bottom hairline border.
- Left: Brand Lockup with an enlarged 72px x 72px red geometrical square logo, accompanied by the bold wordmark "CHUNKS" (21px bold) and small red uppercase tag "TEST 100" (10.5px tracking-[0.22em]).
- Center: Sleek floating segmented pill navigation with light gray background containing 3 tabs: "Đăng ký", "CHUNKS Theory", "FAQ".
- Right: 
  - Pill button: "Bạn là Chunkee? Lấy link & QR" with QR icon and delicate hairline border.
  - Language toggle: Minimalist pill with globe icon displaying "VI" / "EN".

#### HERO MASTHEAD (12-COLUMN SWISS SPLIT)
- Layout: 12-column grid with padding-top 80px and padding-bottom 60px.
- Left Column (col-span-3):
  - Micro-eyebrow in monospace bold uppercase: "CHUNKS TEST" / red text "· Based on CHUNKS Theory" with a live pulsating red beacon dot.
- Right Column (col-span-9):
  - Hero Headline: "Năng lực phản xạ, thử thách có ý thức." with signature red punctuation marks (clamp 2.8rem to 4.8rem, leading-none, tracking-tight).
  - Lead Paragraph: "Khám phá cách bạn duy trì sự chú ý hoặc ứng biến khi nói dưới áp lực qua Chuyển động, Âm thanh và Cảm xúc (MSE). Buổi đánh giá trực tiếp 1-on-1, 15 - 20 phút cùng Chunker-in-Charge. Chương trình thử nghiệm hướng tới 100 lượt đăng ký đủ điều kiện."
  - Action Row:
    - Primary CTA: Pill-shaped solid red button (#C81E16 hover #FF3B30) "Đăng ký đánh giá 1-on-1" with right chevron arrow.
    - Secondary CTA: Outlined rounded pill button "Dành cho Chunkee: Tự tạo link & mã QR" with QR code icon.
  - Meta Stats Bar: Bottom border-t row with 3 tabular metrics separated by subtle vertical hairpins:
    - "100" Mục Tiêu Đăng Ký
    - "15 – 20m" Mini-Test 21 Câu
    - "Offline" Đánh Giá Trực Tiếp

#### DARK SPECIMEN FEATURE BAND
- Full-width ink-black bar (#0A0A0A) with white uppercase monospace ticker chips separated by subtle vertical hairline borders:
  "CHUNKS TEST" | "BASED ON CHUNKS THEORY" | "1-ON-1 CIC TEST" | "21 CHALLENGES (MINI-TEST)" | "100-REGISTRATION TARGET".

#### MAIN REGISTRATION & BOOKING FORM
- Intro Banner: Light gray container highlighting "CHUNKS TEST 100 · KHẢO SÁT PHẢN XẠ NGÔN NGỮ (MSE)" with external link chips to "the-chunks.com" and "chunkstheory.com".
- 12-Column Form Layout:
  - Left Sidebar (col-span-4):
    - Subtitle: "BƯỚC 01 / ĐĂNG KÝ"
    - Heading: "Thông tin đăng ký."
    - Explanatory specifications list:
      - Định dạng: Mini-Test 21 câu ngắn toàn diện (15 – 20 phút)
      - Hình thức: Trực tiếp (Offline) 1-on-1 tại CHUNKS cùng Chunker-in-Charge (CiC)
      - Điều phối: Lịch hẹn chính thức được thống nhất qua điện thoại hoặc Zalo
      - Bảo mật: Thông tin cá nhân được mã hóa máy chủ, chỉ phục vụ duy nhất buổi đánh giá
  - Right Form Panel (col-span-8):
    - Block 01 - Thông Tin Liên Lạc:
      - 2-column input grid: Họ và tên, Số điện thoại / Zalo, Email, Độ tuổi (<18, 18-24, 25-34, 35-44, 45+), Nghề nghiệp / Lĩnh vực.
    - Block 02 - Mức Độ / Phân Loại Bài Test (Ultra-Minimal Select):
      - Section header: "02. MỨC ĐỘ BÀI TEST (ĐỘ KHÓ)"
      - Subtext: "Mặc định bài test là Mini-Test 21 câu ngắn phản xạ toàn diện (15 - 20 phút). Không phân loại Green hay Red, chỉ cần chọn mức độ bạn muốn thử sức:"
      - Ultra-minimal sleek `<select>` dropdown:
        - Option 1: "Cơ bản (Dễ) — Nhịp độ tiêu chuẩn, làm quen phản xạ tự nhiên"
        - Option 2: "Nâng cao (Khó) — Nhịp độ dồn dập, tăng ma sát phản xạ dưới áp lực"
      - Reassurance note: "💡 Chuyên viên CiC sẽ linh hoạt điều chỉnh theo nhịp nói và phản xạ thực tế của bạn."
    - Block 03 - Lịch Test Mong Muốn (Ghi Chú Dự Kiến):
      - Section header: "03. LỊCH TEST MONG MUỐN"
      - Subtext: "Thời lượng 15 – 20 phút trực tiếp 1-on-1 cùng CiC. Vui lòng ghi chú ngày hoặc khung giờ bạn thuận tiện tham gia nhất (Tắt chế độ chọn lịch giờ cứng — điều phối viên CHUNKS sẽ gọi điện hoặc nhắn Zalo để thống nhất lịch hẹn chính thức tại cơ sở)."
      - Sleek text input / textarea:
        - Placeholder: "Ví dụ: Tối thứ Bảy tuần này sau 19h, hoặc các buổi chiều trong tuần sau 17h..."
    - Submission Area:
      - Left: Legal consent disclaimer ("Bằng việc gửi thông tin, bạn đồng ý để điều phối viên CHUNKS liên hệ xếp lịch").
      - Right: Solid crimson pill button "Gửi đăng ký giữ chỗ".

#### NUMBERED FAQ ACCORDION (SWISS SPECIMEN)
- Header: Split 12-col layout with uppercase eyebrow "THÔNG TIN HỖ TRỢ" and general heading "Câu hỏi thường gặp" (Frequently Asked Questions).
- Divider: Distinctive 1.5px black ink top rule.
- Default State: All question rows are collapsed by default (no question auto-opened on page load).
- Accordion Rows (Numbered 01 to 07):
  - Column 1 (col-span-3): Monospace bold red numeral ("01", "02", ... "07").
  - Column 2 (col-span-8): Big readable question text (22px medium, leading-snug).
  - Column 3 (col-span-1): Minimal Swiss cross/plus glyph (+) rotating into minus (-) on click.
  - Expandable Body: Smooth grid expand with 16px light text answering key candidate questions (15-20 min duration, in-person format, MSE reflection focus, appointment confirmation via phone/Zalo, zero preparation required, PILOT100 priority list, and data privacy).

#### DARK INVERTED CTA BAND
- Background: Deep Onyx #0A0A0A with white typography.
- Left (col-span-7):
  - Monospace red tag: "CHUNKS TEST · BASED ON CHUNKS THEORY".
  - Headline: "Ba nền tảng phản xạ ngôn ngữ: Tập Trung · Ứng Biến · Quan Sát (MSE)."
  - Copy: "Theo CHUNKS Theory: Ngôn ngữ thực tế là sự hợp nhất có ý thức giữa Chuyển động (Motion) – Âm thanh (Sound) – Cảm xúc (Emotion). Trải nghiệm trực tiếp qua bài Mini-Test 21 câu ngắn (15 – 20 phút) cùng Chunker-in-Charge để xác định vạch xuất phát phản xạ thực tế của bạn."
  - Outlined pill links with external icons to "the-chunks.com" and "chunkstheory.com".
- Right (col-span-5):
  - Frosted glassmorphism action card (border-white/15 bg-white/5 backdrop-blur-md) with badge "MINI-TEST 21 CÂU · 15 - 20 PHÚT", title "Đánh Giá Trực Tiếp Offline", and bright crimson rounded CTA button "Đăng ký Mini-Test 20p".

#### FOOTER
- Clean Swiss bottom lockup with brand name, copyright, terms, privacy, and subtle administrative links.
```
