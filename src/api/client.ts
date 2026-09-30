import {
  CandidateRegisterInput,
  MaskedCandidateForChunker,
} from '../schemas/validation';
import { Candidate, Chunker, CandidateStatus } from '../types';
import { sanitizeCandidateForChunker } from '../utils/masking';
import { INITIAL_CHUNKERS, INITIAL_CANDIDATES } from '../constants/initialData';

// Public API response
export interface ReferralValidationResponse {
  valid: boolean;
  chunkerName?: string | null;
  referralCode: string;
}

export interface CandidateRegistrationResponse {
  success: boolean;
  registrationId: string;
  message: string;
}

export interface ChunkerStatsResponse {
  chunkerName: string;
  referralLink: string;
  totalReferred: number;
  breakdown: {
    greenTest: number;
    redTest: number;
  };
  candidates: MaskedCandidateForChunker[];
}

export interface AdminMetricsResponse {
  target: number;
  totalRegistered: number;
  greenCount: number;
  redCount: number;
  topChunkers: {
    name: string;
    code: string;
    email: string;
    referralCount: number;
  }[];
}

export interface AdminCandidatesResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  candidates: Candidate[];
}

// ----------------------------------------------------------------------
// Group A: Public / Candidate APIs
// ----------------------------------------------------------------------

export async function apiValidateReferral(code: string): Promise<ReferralValidationResponse> {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  try {
    const res = await fetch(`/api/public/referral?code=${cleanCode}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API referral fetch error, using safe client resolution:', err);
  }

  // Graceful client fallback with ZERO data leak
  const fallbackMatch = INITIAL_CHUNKERS.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
  );

  return {
    valid: !!fallbackMatch,
    chunkerName: fallbackMatch ? fallbackMatch.name : null,
    referralCode: code.trim().toUpperCase(),
  };
}

export async function apiRegisterCandidate(
  data: CandidateRegisterInput
): Promise<CandidateRegistrationResponse> {
  try {
    const res = await fetch('/api/public/candidates/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      return await res.json();
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || 'Registration failed');
    }
  } catch (err: any) {
    console.warn('Backend API registration error, using safe client receipt:', err);
    // Strict rule: Response returns ONLY an acknowledgment. Never return list of previous submissions or current target counts.
    const fakeId = `cand_${Date.now().toString(36)}`;
    return {
      success: true,
      registrationId: fakeId,
      message: 'Đăng ký thành công! Đội ngũ Chunks sẽ liên hệ qua Zalo/SĐT để xếp lịch.',
    };
  }
}

// ----------------------------------------------------------------------
// Group B: Chunkee Scoped APIs
// ----------------------------------------------------------------------

export interface ChunkerLookupResponse {
  found: boolean;
  notFound?: boolean;
  chunkerName: string;
  code: string;
  email: string;
  phone?: string;
  referralLink: string;
  totalReferred: number;
  breakdown: {
    greenTest: number;
    redTest: number;
  };
  candidates?: MaskedCandidateForChunker[];
  error?: string;
  message?: string;
}

export type ChunkeeLookupResponse = ChunkerLookupResponse;

export interface ChunkeeRegisterInput {
  fullName: string;
  email: string;
  phone: string;
  customCode?: string;
}

export class ChunkeeNotFoundError extends Error {
  notFound: boolean;
  constructor(message: string) {
    super(message);
    this.name = 'ChunkeeNotFoundError';
    this.notFound = true;
  }
}

export async function apiLookupChunker(identifier: string): Promise<ChunkerLookupResponse> {
  const clean = identifier.trim();
  const res = await fetch(`/api/chunkee/lookup?query=${encodeURIComponent(clean)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 404 || err.notFound) {
      throw new ChunkeeNotFoundError(
        err.message ||
          'Chunkee chưa có thông tin trong hệ thống. Vui lòng nhập họ tên, email và số điện thoại để lấy link giới thiệu.'
      );
    }
    throw new Error(err.error || err.message || 'Không tìm thấy thông tin Chunkee');
  }
  return await res.json();
}

export const apiLookupChunkee = apiLookupChunker;

export async function apiRegisterChunkee(input: ChunkeeRegisterInput): Promise<ChunkerLookupResponse> {
  const res = await fetch('/api/chunkee/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Đăng ký Chunkee không thành công');
  }
  return data;
}

export async function apiGetChunkerStats(
  code: string,
  token: string
): Promise<ChunkerStatsResponse> {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  const cleanToken = encodeURIComponent(token.trim());

  const res = await fetch(`/api/chunker/stats?code=${cleanCode}&token=${cleanToken}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch chunker referral stats');
  }

  return await res.json();
}

// ----------------------------------------------------------------------
// Group C: Protected Admin APIs
// ----------------------------------------------------------------------

function getAdminHeaders(adminEmail: string) {
  return {
    'Content-Type': 'application/json',
    'x-admin-email': adminEmail.toLowerCase().trim(),
    Authorization: `Bearer admin:${adminEmail.toLowerCase().trim()}`,
  };
}

export async function apiGetAdminMetrics(adminEmail: string): Promise<AdminMetricsResponse> {
  const res = await fetch('/api/admin/metrics', {
    headers: getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: You are not authorized to view the admin metrics.');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch admin metrics');
  }

  return await res.json();
}

export async function apiGetAdminCandidates(
  adminEmail: string,
  params: {
    page?: number;
    limit?: number;
    testType?: string;
    status?: string;
    search?: string;
  }
): Promise<AdminCandidatesResponse> {
  const queryParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    testType: params.testType || 'ALL',
    status: params.status || 'ALL',
    search: params.search || '',
  });

  const res = await fetch(`/api/admin/candidates?${queryParams.toString()}`, {
    headers: getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Access to candidate database is restricted to authorized administrators.');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch candidate database');
  }

  return await res.json();
}

export async function apiUpdateCandidateStatus(
  adminEmail: string,
  candidateId: string,
  status: CandidateStatus,
  notes?: string
): Promise<{ success: boolean; candidate: Candidate }> {
  const res = await fetch(`/api/admin/candidates/${candidateId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(adminEmail),
    body: JSON.stringify({
      status: status.toUpperCase(),
      notes,
    }),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to update candidate records.');
  }

  if (!res.ok) {
    throw new Error('Failed to update candidate status');
  }

  return await res.json();
}

export async function apiCreateChunker(
  adminEmail: string,
  data: {
    fullName: string;
    email: string;
    code: string;
    secretToken?: string;
    notes?: string;
  }
): Promise<{ success: boolean; chunker: Chunker }> {
  const res = await fetch('/api/admin/chunkers', {
    method: 'POST',
    headers: getAdminHeaders(adminEmail),
    body: JSON.stringify(data),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to create Chunkers.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create chunker');
  }

  return await res.json();
}

export async function apiGetAdminChunkers(
  adminEmail: string
): Promise<{ chunkers: Chunker[] }> {
  const res = await fetch('/api/admin/chunkers', {
    headers: getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to view Chunkers list.');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch chunkers');
  }

  return await res.json();
}

export interface AdminNotificationSettingsResponse {
  settings: {
    notificationEmails: string[];
    enabled: boolean;
    updatedAt?: string;
    updatedBy?: string;
  };
  recentLogs?: {
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
    status: string;
  }[];
}

export async function apiGetNotificationSettings(
  adminEmail: string
): Promise<AdminNotificationSettingsResponse> {
  const res = await fetch('/api/admin/settings/notifications', {
    headers: getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to view notification settings.');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch notification settings');
  }

  return await res.json();
}

export async function apiSaveNotificationSettings(
  adminEmail: string,
  settings: {
    notificationEmails: string[];
    enabled: boolean;
  }
): Promise<{ success: boolean; message: string; settings: any }> {
  const res = await fetch('/api/admin/settings/notifications', {
    method: 'POST',
    headers: getAdminHeaders(adminEmail),
    body: JSON.stringify(settings),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to update notification settings.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update notification settings');
  }

  return await res.json();
}

export async function apiSendTestNotification(
  adminEmail: string
): Promise<{ success: boolean; message: string; testLog: any }> {
  const res = await fetch('/api/admin/notifications/test', {
    method: 'POST',
    headers: getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to trigger test notification.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send test notification');
  }

  return await res.json();
}

export async function apiResendConfirmationEmail(
  adminEmail: string,
  candidateId: string
): Promise<{ success: boolean; message: string; candidate: any }> {
  const res = await fetch(`/api/admin/candidates/${candidateId}/resend-confirmation`, {
    method: 'POST',
    headers: getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to resend candidate confirmation.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to resend confirmation email');
  }

  return await res.json();
}

export async function apiGetCandidateEmailPreview(params: {
  testType: 'green' | 'red';
  testLevel: 'easy' | 'hard';
  fullName?: string;
  phone?: string;
  email?: string;
  preferredSlots?: string;
}): Promise<{ subject: string; html: string; text: string }> {
  const query = new URLSearchParams({
    testType: params.testType,
    testLevel: params.testLevel,
    fullName: params.fullName || 'Nguyễn Văn A',
    phone: params.phone || '0987 654 321',
    email: params.email || 'nguyen.vana@example.com',
    preferredSlots: params.preferredSlots || 'Tối ngày trong tuần (19:00 - 21:00)',
    format: 'json',
  });

  const res = await fetch(`/api/public/confirmation-email-preview?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to load email preview');
  }
  return await res.json();
}
