import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';

const ADMIN_EMAILS = ['le.ntmkh@gmail.com', 'lucy2511kh@gmail.com'];

export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user, !!user?.emailVerified && ADMIN_EMAILS.includes(user.email?.toLowerCase() || ''));
  });
}
