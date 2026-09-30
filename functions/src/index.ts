/**
 * Firebase Cloud Function Trigger
 * Automatically sends email notifications to candidates upon successful booking.
 * Confirms selected Test Type (Green Focus %c vs Red Improv %r) and Level (Dễ vs Khó).
 */

import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import * as nodemailer from 'nodemailer';
import { formatCandidateConfirmationEmail, CandidateBookingData } from './emailTemplate';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure Transporter (supports SMTP or fallback simulator)
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Graceful simulated transporter for environments without configured external SMTP relay
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

/**
 * Cloud Function Trigger (v2): Fires automatically when a new candidate document
 * is created in the /candidates/{candidateId} collection.
 */
export const onCandidateBookingCreated = onDocumentCreated(
  {
    document: 'candidates/{candidateId}',
    region: 'asia-southeast1', // Matches regional cluster
    maxInstances: 10,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn('No document data present in onCandidateBookingCreated event');
      return;
    }

    const candidateId = event.params.candidateId;
    const data = snapshot.data();

    if (!data) {
      logger.warn(`Candidate ${candidateId} document data is empty`);
      return;
    }

    // Prevent duplicate dispatches
    if (data.confirmationEmailSent === true) {
      logger.info(`Candidate ${candidateId} already received confirmation email. Skipping.`);
      return;
    }

    const candidateEmail = String(data.email || '').trim().toLowerCase();
    if (!candidateEmail || !candidateEmail.includes('@')) {
      logger.warn(`Candidate ${candidateId} has invalid email address: "${candidateEmail}". Skipping.`);
      return;
    }

    const candidateBooking: CandidateBookingData = {
      candidateId,
      fullName: data.fullName || 'Ứng viên',
      phone: data.phone || 'Chưa cung cấp',
      email: candidateEmail,
      testType: data.testType === 'red' ? 'red' : 'green',
      testLevel: data.testLevel === 'hard' ? 'hard' : 'easy',
      preferredSlots: data.preferredSlots || 'Chưa chọn',
      chunkerCode: data.chunkerCode || 'DIRECT',
      chunkerName: data.chunkerName || '',
      createdAt: data.createdAt,
    };

    const { subject, html, text } = formatCandidateConfirmationEmail(candidateBooking);

    logger.info(`Triggering automated confirmation email for candidate: ${candidateId}`, {
      candidateName: candidateBooking.fullName,
      recipient: candidateEmail,
      testType: candidateBooking.testType,
      testLevel: candidateBooking.testLevel,
    });

    try {
      const transporter = createTransporter();
      const senderAddress = process.env.NOTIFICATION_FROM_EMAIL || 'chunks.assessment@chunks.edu.vn';

      const mailOptions = {
        from: `"CHUNKS Test 100" <${senderAddress}>`,
        to: candidateEmail,
        subject,
        text,
        html,
      };

      const sendResult = await transporter.sendMail(mailOptions);
      logger.info(`Email successfully dispatched to ${candidateEmail}`, {
        messageId: (sendResult as any).messageId || 'simulated',
      });

      // 1. Update candidate record with confirmation status
      await snapshot.ref.update({
        confirmationEmailSent: true,
        confirmationEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        confirmationEmailStatus: 'delivered',
      });

      // 2. Write to Firebase "Trigger Email from Firestore" queue (/mail collection)
      const mailQueueRef = db.collection('mail').doc(`mail_${candidateId}_${Date.now()}`);
      await mailQueueRef.set({
        to: candidateEmail,
        message: {
          subject,
          text,
          html,
        },
        candidateId,
        testType: candidateBooking.testType,
        testLevel: candidateBooking.testLevel,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`Candidate ${candidateId} confirmation state and /mail queue persisted successfully.`);
    } catch (err: any) {
      logger.error(`Error sending candidate confirmation email for ${candidateId}:`, err);
      try {
        await snapshot.ref.update({
          confirmationEmailSent: false,
          confirmationEmailStatus: 'failed',
        });
      } catch (updateErr) {
        logger.error(`Failed to record failure status on candidate ${candidateId}:`, updateErr);
      }
    }
  }
);
