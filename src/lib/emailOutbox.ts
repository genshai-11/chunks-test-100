import { randomUUID } from 'node:crypto';
import { getServerFirestore, dbService } from '../db/database';
import { sendEmail, sendAdminNewCandidateNotification } from './email';
import { generateCandidateEmailContent } from '../utils/candidateEmailTemplate';

const LEASE_MS = 90_000;
const MAX_ATTEMPTS = 8;

interface OutboxJob {
  candidateId: string;
  kind: 'candidate' | 'admin' | 'referral';
  recipients: string[];
  chunkerCode?: string;
  chunkerName?: string;
  referralCount?: number;
  status: 'pending' | 'failed' | 'processing' | 'accepted';
  attempts: number;
  nextAttemptAt: number;
  leaseUntil?: number;
  claimId?: string;
}

async function processJob(id: string): Promise<void> {
  const db = getServerFirestore();
  const ref = db.collection('emailOutbox').doc(id);
  const claimId = randomUUID();
  const now = Date.now();
  const job = await db.runTransaction(async (tx): Promise<OutboxJob | null> => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const entry = snap.data() as OutboxJob;
    if (entry.status === 'accepted' || entry.attempts >= MAX_ATTEMPTS ||
      (entry.status === 'processing' && (entry.leaseUntil || 0) > now) ||
      (entry.status !== 'processing' && entry.nextAttemptAt > now)) return null;
    tx.update(ref, { status: 'processing', claimId, leaseUntil: now + LEASE_MS, attempts: entry.attempts + 1 });
    return entry;
  });
  if (!job) return;
  try {
    const candidate = await dbService.getCandidateById(job.candidateId);
    let result: { success: boolean; error?: string; messageId?: string; provider: string };
    if (!candidate) {
      result = { success: false, provider: 'none', error: 'Candidate record missing' };
    } else if (job.kind === 'candidate') {
      const content = generateCandidateEmailContent({
        candidateId: candidate.id!, fullName: candidate.fullName, phone: candidate.phone,
        email: candidate.email, testType: candidate.testType, testLevel: candidate.testLevel,
        preferredSlots: candidate.preferredSlots, chunkerCode: candidate.chunkerCode,
        chunkerName: candidate.chunkerName, createdAt: candidate.createdAt,
      });
      result = await sendEmail({ to: job.recipients, ...content, idempotencyKey: id });
    } else if (job.kind === 'referral') {
      const subject = `[CHUNKS Alert] Ứng viên mới đăng ký qua mã ${candidate.chunkerCode} của bạn!`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; background: #ffffff;">
          <div style="font-size: 11px; font-weight: 700; color: #c81e16; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
            CHUNKEE REFERRAL · THÔNG BÁO TỰ ĐỘNG
          </div>
          <h2 style="font-size: 19px; font-weight: 700; color: #0a0a0a; margin: 0 0 16px 0;">
            Chúc mừng! Đã có ứng viên mới đăng ký qua link của bạn
          </h2>
          <div style="background: #fafafa; padding: 16px; border: 1px solid #f4f4f5; margin-bottom: 16px; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0;">Xin chào <strong>${candidate.chunkerName || 'Chunkee'}</strong>,</p>
            <p style="margin: 0 0 8px 0;">Ứng viên <strong>${candidate.fullName}</strong> vừa hoàn tất đăng ký giữ chỗ tham gia Mini-Test 21 câu qua mã giới thiệu <strong>${candidate.chunkerCode}</strong> của bạn.</p>
            <p style="margin: 0;">Tổng số lượt ứng viên đã đăng ký qua mã của bạn hiện tại là: <strong style="color: #c81e16; font-size: 16px;">${job.referralCount || '1'}</strong> lượt.</p>
          </div>
          <p style="font-size: 13px; color: #71717a; margin: 0;">Cảm ơn bạn đã đồng hành và lan tỏa phương pháp đánh giá phản xạ CHUNKS!</p>
        </div>
      `;
      const text = `Chúc mừng ${candidate.chunkerName || 'Chunkee'}! Ứng viên ${candidate.fullName} vừa đăng ký qua mã ${candidate.chunkerCode} của bạn. Tổng số lượt đăng ký hiện tại là: ${job.referralCount || 1}.`;
      result = await sendEmail({ to: job.recipients, subject, html, text, idempotencyKey: id });
    } else {
      result = await sendAdminNewCandidateNotification(candidate, job.recipients, id);
    }
    const completedAt = Date.now();
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.get('claimId') !== claimId || snap.get('status') !== 'processing') return;
      const attempts = snap.get('attempts') as number;
      tx.update(ref, {
        status: result.success ? 'accepted' : 'failed', claimId: null, leaseUntil: 0,
        provider: result.provider, providerMessageId: result.messageId || null,
        lastError: result.error || null, updatedAt: new Date(completedAt).toISOString(),
        nextAttemptAt: result.success ? 0 : completedAt + Math.min(3_600_000, 30_000 * 2 ** (attempts - 1)),
      });
      if (job.kind === 'candidate' && candidate) {
        tx.update(db.collection('candidates').doc(job.candidateId), {
          confirmationEmailSent: result.success,
          confirmationEmailStatus: result.success ? 'accepted' : 'failed',
          ...(result.success ? { confirmationEmailSentAt: new Date(completedAt).toISOString() } : {}),
          updatedAt: new Date(completedAt).toISOString(),
        });
      }
      tx.create(db.collection('notificationLogs').doc(`${id}_${attempts}`), {
        candidateId: job.candidateId, kind: job.kind, recipients: job.recipients,
        status: result.success ? 'accepted' : 'failed', provider: result.provider,
        errorDetails: result.error || null, createdAt: new Date(completedAt).toISOString(),
      });
    });
  } catch {
    // Preserve the durable job for retry even if rendering or Firestore reads fail.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.get('claimId') !== claimId || snap.get('status') !== 'processing') return;
      const attempts = snap.get('attempts') as number;
      tx.update(ref, {
        status: 'failed', claimId: null, leaseUntil: 0, lastError: 'Worker failure',
        nextAttemptAt: Date.now() + Math.min(3_600_000, 30_000 * 2 ** (attempts - 1)),
      });
    });
  }
}
export async function processCandidateEmailOutbox(candidateId: string): Promise<void> {
  await Promise.all([
    processJob(`${candidateId}_candidate`),
    processJob(`${candidateId}_admin`),
    processJob(`${candidateId}_referral`),
  ]);
}

export async function processEmailOutbox({ limit = 20 }: { limit?: number } = {}): Promise<number> {
  const db = getServerFirestore();
  const now = Date.now();
  const pending = await Promise.all([
    db.collection('emailOutbox').where('status', '==', 'pending').get(),
    db.collection('emailOutbox').where('status', '==', 'failed').get(),
    db.collection('emailOutbox').where('status', '==', 'processing').get(),
  ]);
  const due = pending.flatMap((snapshot) => snapshot.docs).filter((doc) => {
    const job = doc.data() as OutboxJob;
    return job.attempts < MAX_ATTEMPTS && (job.status === 'processing'
      ? (job.leaseUntil || 0) <= now : job.nextAttemptAt <= now);
  }).sort((a, b) => (a.get('nextAttemptAt') || 0) - (b.get('nextAttemptAt') || 0)).slice(0, limit);
  await Promise.all(due.map((doc) => processJob(doc.id)));
  return due.length;
}
