import { randomUUID } from 'node:crypto';
import { getServerFirestore, dbService } from '../db/database';
import { sendEmail, sendAdminNewCandidateNotification } from './email';
import { generateCandidateEmailContent } from '../utils/candidateEmailTemplate';

const LEASE_MS = 90_000;
const MAX_ATTEMPTS = 8;

interface OutboxJob {
  candidateId: string;
  kind: 'candidate' | 'admin';
  recipients: string[];
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
