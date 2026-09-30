import { z } from 'zod';

// Group A: Public / Candidate Schemas
export const referralQuerySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Referral code must have at least 2 characters')
    .max(30, 'Referral code too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Referral code contains invalid characters'),
});

// Phone and Email patterns
export const PHONE_REGEX = /^(\+?[0-9\s().-]{9,20})$/;
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const VN_PHONE_REGEX = /^(?:\+84|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/;

export function isValidPhoneNumber(phoneStr: string): boolean {
  const clean = phoneStr.trim();
  if (!PHONE_REGEX.test(clean)) return false;
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;

  // If local Vietnamese number (starts with 0 or +84 or 84)
  if (clean.startsWith('0') || clean.startsWith('+84') || clean.startsWith('84')) {
    const normalizedDigits = digitsOnly.startsWith('84') ? '0' + digitsOnly.slice(2) : digitsOnly;
    return VN_PHONE_REGEX.test(normalizedDigits);
  }
  return true;
}

export function isValidEmailAddress(emailStr: string): boolean {
  const clean = emailStr.trim();
  if (!EMAIL_PATTERN.test(clean)) return false;
  if (clean.includes('..')) return false;
  return true;
}

export const candidateRegisterSchema = z.object({
  referralCode: z
    .string()
    .trim()
    .max(30, 'Referral code too long')
    .optional()
    .default('PILOT100')
    .transform((val) => val || 'PILOT100'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must have at least 2 characters')
    .max(120, 'Full name cannot exceed 120 characters')
    .refine((val) => /[a-zA-ZÀ-ỹ]/.test(val), {
      message: 'Full name must contain letters',
    }),
  phone: z
    .string()
    .trim()
    .min(9, 'Phone number must have at least 9 digits')
    .max(20, 'Phone number too long')
    .refine((val) => isValidPhoneNumber(val), {
      message: 'Invalid phone number format (e.g. 0912345678 or +84912345678)',
    }),
  email: z
    .string()
    .trim()
    .max(120, 'Email cannot exceed 120 characters')
    .refine((val) => isValidEmailAddress(val), {
      message: 'Invalid email address format (e.g. name@domain.com)',
    }),
  ageRange: z.enum(['<18', '18-24', '25-34', '35-44', '45+']),
  occupation: z
    .string()
    .trim()
    .min(2, 'Occupation is required')
    .max(100, 'Occupation cannot exceed 100 characters'),
  testType: z.enum(['GREEN_TEST', 'RED_TEST', 'GENERAL_TEST', 'green', 'red', 'general']).default('general'),
  testLevel: z
    .enum(['easy', 'hard', 'dễ', 'khó', 'EASY', 'HARD'])
    .optional()
    .default('easy')
    .transform((val) => {
      const lower = String(val).toLowerCase();
      return lower === 'hard' || lower === 'khó' ? ('hard' as const) : ('easy' as const);
    }),
  preferredTimeSlot: z
    .string()
    .trim()
    .min(3, 'Preferred time slot is required')
    .max(250, 'Preferred time slot cannot exceed 250 characters'),
  selectedDate: z.string().trim().max(40).optional(),
  selectedTimeSlot: z.string().trim().max(80).optional(),
});

export function createCandidateRegistrationSchema(lang: 'vi' | 'en') {
  const isVi = lang === 'vi';
  return z.object({
    referralCode: z
      .string()
      .trim()
      .max(30, isVi ? 'Mã giới thiệu quá dài' : 'Referral code too long')
      .optional()
      .default('PILOT100')
      .transform((val) => val || 'PILOT100'),
    fullName: z
      .string()
      .trim()
      .min(2, isVi ? 'Họ và tên cần ít nhất 2 ký tự' : 'Full name must have at least 2 characters')
      .max(120, isVi ? 'Họ và tên không vượt quá 120 ký tự' : 'Full name cannot exceed 120 characters')
      .refine((val) => /[a-zA-ZÀ-ỹ]/.test(val), {
        message: isVi ? 'Họ và tên cần chứa chữ cái hợp lệ' : 'Full name must contain valid letters',
      }),
    phone: z
      .string()
      .trim()
      .min(9, isVi ? 'Số điện thoại cần ít nhất 9 chữ số' : 'Phone number must have at least 9 digits')
      .max(20, isVi ? 'Số điện thoại quá dài' : 'Phone number too long')
      .refine((val) => isValidPhoneNumber(val), {
        message: isVi
          ? 'Số điện thoại không đúng định dạng (VD: 0912345678 hoặc +84912345678)'
          : 'Invalid phone number format (e.g. 0912345678 or +84912345678)',
      }),
    email: z
      .string()
      .trim()
      .max(120, isVi ? 'Email không vượt quá 120 ký tự' : 'Email cannot exceed 120 characters')
      .refine((val) => isValidEmailAddress(val), {
        message: isVi
          ? 'Email không đúng định dạng (VD: name@domain.com)'
          : 'Invalid email address format (e.g. name@domain.com)',
      }),
    ageRange: z.enum(['<18', '18-24', '25-34', '35-44', '45+']),
    occupation: z
      .string()
      .trim()
      .min(2, isVi ? 'Vui lòng nhập Nghề nghiệp hoặc Lĩnh vực của bạn' : 'Occupation is required')
      .max(100, isVi ? 'Nghề nghiệp không vượt quá 100 ký tự' : 'Occupation cannot exceed 100 characters'),
    testType: z.enum(['GREEN_TEST', 'RED_TEST', 'GENERAL_TEST', 'green', 'red', 'general']).default('general'),
    testLevel: z
      .enum(['easy', 'hard', 'dễ', 'khó', 'EASY', 'HARD'])
      .optional()
      .default('easy')
      .transform((val) => {
        const lower = String(val).toLowerCase();
        return lower === 'hard' || lower === 'khó' ? ('hard' as const) : ('easy' as const);
      }),
    preferredTimeSlot: z
      .string()
      .trim()
      .min(3, isVi ? 'Vui lòng ghi chú thời gian hoặc để hệ thống liên hệ sắp xếp' : 'Please add a time note or let us contact you to arrange it')
      .max(250, isVi ? 'Ghi chú thời gian quá dài' : 'Time preference note too long'),
    selectedDate: z.string().trim().max(40).optional(),
    selectedTimeSlot: z.string().trim().max(80).optional(),
  });
}

export const notificationSettingsSchema = z.object({
  notificationEmails: z.array(z.string().email('Invalid email')).min(1, 'At least one email is required'),
  enabled: z.boolean().default(true),
});

export type CandidateRegisterInput = z.input<typeof candidateRegisterSchema>;

// Group C: Admin Protected Schemas
export const adminCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  testType: z.enum(['ALL', 'GREEN', 'RED', 'GENERAL', 'green', 'red', 'general']).default('ALL'),
  status: z
    .enum(['ALL', 'NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'NO_SHOW', 'new', 'contacted', 'scheduled', 'completed', 'noshow'])
    .default('ALL'),
  search: z.string().optional().default(''),
});

export const updateCandidateStatusSchema = z.object({
  status: z.enum([
    'NEW',
    'CONTACTED',
    'SCHEDULED',
    'COMPLETED',
    'NO_SHOW',
    'new',
    'contacted',
    'scheduled',
    'completed',
    'noshow',
  ]),
  notes: z.string().max(500).optional(),
  scheduledAt: z.string().optional(),
});

export const createChunkerSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(120),
  code: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/),
  notes: z.string().max(500).optional(),
}).refine((data) => data.fullName || data.name, {
  message: 'Either fullName or name must be provided',
  path: ['fullName'],
});

export const publicRegisterChunkerSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ và tên cần ít nhất 2 ký tự').max(100),
  email: z.string().trim().email('Địa chỉ email không hợp lệ').max(120),
  phone: z.string().trim().optional(),
  preferredCode: z
    .string()
    .trim()
    .min(3, 'Mã giới thiệu cần ít nhất 3 ký tự')
    .max(20, 'Mã giới thiệu không vượt quá 20 ký tự')
    .regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ được chứa chữ cái, số, gạch dưới (_) hoặc gạch nối (-)')
    .optional(),
});
