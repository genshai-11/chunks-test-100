import { DatabaseSync } from 'node:sqlite';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { dbService, getServerFirestore, hashPhone, PROJECT_ID } from '../src/db/database';
import type { Candidate, CandidateStatus, Chunker } from '../src/types';

// Run only against a quiescent, complete SQLite snapshot with its WAL checkpointed.
// Production writes require an explicit flag and an independent project/database check.
const source = resolve(process.argv.find((arg, index) => index > 1 && !arg.startsWith('--')) || 'data/chunks.db');
const apply = process.argv.includes('--apply');
if (!existsSync(source)) throw new Error('Snapshot not found');
if (existsSync(`${source}-wal`) && statSync(`${source}-wal`).size > 0) {
  throw new Error('Checkpoint the SQLite WAL before migration');
}
const db = getServerFirestore();
const sqlite = new DatabaseSync(source, { readOnly: true });

try {
  const candidates = sqlite.prepare('SELECT * FROM candidates').all() as unknown as Record<string, unknown>[];
  const chunkers = sqlite.prepare('SELECT * FROM chunkers').all() as unknown as Record<string, unknown>[];
  const settings = sqlite.prepare('SELECT * FROM notification_settings').all() as unknown as Record<string, unknown>[];
  if (settings.length > 1) throw new Error('Multiple notification settings rows');
  if (candidates.length > 100) throw new Error('Source already exceeds capacity');

  const mappedChunkers = new Map<string, Chunker>();
  for (const row of chunkers) {
    const code = String(row.code).trim().toUpperCase();
    if (!code || mappedChunkers.has(code)) throw new Error('Invalid or duplicate referral code');
    mappedChunkers.set(code, {
      id: code, code, name: String(row.name), email: String(row.email).toLowerCase(),
      active: row.active === 1, referralCount: 0,
      notes: row.notes ? String(row.notes) : '', createdAt: String(row.createdAt),
    });
  }
  // Existing general-invitation registrations used DIRECT; consolidate them
  // under the documented PILOT100 allocation without issuing a second identity.
  if (!mappedChunkers.has('PILOT100')) {
    mappedChunkers.set('PILOT100', {
      id: 'PILOT100', code: 'PILOT100', name: 'CHUNKS Pilot', email: '',
      active: true, referralCount: 0, createdAt: new Date().toISOString(),
    });
  }

  const mappedCandidates: Candidate[] = [];
  const locks = new Map<string, { lastRegistrationAt: number; candidateId: string }>();
  const candidateIds = new Set<string>();
  let greenCount = 0;
  let redCount = 0;
  for (const row of candidates) {
    const id = String(row.id);
    const code = String(row.chunkerCode || 'PILOT100').trim().toUpperCase();
    const resolvedCode = code === 'DIRECT' ? 'PILOT100' : code;
    let chunker = mappedChunkers.get(resolvedCode);
    if (!chunker) {
      chunker = {
        id: resolvedCode,
        code: resolvedCode,
        name: String(row.chunkerName || resolvedCode),
        email: '',
        active: true,
        referralCount: 0,
        createdAt: String(row.createdAt),
        notes: 'Discovered during migration',
      };
      mappedChunkers.set(resolvedCode, chunker);
    }
    const createdAt = String(row.createdAt);
    const timestamp = Date.parse(createdAt);
    if (!id || candidateIds.has(id) || !Number.isFinite(timestamp)) {
      throw new Error('Duplicate candidate ID or invalid registration date');
    }
    candidateIds.add(id);
    const type = String(row.testType).toLowerCase();
    if (type !== 'green' && type !== 'red') throw new Error('Unknown assessment type');
    greenCount += Number(type === 'green');
    redCount += Number(type === 'red');
    const rawStatus = String(row.status || 'NEW').toLowerCase().replace('_', '');
    if (!['new', 'contacted', 'scheduled', 'completed', 'noshow'].includes(rawStatus)) throw new Error('Unknown candidate status');
    const candidate: Candidate = {
      id, fullName: String(row.fullName), phone: String(row.phone),
      email: String(row.email).toLowerCase(), ageRange: String(row.ageRange) as Candidate['ageRange'],
      occupation: String(row.occupation), testType: type, testLevel: String(row.testLevel || 'easy') as Candidate['testLevel'],
      preferredSlots: String(row.preferredSlots), chunkerCode: resolvedCode,
      chunkerName: chunker.name, status: rawStatus as CandidateStatus,
      confirmationEmailSent: row.confirmationEmailSent === 1,
      confirmationEmailStatus: row.confirmationEmailStatus === 'sent' ? 'accepted' : row.confirmationEmailStatus === 'failed' ? 'failed' : 'pending',
      createdAt, updatedAt: row.updatedAt ? String(row.updatedAt) : createdAt,
      ...(row.notes ? { notes: String(row.notes) } : {}),
      ...(row.scheduledAt ? { scheduledAt: String(row.scheduledAt) } : {}),
      ...(row.selectedDate ? { selectedDate: String(row.selectedDate) } : {}),
      ...(row.selectedTimeSlot ? { selectedTimeSlot: String(row.selectedTimeSlot) } : {}),
      ...(row.confirmationEmailSentAt && row.confirmationEmailSent === 1 ? { confirmationEmailSentAt: String(row.confirmationEmailSentAt) } : {}),
    };
    mappedCandidates.push(candidate);
    chunker.referralCount++;
    const phoneHash = hashPhone(candidate.phone);
    const old = locks.get(phoneHash);
    if (!old || timestamp > old.lastRegistrationAt) locks.set(phoneHash, { lastRegistrationAt: timestamp, candidateId: id });
  }

  console.log(JSON.stringify({ source, apply, candidates: mappedCandidates.length, greenCount, redCount,
    chunkers: mappedChunkers.size, locks: locks.size, databaseId: db.databaseId, projectId: PROJECT_ID }));
  if (apply) {
    if (process.env.FIRESTORE_EMULATOR_HOST === undefined && process.env.MIGRATION_PROJECT !== PROJECT_ID) {
      throw new Error('Set MIGRATION_PROJECT to the verified destination project before real writes');
    }
    if (!process.env.FIRESTORE_EMULATOR_HOST && process.env.MIGRATION_DATABASE !== db.databaseId) {
      throw new Error('Set MIGRATION_DATABASE to the verified named database before real writes');
    }
    const stateRef = db.doc('campaign/state');
    if ((await stateRef.get()).exists) throw new Error('Destination campaign already exists; refusing overwrite');
    const collections = ['candidates', 'chunkers', 'phoneLocks', 'emailOutbox'];
    const counts = await Promise.all(collections.map(async (name) => (await db.collection(name).count().get()).data().count));
    if (counts.some(Boolean) || (await db.doc('settings/notifications').get()).exists) {
      throw new Error('Destination is not empty; refusing overwrite');
    }
    const bulk = db.bulkWriter();
    for (const candidate of mappedCandidates) bulk.create(db.collection('candidates').doc(candidate.id!), candidate);
    for (const chunker of mappedChunkers.values()) bulk.create(db.collection('chunkers').doc(chunker.code), chunker);
    for (const [hash, lock] of locks) bulk.create(db.collection('phoneLocks').doc(hash), lock);
    if (settings.length) {
      const row = settings[0];
      const emails = JSON.parse(String(row.notificationEmails));
      if (!Array.isArray(emails) || !emails.every((email) => typeof email === 'string')) throw new Error('Invalid settings recipients');
      bulk.create(db.doc('settings/notifications'), {
        enabled: row.enabled === 1, notificationEmails: emails,
        updatedAt: String(row.updatedAt), updatedBy: String(row.updatedBy || 'migration'),
      });
    }
    await bulk.close();
    const [candidateCount, chunkerCount, lockCount] = await Promise.all([
      db.collection('candidates').count().get(), db.collection('chunkers').count().get(), db.collection('phoneLocks').count().get(),
    ]);
    if (candidateCount.data().count !== mappedCandidates.length || chunkerCount.data().count !== mappedChunkers.size || lockCount.data().count !== locks.size) {
      throw new Error('Destination counts mismatch; registration remains disabled');
    }
    await stateRef.create({ migrationComplete: true, totalRegistered: mappedCandidates.length,
      greenCount, redCount, migratedAt: new Date().toISOString(), source: 'sqlite-snapshot' });
    console.log('Migration completed; registration gate opened');
    console.log(JSON.stringify(await dbService.getHealth()));
  }
} finally {
  sqlite.close();
}
