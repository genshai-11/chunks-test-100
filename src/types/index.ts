export type TestType = 'green' | 'red';

export type TestLevel = 'easy' | 'hard';

export type CandidateStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'noshow';

export type AgeRange = '<18' | '18-24' | '25-34' | '35-44' | '45+';

export interface Candidate {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  ageRange: AgeRange;
  occupation: string;
  testType: TestType;
  testLevel?: TestLevel; // Level: Dễ (easy) hoặc Khó (hard)
  preferredSlots: string;
  selectedDate?: string;
  selectedTimeSlot?: string;
  chunkerCode: string;
  chunkerName?: string;
  status: CandidateStatus;
  notes?: string;
  scheduledAt?: string;
  confirmationEmailSent?: boolean;
  confirmationEmailSentAt?: string;
  confirmationEmailStatus?: 'delivered' | 'pending' | 'failed' | 'simulated';
  createdAt: any; // Timestamp or ISO string
  updatedAt?: any;
}

export interface AdminNotificationSettings {
  notificationEmails: string[];
  enabled: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface NotificationLog {
  id: string;
  recipient: string;
  subject: string;
  candidateName: string;
  testType: string;
  testLevel: string;
  timestamp: string;
  status: 'sent' | 'simulated';
}

export interface Chunker {
  id?: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  secretToken?: string;
  active: boolean;
  referralCount: number;
  createdAt: any;
  notes?: string;
}

export type Chunkee = Chunker;

export interface AdminUser {
  uid: string;
  email: string;
  role: 'super_admin' | 'ops_admin';
  name?: string;
}

export interface TimeSlotOption {
  id: string;
  labelVi: string;
  labelEn: string;
  descriptionVi: string;
  descriptionEn: string;
  badge?: string;
}

export interface AssessmentInfo {
  type: TestType;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  coefficientVi: string;
  coefficientEn: string;
  duration: string;
  challengesCount: number;
  levelsCount: number;
  coreQuestionVi: string;
  coreQuestionEn: string;
  focusVi: string;
  focusEn: string;
  levels: {
    level: number;
    nameVi: string;
    nameEn: string;
    focusVi: string;
    focusEn: string;
    detailVi: string;
    detailEn: string;
  }[];
  theoryHighlightsVi: string[];
  theoryHighlightsEn: string[];
}
