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
  - Hero Headline: "Khi nói thật, bạn phản xạ ra sao?" with signature red punctuation marks (clamp 2.8rem to 4.8rem, leading-none, tracking-tight).
  - Lead Paragraph: "Một cuộc gặp trực tiếp để quan sát cách bạn duy trì sự chú ý, ứng biến và kết nối ý tưởng khi nói tiếng Anh. Mini-Test 21 câu, 15–20 phút, 1-on-1 cùng Chunker-in-Charge (CiC); không phải bài trắc nghiệm ngữ pháp."
  - Action Row:
    - Primary CTA: Pill-shaped solid red button (#C81E16 hover #FF3B30) "Đăng ký Mini-Test" with right chevron arrow and tactile micro-motion.
    - Secondary CTA: Outlined rounded pill button "Chunkee? Link & QR" with QR code icon.
  - Meta Stats Bar: Bottom border-t row with 3 tabular metrics separated by subtle vertical hairpins:
    - "21" câu ngắn
    - "15–20" phút trực tiếp
    - "100" lượt đăng ký đủ điều kiện tối đa

#### DARK SPECIMEN FEATURE BAND
- Full-width ink-black bar (#0A0A0A) with white uppercase monospace ticker chips separated by subtle vertical hairline borders:
  "CHUNKS TEST" | "BASED ON CHUNKS THEORY" | "03 / 21 CÂU NGẮN" | "04 / 1-ON-1 CÙNG CIC".

#### MAIN REGISTRATION & BOOKING FORM
- Intro Banner: Light container highlighting "CHUNKS TEST 100 · BUỔI KHẢO SÁT TRỰC TIẾP" with external link chips to "the-chunks.com" and "chunkstheory.com".
  - Headline: "Không cần học trước. Hãy đến và nói như bạn thường nói."
  - Option 2 Narrative Bridge:
    - "Để nói một câu tiếng Anh trôi chảy ngoài đời thực, tâm trí bạn phải điều phối ba việc cùng lúc: tập trung giữ mạch câu, ứng biến khi tình huống đổi hướng, và tin vào trực giác ngôn ngữ của mình."
    - "Nhưng khi áp lực tăng dần, mắt xích nào trong bạn sẽ bị đứt gãy trước?" (Crimson signal emphasis)
    - "Mini-Test 21 câu (15–20 phút) cùng Chunker-in-Charge không phải một kỳ thi. Đó là nơi bạn thả lỏng để tự nhìn thấy phản xạ thật của mình khi không còn kịch bản chuẩn bị sẵn."
- Centered Invitation / Referral Code Box:
  - Centered invitation card (max-w-xl mx-auto text-center flex flex-col items-center) with delicate crimson hairline border, soft background (#FFF5F2), top/left crimson accent stripe, centered badge "LỜI MỜI / 01", centered input field with monospace uppercase formatting, and reassurance subtext for the PILOT100 priority channel.
  - Official Invitation banner (when valid referral is present): Elegant personalized card with Chunkee name, ref code pill, and direct Chunkee link/QR provisioning button.
- 12-Column Form Layout:
  - Left Sidebar (col-span-4):
    - Subtitle: "BƯỚC 01 / ĐĂNG KÝ"
    - Heading: "Thông tin đăng ký."
    - Explanatory specifications list:
      - Thời lượng: 15 – 20 phút (Mini-Test 21 câu)
      - Hình thức: Trực tiếp (Offline) 1-on-1 tại CHUNKS
      - Bảo mật & Quyền riêng tư: Thông tin liên hệ được lưu trữ bảo mật trên máy chủ để đội ngũ được phân quyền điều phối buổi đánh giá và gửi xác nhận.
  - Right Form Panel (col-span-8):
    - Block 01 - Thông Tin Liên Lạc:
      - 2-column input grid: Họ và tên, Số điện thoại / Zalo, Email, Độ tuổi (<18, 18-24, 25-34, 35-44, 45+), Nghề nghiệp / Lĩnh vực.
    - Block 02 - Mức Độ Bài Test (Interactive Level Selection Cards):
      - Section header: "02. MỨC ĐỘ BÀI TEST (ĐỘ KHÓ)"
      - Two high-craft interactive cards with tactile radio checkmarks and Framer Motion hover/tap interactions:
        - Card A (`easy`): "Cơ bản (Dễ)" — "Nhịp độ tiêu chuẩn · Làm quen phản xạ tự nhiên cùng CiC." (Standard pace, baseline reflex observation note, active ring #C81E16 with #FFF5F2 background).
        - Card B (`hard`): "Nâng cao (Khó)" — "Nhịp độ dồn dập · Tăng ma sát phản xạ dưới áp lực cao." (Intensive pace, improvisation under pressure note, active ring #C81E16 with #FFF5F2 background).
      - Reassurance note: "💡 Chuyên viên CiC sẽ linh hoạt điều chỉnh theo nhịp nói và phản xạ thực tế của bạn."
    - Block 03 - Lịch Test Mong Muốn (Ghi Chú Dự Kiến):
      - Section header: "03. LỊCH TEST MONG MUỐN (GHI CHÚ DỰ KIẾN)"
      - Subtext: "Thời lượng 15 – 20 phút trực tiếp 1-on-1 cùng CiC. Vui lòng ghi chú ngày hoặc khung giờ bạn thuận tiện tham gia nhất, điều phối viên CHUNKS sẽ gọi điện hoặc nhắn Zalo để thống nhất lịch hẹn chính thức tại cơ sở."
      - Sleek textarea with placeholder: "Ví dụ: Tối thứ Bảy tuần này sau 19h, hoặc các buổi chiều trong tuần sau 17h..."
    - Submission Area:
      - Left: Legal consent disclaimer ("Bằng việc gửi thông tin, bạn đồng ý để điều phối viên CHUNKS liên hệ xếp lịch").
      - Right: Solid crimson pill button "Gửi yêu cầu tham gia" with tactile tap/hover micro-motion and inline loading spinner.

#### NUMBERED FAQ ACCORDION (SWISS SPECIMEN)
- Header: Split 12-col layout with uppercase eyebrow "CÂU HỎI THƯỜNG GẶP" and section heading "Câu hỏi thường gặp" (Frequently Asked Questions).
- Divider: Distinctive 1.5px black ink top rule.
- Default State: All question rows are collapsed by default.
- Accordion Rows (Numbered 01 to 07):
  - Column 1 (col-span-3): Monospace bold red numeral ("01", "02", ... "07").
  - Column 2 (col-span-8): Big readable question text (22px medium, leading-snug).
  - Column 3 (col-span-1): Minimal Swiss cross/plus glyph (+) rotating into minus (-) on click.
  - Expandable Body: Smooth grid expand with 16px light text answering key candidate questions (15-20 min duration, in-person format, MSE reflection focus, appointment confirmation via phone/Zalo, zero preparation required, PILOT100 priority list, and data privacy).

#### MSE METHOD SPECIMEN BAND (CTA BAND)
- Layout: 12-column Swiss grid with clean responsive padding.
- Headline: "Ba nền tảng phản xạ ngôn ngữ (MSE):" (crimson) and "Chuyển động · Âm thanh · Cảm xúc." (onyx) each on an unbroken line with fluid sizing (`clamp(20px, 2.8vw, 34px)`).
- Subtext: "CiC quan sát cách ba yếu tố phối hợp khi bạn trò chuyện. Buổi Mini-Test ghi nhận phản xạ ở thời điểm hiện tại; không cần chuẩn bị câu trả lời mẫu."
- 3 MSE Specimen Rows: 01 Chuyển động, 02 Âm thanh, 03 Cảm xúc with interactive hover micro-translation.
- Pill button: "Gửi yêu cầu tham gia" with smooth scale micro-interaction.

#### ANIMATED SWISS FOOTER
- Entrance: Framer Motion staggered animation on scroll (`whileInView`, `staggerChildren`).
- Top Banner: Bold display headline "Đừng đoán phản xạ. Hãy quan sát nó." with white rounded pill button "Tìm hiểu cách đăng ký".
- Navigation Grid (3 Columns):
  - Brand Block: Logo, bold wordmark "CHUNKS TEST 100", and clear mission summary.
  - Column 2: BÀI ĐÁNH GIÁ (Mini-Test 21 câu ngắn, Phương pháp MSE, FAQ) with interactive link hover motion (`hover:translate-x-1` and animated arrows).
  - Column 3: DÀNH CHO CHUNKEE (Lấy link & QR giới thiệu, the-chunks.com ↗, chunkstheory.com ↗) with interactive link hover motion.
- Bottom Bar:
  - Brand tagline: "CHUNKS TEST · Based on CHUNKS Theory" | "© 2026 CHUNKS. All rights reserved."
  - Modern interactive Back-to-Top pill button with upward arrow micro-motion (`whileHover={{ y: -2 }}`).
```
