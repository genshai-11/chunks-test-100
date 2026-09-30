import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Copy, X } from 'lucide-react';
import { Candidate } from '../types';

interface Props {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const BookingSuccessModal: React.FC<Props> = ({
  candidate,
  isOpen,
  onClose,
  lang,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ff3b30', '#0a0a0a', '#c81e16', '#e5e5e5'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen || !candidate) return null;

  const isGreen = candidate.testType === 'green';

  const copyCandidateId = () => {
    if (candidate.id) {
      navigator.clipboard.writeText(candidate.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl bg-white border border-[rgba(10,10,10,0.14)] p-6 sm:p-8 text-[#0a0a0a]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
              CHUNKS TEST 100 · CONFIRMATION RECEIPT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#0a0a0a]/50 hover:text-[#0a0a0a] transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-5">
          <div>
            <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.03em] leading-tight">
              {lang === 'vi' ? 'Đã ghi nhận yêu cầu.' : 'Registration request received.'}
            </h3>
            <p className="text-[14.5px] text-[#0a0a0a]/70 font-light mt-1">
              {lang === 'vi'
                ? `Chào ${candidate.fullName}, yêu cầu tham gia chương trình thử nghiệm đã được ghi nhận. Lịch đánh giá sẽ được xác nhận riêng.`
                : `Hello ${candidate.fullName}, your pilot registration request was received. Your assessment time will be confirmed separately.`}
            </p>
          </div>

          {/* Registration Summary Card */}
          <div className="border border-[rgba(10,10,10,0.14)] p-4 bg-slate-50 space-y-2 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-[#0a0a0a]/60">Registration ID:</span>
              <button
                onClick={copyCandidateId}
                className="font-mono text-[#c81e16] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{candidate.id || 'CAND-PENDING'}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#0a0a0a]/60">{lang === 'vi' ? 'Bài test' : 'Assessment'}:</span>
              <span className="font-semibold text-[#0a0a0a]">
                 {candidate.testType === 'general' || candidate.testType === 'green' ? (lang === 'vi' ? 'Mini-Test 21 câu' : '21-question Mini-Test') : isGreen ? 'Green Test (%c Focus)' : 'Red Test (%r Improv)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#0a0a0a]/60">{lang === 'vi' ? 'Level' : 'Difficulty'}:</span>
              <span className="font-semibold font-mono text-[#0a0a0a]">
                {candidate.testLevel === 'hard'
                  ? (lang === 'vi' ? 'Khó (Advanced)' : 'Hard (Advanced)')
                  : (lang === 'vi' ? 'Dễ (Foundation)' : 'Easy (Foundation)')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#0a0a0a]/60">{lang === 'vi' ? 'Khung giờ' : 'Time Window'}:</span>
               <span className="font-mono text-[#0a0a0a] text-right max-w-[60%] break-words">{candidate.preferredSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#0a0a0a]/60">{lang === 'vi' ? 'Người giới thiệu' : 'Invited By'}:</span>
              <span className="font-medium text-[#0a0a0a]">
                {candidate.chunkerName || candidate.chunkerCode}
              </span>
            </div>
          </div>

          {/* Coordination Timeline */}
          <div className="border-l-2 border-[#c81e16] pl-4 py-1 text-[13.5px] space-y-1">
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60">
              {lang === 'vi' ? 'Các bước tiếp theo' : 'Next Steps'}
            </span>
            <p className="text-[#0a0a0a]/80 font-light">
              {lang === 'vi'
                ? 'Đội ngũ điều phối CHUNKS cần liên hệ qua Zalo hoặc điện thoại để xác nhận lịch với CiC. Khung giờ đã chọn chỉ là ưu tiên của bạn.'
                : 'The CHUNKS operations team needs to contact you by Zalo or phone to confirm your appointment with a CiC. Your selected time is a preference only.'}
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13.5px] font-semibold rounded-full px-6 py-2.5 transition-colors cursor-pointer"
            >
              {lang === 'vi' ? 'Hoàn tất' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
