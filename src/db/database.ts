import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { Candidate, Chunker, AdminNotificationSettings, CandidateStatus, TestLevel } from '../types';
import { INITIAL_CHUNKERS, INITIAL_CANDIDATES } from '../constants/initialData';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'chunks.db');

class DatabaseService {
  private db: DatabaseSync;
  private static instance: DatabaseService;

  private constructor() {
    console.log(`[DATABASE_INIT] Initializing persistent SQLite database at: ${DB_PATH}`);
    this.db = new DatabaseSync(DB_PATH);

    // Enable WAL mode for high concurrency and Foreign Keys
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA foreign_keys = ON;');

    this.initSchema();
    this.seedInitialDataIfEmpty();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chunkers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        referralCount INTEGER NOT NULL DEFAULT 0,
        secretToken TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        ageRange TEXT NOT NULL,
        occupation TEXT NOT NULL,
        testType TEXT NOT NULL,
        testLevel TEXT NOT NULL DEFAULT 'easy',
        preferredSlots TEXT NOT NULL,
        selectedDate TEXT,
        selectedTimeSlot TEXT,
        chunkerCode TEXT NOT NULL,
        chunkerName TEXT,
        status TEXT NOT NULL DEFAULT 'NEW',
        notes TEXT,
        scheduledAt TEXT,
        confirmationEmailSent INTEGER NOT NULL DEFAULT 0,
        confirmationEmailSentAt TEXT,
        confirmationEmailStatus TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
      CREATE INDEX IF NOT EXISTS idx_candidates_chunker_code ON candidates(chunkerCode);
      CREATE INDEX IF NOT EXISTS idx_chunkers_code ON chunkers(code);

      CREATE TABLE IF NOT EXISTS notification_settings (
        id TEXT PRIMARY KEY,
        notificationEmails TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        updatedAt TEXT NOT NULL,
        updatedBy TEXT
      );

      CREATE TABLE IF NOT EXISTS notification_logs (
        id TEXT PRIMARY KEY,
        recipients TEXT NOT NULL,
        candidateName TEXT,
        phone TEXT,
        email TEXT,
        testType TEXT,
        testLevel TEXT,
        preferredSlots TEXT,
        chunkerCode TEXT,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL,
        errorDetails TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_notification_logs_time ON notification_logs(timestamp DESC);
    `);
  }

  private seedInitialDataIfEmpty() {
    const chunkerCountRow = this.db.prepare('SELECT COUNT(*) as count FROM chunkers').get() as { count: number };
    if (chunkerCountRow.count === 0) {
      console.log('[DATABASE_SEED] Seeding initial Chunkers into persistent database...');
      const insertChunker = this.db.prepare(`
        INSERT INTO chunkers (id, name, code, email, active, referralCount, secretToken, notes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const ch of INITIAL_CHUNKERS) {
        insertChunker.run(
          ch.id || `chk_${ch.code.toLowerCase()}`,
          ch.name,
          ch.code.toUpperCase(),
          ch.email,
          ch.active ? 1 : 0,
          ch.referralCount || 0,
          ch.secretToken || `SEC-${ch.code}`,
          ch.notes || null,
          ch.createdAt || new Date().toISOString()
        );
      }
    }

    const candidateCountRow = this.db.prepare('SELECT COUNT(*) as count FROM candidates').get() as { count: number };
    if (candidateCountRow.count === 0) {
      console.log('[DATABASE_SEED] Seeding baseline Candidates into persistent database...');
      const insertCandidate = this.db.prepare(`
        INSERT INTO candidates (
          id, fullName, phone, email, ageRange, occupation, testType, testLevel,
          preferredSlots, selectedDate, selectedTimeSlot, chunkerCode, chunkerName,
          status, notes, scheduledAt, confirmationEmailSent, confirmationEmailSentAt,
          confirmationEmailStatus, createdAt, updatedAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      for (const cand of INITIAL_CANDIDATES) {
        insertCandidate.run(
          cand.id || `seed_${Math.random().toString(36).substring(2, 7)}`,
          cand.fullName,
          cand.phone,
          cand.email,
          String(cand.ageRange),
          cand.occupation,
          cand.testType,
          cand.testLevel || 'easy',
          cand.preferredSlots,
          cand.selectedDate || null,
          cand.selectedTimeSlot || null,
          (cand.chunkerCode || 'DIRECT').toUpperCase(),
          cand.chunkerName || 'Direct Application',
          cand.status.toUpperCase(),
          cand.notes || null,
          cand.scheduledAt || null,
          cand.confirmationEmailSent ? 1 : 0,
          cand.confirmationEmailSentAt || null,
          cand.confirmationEmailStatus || 'delivered',
          typeof cand.createdAt === 'string' ? cand.createdAt : new Date().toISOString(),
          cand.updatedAt || null
        );
      }
    }

    const notifRow = this.db.prepare('SELECT COUNT(*) as count FROM notification_settings').get() as { count: number };
    if (notifRow.count === 0) {
      this.db.prepare(`
        INSERT INTO notification_settings (id, notificationEmails, enabled, updatedAt, updatedBy)
        VALUES ('default', ?, 1, ?, 'system')
      `).run(JSON.stringify(['le.ntmkh@gmail.com']), new Date().toISOString());
    }
  }

  // --- CANDIDATE MUTATIONS & QUERIES ---

  public insertCandidate(c: Candidate): void {
    console.log(`[DB_INSERT] Inserting candidate ${c.fullName} (${c.email}) into SQLite candidates table...`);
    const stmt = this.db.prepare(`
      INSERT INTO candidates (
        id, fullName, phone, email, ageRange, occupation, testType, testLevel,
        preferredSlots, selectedDate, selectedTimeSlot, chunkerCode, chunkerName,
        status, notes, scheduledAt, confirmationEmailSent, confirmationEmailSentAt,
        confirmationEmailStatus, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      c.id || `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      c.fullName.trim(),
      c.phone.trim(),
      c.email.trim().toLowerCase(),
      String(c.ageRange),
      c.occupation.trim(),
      c.testType,
      c.testLevel || 'easy',
      c.preferredSlots.trim(),
      c.selectedDate || null,
      c.selectedTimeSlot || null,
      (c.chunkerCode || 'DIRECT').toUpperCase(),
      c.chunkerName || 'Direct Application',
      (c.status || 'NEW').toUpperCase(),
      c.notes || null,
      c.scheduledAt || null,
      c.confirmationEmailSent ? 1 : 0,
      c.confirmationEmailSentAt || null,
      c.confirmationEmailStatus || 'pending',
      c.createdAt || new Date().toISOString(),
      c.updatedAt || new Date().toISOString()
    );

    // If candidate has valid referral code, increment chunker referral count
    if (c.chunkerCode && c.chunkerCode.toUpperCase() !== 'DIRECT') {
      this.incrementChunkerReferral(c.chunkerCode.toUpperCase());
    }
  }

  public getCandidates(options: {
    page?: number;
    limit?: number;
    status?: string;
    testType?: string;
    testLevel?: string;
    search?: string;
  }): { candidates: Candidate[]; total: number; page: number; limit: number; totalPages: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 15));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (options.status && options.status !== 'all' && options.status !== 'ALL') {
      conditions.push('UPPER(status) = ?');
      params.push(options.status.toUpperCase());
    }

    if (options.testType && options.testType !== 'ALL' && options.testType !== 'all') {
      conditions.push('LOWER(testType) = ?');
      params.push(options.testType.toLowerCase());
    }

    if (options.testLevel && options.testLevel !== 'ALL' && options.testLevel !== 'all') {
      conditions.push('LOWER(testLevel) = ?');
      params.push(options.testLevel.toLowerCase());
    }

    if (options.search && options.search.trim()) {
      const q = `%${options.search.trim().toLowerCase()}%`;
      conditions.push('(LOWER(fullName) LIKE ? OR phone LIKE ? OR LOWER(email) LIKE ? OR UPPER(chunkerCode) LIKE ?)');
      params.push(q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = this.db.prepare(`SELECT COUNT(*) as total FROM candidates ${whereClause}`).get(...params) as { total: number };
    const total = countRow.total;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const rows = this.db.prepare(`
      SELECT * FROM candidates
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    const candidates: Candidate[] = rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      phone: r.phone,
      email: r.email,
      ageRange: r.ageRange,
      occupation: r.occupation,
      testType: r.testType as any,
      testLevel: r.testLevel as any,
      preferredSlots: r.preferredSlots,
      selectedDate: r.selectedDate || undefined,
      selectedTimeSlot: r.selectedTimeSlot || undefined,
      chunkerCode: r.chunkerCode,
      chunkerName: r.chunkerName || undefined,
      status: (r.status || 'new').toLowerCase() as CandidateStatus,
      notes: r.notes || undefined,
      scheduledAt: r.scheduledAt || undefined,
      confirmationEmailSent: Boolean(r.confirmationEmailSent),
      confirmationEmailSentAt: r.confirmationEmailSentAt || undefined,
      confirmationEmailStatus: r.confirmationEmailStatus as any,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt || undefined,
    }));

    return { candidates, total, page, limit, totalPages };
  }

  public getCandidateById(id: string): Candidate | null {
    const row = this.db.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
      ageRange: row.ageRange,
      occupation: row.occupation,
      testType: row.testType,
      testLevel: row.testLevel,
      preferredSlots: row.preferredSlots,
      selectedDate: row.selectedDate || undefined,
      selectedTimeSlot: row.selectedTimeSlot || undefined,
      chunkerCode: row.chunkerCode,
      chunkerName: row.chunkerName || undefined,
      status: (row.status || 'new').toLowerCase() as CandidateStatus,
      notes: row.notes || undefined,
      scheduledAt: row.scheduledAt || undefined,
      confirmationEmailSent: Boolean(row.confirmationEmailSent),
      confirmationEmailSentAt: row.confirmationEmailSentAt || undefined,
      confirmationEmailStatus: row.confirmationEmailStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt || undefined,
    };
  }

  public updateCandidateStatus(id: string, status: CandidateStatus, notes?: string): boolean {
    const normalized = status.toUpperCase();
    const now = new Date().toISOString();
    let stmt;
    if (notes !== undefined) {
      stmt = this.db.prepare('UPDATE candidates SET status = ?, notes = ?, updatedAt = ? WHERE id = ?');
      stmt.run(normalized, notes, now, id);
    } else {
      stmt = this.db.prepare('UPDATE candidates SET status = ?, updatedAt = ? WHERE id = ?');
      stmt.run(normalized, now, id);
    }
    return true;
  }

  public updateCandidateEmailStatus(id: string, sent: boolean, status: string, sentAt?: string): void {
    const stmt = this.db.prepare(`
      UPDATE candidates
      SET confirmationEmailSent = ?, confirmationEmailStatus = ?, confirmationEmailSentAt = ?, updatedAt = ?
      WHERE id = ?
    `);
    const now = new Date().toISOString();
    stmt.run(sent ? 1 : 0, status, sentAt || now, now, id);
  }

  // --- CHUNKER MUTATIONS & QUERIES ---

  public getChunkers(): Chunker[] {
    const rows = this.db.prepare('SELECT * FROM chunkers ORDER BY referralCount DESC, name ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      email: r.email,
      active: Boolean(r.active),
      referralCount: r.referralCount,
      secretToken: r.secretToken,
      notes: r.notes || undefined,
      createdAt: r.createdAt,
    }));
  }

  public getChunkerByCode(code: string): Chunker | null {
    const clean = code.trim().toUpperCase();
    const row = this.db.prepare('SELECT * FROM chunkers WHERE UPPER(code) = ?').get(clean) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      email: row.email,
      active: Boolean(row.active),
      referralCount: row.referralCount,
      secretToken: row.secretToken,
      notes: row.notes || undefined,
      createdAt: row.createdAt,
    };
  }

  public incrementChunkerReferral(code: string): void {
    const clean = code.trim().toUpperCase();
    this.db.prepare('UPDATE chunkers SET referralCount = referralCount + 1 WHERE UPPER(code) = ?').run(clean);
  }

  public createChunker(ch: { name: string; code: string; email: string; notes?: string }): Chunker {
    const cleanCode = ch.code.trim().toUpperCase();
    const id = `chk_${Date.now().toString(36)}`;
    const secretToken = `SEC-${cleanCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO chunkers (id, name, code, email, active, referralCount, secretToken, notes, createdAt)
      VALUES (?, ?, ?, ?, 1, 0, ?, ?, ?)
    `).run(id, ch.name.trim(), cleanCode, ch.email.trim(), secretToken, ch.notes || null, now);

    return {
      id,
      name: ch.name.trim(),
      code: cleanCode,
      email: ch.email.trim(),
      active: true,
      referralCount: 0,
      secretToken,
      notes: ch.notes,
      createdAt: now,
    };
  }

  // --- METRICS ---

  public getMetrics(): {
    target: number;
    totalRegistered: number;
    greenCount: number;
    redCount: number;
    topChunkers: { name: string; code: string; email: string; referralCount: number }[];
  } {
    const totalRow = this.db.prepare('SELECT COUNT(*) as c FROM candidates').get() as { c: number };
    const greenRow = this.db.prepare("SELECT COUNT(*) as c FROM candidates WHERE LOWER(testType) = 'green'").get() as { c: number };
    const redRow = this.db.prepare("SELECT COUNT(*) as c FROM candidates WHERE LOWER(testType) = 'red'").get() as { c: number };

    const topChunkersRows = this.db.prepare(`
      SELECT name, code, email, referralCount
      FROM chunkers
      WHERE active = 1
      ORDER BY referralCount DESC, name ASC
      LIMIT 5
    `).all() as any[];

    return {
      target: 100,
      totalRegistered: totalRow.c,
      greenCount: greenRow.c,
      redCount: redRow.c,
      topChunkers: topChunkersRows.map((r) => ({
        name: r.name,
        code: r.code,
        email: r.email,
        referralCount: r.referralCount,
      })),
    };
  }

  // --- NOTIFICATION SETTINGS & LOGS ---

  public getNotificationSettings(): AdminNotificationSettings {
    const row = this.db.prepare('SELECT * FROM notification_settings WHERE id = ?').get('default') as any;
    if (!row) {
      return {
        notificationEmails: ['le.ntmkh@gmail.com'],
        enabled: true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system',
      };
    }
    return {
      notificationEmails: JSON.parse(row.notificationEmails),
      enabled: Boolean(row.enabled),
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    };
  }

  public saveNotificationSettings(settings: { notificationEmails: string[]; enabled: boolean }, userEmail = 'admin'): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT OR REPLACE INTO notification_settings (id, notificationEmails, enabled, updatedAt, updatedBy)
      VALUES ('default', ?, ?, ?, ?)
    `).run(JSON.stringify(settings.notificationEmails), settings.enabled ? 1 : 0, now, userEmail);
  }

  public addNotificationLog(log: {
    id?: string;
    recipients: string[];
    candidateName: string;
    phone: string;
    email: string;
    testType: string;
    testLevel: string;
    preferredSlots: string;
    chunkerCode: string;
    status: 'sent' | 'failed' | 'simulated';
    errorDetails?: string;
  }): void {
    const id = log.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO notification_logs (
        id, recipients, candidateName, phone, email, testType, testLevel,
        preferredSlots, chunkerCode, timestamp, status, errorDetails
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      JSON.stringify(log.recipients),
      log.candidateName,
      log.phone,
      log.email,
      log.testType,
      log.testLevel,
      log.preferredSlots,
      log.chunkerCode,
      now,
      log.status,
      log.errorDetails || null
    );
  }

  public getNotificationLogs(limit = 20): any[] {
    const rows = this.db.prepare(`
      SELECT * FROM notification_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      recipients: JSON.parse(r.recipients),
      candidateName: r.candidateName,
      phone: r.phone,
      email: r.email,
      testType: r.testType,
      testLevel: r.testLevel,
      preferredSlots: r.preferredSlots,
      chunkerCode: r.chunkerCode,
      timestamp: r.timestamp,
      status: r.status,
      errorDetails: r.errorDetails || undefined,
    }));
  }

  // --- HEALTHCHECK ---

  public getHealth(): {
    status: string;
    dbConnected: boolean;
    totalCandidatesInDB: number;
    totalChunkersInDB: number;
    dbPath: string;
    timestamp: string;
  } {
    try {
      const candCount = (this.db.prepare('SELECT COUNT(*) as c FROM candidates').get() as { c: number }).c;
      const chkCount = (this.db.prepare('SELECT COUNT(*) as c FROM chunkers').get() as { c: number }).c;
      return {
        status: 'ok',
        dbConnected: true,
        totalCandidatesInDB: candCount,
        totalChunkersInDB: chkCount,
        dbPath: DB_PATH,
        timestamp: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        status: 'error',
        dbConnected: false,
        totalCandidatesInDB: 0,
        totalChunkersInDB: 0,
        dbPath: DB_PATH,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const dbService = DatabaseService.getInstance();
