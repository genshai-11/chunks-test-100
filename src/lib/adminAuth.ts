import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const DEFAULT_ADMIN_EMAILS = ['le.ntmkh@gmail.com', 'lucy2511kh@gmail.com'];

/** Return the verified email of an authorized administrator, or reject the request. */
export async function verifyAdminBearerToken(authorization: string | undefined): Promise<string> {
  const match = /^Bearer ([^\s]+)$/.exec(authorization ?? '');
  if (!match) {
    throw new Error('Unauthorized administrator');
  }

  const app = getApps().length === 0
    ? initializeApp({ projectId: firebaseConfig.projectId })
    : getApps()[0];

  const claims = await getAuth(app).verifyIdToken(match[1], true);
  const email = claims.email?.trim().toLowerCase();
  const allowlist = (process.env.ADMIN_EMAILS === undefined
    ? DEFAULT_ADMIN_EMAILS
    : process.env.ADMIN_EMAILS.split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean));

  if (!claims.email_verified || !email || !allowlist.includes(email)) {
    throw new Error('Unauthorized administrator');
  }

  return email;
}
