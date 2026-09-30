import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  AlertCircle,
  QrCode,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { AgeRange } from '../types';
import { apiValidateReferral, apiRegisterCandidate } from '../api/client';
import { createCandidateRegistrationSchema } from '../schemas/validation';
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
  const [testLevel, setTestLevel] = useState<'easy' | 'hard'>('easy');
  const [customSlotNote, setCustomSlotNote] = useState('');
  const reduceMotion = useReducedMotion();

  // Honeypot anti-bot
  const [honeypot, setHoneypot] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

    if (!testLevel) {
      setFieldErrors({ testLevel: lang === 'vi' ? 'Vui lòng chọn mức độ bài test' : 'Please select a test level' });
      document.getElementById('field-testLevel')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      return;
    }

    const preferredTimeSlotStr =
      customSlotNote.trim() ||
      (lang === 'vi'
        ? 'Chưa ghi chú lịch; điều phối viên CHUNKS liên hệ xếp lịch'
        : 'No schedule noted; CHUNKS coordinator will contact to arrange');

    const safeRefCode = isCodeValid && referralCode.trim() ? referralCode.trim().toUpperCase() : 'PILOT100';

    const candidatePayload = {
      referralCode: safeRefCode,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      ageRange,
      occupation: occupation.trim(),
      testType: 'green' as const,
      testLevel: testLevel || 'easy',
      preferredTimeSlot: preferredTimeSlotStr,
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
          testType: 'green',
          testLevel: testLevel || 'easy',
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
        setTestLevel('easy');
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
    <div className="chunks-main w-full">
      <section className="chunks-hero" aria-labelledby="main-hero-title">
        <motion.div initial={reduceMotion ? false : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} className="chunks-shell chunks-reveal-shell">
          <div className="chunks-hero-grid">
            <motion.div initial={reduceMotion ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="chunks-hero-rail">
              <span className="chunks-eyebrow flex items-center gap-3"><span className="block w-2.5 h-2.5 bg-[var(--chunks-accent)]" aria-hidden="true" />CHUNKS TEST · Based on CHUNKS Theory</span>
              <span className="chunks-meta hidden md:block text-[var(--chunks-muted)]">{lang === 'vi' ? <>MINI-TEST<br />TRỰC TIẾP / 1-ON-1</> : <>MINI-TEST<br />IN PERSON / 1-ON-1</>}</span>
            </motion.div>
            <div className="chunks-hero-copy">
              <div className="overflow-hidden">
                <motion.h1 id="main-hero-title" initial={reduceMotion ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} className="chunks-hero-title">
                  {lang === 'vi' ? <>Khi nói thật,<br /><strong>bạn phản xạ ra sao?</strong></> : <>When you speak,<br /><strong>how do you respond?</strong></>}
                </motion.h1>
              </div>
              <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.32 }} className="chunks-hero-info">
                <p>{lang === 'vi' ? 'Một cuộc gặp trực tiếp để quan sát cách bạn duy trì sự chú ý, ứng biến và kết nối ý tưởng khi nói tiếng Anh. Mini-Test 21 câu, 15–20 phút, 1-on-1 cùng Chunker-in-Charge (CiC); không phải bài trắc nghiệm ngữ pháp.' : 'A live conversation to observe how you sustain attention, improvise and connect ideas in spoken English. A 21-question Mini-Test, 15–20 minutes, in person with a Chunker-in-Charge (CiC); not a grammar quiz.'}</p>
                <div className="chunks-hero-actions">
                  <motion.button
                    type="button"
                    className="chunks-pill cursor-pointer"
                    whileHover={reduceMotion ? {} : { scale: 1.02 }}
                    whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    onClick={scrollToForm}
                  >
                    {lang === 'vi' ? 'Đăng ký Mini-Test' : 'Register for the Mini-Test'}{' '}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </motion.button>
                  <button type="button" onClick={() => onOpenChunkerHub?.(referralCode)} className="text-[13px] text-[var(--chunks-muted)] hover:text-[var(--chunks-accent)] transition-colors flex items-center gap-2 cursor-pointer"><QrCode size={15} />{lang === 'vi' ? 'Chunkee? Link & QR' : 'Chunkee? Link & QR'}</button>
                </div>
              </motion.div>
              <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.5 }} className="chunks-hero-figures">
                {[
                  ['21', lang === 'vi' ? 'câu ngắn' : 'short questions'],
                  ['15–20', lang === 'vi' ? 'phút trực tiếp' : 'minutes in person'],
                  ['100', lang === 'vi' ? 'lượt đăng ký đủ điều kiện tối đa' : 'qualified registrations maximum'],
                ].map(([number, label]) => <div key={number}><strong>{number}</strong><span>{label}</span></div>)}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Inverted Feature Specimen Rule */}
      <ChunksFeatureBand />

      {/* 3. MSE theory on the same Swiss grid as the review design */}
      <ChunksCtaBand onRegister={scrollToForm} lang={lang} />

      {/* 4. Candidate Registration Section */}
      <section id="booking-form" className="scroll-mt-24">
        <div className="chunks-shell">
        {/* Introductory Banner: About CHUNKS & Mini-Test format */}
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="chunks-booking-banner mb-8 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="CHUNKS" className="w-[44px] h-auto block shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c81e16]">
                {lang === 'vi' ? 'CHUNKS TEST 100 · BUỔI KHẢO SÁT TRỰC TIẾP' : 'CHUNKS TEST 100 · IN-PERSON ASSESSMENT'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <a
                href="https://the-chunks.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[rgba(10,10,10,0.15)] text-[#0a0a0a] hover:border-[#c81e16] transition-colors"
              >
                <span>the-chunks.com</span>
                <ExternalLink className="w-3 h-3 text-[#c81e16]" />
              </a>
                   <a
                     href="https://chunkstheory.com/chunks-theory-2026-7-pages/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[rgba(10,10,10,0.15)] text-[#0a0a0a] hover:border-[#c81e16] transition-colors"
              >
                <span>chunkstheory.com</span>
                <ExternalLink className="w-3 h-3 text-[#c81e16]" />
              </a>
            </div>
          </div>
           <h2 className="text-[22px] sm:text-[28px] font-semibold tracking-tight max-w-[32ch] leading-tight text-[#0a0a0a]">
             {lang === 'vi' ? 'Không cần học trước. Hãy đến và nói như bạn thường nói.' : 'No need to rehearse. Speak just as you normally do.'}
           </h2>
           <div className="text-[14px] sm:text-[14.5px] text-[#0a0a0a]/80 leading-relaxed max-w-3xl space-y-3 font-normal">
             <p>
               {lang === 'vi'
                 ? 'Để nói một câu tiếng Anh trôi chảy ngoài đời thực, tâm trí bạn phải điều phối ba việc cùng lúc: tập trung giữ mạch câu, ứng biến khi tình huống đổi hướng, và tin vào trực giác ngôn ngữ của mình.'
                 : 'To speak fluent English in real life, your mind must coordinate three things simultaneously: maintaining focus on your train of thought, improvising when situations shift direction, and trusting your linguistic intuition.'}
             </p>
             <p className="font-semibold text-[#c81e16]">
               {lang === 'vi'
                 ? 'Nhưng khi áp lực tăng dần, mắt xích nào trong bạn sẽ bị đứt gãy trước?'
                 : 'Yet as pressure mounts, which link within you breaks first?'}
             </p>
             <p>
               {lang === 'vi'
                 ? 'Mini-Test 21 câu (15–20 phút) cùng Chunker-in-Charge không phải một kỳ thi. Đó là nơi bạn thả lỏng để tự nhìn thấy phản xạ thật của mình khi không còn kịch bản chuẩn bị sẵn.'
                 : 'The 21-question Mini-Test (15–20 minutes) with a Chunker-in-Charge is not an exam. It is a space to unwind and witness your genuine reflexes when prepared scripts are stripped away.'}
             </p>
           </div>
        </motion.div>
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
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 sm:p-7 border border-[#c81e16]/30 bg-[#fff5f2] relative overflow-hidden max-w-xl mx-auto text-center flex flex-col items-center shadow-xs"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#c81e16]" aria-hidden="true" />
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#a81711] mb-2">
              {lang === 'vi' ? 'LỜI MỜI / 01' : 'INVITATION / 01'}
            </span>
            <label htmlFor="referral-code" className="block text-sm font-medium text-[#0a0a0a]">
              {lang === 'vi' ? 'Bạn có mã giới thiệu từ Chunkee?' : 'Have a referral code from a Chunkee?'}
            </label>
            <input
              id="referral-code"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value)}
              maxLength={30}
              placeholder={lang === 'vi' ? 'Nhập mã nếu có' : 'Enter your code if you have one'}
              className="mt-3 w-full sm:max-w-xs mx-auto text-center bg-white border border-[#0a0a0a]/25 px-4 py-3 focus:outline-2 focus:outline-[#c81e16] font-mono uppercase tracking-wider"
            />
            <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto text-center">
              {loadingCode
                ? (lang === 'vi' ? 'Đang kiểm tra mã…' : 'Checking code…')
                : (lang === 'vi'
                     ? 'Chưa có mã? Bạn vẫn có thể gửi yêu cầu qua chương trình PILOT100.'
                     : 'No code yet? You can still submit a request through PILOT100.')}
            </p>
          </motion.div>
        )}

        {/* 12-Column Layout for Form */}
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-12">
          {/* Left Column (col-span-4): Explanatory Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block">
                {lang === 'vi' ? 'BƯỚC 01 / ĐĂNG KÝ' : 'STEP 01 / REGISTRATION'}
              </span>
              <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight text-[#0a0a0a] mt-2">
                {lang === 'vi' ? 'Thông tin đăng ký.' : 'Registration details.'}
              </h2>
              <p className="text-[14.5px] text-[#0a0a0a]/65 font-light leading-relaxed mt-3">
                {lang === 'vi'
                   ? 'Để lại thông tin và chọn mức độ bạn muốn thử. CiC sẽ quan sát cách bạn phản hồi trong bài Mini-Test 21 câu, 15–20 phút trực tiếp. Đội ngũ CHUNKS sẽ liên hệ xác nhận lịch.'
                   : 'Share your details and preferred difficulty. A CiC will observe your responses during the 21-question, 15–20 minute in-person Mini-Test. CHUNKS will contact you to confirm the appointment.'}
              </p>
            </div>

            <div className="border-t border-[rgba(10,10,10,0.14)] pt-6 space-y-4 text-[13px]">
              <div>
                <span className="font-semibold text-[#0a0a0a] block">
                  {lang === 'vi' ? 'Thời lượng' : 'Session duration'}:
                </span>
                <span className="text-[#0a0a0a]/70 font-light">
                  {lang === 'vi' ? '15 – 20 phút (Mini-test 21 câu)' : '15 – 20 minutes (21-question mini-test)'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#0a0a0a] block">
                  {lang === 'vi' ? 'Hình thức' : 'Format'}:
                </span>
                <span className="text-[#0a0a0a]/70 font-light">
                  {lang === 'vi' ? 'Trực tiếp (Offline) 1-on-1 tại CHUNKS' : 'In-person (Offline) 1-on-1 at CHUNKS'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#0a0a0a] block">
                  {lang === 'vi' ? 'Bảo mật & Quyền riêng tư' : 'Privacy'}:
                </span>
                <span className="text-[#0a0a0a]/70 font-light">
                  {lang === 'vi'
                     ? 'Thông tin liên hệ được lưu trên máy chủ để đội ngũ được phân quyền điều phối buổi đánh giá và gửi xác nhận.'
                     : 'Contact details are stored on the server for authorized staff to coordinate and confirm your session.'}
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
                         ? 'Nhận xác nhận đăng ký và thông tin liên hệ'
                         : 'For registration confirmation and follow-up'}
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

              {/* 02. MỨC ĐỘ BÀI TEST (ĐỘ KHÓ) */}
              <div className="space-y-3" id="field-testLevel">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block pb-1 border-b border-[rgba(10,10,10,0.14)]">
                  02. {lang === 'vi' ? 'MỨC ĐỘ BÀI TEST (ĐỘ KHÓ)' : 'TEST LEVEL (DIFFICULTY)'}
                </span>
                <div
                  role="radiogroup"
                  aria-label={lang === 'vi' ? 'Mức độ bài test (Độ khó)' : 'Test level (Difficulty)'}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1"
                >
                  {/* Card A: Cơ bản (Dễ) */}
                  <motion.div
                    role="radio"
                    aria-checked={testLevel === 'easy'}
                    tabIndex={0}
                    onClick={() => {
                      setTestLevel('easy');
                      clearFieldError('testLevel');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setTestLevel('easy');
                        clearFieldError('testLevel');
                      }
                    }}
                    whileHover={reduceMotion ? {} : { y: -2 }}
                    whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`relative p-5 border cursor-pointer select-none transition-all flex flex-col justify-between rounded-[2px] ${
                      testLevel === 'easy'
                        ? 'border-[#c81e16] bg-[#fff5f2] ring-2 ring-[#c81e16]/20 shadow-sm'
                        : 'border-[rgba(10,10,10,0.16)] bg-white hover:border-[#0a0a0a]/40 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold px-2 py-0.5 transition-colors ${
                            testLevel === 'easy'
                              ? 'bg-[#c81e16] text-white'
                              : 'bg-slate-100 text-[#0a0a0a]/70'
                          }`}
                        >
                          {lang === 'vi' ? 'TIÊU CHUẨN' : 'STANDARD'}
                        </span>

                        {/* Tactile Radio Checkmark */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            testLevel === 'easy'
                              ? 'border-[#c81e16] bg-[#c81e16]'
                              : 'border-[rgba(10,10,10,0.28)] bg-white'
                          }`}
                        >
                          {testLevel === 'easy' && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <h3 className="text-[17px] font-bold tracking-tight text-[#0a0a0a]">
                        {lang === 'vi' ? 'Cơ bản (Dễ)' : 'Basic (Easy)'}
                      </h3>

                      <p className="text-[13px] text-[#0a0a0a]/75 mt-1.5 leading-relaxed font-normal">
                        {lang === 'vi'
                          ? 'Nhịp độ tiêu chuẩn · Làm quen phản xạ tự nhiên cùng CiC.'
                          : 'Standard pace · Natural reflex acclimatization with CiC.'}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[rgba(10,10,10,0.08)] text-[11.5px] text-[#0a0a0a]/60 font-light flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>
                        {lang === 'vi'
                          ? 'Phù hợp quan sát nhịp phản hồi căn bản.'
                          : 'Ideal to observe baseline response rhythm.'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Card B: Nâng cao (Khó) */}
                  <motion.div
                    role="radio"
                    aria-checked={testLevel === 'hard'}
                    tabIndex={0}
                    onClick={() => {
                      setTestLevel('hard');
                      clearFieldError('testLevel');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setTestLevel('hard');
                        clearFieldError('testLevel');
                      }
                    }}
                    whileHover={reduceMotion ? {} : { y: -2 }}
                    whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`relative p-5 border cursor-pointer select-none transition-all flex flex-col justify-between rounded-[2px] ${
                      testLevel === 'hard'
                        ? 'border-[#c81e16] bg-[#fff5f2] ring-2 ring-[#c81e16]/20 shadow-sm'
                        : 'border-[rgba(10,10,10,0.16)] bg-white hover:border-[#0a0a0a]/40 hover:bg-rose-50/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold px-2 py-0.5 transition-colors ${
                            testLevel === 'hard'
                              ? 'bg-[#c81e16] text-white'
                              : 'bg-rose-100/70 text-[#c81e16]'
                          }`}
                        >
                          {lang === 'vi' ? 'DỒN DẬP' : 'INTENSIVE'}
                        </span>

                        {/* Tactile Radio Checkmark */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            testLevel === 'hard'
                              ? 'border-[#c81e16] bg-[#c81e16]'
                              : 'border-[rgba(10,10,10,0.28)] bg-white'
                          }`}
                        >
                          {testLevel === 'hard' && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <h3 className="text-[17px] font-bold tracking-tight text-[#0a0a0a]">
                        {lang === 'vi' ? 'Nâng cao (Khó)' : 'Advanced (Hard)'}
                      </h3>

                      <p className="text-[13px] text-[#0a0a0a]/75 mt-1.5 leading-relaxed font-normal">
                        {lang === 'vi'
                          ? 'Nhịp độ dồn dập · Tăng ma sát phản xạ dưới áp lực cao.'
                          : 'Rapid pace · Heightened reflex friction under elevated pressure.'}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[rgba(10,10,10,0.08)] text-[11.5px] text-[#0a0a0a]/60 font-light flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c81e16] shrink-0" />
                      <span>
                        {lang === 'vi'
                          ? 'Thử thách ứng biến khi CiC tăng tốc nhịp trao đổi.'
                          : 'Challenges improvisation when CiC increases pacing.'}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {fieldErrors.testLevel && (
                  <p className="text-[12px] text-[#c81e16] mt-1 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.testLevel}</span>
                  </p>
                )}
                <p className="text-[12.5px] text-[#0a0a0a]/70 flex items-center gap-1.5 mt-2.5">
                  <span>💡</span>
                  <span>
                    {lang === 'vi'
                      ? 'Chuyên viên CiC sẽ linh hoạt điều chỉnh theo nhịp nói và phản xạ thực tế của bạn.'
                      : 'The CiC specialist will flexibly adapt to your actual speech rhythm and reflex.'}
                  </span>
                </p>
              </div>

              {/* 03. LỊCH TEST MONG MUỐN (GHI CHÚ DỰ KIẾN) */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 block pb-1 border-b border-[rgba(10,10,10,0.14)]">
                  03. {lang === 'vi' ? 'LỊCH TEST MONG MUỐN (GHI CHÚ DỰ KIẾN)' : 'PREFERRED SCHEDULE (ESTIMATED NOTE)'}
                </span>
                <p className="text-[13px] text-[#0a0a0a]/75 leading-relaxed font-light">
                  {lang === 'vi'
                    ? 'Thời lượng 15 – 20 phút trực tiếp 1-on-1 cùng CiC. Vui lòng ghi chú ngày hoặc khung giờ bạn thuận tiện tham gia nhất, điều phối viên CHUNKS sẽ gọi điện hoặc nhắn Zalo để thống nhất lịch hẹn chính thức tại cơ sở.'
                    : 'Duration 15–20 minutes in-person 1-on-1 with a CiC. Please note your most convenient date or time window; CHUNKS coordinators will call or message via Zalo to finalize your official appointment at the center.'}
                </p>
                <div className="pt-1">
                  <label htmlFor="field-preferredTimeSlot" className="sr-only">
                    {lang === 'vi' ? 'Ghi chú lịch test mong muốn' : 'Preferred schedule note'}
                  </label>
                  <textarea
                    id="field-preferredTimeSlot"
                    rows={3}
                    maxLength={250}
                    disabled={submitting}
                    value={customSlotNote}
                    onChange={(e) => {
                      setCustomSlotNote(e.target.value);
                      clearFieldError('preferredTimeSlot');
                    }}
                    placeholder={
                      lang === 'vi'
                        ? 'Ví dụ: Tối thứ Bảy tuần này sau 19h, hoặc các buổi chiều trong tuần sau 17h...'
                        : 'e.g. This Saturday evening after 7 PM, or weekday afternoons after 5 PM...'
                    }
                    className={`w-full border px-3.5 py-2.5 text-[14px] text-[#0a0a0a] focus:outline-none transition-colors bg-white resize-y ${
                      fieldErrors.preferredTimeSlot
                        ? 'border-[#c81e16] bg-rose-50/20 focus:border-[#c81e16]'
                        : 'border-[rgba(10,10,10,0.2)] focus:border-[#0a0a0a]'
                    }`}
                  />
                  {fieldErrors.preferredTimeSlot && (
                    <p className="text-[12px] text-[#c81e16] mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.preferredTimeSlot}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-[12px] text-[#0a0a0a]/60 leading-normal font-light">
                  {lang === 'vi'
                    ? 'Bằng việc gửi thông tin, bạn đồng ý để điều phối viên CHUNKS liên hệ xếp lịch.'
                    : 'By submitting, you agree to allow CHUNKS operations to coordinate your session.'}
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={reduceMotion || submitting ? {} : { scale: 1.02 }}
                  whileTap={reduceMotion || submitting ? {} : { scale: 0.98 }}
                  className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[15px] font-bold rounded-full px-8 py-3.5 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto shadow-sm"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'vi' ? 'Đang xác thực & gửi đăng ký...' : 'Validating & submitting...'}</span>
                    </>
                  ) : (
                    <span>
                       {lang === 'vi' ? 'Gửi yêu cầu tham gia' : 'Send registration request'}
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
        </div>
      </section>

      {/* 5. Swiss Numbered FAQ Section */}
      <ChunksNumberedFaq lang={lang} />

      {/* Modals */}
      <BookingSuccessModal
        candidate={confirmedCandidate}
        isOpen={!!confirmedCandidate}
        onClose={() => setConfirmedCandidate(null)}
        lang={lang}
      />
    </div>
  );
};
