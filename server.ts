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
import { dbService } from './src/db/database';
import {
  sendCandidateConfirmationEmail,
  sendAdminNewCandidateNotification,
  getEmailProviderStatus,
} from './src/lib/email';
import { generateCandidateEmailContent } from './src/utils/candidateEmailTemplate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Whitelist of allowed Admin Emails
const ADMIN_EMAIL_WHITELIST = [
  'le.ntmkh@gmail.com',
  'lucy2511kh@gmail.com',
  'admin@chunks.edu.vn',
  'operations@chunks.edu.vn',
];

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
  app.set('trust proxy', true);
  app.use(express.json());

  // ---------------------------------------------------------------------
  // [GROUP A: Public / Candidate APIs]
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // [DIAGNOSTICS & SYSTEM HEALTHCHECK]
  // ---------------------------------------------------------------------

  /**
   * GET /api/health
   * Live database connection status & metrics
   */
  app.get('/api/health', (_req: Request, res: Response) => {
    const health = dbService.getHealth();
    const emailStatus = getEmailProviderStatus();
    return res.status(200).json({
      status: health.status,
      dbConnected: health.dbConnected,
      totalCandidatesInDB: health.totalCandidatesInDB,
      totalChunkersInDB: health.totalChunkersInDB,
      timestamp: health.timestamp,
      dbPath: health.dbPath,
      emailService: {
        configured: emailStatus.configured,
        provider: emailStatus.provider,
        details: emailStatus.details,
      },
    });
  });

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
    const chunker = dbService.getChunkerByCode(cleanCode);

    if (!chunker || !chunker.active) {
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
   * Real SQL INSERT into persistent database & Async automated confirmation email.
   */
  app.post('/api/public/candidates/register', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Anti-Spam Rate Limit Check
    if (!checkRateLimit(clientIp)) {
      console.warn(`[RATE_LIMIT_BLOCKED] IP ${clientIp} exceeded max registration attempts.`);
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Bạn đã gửi đăng ký quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
      });
    }

    // Zod Schema Validation
    const parseResult = candidateRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.warn('[REGISTRATION_VALIDATION_ERROR]:', parseResult.error.flatten());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const data = parseResult.data;
    const cleanCode = (data.referralCode || 'DIRECT').toUpperCase();
    const chunker = dbService.getChunkerByCode(cleanCode);

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
      updatedAt: new Date().toISOString(),
    };

    // 1. REAL PERSISTENT SQL INSERT INTO DATABASE
    try {
      dbService.insertCandidate(newCandidate);
      console.log(`[DB_INSERT_SUCCESS] Inserted candidate ${candidateId} (${newCandidate.fullName}) into SQLite database.`);
    } catch (dbErr: any) {
      console.error('[REGISTRATION_ERROR] Database insertion failed:', dbErr);
      return res.status(500).json({
        success: false,
        error: 'DatabaseError',
        message: 'Không thể ghi nhận dữ liệu vào cơ sở dữ liệu. Vui lòng thử lại.',
      });
    }

    // 2. ASYNC NON-BLOCKING EMAIL DISPATCH (Candidate Confirmation & Admin Alert)
    (async () => {
      try {
        console.log(`[EMAIL_TRIGGER] Starting async email dispatch for candidate ${candidateId}...`);
        const candidateResult = await sendCandidateConfirmationEmail(newCandidate);
        dbService.updateCandidateEmailStatus(
          candidateId,
          candidateResult.success,
          candidateResult.success ? 'delivered' : 'failed'
        );

        dbService.addNotificationLog({
          recipients: [newCandidate.email],
          candidateName: newCandidate.fullName,
          phone: newCandidate.phone,
          email: newCandidate.email,
          testType: newCandidate.testType === 'green' ? 'Green Focus (%c)' : 'Red Improv (%r)',
          testLevel: newCandidate.testLevel === 'easy' ? 'Dễ (Foundation)' : 'Khó (Advanced)',
          preferredSlots: newCandidate.preferredSlots,
          chunkerCode: newCandidate.chunkerCode,
          status: candidateResult.success ? 'sent' : 'failed',
          errorDetails: candidateResult.error,
        });

        // Trigger Admin notification if configured
        const notifSettings = dbService.getNotificationSettings();
        if (notifSettings.enabled && notifSettings.notificationEmails.length > 0) {
          const adminResult = await sendAdminNewCandidateNotification(
            newCandidate,
            notifSettings.notificationEmails
          );
          dbService.addNotificationLog({
            recipients: notifSettings.notificationEmails,
            candidateName: newCandidate.fullName,
            phone: newCandidate.phone,
            email: newCandidate.email,
            testType: newCandidate.testType === 'green' ? 'Green Focus (%c)' : 'Red Improv (%r)',
            testLevel: newCandidate.testLevel === 'easy' ? 'Dễ (Foundation)' : 'Khó (Advanced)',
            preferredSlots: newCandidate.preferredSlots,
            chunkerCode: newCandidate.chunkerCode,
            status: adminResult.success ? 'sent' : 'failed',
            errorDetails: adminResult.error,
          });
        }
      } catch (emailErr: any) {
        console.error('[EMAIL_ASYNC_ERROR] Background email sending encountered unexpected failure:', emailErr);
      }
    })();

    // 3. IMMEDIATE SUCCESS RESPONSE TO CLIENT (Never block HTTP response on email)
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
    while (dbService.getChunkerByCode(codeCandidate)) {
      codeCandidate = `${base}${counter}2026`;
      counter++;
    }
    return codeCandidate;
  };

  /**
   * Helper: Resolves the canonical public base URL for referral links.
   * Priority:
   * 1. APP_URL env variable (if non-localhost)
   * 2. Reverse proxy headers: x-forwarded-host & x-forwarded-proto
   * 3. Browser headers: origin or referer (if non-localhost)
   * 4. Request Host (if non-localhost)
   * 5. Default production domain: https://chunkstest.ai.studio
   */
  const getBaseUrl = (req: Request): string => {
    // 1. Environment variable override
    const envUrl = process.env.APP_URL?.trim();
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '');
    }

    // 2. Google Cloud Run / AI Studio reverse proxy headers
    const xForwardedHost = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0].trim();
    const xForwardedProto = (req.headers['x-forwarded-proto'] as string | undefined) || 'https';
    if (xForwardedHost && !xForwardedHost.includes('localhost') && !xForwardedHost.includes('127.0.0.1')) {
      return `${xForwardedProto}://${xForwardedHost}`;
    }

    // 3. Origin header sent by browser during client-side fetch
    const origin = req.headers['origin'] as string | undefined;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/\/+$/, '');
    }

    // 4. Referer header
    const referer = req.headers['referer'] as string | undefined;
    if (referer) {
      try {
        const u = new URL(referer);
        if (!u.hostname.includes('localhost') && !u.hostname.includes('127.0.0.1')) {
          return u.origin.replace(/\/+$/, '');
        }
      } catch {
        // ignore
      }
    }

    // 5. Host header
    const host = req.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.startsWith('0.0.0.0')) {
      const proto = req.secure || xForwardedProto === 'https' ? 'https' : (req.protocol || 'https');
      return `${proto}://${host}`;
    }

    // 6. Canonical official production domain
    return 'https://chunkstest.ai.studio';
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

    const baseUrl = getBaseUrl(req);
    const digitsOnly = cleanQuery.replace(/\D/g, '');

    // 1. Check existing chunker/chunkee by code, email, or phone
    const chunkers = dbService.getChunkers();
    const chunker = chunkers.find((c) => {
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

    // Real candidates registered under this code from persistent SQLite database
    const { candidates: referredCandidates } = dbService.getCandidates({
      search: chunker.code,
      limit: 100,
    });

    const greenTestCount = referredCandidates.filter((c) => c.testType === 'green').length;
    const redTestCount = referredCandidates.filter((c) => c.testType === 'red').length;
    const referralLink = `${baseUrl}/?ref=${chunker.code}`;

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

    const baseUrl = getBaseUrl(req);

    // Check if Chunkee already exists by email
    const chunkers = dbService.getChunkers();
    let existing = chunkers.find(
      (c) => c.email.toLowerCase() === cleanEmail || (cleanPhone && c.phone === cleanPhone)
    );

    if (existing) {
      const referralLink = `${baseUrl}/?ref=${existing.code}`;
      const { candidates: referredCandidates } = dbService.getCandidates({ search: existing.code, limit: 100 });
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
      if (!dbService.getChunkerByCode(cleanCustomCode)) {
        assignedCode = cleanCustomCode;
      }
    }
    if (!assignedCode) {
      assignedCode = generateChunkeeCode(cleanName);
    }

    const newChunkee = dbService.createChunker({
      name: cleanName,
      code: assignedCode,
      email: cleanEmail,
      notes: 'Registered via Chunkee Hub Gateway',
    });

    const referralLink = `${baseUrl}/?ref=${newChunkee.code}`;

    return res.status(201).json({
      success: true,
      found: true,
      newlyCreated: true,
      chunkerName: newChunkee.name,
      code: newChunkee.code,
      email: newChunkee.email,
      phone: cleanPhone,
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
   * GET /api/chunker/stats?code={code}
   * Backward-compatible Chunker stats route
   */
  app.get('/api/chunker/stats', (req: Request, res: Response) => {
    const rawCode = (req.query.code as string) || '';
    const cleanCode = rawCode.trim().toUpperCase();

    const chunker = dbService.getChunkerByCode(cleanCode);
    if (!chunker) {
      return res.status(404).json({ error: 'Chunker code not found' });
    }

    const baseUrl = getBaseUrl(req);
    const referralLink = `${baseUrl}/?ref=${chunker.code}`;

    const { candidates: referredCandidates } = dbService.getCandidates({
      search: cleanCode,
      limit: 100,
    });

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
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.status(200).json(dbService.getMetrics());
  });

  /**
   * GET /api/admin/candidates?page=1&limit=20&testType=ALL&status=ALL&search=
   * Response: Dynamic server-side fetching directly from persistent SQLite database.
   */
  app.get('/api/admin/candidates', adminAuthMiddleware, (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const parseResult = adminCandidatesQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parseResult.error.flatten() });
    }

    const { page, limit, testType, status, search } = parseResult.data;
    const levelQuery = req.query.level as string | undefined;

    const result = dbService.getCandidates({
      page,
      limit,
      testType: testType !== 'ALL' ? (testType.toLowerCase().includes('green') ? 'green' : 'red') : undefined,
      testLevel: levelQuery && levelQuery !== 'ALL' ? levelQuery : undefined,
      status: status !== 'ALL' ? status : undefined,
      search: search.trim() || undefined,
    });

    return res.status(200).json(result);
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

    const candidate = dbService.getCandidateById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const { status, notes } = parseResult.data;
    const normalizedStatus = status.toLowerCase().replace('_', '') as CandidateStatus;

    dbService.updateCandidateStatus(id, normalizedStatus, notes);
    const updated = dbService.getCandidateById(id);

    return res.status(200).json({
      success: true,
      candidate: updated,
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

    if (dbService.getChunkerByCode(cleanCode)) {
      return res.status(409).json({ error: `Chunker code '${cleanCode}' already exists.` });
    }

    const chunker = dbService.createChunker({
      name: (data.fullName || data.name)!.trim(),
      code: cleanCode,
      email: data.email.trim().toLowerCase(),
      notes: data.notes || '',
    });

    return res.status(201).json({
      success: true,
      chunker,
    });
  });

  /**
   * GET /api/admin/chunkers
   */
  app.get('/api/admin/chunkers', adminAuthMiddleware, (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({
      chunkers: dbService.getChunkers(),
    });
  });

  /**
   * GET /api/admin/settings/notifications
   */
  app.get('/api/admin/settings/notifications', adminAuthMiddleware, (_req: Request, res: Response) => {
    return res.status(200).json({
      settings: dbService.getNotificationSettings(),
      recentLogs: dbService.getNotificationLogs(10),
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

    dbService.saveNotificationSettings(
      {
        notificationEmails: cleanEmails,
        enabled: enabled !== false,
      },
      req.adminEmail || 'admin'
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật email nhận thông báo thành công!',
      settings: dbService.getNotificationSettings(),
    });
  });

  /**
   * POST /api/admin/notifications/test
   * Dispatches a test notification email event to configured addresses
   */
  app.post('/api/admin/notifications/test', adminAuthMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
    const notifSettings = dbService.getNotificationSettings();
    if (!notifSettings.notificationEmails.length) {
      return res.status(400).json({ error: 'Chưa cấu hình email nhận thông báo.' });
    }

    const fakeCandidate: Candidate = {
      id: `test_${Date.now()}`,
      fullName: 'Nguyễn Văn A (Mẫu Thử Nghiệm)',
      phone: '0912 345 678',
      email: notifSettings.notificationEmails[0],
      ageRange: '25-34',
      occupation: 'Developer',
      testType: 'green',
      testLevel: 'hard',
      preferredSlots: 'Tối ngày trong tuần (19:00 - 21:00)',
      chunkerCode: 'TEST2026',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const result = await sendAdminNewCandidateNotification(fakeCandidate, notifSettings.notificationEmails);

    const testLog = {
      id: `test_${Date.now()}`,
      recipients: notifSettings.notificationEmails,
      candidateName: fakeCandidate.fullName,
      phone: fakeCandidate.phone,
      email: fakeCandidate.email,
      testType: 'Green Focus (%c)',
      testLevel: 'Khó (Advanced)',
      preferredSlots: fakeCandidate.preferredSlots,
      chunkerCode: fakeCandidate.chunkerCode,
      status: result.success ? ('sent' as const) : ('failed' as const),
      errorDetails: result.error,
    };

    dbService.addNotificationLog(testLog);

    console.log(
      `[TEST NOTIFICATION DISPATCH] Alert sent to: ${notifSettings.notificationEmails.join(', ')} | Success: ${result.success}`
    );

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? `Đã gửi thông báo thử nghiệm thành công tới ${notifSettings.notificationEmails.join(', ')}!`
        : `Gửi email thử nghiệm thất bại: ${result.error || 'Vui lòng kiểm tra cấu hình RESEND_API_KEY hoặc SMTP'}`,
      testLog,
    });
  });

  /**
   * POST /api/admin/candidates/:id/resend-confirmation
   * Manually re-triggers automated candidate confirmation email.
   */
  app.post('/api/admin/candidates/:id/resend-confirmation', adminAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const candidateId = req.params.id;
    const candidate = dbService.getCandidateById(candidateId);

    if (!candidate) {
      return res.status(404).json({ error: 'Không tìm thấy ứng viên.' });
    }

    const result = await sendCandidateConfirmationEmail(candidate);
    dbService.updateCandidateEmailStatus(candidateId, result.success, result.success ? 'delivered' : 'failed');

    dbService.addNotificationLog({
      recipients: [candidate.email],
      candidateName: candidate.fullName,
      phone: candidate.phone,
      email: candidate.email,
      testType: candidate.testType === 'green' ? 'Green Focus (%c)' : 'Red Improv (%r)',
      testLevel: candidate.testLevel === 'easy' ? 'Dễ (Foundation)' : 'Khó (Advanced)',
      preferredSlots: candidate.preferredSlots,
      chunkerCode: candidate.chunkerCode,
      status: result.success ? 'sent' : 'failed',
      errorDetails: result.error,
    });

    const updated = dbService.getCandidateById(candidateId);

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? `Đã gửi lại email xác nhận bài test (${candidate.testType.toUpperCase()} - Level ${candidate.testLevel}) tới ${candidate.email}!`
        : `Gửi email thất bại: ${result.error || 'Vui lòng kiểm tra RESEND_API_KEY hoặc SMTP'}`,
      candidate: updated,
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
    const { candidates } = dbService.getCandidates({ limit: 1000 });
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

    const rows = candidates.map((c) => [
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
