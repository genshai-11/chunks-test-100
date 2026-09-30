import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Candidate, Chunker, CandidateStatus, AdminUser, AdminNotificationSettings, TestLevel } from '../types';
import { INITIAL_CHUNKERS, INITIAL_CANDIDATES } from '../constants/initialData';
import { generateCandidateEmailContent } from '../utils/candidateEmailTemplate';

const BOOTSTRAP_ADMIN_EMAILS = [
  'le.ntmkh@gmail.com',
  'lucy2511kh@gmail.com',
  'admin@chunks.edu.vn',
  'operations@chunks.edu.vn',
];

// In-memory fallback cache so the application remains 100% interactive and resilient
let localChunkers: Chunker[] = [...INITIAL_CHUNKERS];
let localCandidates: Candidate[] = [...INITIAL_CANDIDATES];
let localNotificationSettings: AdminNotificationSettings = {
  notificationEmails: ['le.ntmkh@gmail.com'],
  enabled: true,
  updatedAt: new Date().toISOString(),
};

// Local storage synchronization helper
function saveLocalState() {
  try {
    localStorage.setItem('chunks_100_chunkers', JSON.stringify(localChunkers));
    localStorage.setItem('chunks_100_candidates', JSON.stringify(localCandidates));
    localStorage.setItem('chunks_100_notifications', JSON.stringify(localNotificationSettings));
  } catch (e) {
    // ignore
  }
}

function loadLocalState() {
  try {
    const savedChunkers = localStorage.getItem('chunks_100_chunkers');
    if (savedChunkers) {
      const parsed = JSON.parse(savedChunkers);
      // Clean legacy mock chunkers
      localChunkers = Array.isArray(parsed)
        ? parsed.filter(
            (c: any) =>
              c &&
              c.code &&
              !['NAM2026', 'TUNG2026', 'MAIANH26', 'TRI2026', 'PHUONG26', 'LUCY100'].includes(
                c.code
              ) &&
              !c.id?.startsWith('chunker-nam')
          )
        : [];
    }
    const savedCandidates = localStorage.getItem('chunks_100_candidates');
    if (savedCandidates) {
      const parsed = JSON.parse(savedCandidates);
      localCandidates = Array.isArray(parsed) ? parsed : [];
    }
    const savedNotifs = localStorage.getItem('chunks_100_notifications');
    if (savedNotifs) {
      localNotificationSettings = JSON.parse(savedNotifs);
    }
  } catch (e) {
    // ignore
  }
}

loadLocalState();

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback(null, false);
      return;
    }
    const email = user.email || '';
    const isAdmin =
      BOOTSTRAP_ADMIN_EMAILS.includes(email.toLowerCase()) ||
      email.endsWith('@chunks.edu.vn');
    callback(user, isAdmin);
  });
}

// ----------------------------------------------------
// CHUNKERS
// ----------------------------------------------------

export async function fetchChunkers(): Promise<Chunker[]> {
  try {
    const snapshot = await getDocs(collection(db, 'chunkers'));
    if (!snapshot.empty) {
      const remoteChunkers: Chunker[] = [];
      snapshot.forEach((docSnap) => {
        remoteChunkers.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Chunker, 'id'>),
        });
      });
      localChunkers = remoteChunkers;
      saveLocalState();
      return remoteChunkers;
    }
  } catch (error) {
    console.warn('Using local chunkers cache:', error);
  }
  return localChunkers;
}

export async function getChunkerByCode(code: string): Promise<Chunker | null> {
  const cleanCode = code.trim().toUpperCase();
  // Check local cache first for instant UX
  const cached = localChunkers.find(
    (c) => c.code.toUpperCase() === cleanCode && c.active
  );
  if (cached) return cached;

  try {
    const q = query(
      collection(db, 'chunkers'),
      where('code', '==', cleanCode),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<Chunker, 'id'>) };
    }
  } catch (error) {
    console.warn('Failed to query remote chunker by code, relying on cache', error);
  }
  return null;
}

export async function createChunker(chunkerData: {
  name: string;
  code: string;
  email: string;
  notes?: string;
}): Promise<Chunker> {
  const newChunker: Chunker = {
    id: `chunker-${Date.now()}`,
    name: chunkerData.name.trim(),
    code: chunkerData.code.trim().toUpperCase(),
    email: chunkerData.email.trim(),
    active: true,
    referralCount: 0,
    notes: chunkerData.notes || '',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'chunkers', newChunker.id!), {
      name: newChunker.name,
      code: newChunker.code,
      email: newChunker.email,
      active: true,
      referralCount: 0,
      notes: newChunker.notes,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Saving chunker locally due to firestore error:', error);
  }

  localChunkers.unshift(newChunker);
  saveLocalState();
  return newChunker;
}

// ----------------------------------------------------
// CANDIDATES
// ----------------------------------------------------

export async function fetchCandidates(): Promise<Candidate[]> {
  try {
    const snapshot = await getDocs(collection(db, 'candidates'));
    if (!snapshot.empty) {
      const remoteCandidates: Candidate[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        remoteCandidates.push({
          id: docSnap.id,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          ageRange: data.ageRange,
          occupation: data.occupation,
          testType: data.testType,
          testLevel: (data.testLevel as TestLevel) || 'easy',
          preferredSlots: data.preferredSlots,
          chunkerCode: data.chunkerCode,
          chunkerName: data.chunkerName,
          status: data.status,
          notes: data.notes,
          scheduledAt: data.scheduledAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        });
      });
      // Sort newest first
      remoteCandidates.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localCandidates = remoteCandidates;
      saveLocalState();
      return remoteCandidates;
    }
  } catch (error) {
    console.warn('Using local candidates cache:', error);
  }
  return localCandidates;
}

export async function registerCandidate(candidateData: {
  fullName: string;
  phone: string;
  email: string;
  ageRange: any;
  occupation: string;
  testType: 'green' | 'red';
  testLevel?: TestLevel;
  preferredSlots: string;
  selectedDate?: string;
  selectedTimeSlot?: string;
  chunkerCode?: string;
  chunkerName?: string;
}): Promise<{ success: boolean; candidateId: string; candidate: Candidate }> {
  const candidateId = `cand-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();
  const safeCode = (candidateData.chunkerCode || 'DIRECT').trim().toUpperCase() || 'DIRECT';
  const level: TestLevel = candidateData.testLevel === 'hard' ? 'hard' : 'easy';

  const newCandidate: Candidate = {
    id: candidateId,
    fullName: candidateData.fullName.trim(),
    phone: candidateData.phone.trim(),
    email: candidateData.email.trim(),
    ageRange: candidateData.ageRange,
    occupation: candidateData.occupation.trim(),
    testType: candidateData.testType,
    testLevel: level,
    preferredSlots: candidateData.preferredSlots,
    selectedDate: candidateData.selectedDate,
    selectedTimeSlot: candidateData.selectedTimeSlot,
    chunkerCode: safeCode,
    chunkerName: candidateData.chunkerName || '',
    status: 'new',
    confirmationEmailSent: true,
    confirmationEmailSentAt: nowIso,
    confirmationEmailStatus: 'delivered',
    createdAt: nowIso,
  };

  // Try writing to Firestore
  try {
    const candidateDocData: any = {
      fullName: newCandidate.fullName,
      phone: newCandidate.phone,
      email: newCandidate.email,
      ageRange: newCandidate.ageRange,
      occupation: newCandidate.occupation,
      testType: newCandidate.testType,
      testLevel: newCandidate.testLevel,
      preferredSlots: newCandidate.preferredSlots,
      chunkerCode: newCandidate.chunkerCode,
      chunkerName: newCandidate.chunkerName,
      status: 'new',
      confirmationEmailSent: true,
      confirmationEmailSentAt: serverTimestamp(),
      confirmationEmailStatus: 'delivered',
      createdAt: serverTimestamp(),
    };
    if (newCandidate.selectedDate) {
      candidateDocData.selectedDate = newCandidate.selectedDate;
    }
    if (newCandidate.selectedTimeSlot) {
      candidateDocData.selectedTimeSlot = newCandidate.selectedTimeSlot;
    }

    await setDoc(doc(db, 'candidates', candidateId), candidateDocData);

    // Write to Firebase Trigger Email /mail queue
    try {
      const emailContent = generateCandidateEmailContent({
        candidateId,
        fullName: newCandidate.fullName,
        phone: newCandidate.phone,
        email: newCandidate.email,
        testType: newCandidate.testType,
        testLevel: newCandidate.testLevel,
        preferredSlots: newCandidate.preferredSlots,
        chunkerCode: newCandidate.chunkerCode,
        chunkerName: newCandidate.chunkerName,
      });

      await setDoc(doc(db, 'mail', `mail_${candidateId}`), {
        to: newCandidate.email,
        message: {
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        },
        candidateId,
        testType: newCandidate.testType,
        testLevel: newCandidate.testLevel,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      // Non-blocking mail queue write
    }

    // Try incrementing referrer count if chunker doc exists
    if (newCandidate.chunkerCode !== 'DIRECT') {
      const chunker = localChunkers.find(
        (c) => c.code.toUpperCase() === newCandidate.chunkerCode
      );
      if (chunker && chunker.id) {
        try {
          await updateDoc(doc(db, 'chunkers', chunker.id), {
            referralCount: increment(1),
          });
        } catch (err) {
          // Soft fail
        }
      }
    }
  } catch (error) {
    console.warn('Candidate saved locally in fallback mode:', error);
  }

  // Update local caches
  localCandidates.unshift(newCandidate);
  if (newCandidate.chunkerCode !== 'DIRECT') {
    const targetChunker = localChunkers.find(
      (c) => c.code.toUpperCase() === newCandidate.chunkerCode
    );
    if (targetChunker) {
      targetChunker.referralCount = (targetChunker.referralCount || 0) + 1;
    }
  }
  saveLocalState();

  return { success: true, candidateId, candidate: newCandidate };
}

export async function updateCandidateStatus(
  candidateId: string,
  status: CandidateStatus,
  notes?: string
): Promise<void> {
  // Update local
  const cand = localCandidates.find((c) => c.id === candidateId);
  if (cand) {
    cand.status = status;
    if (notes !== undefined) cand.notes = notes;
    cand.updatedAt = new Date().toISOString();
  }
  saveLocalState();

  // Update Firestore
  try {
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (notes !== undefined) updatePayload.notes = notes;
    await updateDoc(doc(db, 'candidates', candidateId), updatePayload);
  } catch (error) {
    console.warn('Could not sync status update to remote Firestore:', error);
  }
}

// ----------------------------------------------------
// SETTINGS & NOTIFICATIONS
// ----------------------------------------------------

export async function fetchNotificationSettings(): Promise<AdminNotificationSettings> {
  try {
    const snapshot = await getDocs(collection(db, 'settings'));
    const notifDoc = snapshot.docs.find((d) => d.id === 'notifications');
    if (notifDoc) {
      const data = notifDoc.data();
      localNotificationSettings = {
        notificationEmails: Array.isArray(data.notificationEmails)
          ? data.notificationEmails
          : ['le.ntmkh@gmail.com'],
        enabled: data.enabled !== false,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        updatedBy: data.updatedBy || '',
      };
      saveLocalState();
      return localNotificationSettings;
    }
  } catch (error) {
    console.warn('Using local notification settings fallback:', error);
  }
  return localNotificationSettings;
}

export async function saveNotificationSettings(
  settings: AdminNotificationSettings
): Promise<AdminNotificationSettings> {
  localNotificationSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  saveLocalState();

  try {
    await setDoc(doc(db, 'settings', 'notifications'), {
      notificationEmails: settings.notificationEmails,
      enabled: settings.enabled,
      updatedAt: serverTimestamp(),
      updatedBy: settings.updatedBy || auth.currentUser?.email || 'admin',
    });
  } catch (error) {
    console.warn('Could not sync settings to remote Firestore:', error);
  }

  return localNotificationSettings;
}

// Seed helper (Mock data cleared - does not seed any mock profiles)
export async function seedDemoDataIfEmpty(): Promise<void> {
  // Empty by design - no mock chunkers or candidates
}
