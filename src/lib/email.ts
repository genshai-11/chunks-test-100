import { escapeHtml } from '../utils/escapeHtml';
import nodemailer from 'nodemailer';
import { Candidate } from '../types';

export interface EmailDispatchResult {
  success: boolean;
  status: 'accepted' | 'failed';
  messageId?: string;
  provider: 'resend' | 'smtp' | 'none';
  error?: string;
}

/**
 * Audit and verify available email provider configuration
 */
export function getEmailProviderStatus(): {
  configured: boolean;
  provider: 'resend' | 'smtp' | 'none';
  fromEmail: string;
  details: string;
} {
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (resendApiKey && process.env.RESEND_FROM_EMAIL) {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    return {
      configured: true,
      provider: 'resend',
      fromEmail: fromEmail!,
      details: 'Resend configured',
    };
  }

  if (smtpHost && smtpUser && smtpPass) {
    const rawFrom = process.env.NOTIFICATION_FROM_EMAIL || process.env.SMTP_FROM || smtpUser;
    const fromEmail = rawFrom.includes('<') ? rawFrom : `"CHUNKS Operations" <${rawFrom}>`;
    return {
      configured: true,
      provider: 'smtp',
      fromEmail,
      details: 'SMTP configured',
    };
  }

  return {
    configured: false,
    provider: 'none',
    fromEmail: 'none',
    details: 'Missing provider credentials or verified sender',
  };
}

/**
 * Dispatch raw email using Resend HTTP API or Nodemailer SMTP with detailed logging
 */
export async function sendEmail({
  to, subject, html, text, idempotencyKey,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
}): Promise<EmailDispatchResult> {
  const recipients = Array.isArray(to) ? to : [to];
  const status = getEmailProviderStatus();

  // 1. Resend API
  if (status.provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY!;
    const from = status.fromEmail;

    try {
      // Provider acceptance is not delivery; never log recipient PII or API secrets.
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject,
          html,
          text,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, status: 'failed', provider: 'resend', error: `Resend HTTP ${res.status}` };
      }
      return { success: true, status: 'accepted', provider: 'resend', messageId: data.id };
    } catch {
      return { success: false, status: 'failed', provider: 'resend', error: 'Resend request failed' };
    }
  }

  // 2. SMTP Transport
  if (status.provider === 'smtp') {
    try {
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // A relay Message-ID is not an exactly-once guarantee after a crash.
      const info = await transporter.sendMail({
        from: status.fromEmail,
        to: recipients,
        subject,
        html,
        text,
        ...(idempotencyKey ? { messageId: `<${idempotencyKey}@chunkstest.ai.studio>` } : {}),
      });

      return { success: true, status: 'accepted', provider: 'smtp', messageId: info.messageId };
    } catch {
      return { success: false, status: 'failed', provider: 'smtp', error: 'SMTP request failed' };
    }
  }

  // 3. Fallback: Missing Environment Variables
  return {
    success: false,
    status: 'failed',
    provider: 'none',
    error: 'Email provider not configured with a verified sender',
  };
}


/**
 * Sends immediate notification email to Admin team when a new candidate registers
 */
export async function sendAdminNewCandidateNotification(
  candidate: Candidate,
  adminEmails: string[],
  idempotencyKey?: string
): Promise<EmailDispatchResult> {
  if (!adminEmails || adminEmails.length === 0) {
    return { success: false, status: 'failed', provider: 'none', error: 'No admin emails configured' };
  }

  try {
    const testName =
      candidate.testType === 'green'
        ? 'Green Focus Test (%c)'
        : 'Red Improvisation Test (%r)';
    const levelName = candidate.testLevel === 'hard' ? 'Khó (Advanced)' : 'Dễ (Foundation)';

    const subject = `[CHUNKS Alert] Ứng viên mới đăng ký: ${candidate.fullName} — ${testName} (Level: ${levelName})`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; background: #ffffff;">
        <div style="font-size: 11px; font-weight: 700; color: #c81e16; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
          CHUNKS TEST 100 · HỆ THỐNG ĐIỀU PHỐI TỰ ĐỘNG
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0a0a0a; margin: 0 0 16px 0;">
          Có Ứng Viên Mới Đăng Ký Đánh Giá 1-on-1
        </h2>

        <div style="background: #fafafa; padding: 16px; border: 1px solid #f4f4f5; margin-bottom: 20px; font-size: 13.5px; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;"><strong>Họ và tên:</strong> ${escapeHtml(candidate.fullName)}</p>
          <p style="margin: 0 0 8px 0;"><strong>Số điện thoại:</strong> ${escapeHtml(candidate.phone)}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(candidate.email)}</p>
          <p style="margin: 0 0 8px 0;"><strong>Nghề nghiệp:</strong> ${escapeHtml(candidate.occupation)} (${escapeHtml(candidate.ageRange)})</p>
          <p style="margin: 0 0 8px 0;"><strong>Bài test:</strong> <span style="color: ${candidate.testType === 'green' ? '#047857' : '#c81e16'}; font-weight: 700;">${testName}</span> (Level: ${levelName})</p>
          <p style="margin: 0 0 8px 0;"><strong>Khung giờ chọn:</strong> <strong>${escapeHtml(candidate.preferredSlots)}</strong></p>
          <p style="margin: 0;"><strong>Mã giới thiệu:</strong> <span style="font-family: monospace; font-weight: 700;">${escapeHtml(candidate.chunkerCode)}</span> (${escapeHtml(candidate.chunkerName || 'Pilot allocation')})</p>
        </div>

        <p style="font-size: 13px; color: #52525b; margin: 0 0 16px 0;">
          Vui lòng đăng nhập vào trang Quản trị (Admin Portal) để xếp lịch cho Chunker-in-Charge (CiC) và liên hệ xác nhận phòng với ứng viên.
        </p>

        <div style="font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 12px; font-family: monospace;">
          Candidate ID: ${escapeHtml(candidate.id)} · Timestamp: ${escapeHtml(candidate.createdAt)}
        </div>
      </div>
    `;

    const text = `
[CHUNKS Alert] Ứng viên mới đăng ký đánh giá 1-on-1:
- Họ tên: ${candidate.fullName}
- SĐT: ${candidate.phone}
- Email: ${candidate.email}
- Nghề nghiệp: ${candidate.occupation} (${candidate.ageRange})
- Bài test: ${testName} (Level: ${levelName})
- Khung giờ: ${candidate.preferredSlots}
- Mã giới thiệu: ${candidate.chunkerCode} (${candidate.chunkerName || 'Direct Pilot'})
- Candidate ID: ${candidate.id}
    `.trim();

    return await sendEmail({
      to: adminEmails,
      subject,
      html,
      text,
      idempotencyKey,
    });
  } catch {
    return { success: false, status: 'failed', provider: 'none', error: 'Admin email composition failed' };
  }
}
