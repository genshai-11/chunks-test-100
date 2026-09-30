import { CandidateRegisterInput } from '../schemas/validation';
import { Candidate, Chunker, CandidateStatus } from '../types';
import { auth } from '../firebase/config';

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

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host.includes('web.app') || host.includes('firebaseapp.com')) {
      return 'https://chunkstest.ai.studio';
    }
  }
  return '';
}

export async function apiValidateReferral(code: string): Promise<ReferralValidationResponse> {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  const res = await fetch(`${getApiBaseUrl()}/api/public/referral?code=${cleanCode}`);
  if (!res.ok) throw new Error('Could not validate referral');
  return await res.json();
}

export async function apiSelfRegisterChunker(data: {
  fullName: string;
  email: string;
  phone?: string;
  preferredCode?: string;
}): Promise<{ success: boolean; chunker: { code: string; name: string } }> {
  const res = await fetch(`${getApiBaseUrl()}/api/public/chunkee/register-referrer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(responseData.error || responseData.details || 'Không thể tạo mã giới thiệu lúc này');
  }
  return responseData;
}

export async function apiRegisterCandidate(
  data: CandidateRegisterInput
): Promise<CandidateRegistrationResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/public/candidates/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = responseData.message || responseData.error || `HTTP ${res.status}: Registration failed`;
    console.error('[API_REGISTER_ERROR]:', errorMsg);
    throw new Error(errorMsg);
  }

  return responseData;
}

export async function apiGetHealth(): Promise<{
  status: string;
  dbConnected: boolean;
  totalCandidatesInDB: number;
  totalChunkersInDB: number;
  timestamp: string;
  emailService?: {
    configured: boolean;
    provider: string;
    details: string;
  };
}> {
  const res = await fetch(`${getApiBaseUrl()}/api/health`, { cache: 'no-store' });
  return await res.json();
}


// ----------------------------------------------------------------------
// Group C: Protected Admin APIs
// ----------------------------------------------------------------------

async function getAdminHeaders(_adminEmail: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sign in to access administrative resources.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await user.getIdToken()}`,
  };
}

export async function apiGetAdminMetrics(adminEmail: string): Promise<AdminMetricsResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/metrics`, {
    headers: await getAdminHeaders(adminEmail),
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

  const res = await fetch(`${getApiBaseUrl()}/api/admin/candidates?${queryParams.toString()}`, {
    headers: await getAdminHeaders(adminEmail),
    cache: 'no-store',
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
  const res = await fetch(`${getApiBaseUrl()}/api/admin/candidates/${candidateId}/status`, {
    method: 'PATCH',
    headers: await getAdminHeaders(adminEmail),
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
    notes?: string;
  }
): Promise<{ success: boolean; chunker: Chunker }> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/chunkers`, {
    method: 'POST',
    headers: await getAdminHeaders(adminEmail),
    body: JSON.stringify(data),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to create Chunkers.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || err.error || 'Failed to create chunker');
  }
  return await res.json();
}

export async function apiGetAdminChunkers(
  adminEmail: string
): Promise<{ chunkers: Chunker[] }> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/chunkers`, {
    headers: await getAdminHeaders(adminEmail),
  });

  if (res.status === 403) {
    throw new Error('403 Forbidden: Not authorized to view Chunkers list.');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch chunkers');
  }

  return await res.json();
}

export async function apiUpdateChunker(
  adminEmail: string,
  code: string,
  data: {
    name?: string;
    email?: string;
    active?: boolean;
    notes?: string;
  }
): Promise<{ success: boolean; chunker: Chunker }> {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  const res = await fetch(`${getApiBaseUrl()}/api/admin/chunkers/${cleanCode}`, {
    method: 'PATCH',
    headers: await getAdminHeaders(adminEmail),
    body: JSON.stringify(data),
  });
  if (res.status === 403) throw new Error('403 Forbidden: Not authorized to update Chunker.');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update chunker');
  }
  return await res.json();
}

export async function apiDeleteChunker(
  adminEmail: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const cleanCode = encodeURIComponent(code.trim().toUpperCase());
  const res = await fetch(`${getApiBaseUrl()}/api/admin/chunkers/${cleanCode}`, {
    method: 'DELETE',
    headers: await getAdminHeaders(adminEmail),
  });
  if (res.status === 403) throw new Error('403 Forbidden: Not authorized to delete Chunker.');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete chunker');
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
  const res = await fetch(`${getApiBaseUrl()}/api/admin/settings/notifications`, {
    headers: await getAdminHeaders(adminEmail),
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
  const res = await fetch(`${getApiBaseUrl()}/api/admin/settings/notifications`, {
    method: 'POST',
    headers: await getAdminHeaders(adminEmail),
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
  const res = await fetch(`${getApiBaseUrl()}/api/admin/notifications/test`, {
    method: 'POST',
    headers: await getAdminHeaders(adminEmail),
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
  const res = await fetch(`${getApiBaseUrl()}/api/admin/candidates/${candidateId}/resend-confirmation`, {
    method: 'POST',
    headers: await getAdminHeaders(adminEmail),
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

