import React, { useState, useEffect } from 'react';
import {
  Brain,
  Compass,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  UserCheck,
  QrCode,
} from 'lucide-react';
import { TestType, AgeRange, AssessmentInfo } from '../types';
import { TIME_SLOT_OPTIONS, GREEN_TEST_INFO, RED_TEST_INFO } from '../constants/initialData';
import { apiValidateReferral, apiRegisterCandidate } from '../api/client';
import { createCandidateRegistrationSchema } from '../schemas/validation';
import { BookingCalendar, SlotSelection } from '../components/BookingCalendar';
import { AssessmentDetailModal } from '../components/AssessmentDetailModal';
import { BookingSuccessModal } from '../components/BookingSuccessModal';
import { ChunksFeatureBand } from '../components/ChunksFeatureBand';
import { ChunksNumberedFaq } from '../components/ChunksNumberedFaq';
import { ChunksCtaBand } from '../components/ChunksCtaBand';

interface Props {
  initialReferralCode: string;
  lang: 'vi' | 'en';
  onOpenChunkerHub?: (code?: string) => void;
}

export const CandidateView: React.FC<Props> = ({ initialReferralCode, lang, onOpenChunkerHub }) => {
  // Referral state
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isCodeValid, setIsCodeValid] = useState<boolean>(false);
  const [loadingCode, setLoadingCode] = useState<boolean>(false);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange>('25-34');
  const [occupation, setOccupation] = useState('');
  const [testType, setTestType] = useState<TestType>('green');
  const [testLevel, setTestLevel] = useState<'easy' | 'hard'>('easy');
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOT_OPTIONS[0].labelEn);
  const [calendarSlot, setCalendarSlot] = useState<SlotSelection | null>(null);
  const [customSlotNote, setCustomSlotNote] = useState('');

  // Honeypot anti-bot
  const [honeypot, setHoneypot] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedAssessmentModal, setSelectedAssessmentModal] = useState<AssessmentInfo | null>(
    null
  );
  const [confirmedCandidate, setConfirmedCandidate] = useState<any | null>(null);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Sync initial referral code prop
  useEffect(() => {
    setReferralCode(initialReferralCode || '');
  }, [initialReferralCode]);

  // Sync initial slot based on lang
  useEffect(() => {
    setSelectedSlot(lang === 'vi' ? TIME_SLOT_OPTIONS[0].labelVi : TIME_SLOT_OPTIONS[0].labelEn);
  }, [lang]);

  // Resolve referral code via Group A Public API (Only if explicitly present)
  useEffect(() => {
    let isMounted = true;
    async function resolve() {
      if (!referralCode.trim()) {
        setIsCodeValid(false);
        setInviterName(null);
        return;
      }
      setLoadingCode(true);
      try {
        const result = await apiValidateReferral(referralCode);
        if (isMounted) {
          setIsCodeValid(result.valid);
          setInviterName(result.chunkerName || null);
        }
      } catch (err) {
        if (isMounted) {
          setIsCodeValid(false);
          setInviterName(null);
        }
      } finally {
        if (isMounted) setLoadingCode(false);
      }
    }
    resolve();
    return () => {
      isMounted = false;
    };
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Bot trap
    if (honeypot) {
      console.warn('Bot submission blocked via honeypot');
      return;
    }

    const preferredTimeSlotStr = calendarSlot
      ? (customSlotNote.trim()
          ? `${calendarSlot.fullSlotString} — ${lang === 'vi' ? 'Ghi chú' : 'Note'}: ${customSlotNote.trim()}`
          : calendarSlot.fullSlotString)
      : (customSlotNote.trim()
          ? `${selectedSlot} (${customSlotNote.trim()})`
          : selectedSlot);

    const safeRefCode = isCodeValid && referralCode.trim() ? referralCode.trim().toUpperCase() : 'PILOT100';

    const candidatePayload = {
      referralCode: safeRefCode,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      ageRange,
      occupation: occupation.trim(),
      testType: testType === 'green' ? ('GREEN_TEST' as const) : ('RED_TEST' as const),
      testLevel: testLevel,
      preferredTimeSlot: preferredTimeSlotStr,
      selectedDate: calendarSlot?.dateStr,
      selectedTimeSlot: calendarSlot?.timeStr,
    };

    // ZOD VALIDATION: Phone format & Email pattern verification
    const registrationSchema = createCandidateRegistrationSchema(lang);
    const validationResult = registrationSchema.safeParse(candidatePayload);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });

      setFieldErrors(errors);
      setFormError(
        lang === 'vi'
          ? 'Vui lòng kiểm tra và sửa các thông tin chưa chính xác được đánh dấu đỏ bên dưới.'
          : 'Please review and correct the invalid fields highlighted below.'
      );

      // Focus and scroll smoothly to the first errored input field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const el = document.getElementById(`field-${firstErrorField}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Clear previous field errors and begin submission
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await apiRegisterCandidate(candidatePayload);

      if (response.success) {
        setConfirmedCandidate({
          id: response.registrationId,
          fullName: fullName.trim(),
          testType,
          testLevel,
          preferredSlots: preferredTimeSlotStr,
          chunkerName: inviterName || (safeRefCode === 'PILOT100' ? '' : safeRefCode),
          chunkerCode: safeRefCode,
        });

        // Reset form upon successful reservation
        setFullName('');
        setPhone('');
        setEmail('');
        setOccupation('');
        setCustomSlotNote('');
        setFormError(null);
        setFieldErrors({});
      } else {
        setFormError(
          response.message ||
            (lang === 'vi'
              ? 'Đăng ký không thành công. Vui lòng kiểm tra lại.'
              : 'Registration failed. Please try again.')
        );
      }
    } catch (err: any) {
      setFormError(
        err.message ||
          (lang === 'vi'
            ? 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.'
            : 'An error occurred during submission. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('booking-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full text-[#0a0a0a]">
      {/* 1. Hero Masthead: 12-Column Swiss Grid */}
      <section className="w-full hairline-b">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-x-6 pt-16 md:pt-24 pb-14 md:pb-16">
          {/* Left Column (col-span-3): Micro Eyebrow */}
          <div className="col-span-12 md:col-span-3 mb-6 md:mb-0">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] leading-tight">
              <span className="block text-[#0a0a0a]/60">CHUNKS PILOT</span>
              <span className="block text-[#c81e16] mt-0.5">/ MN107.V2.1</span>
            </div>
          </div>

          {/* Right Column (col-span-9): Headline, Lead & Tabular Meta */}
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-[clamp(2.4rem,6vw,5rem)] leading-[0.94] tracking-[-0.03em] font-semibold text-[#0a0a0a] text-balance">
              {lang === 'vi' ? (
                <>
                  Năng lực phản xạ<span className="text-[#ff3b30]">,</span> thử thách có ý thức
                  <span className="text-[#ff3b30]">.</span>
                </>
              ) : (
                <>
                  Conscious performance<span className="text-[#ff3b30]">,</span> tested
                  <span className="text-[#ff3b30]">.</span>
                </>
              )}
            </h1>

            <p className="max-w-[48ch] text-[16px] md:text-[17px] text-[#0a0a0a]/65 leading-relaxed mt-6 font-normal tracking-[-0.011em]">
              {lang === 'vi'
                ? 'Khám phá cách bạn duy trì sự chú ý hoặc ứng biến khi nói dưới áp lực qua Chuyển động, Âm thanh và Cảm xúc (MSE). Buổi đánh giá trực tiếp 1-on-1, 45 phút cùng Chunker-in-Charge. Chương trình thử nghiệm hướng tới 100 lượt đăng ký đủ điều kiện.'
                : 'Explore how you sustain attention or improvise while speaking under pressure through Motion, Sound and Emotion (MSE). A live, 45-minute 1-on-1 assessment with a Chunker-in-Charge. This pilot aims for 100 qualified registrations.'}
            </p>

            {/* Campaign Call-to-Actions in Hero */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                type="button"
                onClick={scrollToForm}
                className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[14px] font-bold rounded-full px-6 py-2.5 transition-colors cursor-pointer"
              >
                {lang === 'vi' ? 'Đăng ký đánh giá 1-on-1' : 'Register for 1-on-1'}
              </button>

              <button
                type="button"
                onClick={() => onOpenChunkerHub && onOpenChunkerHub(referralCode)}
                className="text-[13px] font-medium text-[#0a0a0a]/75 hover:text-[#0a0a0a] border border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a] hover:bg-slate-50 rounded-full px-4 py-2 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#c81e16]" />
                <span>
                  {lang === 'vi'
                    ? 'Bạn là Chunkee? Lấy link & mã QR giới thiệu'
                    : 'Are you a Chunkee? Get your link & QR'}
                </span>
              </button>
            </div>

            {/* Tabular-nums Meta Row */}
            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-[rgba(10,10,10,0.14)] text-[12.5px] font-medium text-[#0a0a0a]/60 tabular-nums">
              <div>
                <span className="font-bold text-[#0a0a0a]">100</span> {lang === 'vi' ? 'Mục Tiêu Đăng Ký' : 'Registration Target'}
              </div>

              <span className="w-px h-3.5 bg-[rgba(10,10,10,0.15)] shrink-0" aria-hidden="true" />

              <div>
                <span className="font-bold text-[#0a0a0a]">45 min</span> {lang === 'vi' ? 'Phiên Đánh Giá' : 'Session'}
              </div>

              <span className="w-px h-3.5 bg-[rgba(10,10,10,0.15)] shrink-0" aria-hidden="true" />

              <div>
                <span className="font-bold text-[#0a0a0a]">02</span> {lang === 'vi' ? 'Bài Test Ưu Tiên' : 'Priority Tests'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Inverted Feature Specimen Rule */}
      <ChunksFeatureBand />

      {/* 3. Form-First Candidate Registration Section */}
      <section id="booking-form" className="scroll-mt-24 max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Inviter Greeting Banner: ONLY shown when a valid referral code and real inviter are verified */}
        {Boolean(referralCode.trim() && isCodeValid && inviterName) && (
          <div className="mb-10 p-5 sm:p-6 border border-[rgba(10,10,10,0.14)] bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30] shrink-0" aria-hidden="true" />
              <div>
                <span className="block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
                  {lang === 'vi' ? 'THƯ MỜI CHÍNH THỨC' : 'OFFICIAL INVITATION'}
                </span>
                <p className="text-[15px] sm:text-[16px] font-medium text-[#0a0a0a] mt-0.5">
                  {lang === 'vi' ? (
                    <>
                      Bạn được mời bởi{' '}
                      <span className="font-bold underline decoration-[#ff3b30] decoration-2">
                        {inviterName}
                      </span>{' '}
                      để tham gia đánh giá 1-on-1 CHUNKS Test.
                    </>
                  ) : (
                    <>
                      You have been invited by{' '}
                      <span className="font-bold underline decoration-[#ff3b30] decoration-2">
                        {inviterName}
                      </span>{' '}
                      to take the 1-on-1 CHUNKS Test.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChunkerHub && onOpenChunkerHub(referralCode)}
                  className="text-[12px] text-[#c81e16] hover:underline font-semibold flex items-center gap-1 mt-1.5 cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                  <span>
                    {lang === 'vi'
                      ? 'Bạn cũng là một Chunkee? Lấy link & mã QR của bạn'
                      : 'Are you a Chunkee too? Get your referral link & QR'}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-right self-end sm:self-center shrink-0">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 border border-[rgba(10,10,10,0.14)] bg-white">
                REF: {referralCode}
              </span>
            </div>
          </div>
        )}
        {!isCodeValid && (
          <div className="mb-6 p-4 border border-[rgba(10,10,10,0.14)] bg-slate-50">
            <label htmlFor="referral-code" className="block text-sm font-medium">
              {lang === 'vi' ? 'Mã giới thiệu (không bắt buộc)' : 'Referral code (optional)'}
            </label>
            <input
              id="referral-code"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value)}
              maxLength={30}
              className="mt-2 border border-slate-300 p-2"
            />
            <p className="mt-2 text-xs text-slate-600">
              {loadingCode
                ? (lang === 'vi' ? 'Đang kiểm tra mã…' : 'Checking code…')
                : (lang === 'vi'
                    ? 'Không có mã hợp lệ? Đăng ký qua danh sách chờ PILOT100.'
                    : 'No valid code? Register through the PILOT100 waitlist.')}
            </p>
          </div>
        )}

        {/* 12-Column Layout for Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-12">
          {/* Left Column (col-span-4): Explanatory Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block">
                {lang === 'vi' ? 'BƯỚC 01 / ĐĂNG KÝ' : 'STEP 01 / REGISTRATION'}
              </span>
              <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight text-[#0a0a0a] mt-2">
                {lang === 'vi' ? 'Điền thông tin giữ chỗ.' : 'Reserve your slot.'}
              </h2>
              <p className="text-[14.5px] text-[#0a0a0a]/65 font-light leading-relaxed mt-3">
                {lang === 'vi'
                  ? 'Thông tin liên hệ được thu thập để điều phối buổi đánh giá. Hệ thống đang được rà soát bảo mật; vui lòng cân nhắc trước khi gửi thông tin cá nhân.'
                  : 'Contact details are collected to arrange your assessment. Security review is in progress; consider this before submitting personal information.'}
              </p>
            </div>

            <div className="border-t border-[rgba(10,10,10,0.14)] pt-6 space-y-4 text-[13px]">
              <div>
                <span className="font-semibold text-[#0a0a0a] block">
                  {lang === 'vi' ? 'Thời lượng chuẩn' : 'Session duration'}:
                </span>
                <span className="text-[#0a0a0a]/70 font-light">45 {lang === 'vi' ? 'phút trực tiếp với CiC' : 'minutes live with CiC'}</span>
              </div>
              <div>
                <span className="font-semibold text-[#0a0a0a] block">
                  {lang === 'vi' ? 'Hình thức' : 'Format'}:
                </span>
                <span className="text-[#0a0a0a]/70 font-light">Online Google Meet / Không gian yên tĩnh</span>
              </div>
              <div>
                <span className="font-semibold text-[#0a0a0a] block">
                  {lang === 'vi' ? 'Quyền riêng tư' : 'Privacy'}:
                </span>
                <span className="text-[#0a0a0a]/70 font-light">
                  {lang === 'vi'
                    ? 'Quyền truy cập thông tin ứng viên đang được rà soát trước khi mở rộng chương trình.'
                    : 'Access to candidate information is being reviewed before expanding the pilot.'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (col-span-8): Minimal High-Conversion Form */}
          <div className="col-span-12 md:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Bot Trap */}
              <input
                type="text"
                name="website_probe"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {formError && (
                <div className="p-4 border border-[#c81e16] bg-rose-50/60 text-[#c81e16] text-[13.5px] flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">
                      {lang === 'vi' ? 'Thông tin chưa hợp lệ' : 'Validation Error'}
                    </div>
                    <div className="text-[13px] text-[#0a0a0a]/80 mt-0.5">{formError}</div>
                  </div>
                </div>
              )}

              {/* 1. Contact Information */}
              <div className="space-y-4">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block pb-1 border-b border-[rgba(10,10,10,0.14)]">
                  01. {lang === 'vi' ? 'THÔNG TIN LIÊN LẠC' : 'CONTACT CREDENTIALS'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="field-fullName"
                      className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/70 mb-1.5"
                    >
                      {lang === 'vi' ? 'Họ và tên *' : 'Full Name *'}
                    </label>
                    <input
                      id="field-fullName"
                      type="text"
                      disabled={submitting}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearFieldError('fullName');
                      }}
                      placeholder="Nguyễn Văn A"
                      className={`w-full border px-3.5 py-2.5 text-[14.5px] text-[#0a0a0a] focus:outline-none transition-colors ${
                        fieldErrors.fullName
                          ? 'border-[#c81e16] bg-rose-50/20 focus:border-[#c81e16]'
                          : 'border-[rgba(10,10,10,0.2)] focus:border-[#0a0a0a]'
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-[12px] text-[#c81e16] mt-1 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-phone"
                      className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/70 mb-1.5"
                    >
                      {lang === 'vi' ? 'Số điện thoại / Zalo *' : 'Phone / Zalo *'}
                    </label>
                    <input
                      id="field-phone"
                      type="tel"
                      disabled={submitting}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearFieldError('phone');
                      }}
                      placeholder="0912 345 678"
                      className={`w-full border px-3.5 py-2.5 text-[14.5px] text-[#0a0a0a] focus:outline-none transition-colors ${
                        fieldErrors.phone
                          ? 'border-[#c81e16] bg-rose-50/20 focus:border-[#c81e16]'
                          : 'border-[rgba(10,10,10,0.2)] focus:border-[#0a0a0a]'
                      }`}
                    />
                    {fieldErrors.phone ? (
                      <p className="text-[12px] text-[#c81e16] mt-1 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    ) : (
                      <span className="text-[11px] text-[#0a0a0a]/45 mt-1 block font-mono">
                        {lang === 'vi'
                          ? 'Định dạng 10 chữ số (VD: 0912345678 hoặc +84...)'
                          : '10-digit format (e.g. 0912345678 or +84...)'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="field-email"
                      className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/70 mb-1.5"
                    >
                      Email *
                    </label>
                    <input
                      id="field-email"
                      type="email"
                      disabled={submitting}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearFieldError('email');
                      }}
                      placeholder="name@example.com"
                      className={`w-full border px-3.5 py-2.5 text-[14.5px] text-[#0a0a0a] focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? 'border-[#c81e16] bg-rose-50/20 focus:border-[#c81e16]'
                          : 'border-[rgba(10,10,10,0.2)] focus:border-[#0a0a0a]'
                      }`}
                    />
                    {fieldErrors.email ? (
                      <p className="text-[12px] text-[#c81e16] mt-1 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    ) : (
                      <span className="text-[11px] text-[#0a0a0a]/45 mt-1 block font-mono">
                        {lang === 'vi'
                          ? 'Nhận thư mời Google Meet & kết quả'
                          : 'For Google Meet invite & score results'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-ageRange"
                      className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/70 mb-1.5"
                    >
                      {lang === 'vi' ? 'Độ tuổi' : 'Age Range'}
                    </label>
                    <select
                      id="field-ageRange"
                      disabled={submitting}
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value as AgeRange)}
                      className="w-full border border-[rgba(10,10,10,0.2)] px-3.5 py-2.5 text-[14.5px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] bg-white cursor-pointer"
                    >
                      <option value="<18">&lt; 18</option>
                      <option value="18-24">18 - 24</option>
                      <option value="25-34">25 - 34</option>
                      <option value="35-44">35 - 44</option>
                      <option value="45+">45+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="field-occupation"
                    className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/70 mb-1.5"
                  >
                    {lang === 'vi' ? 'Nghề nghiệp / Lĩnh vực *' : 'Occupation / Industry *'}
                  </label>
                  <input
                    id="field-occupation"
                    type="text"
                    disabled={submitting}
                    value={occupation}
                    onChange={(e) => {
                      setOccupation(e.target.value);
                      clearFieldError('occupation');
                    }}
                    placeholder="Product Manager, Software Engineer, v.v."
                    className={`w-full border px-3.5 py-2.5 text-[14.5px] text-[#0a0a0a] focus:outline-none transition-colors ${
                      fieldErrors.occupation
                        ? 'border-[#c81e16] bg-rose-50/20 focus:border-[#c81e16]'
                        : 'border-[rgba(10,10,10,0.2)] focus:border-[#0a0a0a]'
                    }`}
                  />
                  {fieldErrors.occupation && (
                    <p className="text-[12px] text-[#c81e16] mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.occupation}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Test Selection (Green vs Red Radio Cards) */}
              <div id="test-options" className="space-y-4 scroll-mt-24">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block pb-1 border-b border-[rgba(10,10,10,0.14)]">
                  02. {lang === 'vi' ? 'CHỌN BÀI TEST ƯU TIÊN' : 'SELECT PRIORITY ASSESSMENT'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Green Test */}
                  <div
                    onClick={() => setTestType('green')}
                    className={`p-5 border cursor-pointer transition-all ${
                      testType === 'green'
                        ? 'border-[#0a0a0a] bg-slate-50 ring-1 ring-[#0a0a0a]'
                        : 'border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="text-[14px] font-bold text-[#0a0a0a]">
                          Green Test (%c)
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#0a0a0a]/60">
                        Focus
                      </span>
                    </div>

                    <p className="text-[13px] text-[#0a0a0a]/75 font-light leading-relaxed">
                      {lang === 'vi'
                        ? 'Quan sát cách bạn duy trì sự chú ý, làm theo yêu cầu và nhận biết lỗi đã sửa khi nói dưới áp lực.'
                        : 'Observes how you maintain attention, follow requests and stay aware of corrections while speaking under pressure.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[rgba(10,10,10,0.1)] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssessmentModal(GREEN_TEST_INFO);
                        }}
                        className="text-[12px] text-[#c81e16] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'vi' ? '[Đọc chi tiết về Green Test]' : '[Details on Green Test]'}</span>
                      </button>
                      <span className="text-[11px] font-mono tabular-nums text-[#0a0a0a]/50">
                        45 min · 49 challenges
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Red Test */}
                  <div
                    onClick={() => setTestType('red')}
                    className={`p-5 border cursor-pointer transition-all ${
                      testType === 'red'
                        ? 'border-[#0a0a0a] bg-slate-50 ring-1 ring-[#0a0a0a]'
                        : 'border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shrink-0" />
                        <span className="text-[14px] font-bold text-[#0a0a0a]">
                          Red Test (%r)
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#0a0a0a]/60">
                        Improv
                      </span>
                    </div>

                    <p className="text-[13px] text-[#0a0a0a]/75 font-light leading-relaxed">
                      {lang === 'vi'
                        ? 'Quan sát cách bạn chuyển hướng ý tưởng theo gợi ý bất ngờ mà vẫn giữ trình tự và mạch logic.'
                        : 'Observes how you redirect an idea under unexpected hints while preserving sequence and logic.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[rgba(10,10,10,0.1)] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssessmentModal(RED_TEST_INFO);
                        }}
                        className="text-[12px] text-[#c81e16] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'vi' ? '[Đọc chi tiết về Red Test]' : '[Details on Red Test]'}</span>
                      </button>
                      <span className="text-[11px] font-mono tabular-nums text-[#0a0a0a]/50">
                        45 min · 49 challenges
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2b. Test Level Selection (Dễ vs Khó) */}
              <div id="test-level" className="space-y-4">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block pb-1 border-b border-[rgba(10,10,10,0.14)]">
                  02b. {lang === 'vi' ? 'LEVEL MUỐN TEST (ĐỘ KHÓ)' : 'SELECT TEST LEVEL (DIFFICULTY)'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Dễ (Foundation Level) */}
                  <div
                    onClick={() => setTestLevel('easy')}
                    className={`p-5 border cursor-pointer transition-all ${
                      testLevel === 'easy'
                        ? 'border-[#0a0a0a] bg-slate-50 ring-1 ring-[#0a0a0a]'
                        : 'border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="text-[14px] font-bold text-[#0a0a0a]">
                          {lang === 'vi' ? 'Level: Dễ (Cơ bản / Foundation)' : 'Easy (Foundation Level)'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 border border-blue-200 text-blue-700 bg-blue-50/60 font-semibold">
                        {lang === 'vi' ? 'DỄ' : 'EASY'}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#0a0a0a]/75 font-light leading-relaxed">
                      {lang === 'vi'
                        ? 'Nhịp độ tiêu chuẩn, làm quen phương pháp MSE (Motion, Sound, Emotion). Đánh giá phản xạ ngôn ngữ ở vạch xuất phát nhận thức trước khi nâng cấp.'
                        : 'Standard MSE pacing. Ideal for first-timers to calibrate baseline voice resonance and initial anti-habitual reflexes.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[rgba(10,10,10,0.1)] flex items-center justify-between text-[11px] font-mono text-[#0a0a0a]/60">
                      <span>{lang === 'vi' ? 'Áp lực: Tiêu chuẩn' : 'Pressure: Standard'}</span>
                      <span className="text-blue-700 font-semibold">Phase 1 Calibration</span>
                    </div>
                  </div>

                  {/* Option 2: Khó (Advanced Level / Stress Test) */}
                  <div
                    onClick={() => setTestLevel('hard')}
                    className={`p-5 border cursor-pointer transition-all ${
                      testLevel === 'hard'
                        ? 'border-[#0a0a0a] bg-slate-50 ring-1 ring-[#0a0a0a]'
                        : 'border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shrink-0" />
                        <span className="text-[14px] font-bold text-[#0a0a0a]">
                          {lang === 'vi' ? 'Level: Khó (Nâng cao / Advanced)' : 'Hard (Advanced Level)'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 border border-rose-200 text-[#c81e16] bg-rose-50/60 font-semibold">
                        {lang === 'vi' ? 'KHÓ' : 'HARD'}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#0a0a0a]/75 font-light leading-relaxed">
                      {lang === 'vi'
                        ? 'Ma sát nhận thức tối đa, bẻ lái logic dồn dập, triệt tiêu lỗi thói quen với nhịp độ áp lực cao từ CiC. Không cho phép chuẩn bị kịch bản trước.'
                        : 'Maximum cognitive friction, rapid unpredictable hints, and rigorous real-time pressure from CiC. Rote scripts strictly impossible.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[rgba(10,10,10,0.1)] flex items-center justify-between text-[11px] font-mono text-[#0a0a0a]/60">
                      <span>{lang === 'vi' ? 'Áp lực: Cao độ' : 'Pressure: High Friction'}</span>
                      <span className="text-[#c81e16] font-semibold">Phase 2 Stress Test</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Availability Calendar Picker */}
              <div className="space-y-4">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block pb-1 border-b border-[rgba(10,10,10,0.14)]">
                  03. {lang === 'vi' ? 'CHỌN LỊCH VÀ KHUNG GIỜ ĐÁNH GIÁ 1-ON-1' : '1-ON-1 CALENDAR & TIME SLOT SELECTION'}
                </span>

                {/* Interactive Monthly/Daily Calendar and Slot Picker */}
                <BookingCalendar
                  lang={lang}
                  onSelectSlot={(slot) => {
                    setCalendarSlot(slot);
                    setSelectedSlot(slot.fullSlotString);
                  }}
                />

                <div className="pt-1">
                  <label className="block text-[11px] font-mono text-[#0a0a0a]/60 uppercase tracking-wider mb-1">
                    {lang === 'vi' ? 'Ghi chú thêm về lịch hẹn (Tùy chọn)' : 'Additional Scheduling Notes (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={customSlotNote}
                    onChange={(e) => setCustomSlotNote(e.target.value)}
                    placeholder={
                      lang === 'vi'
                        ? 'Ví dụ: Cần xếp lịch trên Google Meet hoặc dời sang 20:30 nếu được...'
                        : 'e.g. Prefer Google Meet or adjust starting time if needed...'
                    }
                    className="w-full border border-[rgba(10,10,10,0.18)] px-3.5 py-2.5 text-[13.5px] text-[#0a0a0a] focus:outline-none focus:border-[#c81e16] bg-white font-light"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-[12px] text-[#0a0a0a]/60 leading-normal font-light">
                  {lang === 'vi'
                    ? 'Bằng việc gửi thông tin, bạn đồng ý để điều phối viên CHUNKS liên hệ xếp lịch.'
                    : 'By submitting, you agree to allow CHUNKS operations to coordinate your session.'}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[15px] font-bold rounded-full px-8 py-3.5 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto shadow-sm"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'vi' ? 'Đang xác thực & gửi đăng ký...' : 'Validating & submitting...'}</span>
                    </>
                  ) : (
                    <span>
                      {lang === 'vi' ? 'Gửi đăng ký giữ chỗ' : 'Confirm Registration'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 4. Swiss Numbered FAQ Section */}
      <ChunksNumberedFaq lang={lang} />

      {/* 5. Inverted CTA Band */}
      <ChunksCtaBand
        onSelectGreen={() => {
          setTestType('green');
          scrollToForm();
        }}
        onSelectRed={() => {
          setTestType('red');
          scrollToForm();
        }}
        lang={lang}
      />

      {/* Modals */}
      <AssessmentDetailModal
        info={selectedAssessmentModal}
        isOpen={!!selectedAssessmentModal}
        onClose={() => setSelectedAssessmentModal(null)}
        lang={lang}
        onSelectAndClose={(type) => {
          setTestType(type);
          setSelectedAssessmentModal(null);
          scrollToForm();
        }}
      />

      <BookingSuccessModal
        candidate={confirmedCandidate}
        isOpen={!!confirmedCandidate}
        onClose={() => setConfirmedCandidate(null)}
        lang={lang}
      />
    </div>
  );
};
