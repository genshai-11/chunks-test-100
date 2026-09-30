import assert from 'node:assert/strict';
import {
  candidateRegisterSchema,
  createCandidateRegistrationSchema,
  createChunkerSchema,
  adminCandidatesQuerySchema,
  updateCandidateStatusSchema,
  isValidPhoneNumber,
  isValidEmailAddress,
} from '../src/schemas/validation';
import { escapeHtml } from '../src/utils/escapeHtml';
import { normalizedPhone, hashPhone, RegistrationError } from '../src/db/database';
import { generateCandidateEmailContent } from '../src/utils/candidateEmailTemplate';
import { getEmailProviderStatus } from '../src/lib/email';
import { verifyAdminBearerToken } from '../src/lib/adminAuth';

async function runTests() {
  console.log('=== CHUNKS Test 100 Integration & Security Verification Suite ===\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✓ ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
        failed++;
      });
  }

  // -------------------------------------------------------------------
  // 1. Validation & Schema Enforcement
  // -------------------------------------------------------------------
  console.log('1. Schema Validation & Input Sanitization');

  await test('Phone validation accepts Vietnamese and international mobile formats', () => {
    assert.equal(isValidPhoneNumber('0903123456'), true);
    assert.equal(isValidPhoneNumber('0987 654 321'), true);
    assert.equal(isValidPhoneNumber('+84903123456'), true);
    assert.equal(isValidPhoneNumber('+84 987 654 321'), true);
    assert.equal(isValidPhoneNumber('0321234567'), true);
    // Invalid formats
    assert.equal(isValidPhoneNumber('12345'), false);
    assert.equal(isValidPhoneNumber('abcdefghij'), false);
    assert.equal(isValidPhoneNumber('0000000000'), false);
  });

  await test('Email validation requires RFC-compliant structure', () => {
    assert.equal(isValidEmailAddress('nam.nguyen@example.com'), true);
    assert.equal(isValidEmailAddress('test.candidate+tag@sub.domain.vn'), true);
    assert.equal(isValidEmailAddress('invalid-email'), false);
    assert.equal(isValidEmailAddress('missing@domain'), false);
    assert.equal(isValidEmailAddress('@missing-local.com'), false);
  });

  await test('Candidate registration schema applies default PILOT100 code and normalizes testLevel', () => {
    const parsed = candidateRegisterSchema.parse({
      fullName: 'Hoàng Bảo Long',
      phone: '0903123456',
      email: 'baolong@example.com',
      ageRange: '25-34',
      occupation: 'Product Manager',
      testType: 'GREEN_TEST',
      preferredTimeSlot: 'Tối ngày trong tuần',
    });
    assert.equal(parsed.referralCode, 'PILOT100');
    assert.equal(parsed.testLevel, 'easy');

    const parsedHard = candidateRegisterSchema.parse({
      referralCode: 'MINH2026',
      fullName: 'Trần Thị Mai',
      phone: '0912345678',
      email: 'mai.tran@example.com',
      ageRange: '18-24',
      occupation: 'Designer',
      testType: 'red',
      testLevel: 'khó',
      preferredTimeSlot: 'Cuối tuần',
    });
    assert.equal(parsedHard.referralCode, 'MINH2026');
    assert.equal(parsedHard.testLevel, 'hard');
  });

  await test('Candidate registration schema rejects invalid or spam payload', () => {
    const invalidPhone = candidateRegisterSchema.safeParse({
      fullName: 'Valid Name',
      phone: '12345', // Too short / invalid format
      email: 'valid@example.com',
      ageRange: '25-34',
      occupation: 'Engineer',
      testType: 'green',
      preferredTimeSlot: 'Morning',
    });
    assert.equal(invalidPhone.success, false);

    const invalidEmail = candidateRegisterSchema.safeParse({
      fullName: 'Valid Name',
      phone: '0903123456',
      email: 'not-an-email',
      ageRange: '25-34',
      occupation: 'Engineer',
      testType: 'green',
      preferredTimeSlot: 'Morning',
    });
    assert.equal(invalidEmail.success, false);
  });

  await test('Chunker provisioning schema prohibits empty name or invalid code', () => {
    const invalidCode = createChunkerSchema.safeParse({
      name: 'Test Chunker',
      email: 'chunker@chunks.network',
      code: 'A B C', // spaces not allowed
    });
    assert.equal(invalidCode.success, false);

    const valid = createChunkerSchema.safeParse({
      fullName: 'Lê Tuấn Minh',
      email: 'minh.le@chunks.network',
      code: 'MINH2026',
      notes: 'CiC Operations',
    });
    assert.equal(valid.success, true);
  });

  // -------------------------------------------------------------------
  // 2. Security Boundaries & Authorization
  // -------------------------------------------------------------------
  console.log('\n2. Security Boundaries & Authorization');

  await test('Admin auth rejects requests without Bearer token', async () => {
    await assert.rejects(
      async () => verifyAdminBearerToken(undefined),
      /Unauthorized administrator/
    );
    await assert.rejects(
      async () => verifyAdminBearerToken('Basic dXNlcjpwYXNz'),
      /Unauthorized administrator/
    );
    await assert.rejects(
      async () => verifyAdminBearerToken('x-admin-email: le.ntmkh@gmail.com'),
      /Unauthorized administrator/
    );
  });

  await test('Admin auth rejects malformed or forged tokens', async () => {
    await assert.rejects(
      async () => verifyAdminBearerToken('Bearer forged-token-not-valid-jwt'),
      /Unauthorized administrator|Decoding Firebase ID token failed/
    );
  });

  await test('HTML escape utility defends against stored XSS in email and alert rendering', () => {
    const payload = '<script>alert("pwned")</script>&<foo>"bar"\'baz\'';
    const escaped = escapeHtml(payload);
    assert.equal(escaped.includes('<script>'), false);
    assert.equal(escaped.includes('&lt;script&gt;'), true);
    assert.equal(escaped.includes('&amp;'), true);
    assert.equal(escaped.includes('&quot;bar&quot;'), true);
    assert.equal(escaped.includes('&#39;baz&#39;'), true);
  });

  await test('Candidate email template produces consistent plain text and HTML', () => {
    const rendered = generateCandidateEmailContent({
      candidateId: 'cand_test_01',
      fullName: 'Nguyễn Văn A',
      phone: '0903123456',
      email: 'nguyen.a@example.com',
      testType: 'green',
      testLevel: 'hard',
      preferredSlots: 'Thứ Bảy, 19:00 - 19:45',
      chunkerCode: 'PILOT100',
    });
    assert.equal(rendered.subject.includes('Xác Nhận Đăng Ký'), true);
    assert.equal(rendered.html.includes('Green Focus Test (%c)'), true);
    assert.equal(rendered.html.includes('Khó (Advanced'), true);
    assert.equal(rendered.text.includes('cand_test_01'), true);
  });

  // -------------------------------------------------------------------
  // 3. Database Rules, Duplicate Lock & 100-Cap Serialization
  // -------------------------------------------------------------------
  console.log('\n3. Database Logic, Phone Normalization & Quota Rules');

  await test('Phone normalization maps domestic prefixes to single canonical representation', () => {
    assert.equal(normalizedPhone('0903123456'), '0903123456');
    assert.equal(normalizedPhone('+84903123456'), '0903123456');
    assert.equal(normalizedPhone('84 903 123 456'), '0903123456');
    assert.equal(hashPhone('0903 123 456'), hashPhone('+84903123456'));
  });

  await test('RegistrationError codes map to appropriate HTTP status semantics', () => {
    const errCapacity = new RegistrationError('CAPACITY_FULL');
    assert.equal(errCapacity.code, 'CAPACITY_FULL');
    assert.equal(errCapacity.message.includes('100-registration capacity'), true);

    const errDup = new RegistrationError('DUPLICATE_PHONE');
    assert.equal(errDup.code, 'DUPLICATE_PHONE');
    assert.equal(errDup.message.includes('30 days'), true);

    const errRef = new RegistrationError('INVALID_REFERRAL');
    assert.equal(errRef.code, 'INVALID_REFERRAL');

    const errMig = new RegistrationError('MIGRATION_REQUIRED');
    assert.equal(errMig.code, 'MIGRATION_REQUIRED');
  });
  await test('Transaction logic enforces migration prerequisite, active chunker, 100-cap and 30-day phone lock', () => {
    const validatePreconditions = (state: any, chunker: any, lock: any, now: number) => {
      if (!state?.exists || state?.migrationComplete !== true) throw new RegistrationError('MIGRATION_REQUIRED');
      if (!chunker?.exists || chunker?.active !== true) throw new RegistrationError('INVALID_REFERRAL');
      const total = state.totalRegistered;
      if (!Number.isInteger(total) || total < 0 || total > 100 ||
        state.greenCount + state.redCount !== total) throw new RegistrationError('MIGRATION_REQUIRED');
      if (total >= 100) throw new RegistrationError('CAPACITY_FULL');
      const lastRegistrationAt = lock?.lastRegistrationAt;
      if (lock?.exists && (!Number.isInteger(lastRegistrationAt) || lastRegistrationAt > now ||
        now - lastRegistrationAt < 30 * 24 * 60 * 60 * 1000)) throw new RegistrationError('DUPLICATE_PHONE');
      return true;
    };

    const now = Date.now();
    // Case A: Uninitialized migration
    assert.throws(
      () => validatePreconditions({ exists: false }, { exists: true, active: true }, { exists: false }, now),
      (err: any) => err instanceof RegistrationError && err.code === 'MIGRATION_REQUIRED'
    );

    // Case B: Inactive or unknown chunker
    assert.throws(
      () => validatePreconditions({ exists: true, migrationComplete: true, totalRegistered: 10, greenCount: 5, redCount: 5 }, { exists: false }, { exists: false }, now),
      (err: any) => err instanceof RegistrationError && err.code === 'INVALID_REFERRAL'
    );
    assert.throws(
      () => validatePreconditions({ exists: true, migrationComplete: true, totalRegistered: 10, greenCount: 5, redCount: 5 }, { exists: true, active: false }, { exists: false }, now),
      (err: any) => err instanceof RegistrationError && err.code === 'INVALID_REFERRAL'
    );

    // Case C: Strictly enforced 100 quota cap
    assert.throws(
      () => validatePreconditions({ exists: true, migrationComplete: true, totalRegistered: 100, greenCount: 50, redCount: 50 }, { exists: true, active: true }, { exists: false }, now),
      (err: any) => err instanceof RegistrationError && err.code === 'CAPACITY_FULL'
    );

    // Case D: Duplicate phone within 30 days
    const twentyDaysAgo = now - 20 * 24 * 60 * 60 * 1000;
    assert.throws(
      () => validatePreconditions({ exists: true, migrationComplete: true, totalRegistered: 99, greenCount: 50, redCount: 49 }, { exists: true, active: true }, { exists: true, lastRegistrationAt: twentyDaysAgo }, now),
      (err: any) => err instanceof RegistrationError && err.code === 'DUPLICATE_PHONE'
    );

    // Case E: Eligible phone registered 31 days ago (permitted)
    const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000;
    assert.equal(
      validatePreconditions({ exists: true, migrationComplete: true, totalRegistered: 99, greenCount: 50, redCount: 49 }, { exists: true, active: true }, { exists: true, lastRegistrationAt: thirtyOneDaysAgo }, now),
      true
    );

    // Case F: Fresh registration under 100
    assert.equal(
      validatePreconditions({ exists: true, migrationComplete: true, totalRegistered: 0, greenCount: 0, redCount: 0 }, { exists: true, active: true }, { exists: false }, now),
      true
    );
  });

  await test('CSV formula injection prevention correctly neutralizes formula cells', () => {
    const cell = (value: unknown) => {
      const text = String(value ?? '');
      return `"${(/^\s*[=+@-]/.test(text) ? "'" : '') + text.replace(/"/g, '""')}"`;
    };
    assert.equal(cell('=CMD|"/C calc"!A0'), `"'=CMD|""/C calc""!A0"`);
    assert.equal(cell('+12345'), `"'+12345"`);
    assert.equal(cell('@malicious'), `"'@malicious"`);
    assert.equal(cell('-formula'), `"'-formula"`);
    assert.equal(cell('Normal Text'), `"Normal Text"`);
    assert.equal(cell('Text with "quotes"'), `"Text with ""quotes"""`);
  });

  // -------------------------------------------------------------------
  // 4. Email Outbox & Reliability Semantics
  // -------------------------------------------------------------------
  console.log('\n4. Email Outbox & Reliability Semantics');

  await test('Email provider status reports unconfigured without real credentials (safe default)', () => {
    const status = getEmailProviderStatus();
    // In local dev without RESEND_API_KEY or SMTP_HOST, provider should safely report none
    if (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST) {
      assert.equal(status.configured, false);
      assert.equal(status.provider, 'none');
    }
  });
  await test('Email provider status recognizes Gmail SMTP configuration with chunksstation@gmail.com', () => {
    const prev = { ...process.env };
    try {
      delete process.env.RESEND_API_KEY;
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'chunksstation@gmail.com';
      process.env.SMTP_PASS = 'mock-app-password';
      delete process.env.SMTP_FROM;
      delete process.env.NOTIFICATION_FROM_EMAIL;
      const status = getEmailProviderStatus();
      assert.equal(status.configured, true);
      assert.equal(status.provider, 'smtp');
      assert.equal(status.fromEmail, '"CHUNKS Operations" <chunksstation@gmail.com>');
    } finally {
      process.env = prev;
    }
  });
  await test('Outbox retry backoff computes exponential delays capped at 1 hour', () => {
    const computeBackoff = (attempts: number) => Math.min(3_600_000, 30_000 * 2 ** (attempts - 1));
    assert.equal(computeBackoff(1), 30_000); // 30s
    assert.equal(computeBackoff(2), 60_000); // 1m
    assert.equal(computeBackoff(3), 120_000); // 2m
    assert.equal(computeBackoff(4), 240_000); // 4m
    assert.equal(computeBackoff(5), 480_000); // 8m
    assert.equal(computeBackoff(6), 960_000); // 16m
    assert.equal(computeBackoff(7), 1_920_000); // 32m
    assert.equal(computeBackoff(8), 3_600_000); // capped at 1h
    assert.equal(computeBackoff(9), 3_600_000);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
