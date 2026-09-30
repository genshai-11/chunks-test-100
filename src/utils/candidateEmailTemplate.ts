/**
 * Candidate Booking Confirmation Email Template
 * CHUNKS Test 100 — 1-on-1 Pilot Assessment
 */

export interface CandidateEmailData {
  candidateId: string;
  fullName: string;
  phone: string;
  email: string;
  testType: 'green' | 'red';
  testLevel?: 'easy' | 'hard';
  preferredSlots: string;
  chunkerCode?: string;
  chunkerName?: string;
  createdAt?: string;
}

import { escapeHtml } from './escapeHtml';
export function generateCandidateEmailContent(data: CandidateEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const isGreen = data.testType === 'green';
  const isHard = data.testLevel === 'hard';

  const testTypeName = isGreen ? 'Green Focus Test (%c)' : 'Red Improvisation Test (%r)';
  const testTypeDesc = isGreen
    ? 'Đánh giá năng lực tập trung nhận thức, chuẩn hóa trường âm và phản xạ âm thanh MSE (Motion - Sound - Emotion), nhận diện và triệt tiêu lỗi phát âm thói quen.'
    : 'Đánh giá năng lực ứng biến thời gian thực dưới ma sát nhận thức cao độ, phản xạ linh hoạt không kịch bản chuẩn bị trước, thích ứng với tình huống bất ngờ.';

  const testLevelName = isHard ? 'Khó (Advanced / Áp lực cao)' : 'Dễ (Foundation / Tiêu chuẩn)';
  const testLevelDesc = isHard
    ? 'Level Khó: Tốc độ phản xạ dồn dập, bẻ lái logic bất ngờ từ Chunker-in-Charge (CiC). Không cho phép dựa vào tài liệu chuẩn bị sẵn nhằm kiểm tra giới hạn phản xạ thực tế.'
    : 'Level Dễ: Nhịp độ tiêu chuẩn, làm quen phương pháp MSE, đánh giá phản xạ ngôn ngữ ở vạch xuất phát nhận thức trước khi nâng cấp.';

  const testBadgeBg = isGreen ? '#ecfdf5' : '#fff1f2';
  const testBadgeColor = isGreen ? '#047857' : '#be123c';
  const testBadgeBorder = isGreen ? '#a7f3d0' : '#fecdd3';

  const levelBadgeBg = isHard ? '#fff1f2' : '#eff6ff';
  const levelBadgeColor = isHard ? '#be123c' : '#1d4ed8';
  const levelBadgeBorder = isHard ? '#fecdd3' : '#bfdbfe';

  const subject = `[CHUNKS Test 100] Xác Nhận Đăng Ký Đánh Giá 1-on-1: ${data.fullName} — ${testTypeName} (${isHard ? 'Level Khó' : 'Level Dễ'})`;

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0a0a0a; line-height: 1.6;">
  <div style="max-width: 620px; margin: 32px auto; background: #ffffff; border: 1px solid rgba(10, 10, 10, 0.12); box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
    
    <!-- Top Accent Bar -->
    <div style="height: 4px; background: #c81e16; width: 100%;"></div>

    <!-- Header Section -->
    <div style="padding: 32px 32px 24px 32px; border-bottom: 1px solid rgba(10, 10, 10, 0.1);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; color: #c81e16;">
          CHUNKS TEST 100 · MSE THEORY
        </span>
        <span style="font-size: 11px; font-family: monospace; color: #666; background: #f4f4f5; padding: 3px 8px; border: 1px solid #e4e4e7;">
          ID: ${escapeHtml(data.candidateId)}
        </span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; color: #0a0a0a; margin: 0 0 8px 0; line-height: 1.3;">
        Xác Nhận Giữ Chỗ Đánh Giá 1-on-1 Thành Công
      </h1>
      <p style="font-size: 14px; color: #52525b; margin: 0;">
        Kính gửi <strong>${escapeHtml(data.fullName)}</strong>, yêu cầu tham gia đánh giá trực tiếp của bạn đã được ghi nhận trên hệ thống CHUNKS Test 100.
      </p>
    </div>

    <!-- Booking Highlights Box -->
    <div style="padding: 24px 32px; background: #fafafa; border-bottom: 1px solid rgba(10, 10, 10, 0.1);">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #71717a; margin-bottom: 16px;">
        CHI TIẾT ĐĂNG KÝ CỦA BẠN
      </div>

      <!-- Test Type Row -->
      <div style="margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dashed #e4e4e7;">
        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
          Bài test đã chọn (Assessment Type):
        </div>
        <div style="display: inline-block; padding: 4px 10px; background: ${testBadgeBg}; border: 1px solid ${testBadgeBorder}; color: ${testBadgeColor}; font-weight: 700; font-size: 13px; margin-bottom: 6px;">
          ${testTypeName}
        </div>
        <div style="font-size: 12.5px; color: #3f3f46; line-height: 1.5;">
          ${testTypeDesc}
        </div>
      </div>

      <!-- Test Level Row -->
      <div style="margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dashed #e4e4e7;">
        <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
          Level muốn test (Difficulty Level):
        </div>
        <div style="display: inline-block; padding: 4px 10px; background: ${levelBadgeBg}; border: 1px solid ${levelBadgeBorder}; color: ${levelBadgeColor}; font-weight: 700; font-size: 13px; margin-bottom: 6px;">
          ${testLevelName}
        </div>
        <div style="font-size: 12.5px; color: #3f3f46; line-height: 1.5;">
          ${testLevelDesc}
        </div>
      </div>

      <!-- Preferred Slot & Contact -->
      <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 13px;">
        <div>
          <span style="color: #71717a;">Khung giờ ưu tiên:</span>
          <strong style="color: #0a0a0a; margin-left: 6px;">${escapeHtml(data.preferredSlots)}</strong>
        </div>
        <div>
          <span style="color: #71717a;">Số điện thoại:</span>
          <strong style="color: #0a0a0a; margin-left: 6px;">${escapeHtml(data.phone)}</strong>
        </div>
        <div>
          <span style="color: #71717a;">Email đăng ký:</span>
          <strong style="color: #0a0a0a; margin-left: 6px;">${escapeHtml(data.email)}</strong>
        </div>
        ${
          data.chunkerCode && data.chunkerCode !== 'DIRECT' && data.chunkerCode !== 'PILOT100'
            ? `<div>
                <span style="color: #71717a;">Mã mời (Referral):</span>
                <strong style="color: #c81e16; margin-left: 6px;">${escapeHtml(data.chunkerCode)} ${data.chunkerName ? `(${escapeHtml(data.chunkerName)})` : ''}</strong>
              </div>`
            : `<div>
                <span style="color: #71717a;">Hình thức:</span>
                <strong style="color: #0a0a0a; margin-left: 6px;">Đăng ký trực tiếp (Direct Pilot)</strong>
              </div>`
        }
      </div>
    </div>

    <!-- Preparation Checklist -->
    <div style="padding: 24px 32px; border-bottom: 1px solid rgba(10, 10, 10, 0.1);">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #c81e16; margin-bottom: 12px;">
        HƯỚNG DẪN CHUẨN BỊ CHO BUỔI ĐÁNH GIÁ 1-ON-1
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #27272a; line-height: 1.7;">
        <li style="margin-bottom: 8px;">
          <strong>Không cần học vẹt hay chuẩn bị trước kịch bản:</strong> Buổi test áp dụng lý thuyết MSE để đo lường phản xạ tư duy trực tiếp và mức độ tự nhiên của giọng nói. Việc học thuộc lòng mẫu câu sẽ phản tác dụng.
        </li>
        <li style="margin-bottom: 8px;">
          <strong>Thiết bị & Đường truyền:</strong> Ưu tiên sử dụng máy tính có microphone rõ ràng hoặc tai nghe chuyên dụng. Đảm bảo đường truyền Internet ổn định trong suốt 45 phút.
        </li>
        <li style="margin-bottom: 8px;">
          <strong>Không gian yên tĩnh:</strong> Chọn không gian riêng tư, hạn chế tiếng ồn xung quanh để chuyên viên CiC (Chunker-in-Charge) có thể đo đạc trường âm thanh chuẩn xác nhất.
        </li>
        <li>
          <strong>Liên hệ xác nhận:</strong> Bộ phận điều phối sẽ chủ động gọi điện hoặc nhắn tin Zalo tới số <strong>${escapeHtml(data.phone)}</strong> của bạn trước buổi đánh giá để chốt giờ chính xác và gửi link phòng họp bảo mật.
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="padding: 24px 32px; background: #ffffff; text-align: center; font-size: 12px; color: #71717a; line-height: 1.5;">
      <p style="margin: 0 0 6px 0;">
        CHUNKS Test 100 — Nghiên cứu & Đánh giá năng lực ngôn ngữ theo phương pháp MSE.
      </p>
      <p style="margin: 0; font-family: monospace; font-size: 11px; color: #a1a1aa;">
        Email này được gửi tự động từ hệ thống Firebase Cloud Functions Trigger. Vui lòng không trả lời trực tiếp email này.
      </p>
    </div>

  </div>
</body>
</html>`;

  const text = `
CHUNKS TEST 100 — XÁC NHẬN ĐĂNG KÝ ĐÁNH GIÁ 1-ON-1
===================================================
Mã đăng ký: ${data.candidateId}
Kính gửi: ${data.fullName}

Yêu cầu tham gia đánh giá 1-on-1 của bạn đã được ghi nhận thành công trên hệ thống CHUNKS Test 100.

CHI TIẾT ĐĂNG KÝ:
------------------
- Họ và tên: ${data.fullName}
- Số điện thoại: ${data.phone}
- Email: ${data.email}
- Bài test đã chọn: ${testTypeName}
  (${testTypeDesc})
- Level muốn test: ${testLevelName}
  (${testLevelDesc})
- Khung giờ ưu tiên: ${data.preferredSlots}
- Mã giới thiệu: ${data.chunkerCode || 'PILOT100'}

HƯỚNG DẪN CHUẨN BỊ:
-------------------
1. Không cần chuẩn bị kịch bản hay học vẹt mẫu câu. Bài test đo lường phản xạ MSE trực tiếp trong thời gian thực.
2. Sử dụng tai nghe có microphone rõ nét và kết nối mạng ổn định.
3. Giữ không gian yên tĩnh trong suốt 45 phút đánh giá.
4. Chuyên viên CiC (Chunker-in-Charge) sẽ liên hệ qua điện thoại/Zalo để thống nhất lịch cụ thể và gửi link phòng họp.

Trân trọng,
Hệ thống Đánh giá CHUNKS Test 100
`;

  return { subject, html, text };
}
