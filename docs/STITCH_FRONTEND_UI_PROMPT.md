# STITCH UI GENERATION & CUSTOMIZATION PROMPT: CHUNKS TEST 100

> **Target Tool**: Stitch (Google Stitch / AI UI Design Generator)  
> **Use Case**: Paste this exact prompt into Stitch to generate, inspect, or iterate on the full high-fidelity frontend interface for **CHUNKS Test 100**.

---

```text
Design a world-class, ultra-clean web application landing page and booking interface for "CHUNKS TEST 100" — an exclusive 1-on-1 speech reflex diagnostic assessment platform based on CHUNKS Theory MN107.v2.1.

### 1. DESIGN SYSTEM & VISUAL IDENTITY
- Aesthetic: Swiss International Typographic Style (Josef Müller-Brockmann inspired) fused with modern minimalist SaaS craftsmanship (Linear / Apple / Vercel elegance).
- Grid: Strict 12-column responsive layout with max-width 1180px, generous whitespace, mathematical alignment, and razor-sharp hairline borders (1px solid rgba(10, 10, 10, 0.14)).
- Typography:
  - Font Family: High-legibility sans-serif ('Inter', system-ui) with tabular figures for numbers ('tabular-nums').
  - Hierarchy: Giant bold display headlines with tight tracking (-0.03em), elegant medium subheadings, and crisp monospace uppercase micro-eyebrows with wide tracking (+0.22em).
- Color Palette:
  - Background: Crisp Pure White (#FFFFFF) with subtle Slate tints (#F8FAFC) for card containers.
  - Ink Typography: Deep Neutral Onyx (#0A0A0A) for headings, Slate Charcoal (#0A0A0A/65) for body copy.
  - Accent / Signal: Signature Ferrari Crimson (#C81E16 / #FF3B30) used deliberately for pulse dots, key emphasis, and primary conversion buttons.
  - Secondary Accent: Emerald Green (#059669) for Focus (%c) indicators, Royal Blue (#2563EB) for Baseline badges.
  - Dark Theme Contrast: Deep Obsidian (#0A0A0A) with dark glassmorphism for the bottom CTA band.

---

### 2. PAGE LAYOUT & SECTIONS (TOP-TO-BOTTOM)

#### HEADER (STICKY NAVBAR)
- Height: 82px, sticky at top with pure white semi-transparent background (bg-white/90 backdrop-blur-md) and subtle bottom hairline border.
- Left: Brand Lockup with an enlarged 72px x 72px red geometrical square logo, accompanied by the bold wordmark "CHUNKS" (21px bold) and small red uppercase tag "TEST 100" (10.5px tracking-[0.22em]).
- Center: Sleek floating segmented pill navigation with light gray background containing 3 tabs: "Đăng ký", "Green & Red", "FAQ".
- Right: 
  - Pill button: "Bạn là Chunkee? Lấy link & QR" with QR icon and delicate hairline border.
  - Language toggle: Minimalist pill with globe icon displaying "VI" / "EN".

#### HERO MASTHEAD (12-COLUMN SWISS SPLIT)
- Layout: 12-column grid with padding-top 80px and padding-bottom 60px.
- Left Column (col-span-3):
  - Micro-eyebrow in monospace bold uppercase: "CHUNKS PILOT" / red text "/ MN107.V2.1" / "CONSCIOUS SPEECH REFLEX" with a live pulsating red beacon dot.
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
  "CHUNKS THEORY" | "1-ON-1 CIC TEST" | "MSE RESONANCE" | "21 CHALLENGES (MINI-TEST)" | "100-REGISTRATION TARGET".

#### MAIN REGISTRATION & BOOKING FORM
- Intro Banner: Light gray container highlighting "CHUNKS TEST 100 · KHẢO SÁT PHẢN XẠ NGÔN NGỮ (MSE)" with external link chips to "the-chunks.com" and "chunkstheory.com".
- 12-Column Form Layout:
  - Left Sidebar (col-span-4):
    - Subtitle: "BƯỚC 01 / ĐĂNG KÝ"
    - Heading: "Thông tin đăng ký."
    - Explanatory specifications list:
      - Thời lượng: 15 – 20 phút (Mini-test 21 câu ngắn)
      - Hình thức: Trực tiếp (Offline) 1-on-1 tại CHUNKS với Chunker-in-Charge (CiC)
      - Bảo mật: Thông tin cá nhân được mã hóa máy chủ, chỉ phục vụ buổi hẹn
  - Right Form Panel (col-span-8):
    - Block 01 - Thông Tin Liên Lạc:
      - 2-column input grid: Họ và tên, Số điện thoại / Zalo, Email, Độ tuổi (<18, 18-24, 25-34, 35-44, 45+), Nghề nghiệp / Lĩnh vực.
    - Block 02 - Định Hướng Phản Xạ Mong Muốn:
      - Subtext: "Mặc định bài test là Mini-Test 21 câu ngắn toàn diện (15 - 20 phút). Bạn có thể chọn trọng tâm muốn chuyên viên CiC lưu ý hơn:"
      - Card A (Focus %c): Emerald accent dot, title "Tập trung phản xạ (%c Focus)", badge "Offline · 15-20m", description: "Giữ vững câu từ, duy trì nhịp nói và bình tĩnh khi đối thoại trực tiếp."
      - Card B (Improv %r): Red accent dot, title "Ứng biến linh hoạt (%r Improv)", badge "Offline · 15-20m", description: "Khả năng xoay chuyển ý tưởng mượt mà, phản xạ tức thì với tình huống bất ngờ."
      - Reassurance footnote: "💡 Chuyên viên CiC sẽ linh hoạt điều chỉnh theo nhịp nói thực tế của bạn."
    - Block 02b - Level Muốn Test (Độ Khó):
      - Option A: "Cơ bản (Dễ)" with Blue badge — "Nhịp độ tiêu chuẩn, làm quen khảo sát MSE và đo phản xạ tự nhiên."
      - Option B: "Nâng cao (Khó)" with Red badge — "Nhịp độ dồn dập, tăng ma sát hội thoại và thử thách phản xạ dưới áp lực cao."
    - Block 03 - Chọn Ngày & Khung Giờ Đánh Giá:
      - Subtext: "Thời lượng 15 - 20 phút với Chunker-in-Charge (CiC). Lịch đã chọn là thời gian mong muốn dự kiến và được đồng bộ trực tiếp lên hệ thống Firestore."
      - Interactive Calendar component: Monthly grid with date selection (Monday-first, disabled past days).
      - Period Filter: Pills for "Tất cả", "Buổi sáng", "Buổi chiều", "Buổi tối (HOT)".
      - 20-minute Slot Grid: Compact selectable buttons: "09:00 - 09:20", "10:00 - 10:20", "14:00 - 14:20", "15:30 - 15:50", "16:30 - 16:50", "19:00 - 19:20", "19:40 - 20:00", "20:30 - 20:50".
      - Notes input: "Ghi chú thêm về lịch hẹn (Tùy chọn)".
    - Submission Area:
      - Left: Legal consent disclaimer ("Bằng việc gửi thông tin, bạn đồng ý để điều phối viên CHUNKS liên hệ xếp lịch").
      - Right: Solid crimson pill button "Gửi đăng ký giữ chỗ".

#### NUMBERED FAQ ACCORDION (SWISS SPECIMEN)
- Header: Split 12-col layout with uppercase eyebrow "CÂU HỎI THƯỜNG GẶP" and bold headline "Bảy câu hỏi về bài đánh giá 1-on-1 trước khi đăng ký."
- Divider: Distinctive 1.5px black ink top rule.
- 7 Accordion Rows (Numbered 01 to 07):
  - Column 1 (col-span-3): Monospace bold red numeral ("01", "02", ... "07").
  - Column 2 (col-span-8): Big readable question text (22px medium, leading-snug).
  - Column 3 (col-span-1): Minimal Swiss cross/plus glyph (+) rotating into minus (-) on open.
  - Expandable Body: Smooth grid expand with 16px light gray text answering the question concisely with generous line-height.

#### DARK INVERTED CTA BAND
- Background: Deep Onyx #0A0A0A with white typography.
- Left (col-span-7):
  - Monospace red tag: "CHUNKS PILOT · MN107.V2.1 / CONSCIOUS PERFORMANCE".
  - Headline: "Ba nền tảng phản xạ ngôn ngữ: Tập Trung · Ứng Biến · Quan Sát (MSE)."
  - Copy: Explains the MSE philosophy (Motion, Sound, Emotion) and in-person diagnostic value.
  - Outlined pill links with external icons to "the-chunks.com" and "chunkstheory.com".
- Right (col-span-5):
  - Frosted glassmorphism action card (border-white/15 bg-white/5 backdrop-blur-md) with badge "MINI-TEST 21 CÂU · 15 - 20 PHÚT", title "Đánh Giá Trực Tiếp Offline", and bright crimson rounded CTA button "Đăng ký Mini-Test 20p".

#### FOOTER
- Clean Swiss bottom lockup with brand name, copyright, terms, privacy, and subtle administrative links.
```
