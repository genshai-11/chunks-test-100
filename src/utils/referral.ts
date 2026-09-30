/**
 * Referral URL & Domain Resolver
 * 
 * Guarantees that candidate referral links and QR codes NEVER output localhost
 * and always resolve to the real production domain (chunkstest.ai.studio)
 * or the active live deployment URL.
 */

export const DEFAULT_PRODUCTION_DOMAIN = 'https://chunkstest.ai.studio';
const STORAGE_KEY = 'chunks_referral_domain_override';

export interface DomainOption {
  id: string;
  label: string;
  url: string;
  isOfficial?: boolean;
  isCurrent?: boolean;
}

/**
 * Returns true if the hostname is a local loopback address
 */
export function isLocalhost(urlOrHost?: string): boolean {
  if (!urlOrHost) return false;
  return (
    urlOrHost.includes('localhost') ||
    urlOrHost.includes('127.0.0.1') ||
    urlOrHost.includes('0.0.0.0') ||
    urlOrHost.startsWith('::1')
  );
}

/**
 * Cleans a URL or domain string to ensure standard https:// protocol with no trailing slashes
 */
export function normalizeDomain(rawDomain: string): string {
  let cleaned = (rawDomain || '').trim();
  if (!cleaned) return DEFAULT_PRODUCTION_DOMAIN;

  // Add protocol if missing
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  // Remove trailing slashes and search queries
  cleaned = cleaned.replace(/\/+$/, '');
  try {
    const parsed = new URL(cleaned);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return cleaned;
  }
}

/**
 * Gets all selectable domain options based on current browser runtime
 */
export function getDomainOptions(): DomainOption[] {
  const options: DomainOption[] = [
    {
      id: 'official',
      label: 'chunkstest.ai.studio (Chính Thức)',
      url: DEFAULT_PRODUCTION_DOMAIN,
      isOfficial: true,
    },
  ];

  if (typeof window !== 'undefined' && window.location) {
    const currentOrigin = window.location.origin;
    if (
      currentOrigin &&
      !isLocalhost(currentOrigin) &&
      currentOrigin !== DEFAULT_PRODUCTION_DOMAIN
    ) {
      options.push({
        id: 'current',
        label: `${window.location.hostname} (Live App)`,
        url: currentOrigin,
        isCurrent: true,
      });
    }
  }

  return options;
}

/**
 * Retrieves the currently active domain for referral link generation.
 * Priorities:
 * 1. User manual override stored in localStorage
 * 2. If running on a live public domain (not localhost), user can use window.location.origin
 * 3. Official domain (https://chunkstest.ai.studio)
 */
export function getActiveReferralDomain(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && !isLocalhost(stored)) {
        return normalizeDomain(stored);
      }
    } catch {
      // localStorage may fail in restricted iframes
    }

    const currentOrigin = window.location.origin;
    // If running on a real cloud domain (e.g. *.run.app or chunkstest.ai.studio),
    // and no explicit override exists, check if user is on custom domain or run.app
    if (currentOrigin && !isLocalhost(currentOrigin)) {
      // If we are already on chunkstest.ai.studio or custom domain, use it
      if (currentOrigin.includes('chunkstest.ai.studio')) {
        return DEFAULT_PRODUCTION_DOMAIN;
      }
      // If on run.app, default to chunkstest.ai.studio for branded links,
      // but allow currentOrigin
      return DEFAULT_PRODUCTION_DOMAIN;
    }
  }

  return DEFAULT_PRODUCTION_DOMAIN;
}

/**
 * Stores a preferred referral domain in localStorage
 */
export function setActiveReferralDomain(domain: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (!domain || isLocalhost(domain)) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, normalizeDomain(domain));
    }
  } catch {
    // ignore
  }
}

/**
 * Resolves a final referral URL for a given Chunkee code.
 * Ensures localhost is NEVER returned to users.
 */
export function buildReferralUrl(
  code: string,
  preferredDomain?: string,
  fallbackServerUrl?: string
): string {
  const cleanCode = (code || '').trim().toUpperCase();

  // 1. If explicit preferred domain provided and not localhost
  if (preferredDomain && !isLocalhost(preferredDomain)) {
    return `${normalizeDomain(preferredDomain)}/?ref=${encodeURIComponent(cleanCode)}`;
  }

  // 2. Check active domain resolver (stored or official)
  const activeDomain = getActiveReferralDomain();
  if (activeDomain && !isLocalhost(activeDomain)) {
    return `${normalizeDomain(activeDomain)}/?ref=${encodeURIComponent(cleanCode)}`;
  }

  // 3. Check fallback server URL if it doesn't contain localhost
  if (fallbackServerUrl && !isLocalhost(fallbackServerUrl)) {
    try {
      const u = new URL(fallbackServerUrl);
      return `${u.origin}/?ref=${encodeURIComponent(cleanCode)}`;
    } catch {
      // fallback
    }
  }

  // 4. Guaranteed official production domain fallback
  return `${DEFAULT_PRODUCTION_DOMAIN}/?ref=${encodeURIComponent(cleanCode)}`;
}

/**
 * Generates ready-to-share 1-on-1 invitation message text
 */
export function generateShareInviteMessage(
  chunkeeName: string,
  code: string,
  referralUrl: string,
  lang: 'vi' | 'en' = 'vi'
): string {
  if (lang === 'vi') {
    return `Chào bạn, ${chunkeeName || 'mình'} gửi bạn thư mời tham gia kỳ đánh giá 1-on-1 "CHUNKS Test 100" (Lý thuyết MSE - Motion, Sound, Emotion). Bài test 45 phút trực tiếp cùng CiC. Đăng ký qua link riêng của mình tại: ${referralUrl}`;
  }
  return `Hello, here is your exclusive invitation to the 1-on-1 "CHUNKS Test 100" assessment (MSE Theory). 45-minute live session with CiC. Register via my link: ${referralUrl}`;
}
