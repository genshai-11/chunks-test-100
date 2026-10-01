import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { OAuth2Client } from 'google-auth-library';
import {
  referralQuerySchema, candidateRegisterSchema, adminCandidatesQuerySchema,
  updateCandidateStatusSchema, createChunkerSchema, publicRegisterChunkerSchema, isValidEmailAddress,
} from './src/schemas/validation';
import { Candidate, CandidateStatus } from './src/types';
import { dbService, getServerFirestore, RegistrationError } from './src/db/database';
import { verifyAdminBearerToken } from './src/lib/adminAuth';
import { processEmailOutbox, processCandidateEmailOutbox } from './src/lib/emailOutbox';
import {
  sendAdminNewCandidateNotification,
  getEmailProviderStatus,
} from './src/lib/email';
import { generateCandidateEmailContent } from './src/utils/candidateEmailTemplate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

interface AuthenticatedRequest extends Request {
  adminEmail?: string;
}

async function adminAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    req.adminEmail = await verifyAdminBearerToken(req.headers.authorization);
    next();
  } catch {
    res.status(403).json({ error: 'Forbidden' });
  }
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const ALLOWED_ORIGINS = [
    'https://chunkstest.web.app',
    'https://chunkstest.firebaseapp.com',
    'https://fourth-vehicle-452610-a1.web.app',
    'https://fourth-vehicle-452610-a1.firebaseapp.com',
    'https://chunkstest.ai.studio',
  ];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(express.json());
  // Cloud Scheduler must call this endpoint with an OIDC token for the Cloud
  // Run service audience. A regular request does not authorize outbox work.
  app.post('/api/internal/drain-email-outbox', async (req: Request, res: Response) => {
    const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '')?.[1];
    if (!token || !process.env.OUTBOX_SCHEDULER_EMAIL || !process.env.OUTBOX_AUDIENCE) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const ticket = await new OAuth2Client().verifyIdToken({ idToken: token, audience: process.env.OUTBOX_AUDIENCE });
      if (ticket.getPayload()?.email !== process.env.OUTBOX_SCHEDULER_EMAIL || ticket.getPayload()?.email_verified !== true) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.json({ processed: await processEmailOutbox() });
    } catch {
      return res.status(403).json({ error: 'Forbidden' });
    }
  });

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
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const health = await dbService.getHealth();
      const emailStatus = getEmailProviderStatus();
      return res.status(health.dbConnected ? 200 : 503).json({
        ...health,
        emailService: emailStatus,
      });
    } catch {
      return res.status(503).json({ status: 'error', dbConnected: false });
    }
  });

  // ---------------------------------------------------------------------
  // [GROUP A: Public / Candidate APIs]
  // ---------------------------------------------------------------------

  /**
   * GET /api/public/referral?code={code}
   * Purpose: Validate code when Candidate opens /?ref={code} to show greeting banner.
   * Strict Rule: NEVER expose chunker email, phone, ID, or how many people they have invited.
   */
  app.get('/api/public/referral', async (req: Request, res: Response) => {
    const parseResult = referralQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ valid: false, error: 'Invalid referral code format' });
    }
    const cleanCode = parseResult.data.code.toUpperCase();
    try {
      const chunker = await dbService.getChunkerByCode(cleanCode);
      return res.status(200).json({
        valid: !!chunker?.active,
        chunkerName: chunker?.active ? chunker.name : null,
        referralCode: cleanCode,
      });
    } catch {
      return res.status(503).json({ valid: false, error: 'Referral service unavailable' });
    }
  });

  /**
   * POST /api/public/chunkee/register-referrer
   * Purpose: Allow Chunkees on the main landing page to self-register their referral account and get their referral link/QR code.
   */
  app.post('/api/public/chunkee/register-referrer', async (req: Request, res: Response) => {
    const parsed = publicRegisterChunkerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => i.message).join('; '),
      });
    }
    const { fullName, email, phone, preferredCode } = parsed.data;
    const baseCode = (preferredCode || fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()) || 'CHUNKEE';
    let candidateCode = baseCode;
    const existing = await dbService.getChunkerByCode(candidateCode);
    if (existing) {
      if (preferredCode) {
        return res.status(409).json({ success: false, error: 'Mã giới thiệu này đã có người sử dụng. Vui lòng chọn mã khác.' });
      }
      candidateCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    try {
      const chunker = await dbService.createChunker({
        name: fullName.trim(),
        code: candidateCode,
        email: email.trim(),
        notes: `Tự đăng ký từ trang chủ${phone ? ` · SĐT: ${phone.trim()}` : ''}`,
      });
      return res.status(201).json({
        success: true,
        chunker: {
          code: chunker.code,
          name: chunker.name,
        },
      });
    } catch {
      return res.status(503).json({ success: false, error: 'Không thể tạo mã giới thiệu lúc này. Vui lòng thử lại sau.' });
    }
  });

  /** Record one registration, its referral, quota, phone lock, and email jobs atomically. */
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
    const cleanCode = (data.referralCode || 'PILOT100').toUpperCase();
    const now = new Date().toISOString();
    const newCandidate: Candidate = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      ageRange: data.ageRange,
      occupation: data.occupation.trim(),
      testType: data.testType === 'GENERAL_TEST' || data.testType === 'general'
        ? 'general'
        : data.testType === 'GREEN_TEST' || data.testType === 'green' ? 'green' : 'red',
      testLevel: data.testLevel,
      preferredSlots: data.preferredTimeSlot.trim(),
      ...(data.selectedDate !== undefined ? { selectedDate: data.selectedDate } : {}),
      ...(data.selectedTimeSlot !== undefined ? { selectedTimeSlot: data.selectedTimeSlot } : {}),
      chunkerCode: cleanCode,
      status: 'new',
      confirmationEmailSent: false,
      confirmationEmailStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    try {
      const candidate = await dbService.registerCandidate(newCandidate);
      // Jobs are durable before the response. A worker processes them on the
      // next tick or on a later request if this instance terminates.
      void processCandidateEmailOutbox(candidate.id!).catch(() => {});
      return res.status(201).json({
        success: true,
        registrationId: candidate.id,
        message: 'Đã nhận yêu cầu đăng ký. Đội ngũ CHUNKS sẽ liên hệ để xác nhận lịch.',
      });
    } catch (error) {
      if (error instanceof RegistrationError) {
        const status = error.code === 'INVALID_REFERRAL' ? 400 : 409;
        return res.status(status).json({ success: false, error: error.code, message: error.message });
      }
      console.error('[REGISTRATION_ERROR] Firestore registration failed.');
      return res.status(503).json({
        success: false,
        error: 'DatabaseError',
        message: 'Không thể ghi nhận đăng ký. Vui lòng thử lại.',
      });
    }
  });

  // The public referral resolver returns only the inviter's name. Neither
  // email/phone lookup nor self-service code creation proves Chunkee identity.
  // Invite codes are provisioned by verified operations staff.


  // ---------------------------------------------------------------------
  // [GROUP C: Protected Admin APIs]
  // ---------------------------------------------------------------------

  app.get('/api/admin/metrics', adminAuthMiddleware, async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try { return res.json(await dbService.getMetrics()); }
    catch { return res.status(503).json({ error: 'Campaign database unavailable' }); }
  });

  app.get('/api/admin/candidates', adminAuthMiddleware, async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const parsed = adminCandidatesQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid query parameters' });
    const { page, limit, testType, status, search } = parsed.data;
    try {
      return res.json(await dbService.getCandidates({
        page, limit, search: search.trim() || undefined,
        testType: testType !== 'ALL' ? testType.toLowerCase() : undefined,
        status: status !== 'ALL' ? status : undefined,
      }));
    } catch { return res.status(503).json({ error: 'Campaign database unavailable' }); }
  });

  app.patch('/api/admin/candidates/:id/status', adminAuthMiddleware, async (req: Request, res: Response) => {
    const parsed = updateCandidateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid update body' });
    try {
      if (!await dbService.getCandidateById(req.params.id)) return res.status(404).json({ error: 'Candidate not found' });
      const status = parsed.data.status.toLowerCase().replace('_', '') as CandidateStatus;
      await dbService.updateCandidateStatus(req.params.id, status, parsed.data.notes);
      return res.json({ success: true, candidate: await dbService.getCandidateById(req.params.id) });
    } catch { return res.status(503).json({ error: 'Campaign database unavailable' }); }
  });

  app.post('/api/admin/chunkers', adminAuthMiddleware, async (req: Request, res: Response) => {
    const parsed = createChunkerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid chunker data',
        details: parsed.error.issues.map((i) => i.message).join('; '),
      });
    }
    const data = parsed.data;
    try {
      const chunker = await dbService.createChunker({ name: (data.fullName || data.name)!.trim(), code: data.code, email: data.email, notes: data.notes });
      return res.status(201).json({ success: true, chunker });
    } catch (error) {
      const exists = typeof error === 'object' && error !== null && 'code' in error && error.code === 6;
      return res.status(exists ? 409 : 503).json({ error: exists ? 'Chunker code exists' : 'Campaign database unavailable' });
    }
  });

  app.get('/api/admin/chunkers', adminAuthMiddleware, async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try { return res.json({ chunkers: await dbService.getChunkers() }); }
    catch { return res.status(503).json({ error: 'Campaign database unavailable' }); }
  });
  app.patch('/api/admin/chunkers/:code', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const chunker = await dbService.updateChunker(req.params.code, req.body);
      return res.json({ success: true, chunker });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(message === 'Chunker not found' ? 404 : 503).json({ error: message });
    }
  });

  app.delete('/api/admin/chunkers/:code', adminAuthMiddleware, async (req: Request, res: Response) => {
    const code = req.params.code.trim().toUpperCase();
    if (code === 'PILOT100') {
      return res.status(400).json({ error: 'Cannot delete default PILOT100 account' });
    }
    try {
      await dbService.deleteChunker(code);
      return res.json({ success: true, message: 'Chunker deleted successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(message === 'Chunker not found' ? 404 : 503).json({ error: message });
    }
  });


  app.get('/api/admin/settings/notifications', adminAuthMiddleware, async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const [settings, recentLogs] = await Promise.all([dbService.getNotificationSettings(), dbService.getNotificationLogs(10)]);
      return res.json({ settings, recentLogs });
    } catch { return res.status(503).json({ error: 'Campaign database unavailable' }); }
  });

  app.post('/api/admin/settings/notifications', adminAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    let { notificationEmails, enabled } = req.body || {};
    if (typeof notificationEmails === 'string') {
      notificationEmails = notificationEmails.split(/[,;\n]/).map((s: string) => s.trim().toLowerCase()).filter(Boolean);
    }
    const cleanEmails = Array.isArray(notificationEmails)
      ? notificationEmails.map((email: unknown) => String(email).trim().toLowerCase()).filter(Boolean)
      : [];
    if (cleanEmails.length < 1 || cleanEmails.length > 20 ||
      !cleanEmails.every((email: string) => isValidEmailAddress(email))) {
      return res.status(400).json({ error: 'Invalid notification recipients' });
    }
    try {
      const settings = await dbService.saveNotificationSettings({
        notificationEmails: cleanEmails,
        enabled: enabled === true,
      }, req.adminEmail!);
      return res.json({ success: true, settings });
    } catch { return res.status(503).json({ error: 'Campaign database unavailable' }); }
  });

  app.post('/api/admin/notifications/test', adminAuthMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await dbService.getNotificationSettings();
      if (!settings.notificationEmails.length) return res.status(400).json({ error: 'No notification recipients configured' });
      const sample: Candidate = {
        id: `test_${Date.now()}`, fullName: 'CHUNKS Test (Sample)', phone: '0900000000',
        email: settings.notificationEmails[0], ageRange: '25-34', occupation: 'Test',
        testType: 'green', testLevel: 'easy', preferredSlots: 'Sample',
        chunkerCode: 'PILOT100', status: 'new', createdAt: new Date().toISOString(),
      };
      const result = await sendAdminNewCandidateNotification(sample, settings.notificationEmails);
      await dbService.addNotificationLog({ candidateId: sample.id, kind: 'test', recipients: settings.notificationEmails, status: result.status });
      return res.status(result.success ? 200 : 503).json({ success: result.success, message: result.success ? 'Provider accepted sample message; delivery unconfirmed.' : result.error });
    } catch { return res.status(503).json({ error: 'Notification unavailable' }); }
  });

  app.post('/api/admin/candidates/:id/resend-confirmation', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const db = getServerFirestore();
      const candidateRef = db.collection('candidates').doc(req.params.id);
      const jobRef = db.collection('emailOutbox').doc(`${req.params.id}_candidate`);
      const outcome = await db.runTransaction(async (tx) => {
        const [candidate, job] = await Promise.all([tx.get(candidateRef), tx.get(jobRef)]);
        if (!candidate.exists) return 'missing-candidate';
        if (!job.exists) return 'missing-job';
        if (job.get('status') === 'processing') return 'processing';
        tx.update(jobRef, { status: 'pending', attempts: 0, nextAttemptAt: Date.now(), claimId: null, leaseUntil: 0 });
        tx.update(candidateRef, { confirmationEmailSent: false, confirmationEmailStatus: 'pending' });
        return 'queued';
      });
      if (outcome !== 'queued') return res.status(outcome === 'processing' ? 409 : 404).json({ error: outcome });
      await processCandidateEmailOutbox(req.params.id);
      const updated = await jobRef.get();
      return res.status(updated.get('status') === 'accepted' ? 200 : 503).json({
        success: updated.get('status') === 'accepted',
        message: updated.get('status') === 'accepted' ? 'Provider accepted message; delivery unconfirmed.' : 'Provider has not accepted the message.',
        candidate: await dbService.getCandidateById(req.params.id),
      });
    } catch { return res.status(503).json({ error: 'Confirmation resend unavailable' }); }
  });

  app.get('/api/public/confirmation-email-preview', (req: Request, res: Response) => {
    const testType = req.query.testType === 'red' ? 'red' : 'green';
    const testLevel = req.query.testLevel === 'hard' ? 'hard' : 'easy';
    const rendered = generateCandidateEmailContent({
      candidateId: 'DEMO-PREVIEW', fullName: 'Nguyễn Văn A', phone: '0900000000',
      email: 'sample@example.com', testType, testLevel,
      preferredSlots: 'Tối ngày trong tuần', chunkerCode: 'PILOT100',
    });
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(rendered.html);
  });

  /**
   * GET /api/admin/export
   * Response: Binary Stream text/csv with UTF-8 encoding.
   */
  app.get('/api/admin/export', adminAuthMiddleware, async (_req: Request, res: Response) => {
    try {
      const { candidates } = await dbService.getCandidates({ limit: 1000 });
      const headers = ['Candidate ID', 'Full Name', 'Phone', 'Email', 'Age Range', 'Occupation', 'Test Type', 'Test Level', 'Preferred Slot', 'Referral Code', 'Referring Chunker', 'Email Status', 'Status', 'Notes', 'Created At'];
      // Prefix formula-like cells so spreadsheet software does not execute user input.
      const cell = (value: unknown) => {
        const text = String(value ?? '');
        return `"${(/^\s*[=+@-]/.test(text) ? "'" : '') + text.replace(/"/g, '""')}"`;
      };
      const rows = candidates.map((c) => [
        c.id, c.fullName, c.phone, c.email, c.ageRange, c.occupation, c.testType,
        c.testLevel, c.preferredSlots, c.chunkerCode, c.chunkerName,
        c.confirmationEmailStatus || 'pending', c.status, c.notes, c.createdAt,
      ].map(cell).join(','));
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=\"chunks_test_100_candidates_${new Date().toISOString().slice(0, 10)}.csv\"`);
      res.setHeader('Cache-Control', 'no-store');
      return res.send(Buffer.from('\uFEFF' + [headers.map(cell).join(','), ...rows].join('\n'), 'utf8'));
    } catch { return res.status(503).json({ error: 'Campaign export unavailable' }); }
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
  const interval = setInterval(() => {
    void processEmailOutbox().catch(() => {});
  }, 30_000);
  interval.unref();
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
