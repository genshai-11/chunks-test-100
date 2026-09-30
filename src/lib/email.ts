import nodemailer from 'nodemailer';
import { generateCandidateEmailContent, CandidateEmailData } from '../utils/candidateEmailTemplate';
import { Candidate } from '../types';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'smtp' | 'simulated' | 'none';
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

  if (resendApiKey) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CHUNKS Test 100 <onboarding@resend.dev>';
    return {
      configured: true,
      provider: 'resend',
      fromEmail,
      details: `Resend API configured (Key prefix: ${resendApiKey.substring(0, 7)}...)`,
    };
  }

  if (smtpHost && smtpUser && smtpPass) {
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || process.env.SMTP_FROM || smtpUser;
    return {
      configured: true,
      provider: 'smtp',
      fromEmail: `"CHUNKS Operations" <${fromEmail}>`,
      details: `SMTP configured (${smtpHost}:${process.env.SMTP_PORT || 587}, User: ${smtpUser})`,
    };
  }

  return {
    configured: false,
    provider: 'none',
    fromEmail: 'none',
    details: 'Missing credentials. Set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS in .env',
  };
}

/**
 * Dispatch raw email using Resend HTTP API or Nodemailer SMTP with detailed logging
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailDispatchResult> {
  const recipients = Array.isArray(to) ? to : [to];
  const status = getEmailProviderStatus();

  // 1. Resend API
  if (status.provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY!;
    const from = process.env.RESEND_FROM_EMAIL || 'CHUNKS Test 100 <onboarding@resend.dev>';

    try {
      console.log(`[EMAIL_DISPATCH:RESEND] Sending email to ${recipients.join(', ')} | Subject: "${subject}"`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
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
        const errorMsg = data.message || `HTTP ${res.status}: ${res.statusText}`;
        console.error(`[EMAIL_ERROR:RESEND] API rejected dispatch to ${recipients.join(', ')}:`, errorMsg);
        return { success: false, provider: 'resend', error: errorMsg };
      }

      const messageId = data.id || `resend_${Date.now()}`;
      console.log(`[EMAIL_SUCCESS:RESEND] Successfully sent email to ${recipients.join(', ')}. ID: ${messageId}`);
      return { success: true, provider: 'resend', messageId };
    } catch (err: any) {
      console.error(`[EMAIL_ERROR:RESEND] Network or execution failure:`, err.message);
      return { success: false, provider: 'resend', error: err.message };
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

      console.log(`[EMAIL_DISPATCH:SMTP] Sending email via ${process.env.SMTP_HOST} to ${recipients.join(', ')}`);
      const info = await transporter.sendMail({
        from: status.fromEmail,
        to: recipients,
        subject,
        html,
        text,
      });

      const messageId = info.messageId || `smtp_${Date.now()}`;
      console.log(`[EMAIL_SUCCESS:SMTP] Sent successfully to ${recipients.join(', ')}. Message ID: ${messageId}`);
      return { success: true, provider: 'smtp', messageId };
    } catch (err: any) {
      console.error(`[EMAIL_ERROR:SMTP] Failed to send email via SMTP to ${recipients.join(', ')}:`, err);
      return { success: false, provider: 'smtp', error: err.message };
    }
  }

  // 3. Fallback: Missing Environment Variables
  console.warn(
    `[EMAIL_ERROR] Missing API Key: Neither RESEND_API_KEY nor SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are set in .env. ` +
    `Email to ${recipients.join(', ')} ("${subject}") was logged but cannot be delivered over the network. ` +
    `Please set RESEND_API_KEY in .env for production email delivery.`
  );

  return {
    success: false,
    provider: 'none',
    error: 'MISSING_API_KEY: Please configure RESEND_API_KEY or SMTP credentials in .env',
  };
}

/**
 * Sends branded confirmation email to Candidate upon 1-on-1 booking
 */
export async function sendCandidateConfirmationEmail(candidate: Candidate): Promise<EmailDispatchResult> {
  try {
    const emailData: CandidateEmailData = {
      candidateId: candidate.id || 'N/A',
      fullName: candidate.fullName,
      phone: candidate.phone,
      email: candidate.email,
      testType: candidate.testType,
      testLevel: candidate.testLevel,
      preferredSlots: candidate.preferredSlots,
      chunkerCode: candidate.chunkerCode,
      chunkerName: candidate.chunkerName,
      createdAt: candidate.createdAt,
    };

    const { subject, html, text } = generateCandidateEmailContent(emailData);
    return await sendEmail({
      to: candidate.email,
      subject,
      html,
      text,
    });
  } catch (error: any) {
    console.error(`[EMAIL_ERROR] Failed generating/sending candidate confirmation for ${candidate.email}:`, error);
    return {
      success: false,
      provider: 'none',
      error: error.message,
    };
  }
}

/**
 * Sends immediate notification email to Admin team when a new candidate registers
 */
export async function sendAdminNewCandidateNotification(
  candidate: Candidate,
  adminEmails: string[]
): Promise<EmailDispatchResult> {
  if (!adminEmails || adminEmails.length === 0) {
    return { success: false, provider: 'none', error: 'No admin emails configured' };
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
          <p style="margin: 0 0 8px 0;"><strong>Họ và tên:</strong> ${candidate.fullName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Số điện thoại:</strong> ${candidate.phone}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${candidate.email}</p>
          <p style="margin: 0 0 8px 0;"><strong>Nghề nghiệp:</strong> ${candidate.occupation} (${candidate.ageRange})</p>
          <p style="margin: 0 0 8px 0;"><strong>Bài test:</strong> <span style="color: ${candidate.testType === 'green' ? '#047857' : '#c81e16'}; font-weight: 700;">${testName}</span> (Level: ${levelName})</p>
          <p style="margin: 0 0 8px 0;"><strong>Khung giờ chọn:</strong> <strong>${candidate.preferredSlots}</strong></p>
          <p style="margin: 0;"><strong>Mã giới thiệu:</strong> <span style="font-family: monospace; font-weight: 700;">${candidate.chunkerCode}</span> (${candidate.chunkerName || 'Direct Pilot'})</p>
        </div>

        <p style="font-size: 13px; color: #52525b; margin: 0 0 16px 0;">
          Vui lòng đăng nhập vào trang Quản trị (Admin Portal) để xếp lịch cho Chunker-in-Charge (CiC) và liên hệ xác nhận phòng với ứng viên.
        </p>

        <div style="font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 12px; font-family: monospace;">
          Candidate ID: ${candidate.id} · Timestamp: ${candidate.createdAt}
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
    });
  } catch (error: any) {
    console.error('[EMAIL_ERROR] Failed sending admin new candidate alert:', error);
    return { success: false, provider: 'none', error: error.message };
  }
}
