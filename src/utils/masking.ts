/**
 * DTO / Data Masking Layer
 * Sanitizes candidate PII to prevent sensitive data leakage to unprivileged roles.
 */

export function maskName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return '***';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length <= 2) return word[0] + '*';
    return word.slice(0, 1) + '**' + word.slice(-1);
  }

  // Format like "Nguyễn V** B" or "John D**"
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1);

  if (middle.length > 0) {
    const maskedMiddle = middle.map((m) => (m.length > 0 ? m[0] + '**' : '*')).join(' ');
    return `${first} ${maskedMiddle} ${last}`;
  }

  // Two words: e.g. "Nguyễn Nam" -> "Nguyễn N**"
  return `${first} ${last[0]}**`;
}

export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '***';
  const clean = phone.trim();
  if (clean.length < 7) return clean.slice(0, 2) + '****';
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-3);
  return `${prefix}****${suffix}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `*@${domain}`;
  const firstChar = local[0];
  return `${firstChar}***@${domain}`;
}

export interface MaskedCandidateForChunker {
  maskedName: string;
  testType: string;
  status: string;
  createdAt: string;
}

export function sanitizeCandidateForChunker(candidate: {
  fullName: string;
  testType: string;
  status: string;
  createdAt: any;
}): MaskedCandidateForChunker {
  return {
    maskedName: maskName(candidate.fullName),
    testType: candidate.testType === 'green' ? 'GREEN_TEST' : 'RED_TEST',
    status:
      candidate.status === 'new'
        ? 'Registered'
        : candidate.status === 'contacted'
        ? 'Contacted'
        : candidate.status === 'scheduled'
        ? 'Scheduled'
        : candidate.status === 'completed'
        ? 'Completed'
        : 'No-Show',
    createdAt:
      candidate.createdAt?.toDate?.()?.toISOString?.() ||
      (typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString()),
  };
}
