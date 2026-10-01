import { createHash } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Candidate, Chunker, CandidateStatus, AdminNotificationSettings } from '../types';

const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;
export const PROJECT_ID = firebaseConfig.projectId;
const APP_NAME = 'chunks-server';

export function getServerFirestore(): Firestore {
  const app = getApps().find((entry) => entry.name === APP_NAME) ||
    initializeApp({ projectId: PROJECT_ID }, APP_NAME);
  return getFirestore(app, process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId);
}

export class RegistrationError extends Error {
  constructor(public readonly code: 'CAPACITY_FULL' | 'DUPLICATE_PHONE' | 'INVALID_REFERRAL' | 'MIGRATION_REQUIRED') {
    super({ CAPACITY_FULL: 'The pilot has reached its 100-registration capacity.', DUPLICATE_PHONE: 'This phone number already registered in the last 30 days.', INVALID_REFERRAL: 'Referral code is not active.', MIGRATION_REQUIRED: 'Campaign migration has not been completed.' }[code]);
  }
}

export function normalizedPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('84') ? `0${digits.slice(2)}` : digits;
}
export function hashPhone(phone: string): string {
  return createHash('sha256').update(normalizedPhone(phone)).digest('hex');
}
const candidateFrom = (id: string, data: FirebaseFirestore.DocumentData): Candidate => ({ id, ...data } as Candidate);

class DatabaseService {
  private get db() { return getServerFirestore(); }

  async getHealth() {
    try {
      const [state, chunkers] = await Promise.all([
        this.db.doc('campaign/state').get(), this.db.collection('chunkers').count().get(),
      ]);
      const initialized = state.exists && state.get('migrationComplete') === true;
      return { status: initialized ? 'ok' : 'uninitialized', dbConnected: initialized, totalCandidatesInDB: state.get('totalRegistered') || 0, totalChunkersInDB: chunkers.data().count, timestamp: new Date().toISOString(), databaseId: process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId };
    } catch {
      return { status: 'error', dbConnected: false, totalCandidatesInDB: 0, totalChunkersInDB: 0, timestamp: new Date().toISOString(), databaseId: DATABASE_ID };
    }
  }

  async getChunkerByCode(code: string): Promise<Chunker | null> {
    const snap = await this.db.collection('chunkers').doc(code.trim().toUpperCase()).get();
    return snap.exists ? { id: snap.id, ...snap.data() } as Chunker : null;
  }

  async getChunkers(): Promise<Chunker[]> {
    const snap = await this.db.collection('chunkers').get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Chunker));
  }

  async createChunker(data: { name: string; code: string; email: string; notes?: string }): Promise<Chunker> {
    const code = data.code.trim().toUpperCase();
    const chunker: Chunker = { id: code, name: data.name.trim(), code, email: data.email.trim().toLowerCase(), active: true, referralCount: 0, notes: data.notes || '', createdAt: new Date().toISOString() };
    await this.db.collection('chunkers').doc(code).create(chunker);
    return chunker;
  }

  async updateChunker(code: string, data: { name?: string; email?: string; active?: boolean; notes?: string }): Promise<Chunker> {
    const cleanCode = code.trim().toUpperCase();
    const ref = this.db.collection('chunkers').doc(cleanCode);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Chunker not found');
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email.trim().toLowerCase();
    if (data.active !== undefined) updates.active = Boolean(data.active);
    if (data.notes !== undefined) updates.notes = data.notes.trim();
    await ref.update(updates);
    return { id: cleanCode, ...snap.data(), ...updates } as Chunker;
  }

  async deleteChunker(code: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'PILOT100') throw new Error('Cannot delete default PILOT100 account');
    const ref = this.db.collection('chunkers').doc(cleanCode);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Chunker not found');
    await ref.delete();
    return true;
  }

  async registerCandidate(input: Candidate): Promise<Candidate> {
    const db = this.db;
    const now = new Date();
    const code = input.chunkerCode.trim().toUpperCase();
    const ref = db.collection('chunkers').doc(code);
    const stateRef = db.doc('campaign/state');
    const lockRef = db.collection('phoneLocks').doc(hashPhone(input.phone));
    const candidateRef = db.collection('candidates').doc();
    return db.runTransaction(async (tx) => {
      // All reads precede writes. Contention on campaign/state serializes the 100 cap.
      const [state, chunker, lock, settings] = await Promise.all([
        tx.get(stateRef), tx.get(ref), tx.get(lockRef), tx.get(db.doc('settings/notifications')),
      ]);
      if (!state.exists || state.get('migrationComplete') !== true) throw new RegistrationError('MIGRATION_REQUIRED');
      if (!chunker.exists || chunker.get('active') !== true) throw new RegistrationError('INVALID_REFERRAL');
      const total = state.get('totalRegistered');
      if (!Number.isInteger(total) || total < 0 || total > 100 ||
        !Number.isInteger(state.get('greenCount')) || !Number.isInteger(state.get('redCount')) ||
        state.get('greenCount') + state.get('redCount') > total) throw new RegistrationError('MIGRATION_REQUIRED');
      if (total >= 100) throw new RegistrationError('CAPACITY_FULL');
      const lastRegistrationAt = lock.get('lastRegistrationAt');
      if (lock.exists && (!Number.isInteger(lastRegistrationAt) || lastRegistrationAt > now.getTime() ||
        now.getTime() - lastRegistrationAt < 30 * 24 * 60 * 60 * 1000)) throw new RegistrationError('DUPLICATE_PHONE');
      const candidate: Candidate = {
        ...input, id: candidateRef.id, phone: input.phone.trim(), email: input.email.trim().toLowerCase(),
        chunkerCode: code, chunkerName: chunker.get('name'), status: 'new',
        confirmationEmailSent: false, confirmationEmailStatus: 'pending',
        createdAt: now.toISOString(), updatedAt: now.toISOString(),
      };
      tx.create(candidateRef, Object.fromEntries(Object.entries(candidate).filter(([, value]) => value !== undefined)));
      tx.set(lockRef, { lastRegistrationAt: now.getTime(), candidateId: candidateRef.id });
      tx.update(stateRef, { totalRegistered: total + 1, greenCount: (state.get('greenCount') || 0) + Number(candidate.testType === 'green'), redCount: (state.get('redCount') || 0) + Number(candidate.testType === 'red') });
      const newReferralCount = (chunker.get('referralCount') || 0) + 1;
      tx.update(ref, { referralCount: newReferralCount });
      tx.create(db.collection('emailOutbox').doc(`${candidateRef.id}_candidate`), { candidateId: candidateRef.id, kind: 'candidate', recipients: [candidate.email], status: 'pending', attempts: 0, nextAttemptAt: now.getTime(), createdAt: now.toISOString() });
      const rawRecipients = settings.get('notificationEmails');
      const fallbackRecipients = (process.env.ADMIN_EMAILS || 'le.ntmkh@gmail.com,lucy2511kh@gmail.com')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const recipients = Array.isArray(rawRecipients) && rawRecipients.length > 0 ? rawRecipients : fallbackRecipients;
      if (settings.get('enabled') !== false && recipients.length) {
        tx.create(db.collection('emailOutbox').doc(`${candidateRef.id}_admin`), {
          candidateId: candidateRef.id,
          kind: 'admin',
          recipients,
          status: 'pending',
          attempts: 0,
          nextAttemptAt: now.getTime(),
          createdAt: now.toISOString(),
        });
      }
      const chunkerEmail = chunker.get('email');
      if (typeof chunkerEmail === 'string' && chunkerEmail.includes('@') && code !== 'PILOT100') {
        tx.create(db.collection('emailOutbox').doc(`${candidateRef.id}_referral`), {
          candidateId: candidateRef.id,
          kind: 'referral',
          recipients: [chunkerEmail],
          chunkerCode: code,
          chunkerName: chunker.get('name') || code,
          referralCount: newReferralCount,
          status: 'pending',
          attempts: 0,
          nextAttemptAt: now.getTime(),
          createdAt: now.toISOString(),
        });
      }
      return candidate;
    });
  }

  async getCandidates(options: { page?: number; limit?: number; status?: string; testType?: string; testLevel?: string; search?: string } = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(1000, Math.max(1, options.limit || 15));
    // Pilot collection is capped at 100; filter before paging to preserve semantics.
    const docs = await this.db.collection('candidates').get();
    const search = options.search?.trim().toLowerCase();
    const matches = docs.docs.map((doc) => candidateFrom(doc.id, doc.data())).filter((candidate) =>
      (!options.status || options.status.toLowerCase() === 'all' || candidate.status === options.status.toLowerCase()) &&
      (!options.testType || options.testType.toLowerCase() === 'all' || candidate.testType === options.testType.toLowerCase()) &&
      (!options.testLevel || options.testLevel.toLowerCase() === 'all' || candidate.testLevel === options.testLevel.toLowerCase()) &&
      (!search || [candidate.fullName, candidate.phone, candidate.email, candidate.chunkerCode].some((value) => value?.toLowerCase().includes(search)))
    ).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return { candidates: matches.slice((page - 1) * limit, page * limit), total: matches.length, page, limit, totalPages: Math.ceil(matches.length / limit) };
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    const doc = await this.db.collection('candidates').doc(id).get();
    return doc.exists ? candidateFrom(doc.id, doc.data()!) : null;
  }

  async updateCandidateStatus(id: string, status: CandidateStatus, notes?: string) {
    await this.db.collection('candidates').doc(id).update({ status, ...(notes !== undefined ? { notes } : {}), updatedAt: new Date().toISOString() });
  }


  async getMetrics() {
    const [state, chunkers] = await Promise.all([this.db.doc('campaign/state').get(), this.getChunkers()]);
    if (!state.exists || state.get('migrationComplete') !== true) throw new RegistrationError('MIGRATION_REQUIRED');
    return { target: 100, totalRegistered: state.get('totalRegistered') || 0, greenCount: state.get('greenCount') || 0, redCount: state.get('redCount') || 0, topChunkers: chunkers.sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0)).slice(0, 10) };
  }

  async getNotificationSettings(): Promise<AdminNotificationSettings> {
    const doc = await this.db.doc('settings/notifications').get();
    return doc.exists ? doc.data() as AdminNotificationSettings : { enabled: false, notificationEmails: [] };
  }

  async saveNotificationSettings(settings: { notificationEmails: string[]; enabled: boolean }, email: string) {
    const value = { ...settings, updatedBy: email, updatedAt: new Date().toISOString() };
    await this.db.doc('settings/notifications').set(value);
    return value;
  }

  async addNotificationLog(log: Record<string, unknown>) {
    await this.db.collection('notificationLogs').add({ ...log, createdAt: new Date().toISOString() });
  }

  async getNotificationLogs(limit = 10) {
    const docs = await this.db.collection('notificationLogs').orderBy('createdAt', 'desc').limit(limit).get();
    return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export const dbService = new DatabaseService();
