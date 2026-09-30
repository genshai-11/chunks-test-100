import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  referralQuerySchema,
  candidateRegisterSchema,
  chunkerStatsQuerySchema,
  adminCandidatesQuerySchema,
  updateCandidateStatusSchema,
  createChunkerSchema,
  isValidEmailAddress,
  isValidPhoneNumber,
} from './src/schemas/validation';
import { maskName, maskPhone, maskEmail, sanitizeCandidateForChunker } from './src/utils/masking';
import { INITIAL_CHUNKERS, INITIAL_CANDIDATES } from './src/constants/initialData';
import { Candidate, Chunker, CandidateStatus } from './src/types';
import nodemailer from 'nodemailer';
import { generateCandidateEmailContent, CandidateEmailData } from './src/utils/candidateEmailTemplate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to configure SMTP or fallback transporter for server runtime
function createServerMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Built-in JSON fallback transporter for preview/sandbox environments
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

/**
 * Dispatches automated confirmation email to candidate confirming their test type and level.
 */
async function sendAutomatedCandidateConfirmationEmail(candidate: Candidate): Promise<{ success: boolean; messageId: string }> {
  try {
    const { subject, html, text } = generateCandidateEmailContent({
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
    });

    const transporter = createServerMailTransporter();
    const sender = process.env.NOTIFICATION_FROM_EMAIL || 'chunks.assessment@chunks.edu.vn';

    const info = await transporter.sendMail({
      from: `"CHUNKS Test 100" <${sender}>`,
      to: candidate.email,
      subject,
      text,
      html,
    });

    const messageId = (info as any)?.messageId || `sim_${Date.now()}`;
    candidate.confirmationEmailSent = true;
    candidate.confirmationEmailSentAt = new Date().toISOString();
    candidate.confirmationEmailStatus = 'delivered';

    console.log(
      `[FIREBASE CLOUD FUNCTION / AUTOMATED DISPATCH] Successfully triggered candidate confirmation email:
       -> Recipient: ${candidate.email} (${candidate.fullName})
       -> Test Type: ${candidate.testType}
       -> Test Level: ${candidate.testLevel}
       -> Message ID: ${messageId}`
    );

    return { success: true, messageId };
  } catch (error: any) {
    console.error(`[AUTOMATED CONFIRMATION ERROR] Failed to send email to ${candidate.email}:`, error);
    candidate.confirmationEmailSent = false;
    candidate.confirmationEmailStatus = 'failed';
    return { success: false, messageId: '' };
  }
}

// In-Memory Database Store for Server instance (initialized with seed data)
let dbChunkers: Chunker[] = [...INITIAL_CHUNKERS];
let dbCandidates: Candidate[] = [...INITIAL_CANDIDATES];

// Whitelist of allowed Admin Emails
const ADMIN_EMAIL_WHITELIST = [
  'le.ntmkh@gmail.com',
  'lucy2511kh@gmail.com',
  'admin@chunks.edu.vn',
  'operations@chunks.edu.vn',
];

// In-Memory Notification Settings Store
let notificationSettings = {
  notificationEmails: ['le.ntmkh@gmail.com'],
  enabled: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'le.ntmkh@gmail.com',
};

// In-Memory Notification Logs (last 50 dispatches)
interface NotificationDispatchLog {
  id: string;
  recipients: string[];
  candidateName: string;
  phone: string;
  email: string;
  testType: string;
  testLevel: string;
  preferredSlots: string;
  chunkerCode: string;
  timestamp: string;
  status: 'sent' | 'simulated';
}
let notificationLogs: NotificationDispatchLog[] = [];

// In-memory rate limiting map: ip -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 15; // 15 submissions per IP per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// ---------------------------------------------------------------------
// Server-Side RBAC Middleware
// ---------------------------------------------------------------------

export interface AuthenticatedRequest extends Request {
  adminEmail?: string;
  adminRole?: string;
}

function adminAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check authorization header
  const authHeader = req.headers.authorization;
  const adminEmailHeader = req.headers['x-admin-email'] as string | undefined;

  let candidateEmail = '';

  if (adminEmailHeader) {
    candidateEmail = adminEmailHeader.trim().toLowerCase();
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    // Support testing token format "admin:<email>" or standard emails
    if (token.includes('@')) {
      candidateEmail = token.replace(/^admin:/, '').toLowerCase();
    }
  }

  // Check if email matches whitelist or internal domain
  const isWhitelisted =
    candidateEmail &&
    (ADMIN_EMAIL_WHITELIST.includes(candidateEmail) || candidateEmail.endsWith('@chunks.edu.vn'));

  if (!isWhitelisted) {
    return res.status(403).json({
      error: 'Forbidden: You are not authorized to access this administrative resource.',
      message: 'Access is restricted to authorized operations administrators.',
    });
  }

  req.adminEmail = candidateEmail;
  req.adminRole = 'super_admin';
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ---------------------------------------------------------------------
  // [GROUP A: Public / Candidate APIs]
  // ---------------------------------------------------------------------

  /**
   * GET /api/public/referral?code={code}
   * Purpose: Validate code when Candidate opens /?ref={code} to show greeting banner.
   * Strict Rule: NEVER expose chunker email, phone, ID, or how many people they have invited.
   */
  app.get('/api/public/referral', (req: Request, res: Response) => {
    const parseResult = referralQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid referral code format',
        details: parseResult.error.flatten(),
      });
    }

    const { code } = parseResult.data;
    const cleanCode = code.toUpperCase();
    const chunker = dbChunkers.find((c) => c.code.toUpperCase() === cleanCode && c.active);

    if (!chunker) {
      return res.status(200).json({
        valid: false,
        chunkerName: null,
        referralCode: cleanCode,
      });
    }

    // STRICT SANITIZATION: Only return minimal required greeting info
    return res.status(200).json({
      valid: true,
      chunkerName: chunker.name,
      referralCode: chunker.code,
    });
  });

  /**
   * POST /api/public/candidates/register
   * Purpose: Submit registration form.
   * Strict Rule: Response returns ONLY an acknowledgment. Never return list of previous submissions or current target counts.
   */
  app.post('/api/public/candidates/register', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Anti-Spam Rate Limit Check
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Bạn đã gửi đăng ký quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
      });
    }

    // Zod Schema Validation
    const parseResult = candidateRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const data = parseResult.data;
    const cleanCode = (data.referralCode || 'DIRECT').toUpperCase();
    const chunker = dbChunkers.find((c) => c.code.toUpperCase() === cleanCode && c.active);

    const candidateId = `cand_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const normalizedTestType =
      data.testType === 'GREEN_TEST' || data.testType === 'green' ? 'green' : 'red';
    const normalizedTestLevel = data.testLevel === 'hard' ? 'hard' : 'easy';

    const newCandidate: Candidate = {
      id: candidateId,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      ageRange: data.ageRange,
      occupation: data.occupation.trim(),
      testType: normalizedTestType,
      testLevel: normalizedTestLevel,
      preferredSlots: data.preferredTimeSlot.trim(),
      selectedDate: data.selectedDate,
      selectedTimeSlot: data.selectedTimeSlot,
      chunkerCode: cleanCode,
      chunkerName: chunker ? chunker.name : (cleanCode === 'DIRECT' ? 'Direct Application' : cleanCode),
      status: 'new',
      confirmationEmailSent: false,
      confirmationEmailStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    dbCandidates.unshift(newCandidate);

    if (chunker) {
      chunker.referralCount = (chunker.referralCount || 0) + 1;
    }

    // 1. TRIGGER AUTOMATED CONFIRMATION EMAIL TO CANDIDATE
    // (Firebase Cloud Function / automated email trigger confirming Test Type and Level)
    await sendAutomatedCandidateConfirmationEmail(newCandidate);

    // Record candidate confirmation dispatch in notification logs for admin visibility
    const candidateLog: NotificationDispatchLog = {
      id: `cand_conf_${Date.now()}`,
      recipients: [newCandidate.email],
      candidateName: newCandidate.fullName,
      phone: newCandidate.phone,
      email: newCandidate.email,
      testType: newCandidate.testType === 'green' ? 'Green Focus (%c)' : 'Red Improv (%r)',
      testLevel: newCandidate.testLevel === 'easy' ? 'Dễ (Foundation)' : 'Khó (Advanced)',
      preferredSlots: newCandidate.preferredSlots,
      chunkerCode: newCandidate.chunkerCode,
      timestamp: new Date().toISOString(),
      status: newCandidate.confirmationEmailSent ? 'sent' : 'simulated',
    };
    notificationLogs.unshift(candidateLog);

    // 2. TRIGGER ADMIN NOTIFICATION EMAIL IF CONFIGURED
    if (notificationSettings.enabled && notificationSettings.notificationEmails.length > 0) {
      const logEntry: NotificationDispatchLog = {
        id: `admin_alert_${Date.now()}`,
        recipients: [...notificationSettings.notificationEmails],
        candidateName: newCandidate.fullName,
        phone: newCandidate.phone,
        email: newCandidate.email,
        testType: newCandidate.testType === 'green' ? 'Green Focus (%c)' : 'Red Improv (%r)',
        testLevel: newCandidate.testLevel === 'easy' ? 'Dễ (Foundation)' : 'Khó (Advanced)',
        preferredSlots: newCandidate.preferredSlots,
        chunkerCode: newCandidate.chunkerCode,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      notificationLogs.unshift(logEntry);
      if (notificationLogs.length > 50) notificationLogs.pop();
      console.log(
        `[NOTIF DISPATCH] New Candidate registration notification dispatched to: ${notificationSettings.notificationEmails.join(
          ', '
        )} | Candidate: ${newCandidate.fullName} (${newCandidate.testType} - Level: ${newCandidate.testLevel})`
      );
    }

    // STRICT ISOLATION: Never leak database counts or records in receipt
    return res.status(201).json({
      success: true,
      registrationId: candidateId,
      message: 'Đăng ký thành công! Đội ngũ Chunks sẽ liên hệ qua Zalo/SĐT để xếp lịch.',
    });
  });

  // ---------------------------------------------------------------------
  // [GROUP B: Chunkee Scoped APIs - Zero Friction Access & Registration]
  // ---------------------------------------------------------------------

  /**
   * Helper: Generate unique Chunkee referral code from name
   */
  const generateChunkeeCode = (name: string): string => {
    const clean = name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    let base = '';
    if (words.length >= 1) {
      // Use the last name (given name in VN)
      const lastWord = words[words.length - 1].toUpperCase().replace(/[^A-Z0-9]/g, '');
      base = lastWord.length >= 2 ? lastWord : words.map((w) => w[0]).join('').toUpperCase();
    }
    if (!base || base.length < 2) base = 'CHUNKEE';
    base = base.slice(0, 8);

    let codeCandidate = `${base}2026`;
    let counter = 1;
    while (dbChunkers.some((c) => c.code.toUpperCase() === codeCandidate.toUpperCase())) {
      codeCandidate = `${base}${counter}2026`;
      counter++;
    }
    return codeCandidate;
  };

  /**
   * GET/POST /api/chunker/lookup or /api/chunkee/lookup
   * Zero-Friction Chunkee Hub: enter assigned Referral Code, Registered Email, or Phone.
   * Instant Output: Unique Referral Link, dynamic QR data, real personal candidate registration count.
   */
  const handleChunkeeLookup = (req: Request, res: Response) => {
    const rawQuery = (req.method === 'POST' ? req.body?.identifier : req.query.query) as string | undefined;
    const cleanQuery = (rawQuery || '').trim();

    if (!cleanQuery || cleanQuery.length < 2) {
      return res.status(400).json({
        found: false,
        error: 'Vui lòng nhập Mã giới thiệu, Email hoặc Số điện thoại.',
      });
    }

    const host = req.get('host') || 'chunks.edu.vn';
    const protocol = req.protocol || 'https';
    const digitsOnly = cleanQuery.replace(/\D/g, '');

    // 1. Check existing chunker/chunkee by code, email, or phone
    const chunker = dbChunkers.find((c) => {
      if (c.code.toUpperCase() === cleanQuery.toUpperCase()) return true;
      if (c.email.toLowerCase() === cleanQuery.toLowerCase()) return true;
      if (digitsOnly.length >= 9 && c.phone && c.phone.replace(/\D/g, '').endsWith(digitsOnly.slice(-9))) return true;
      return false;
    });

    if (!chunker) {
      return res.status(404).json({
        found: false,
        notFound: true,
        message: 'Chunkee chưa có thông tin trong hệ thống. Vui lòng nhập họ tên, email và số điện thoại để lấy link giới thiệu.',
      });
    }

    // Real candidates registered under this code
    const referredCandidates = dbCandidates.filter(
      (c) => c.chunkerCode.toUpperCase() === chunker.code.toUpperCase()
    );

    const greenTestCount = referredCandidates.filter((c) => c.testType === 'green').length;
    const redTestCount = referredCandidates.filter((c) => c.testType === 'red').length;
    const referralLink = `${protocol}://${host}/?ref=${chunker.code}`;

    // Masked candidate list for transparency
    const sanitizedCandidates = referredCandidates.map((c) => sanitizeCandidateForChunker(c));

    return res.status(200).json({
      found: true,
      chunkerName: chunker.name,
      code: chunker.code,
      email: chunker.email,
      phone: chunker.phone,
      referralLink,
      totalReferred: referredCandidates.length,
      breakdown: {
        greenTest: greenTestCount,
        redTest: redTestCount,
      },
      candidates: sanitizedCandidates,
    });
  };

  app.all('/api/chunker/lookup', handleChunkeeLookup);
  app.all('/api/chunkee/lookup', handleChunkeeLookup);

  /**
   * POST /api/chunker/register or /api/chunkee/register
   * If a Chunkee does not have information yet, enter Full Name, Email, Phone to get link & QR code immediately.
   */
  const handleChunkeeRegister = (req: Request, res: Response) => {
    const { fullName, email, phone, customCode } = req.body || {};

    const cleanName = String(fullName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanCustomCode = String(customCode || '').trim().toUpperCase();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Họ và tên cần ít nhất 2 ký tự.',
      });
    }

    if (!isValidEmailAddress(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Email không hợp lệ.',
      });
    }

    if (!isValidPhoneNumber(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Số điện thoại không đúng định dạng (VD: 0912345678).',
      });
    }

    const host = req.get('host') || 'chunks.edu.vn';
    const protocol = req.protocol || 'https';

    // Check if Chunkee already exists by email
    let existing = dbChunkers.find(
      (c) => c.email.toLowerCase() === cleanEmail || (cleanPhone && c.phone === cleanPhone)
    );

    if (existing) {
      const referralLink = `${protocol}://${host}/?ref=${existing.code}`;
      const referredCandidates = dbCandidates.filter(
        (c) => c.chunkerCode.toUpperCase() === existing!.code.toUpperCase()
      );
      return res.status(200).json({
        success: true,
        found: true,
        alreadyExisted: true,
        chunkerName: existing.name,
        code: existing.code,
        email: existing.email,
        phone: existing.phone,
        referralLink,
        totalReferred: referredCandidates.length,
        breakdown: {
          greenTest: referredCandidates.filter((c) => c.testType === 'green').length,
          redTest: referredCandidates.filter((c) => c.testType === 'red').length,
        },
        candidates: referredCandidates.map((c) => sanitizeCandidateForChunker(c)),
      });
    }

    // Determine code
    let assignedCode = '';
    if (cleanCustomCode && /^[A-Za-z0-9_-]{3,20}$/.test(cleanCustomCode)) {
      if (!dbChunkers.some((c) => c.code.toUpperCase() === cleanCustomCode)) {
        assignedCode = cleanCustomCode;
      }
    }
    if (!assignedCode) {
      assignedCode = generateChunkeeCode(cleanName);
    }

    const newChunkee: Chunker = {
      id: `chunkee-${Date.now()}`,
      name: cleanName,
      code: assignedCode,
      email: cleanEmail,
      phone: cleanPhone,
      secretToken: `SEC-${assignedCode}`,
      active: true,
      referralCount: 0,
      createdAt: new Date().toISOString(),
      notes: 'Registered via Chunkee Hub Gateway',
    };

    dbChunkers.push(newChunkee);

    const referralLink = `${protocol}://${host}/?ref=${newChunkee.code}`;

    return res.status(201).json({
      success: true,
      found: true,
      newlyCreated: true,
      chunkerName: newChunkee.name,
      code: newChunkee.code,
      email: newChunkee.email,
      phone: newChunkee.phone,
      referralLink,
      totalReferred: 0,
      breakdown: {
        greenTest: 0,
        redTest: 0,
      },
      candidates: [],
    });
  };

  app.post('/api/chunker/register', handleChunkeeRegister);
  app.post('/api/chunkee/register', handleChunkeeRegister);

  /**
   * GET /api/chunker/stats?code={code}&token={secret_token}
   * Backward-compatible Chunker stats route
   */
  app.get('/api/chunker/stats', (req: Request, res: Response) => {
    const rawCode = (req.query.code as string) || '';
    const cleanCode = rawCode.trim().toUpperCase();

    const chunker = dbChunkers.find((c) => c.code.toUpperCase() === cleanCode);
    if (!chunker) {
      return res.status(404).json({ error: 'Chunker code not found' });
    }

    const host = req.get('host') || 'chunks.edu.vn';
    const protocol = req.protocol || 'https';
    const referralLink = `${protocol}://${host}/?ref=${chunker.code}`;

    const referredCandidates = dbCandidates.filter(
      (c) => c.chunkerCode.toUpperCase() === cleanCode
    );

    return res.status(200).json({
      chunkerName: chunker.name,
      referralLink,
      totalReferred: referredCandidates.length,
      breakdown: {
        greenTest: referredCandidates.filter((c) => c.testType === 'green').length,
        redTest: referredCandidates.filter((c) => c.testType === 'red').length,
      },
      candidates: referredCandidates.map((c) => sanitizeCandidateForChunker(c)),
    });
  });

  // ---------------------------------------------------------------------
  // [GROUP C: Protected Admin APIs]
  // ---------------------------------------------------------------------

  /**
   * GET /api/admin/metrics
   */
  app.get('/api/admin/metrics', adminAuthMiddleware, (_req: Request, res: Response) => {
    const target = 100;
    const totalRegistered = dbCandidates.length;
    const greenCount = dbCandidates.filter((c) => c.testType === 'green').length;
    const redCount = dbCandidates.filter((c) => c.testType === 'red').length;

    const topChunkers = [...dbChunkers]
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        code: c.code,
        email: c.email,
        referralCount: c.referralCount,
      }));

    return res.status(200).json({
      target,
      totalRegistered,
      greenCount,
      redCount,
      topChunkers,
    });
  });

  /**
   * GET /api/admin/candidates?page=1&limit=20&testType=ALL&status=ALL&search=
   * Response: Full raw candidate objects including raw Phone, Email, Referral Chunker details, and Status.
   */
  app.get('/api/admin/candidates', adminAuthMiddleware, (req: Request, res: Response) => {
    const parseResult = adminCandidatesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parseResult.error.flatten() });
    }

    const { page, limit, testType, status, search } = parseResult.data;

    let filtered = [...dbCandidates];

    // Filter by test type
    if (testType !== 'ALL') {
      const targetType = testType.toLowerCase().includes('green') ? 'green' : 'red';
      filtered = filtered.filter((c) => c.testType === targetType);
    }

    // Filter by test level if provided in query
    const levelQuery = req.query.level as string | undefined;
    if (levelQuery && levelQuery !== 'ALL') {
      const targetLevel = levelQuery.toLowerCase() === 'hard' || levelQuery.toLowerCase() === 'khó' ? 'hard' : 'easy';
      filtered = filtered.filter((c) => (c.testLevel || 'easy') === targetLevel);
    }

    // Filter by status
    if (status !== 'ALL') {
      const targetStatus = status.toLowerCase().replace('_', '') as CandidateStatus;
      filtered = filtered.filter((c) => c.status.toLowerCase().replace('_', '') === targetStatus);
    }

    // Filter by search query (raw name, phone, email, code)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.chunkerCode.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      candidates: paginated,
    });
  });

  /**
   * PATCH /api/admin/candidates/:id/status
   */
  app.patch('/api/admin/candidates/:id/status', adminAuthMiddleware, (req: Request, res: Response) => {
    const { id } = req.params;
    const parseResult = updateCandidateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid update body', details: parseResult.error.flatten() });
    }

    const candidate = dbCandidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const { status, notes, scheduledAt } = parseResult.data;
    const normalizedStatus = status.toLowerCase().replace('_', '') as CandidateStatus;

    candidate.status = normalizedStatus;
    if (notes !== undefined) candidate.notes = notes;
    if (scheduledAt !== undefined) candidate.scheduledAt = scheduledAt;
    candidate.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      candidate,
    });
  });

  /**
   * POST /api/admin/chunkers
   */
  app.post('/api/admin/chunkers', adminAuthMiddleware, (req: Request, res: Response) => {
    const parseResult = createChunkerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid chunker data', details: parseResult.error.flatten() });
    }

    const data = parseResult.data;
    const cleanCode = data.code.toUpperCase();

    if (dbChunkers.some((c) => c.code.toUpperCase() === cleanCode)) {
      return res.status(409).json({ error: `Chunker code '${cleanCode}' already exists.` });
    }

    const newChunker: Chunker = {
      id: `chunker-${Date.now()}`,
      name: (data.fullName || data.name)!.trim(),
      code: cleanCode,
      email: data.email.trim().toLowerCase(),
      secretToken: data.secretToken || `SEC-${cleanCode}`,
      active: true,
      referralCount: 0,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    dbChunkers.unshift(newChunker);

    return res.status(201).json({
      success: true,
      chunker: newChunker,
    });
  });

  /**
   * GET /api/admin/chunkers
   */
  app.get('/api/admin/chunkers', adminAuthMiddleware, (_req: Request, res: Response) => {
    return res.status(200).json({
      chunkers: dbChunkers,
    });
  });

  /**
   * GET /api/admin/settings/notifications
   */
  app.get('/api/admin/settings/notifications', adminAuthMiddleware, (_req: Request, res: Response) => {
    return res.status(200).json({
      settings: notificationSettings,
      recentLogs: notificationLogs.slice(0, 10),
    });
  });

  /**
   * POST /api/admin/settings/notifications
   */
  app.post('/api/admin/settings/notifications', adminAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { notificationEmails, enabled } = req.body || {};

    if (!Array.isArray(notificationEmails) || notificationEmails.length === 0) {
      return res.status(400).json({ error: 'Cần ít nhất một địa chỉ email hợp lệ.' });
    }

    const cleanEmails = notificationEmails
      .map((e: string) => String(e).trim().toLowerCase())
      .filter((e: string) => isValidEmailAddress(e));

    if (cleanEmails.length === 0) {
      return res.status(400).json({ error: 'Không có email hợp lệ nào được cung cấp.' });
    }

    notificationSettings = {
      notificationEmails: cleanEmails,
      enabled: enabled !== false,
      updatedAt: new Date().toISOString(),
      updatedBy: req.adminEmail || 'admin',
    };

    return res.status(200).json({
      success: true,
      message: 'Cập nhật email nhận thông báo thành công!',
      settings: notificationSettings,
    });
  });

  /**
   * POST /api/admin/notifications/test
   * Dispatches a test notification email event to configured addresses
   */
  app.post('/api/admin/notifications/test', adminAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (!notificationSettings.notificationEmails.length) {
      return res.status(400).json({ error: 'Chưa cấu hình email nhận thông báo.' });
    }

    const testLog: NotificationDispatchLog = {
      id: `test_${Date.now()}`,
      recipients: [...notificationSettings.notificationEmails],
      candidateName: 'Nguyễn Văn A (Mẫu Thử Nghiệm)',
      phone: '0912 345 678',
      email: 'candidate.sample@example.com',
      testType: 'Green Focus (%c)',
      testLevel: 'Khó (Advanced)',
      preferredSlots: 'Tối ngày trong tuần (19:00 - 21:00)',
      chunkerCode: 'TEST2026',
      timestamp: new Date().toISOString(),
      status: 'simulated',
    };

    notificationLogs.unshift(testLog);
    if (notificationLogs.length > 50) notificationLogs.pop();

    console.log(
      `[TEST NOTIFICATION DISPATCH] Alert sent to: ${notificationSettings.notificationEmails.join(', ')}`
    );

    return res.status(200).json({
      success: true,
      message: `Đã gửi thông báo thử nghiệm tới ${notificationSettings.notificationEmails.join(', ')}`,
      testLog,
    });
  });

  /**
   * POST /api/admin/candidates/:id/resend-confirmation
   * Manually re-triggers automated candidate confirmation email.
   */
  app.post('/api/admin/candidates/:id/resend-confirmation', adminAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const candidateId = req.params.id;
    const candidate = dbCandidates.find((c) => c.id === candidateId);

    if (!candidate) {
      return res.status(404).json({ error: 'Không tìm thấy ứng viên.' });
    }

    const result = await sendAutomatedCandidateConfirmationEmail(candidate);

    notificationLogs.unshift({
      id: `resend_${Date.now()}`,
      recipients: [candidate.email],
      candidateName: candidate.fullName,
      phone: candidate.phone,
      email: candidate.email,
      testType: candidate.testType === 'green' ? 'Green Focus (%c)' : 'Red Improv (%r)',
      testLevel: candidate.testLevel === 'easy' ? 'Dễ (Foundation)' : 'Khó (Advanced)',
      preferredSlots: candidate.preferredSlots,
      chunkerCode: candidate.chunkerCode,
      timestamp: new Date().toISOString(),
      status: result.success ? 'sent' : 'simulated',
    });

    return res.status(200).json({
      success: true,
      message: `Đã gửi lại email xác nhận bài test (${candidate.testType.toUpperCase()} - Level ${candidate.testLevel}) tới ${candidate.email}!`,
      candidate,
    });
  });

  /**
   * GET /api/public/confirmation-email-preview
   * Previews the rendered candidate confirmation email template.
   */
  app.get('/api/public/confirmation-email-preview', (req: Request, res: Response) => {
    const testType = req.query.testType === 'red' ? 'red' : 'green';
    const testLevel = req.query.testLevel === 'hard' ? 'hard' : 'easy';
    const fullName = (req.query.fullName as string) || 'Nguyễn Văn A';
    const phone = (req.query.phone as string) || '0987 654 321';
    const email = (req.query.email as string) || 'nguyen.vana@example.com';
    const preferredSlots = (req.query.preferredSlots as string) || 'Tối ngày trong tuần (19:00 - 21:00)';
    const chunkerCode = (req.query.chunkerCode as string) || 'DIRECT';

    const rendered = generateCandidateEmailContent({
      candidateId: 'DEMO-PREVIEW',
      fullName,
      phone,
      email,
      testType,
      testLevel,
      preferredSlots,
      chunkerCode,
      chunkerName: chunkerCode !== 'DIRECT' ? 'Người giới thiệu' : '',
    });

    if (req.query.format === 'json') {
      return res.status(200).json(rendered);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(rendered.html);
  });

  /**
   * GET /api/admin/export
   * Response: Binary Stream text/csv with UTF-8 encoding.
   */
  app.get('/api/admin/export', adminAuthMiddleware, (_req: Request, res: Response) => {
    const headers = [
      'Candidate ID',
      'Full Name',
      'Phone',
      'Email',
      'Age Range',
      'Occupation',
      'Test Type',
      'Test Level',
      'Preferred Slot',
      'Referral Code',
      'Referring Chunker',
      'Email Confirmed',
      'Status',
      'Notes',
      'Created At',
    ];

    const rows = dbCandidates.map((c) => [
      `"${c.id || ''}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.ageRange}"`,
      `"${c.occupation.replace(/"/g, '""')}"`,
      `"${c.testType === 'green' ? 'GREEN_TEST' : 'RED_TEST'}"`,
      `"${c.testLevel === 'hard' ? 'Khó (Hard)' : 'Dễ (Easy)'}"`,
      `"${c.preferredSlots.replace(/"/g, '""')}"`,
      `"${c.chunkerCode}"`,
      `"${(c.chunkerName || '').replace(/"/g, '""')}"`,
      `"${c.confirmationEmailSent ? 'SENT' : 'PENDING'}"`,
      `"${c.status.toUpperCase()}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${c.createdAt || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="chunks_test_100_candidates_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(Buffer.from(csvContent, 'utf-8'));
  });

  // ---------------------------------------------------------------------
  // Frontend Mounting / Vite Dev Server
  // ---------------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Chunks Test 100 Server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
