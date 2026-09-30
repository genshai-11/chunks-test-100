import React from 'react';
import { X } from 'lucide-react';
import { AssessmentInfo } from '../types';

interface Props {
  info: AssessmentInfo | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
  onSelectAndClose?: (type: 'green' | 'red') => void;
}

export const AssessmentDetailModal: React.FC<Props> = ({
  info,
  isOpen,
  onClose,
  lang,
  onSelectAndClose,
}) => {
  if (!isOpen || !info) return null;

  const isGreen = info.type === 'green';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-[rgba(10,10,10,0.14)] overflow-hidden flex flex-col text-[#0a0a0a]">
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 hairline-b flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c81e16]">
                {isGreen ? 'GREEN TEST · %c FOCUS' : 'RED TEST · %r IMPROV'}
              </span>
            </div>
            <h3 className="text-[22px] sm:text-[26px] font-semibold text-[#0a0a0a] tracking-tight leading-tight">
              {lang === 'vi' ? info.titleVi : info.titleEn}
            </h3>
            <p className="text-[14px] text-[#0a0a0a]/65 mt-1 font-light">
              {lang === 'vi' ? info.subtitleVi : info.subtitleEn}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#0a0a0a]/50 hover:text-[#0a0a0a] transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Quick Stats Rule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border border-[rgba(10,10,10,0.14)] p-4 bg-white">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/50">
                Duration
              </span>
              <span className="text-[16px] font-semibold font-mono tabular-nums text-[#0a0a0a]">
                45 mins
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/50">
                Challenges
              </span>
              <span className="text-[16px] font-semibold font-mono tabular-nums text-[#0a0a0a]">
                49 items
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/50">
                Progression
              </span>
              <span className="text-[16px] font-semibold font-mono tabular-nums text-[#0a0a0a]">
                7 Levels
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/50">
                Format
              </span>
              <span className="text-[16px] font-semibold text-[#c81e16]">
                1-on-1 CiC
              </span>
            </div>
          </div>

          {/* Core Question & Focus */}
          <div className="space-y-4">
            <div className="border-l-2 border-[#c81e16] pl-4 py-1">
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
                {lang === 'vi' ? 'Câu hỏi cốt lõi' : 'Core Question'}
              </span>
              <p className="text-[16px] sm:text-[17px] font-medium text-[#0a0a0a] mt-1 leading-snug">
                "{lang === 'vi' ? info.coreQuestionVi : info.coreQuestionEn}"
              </p>
            </div>

            <div>
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 mb-1">
                {lang === 'vi' ? 'Trọng tâm đánh giá' : 'Assessment Focus'}
              </span>
              <p className="text-[14px] text-[#0a0a0a]/75 font-light leading-relaxed">
                {lang === 'vi' ? info.focusVi : info.focusEn}
              </p>
            </div>
          </div>

          <div>
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60 mb-3">
              {lang === 'vi' ? 'Theo CHUNKS Theory MN107.v2.1' : 'Based on CHUNKS Theory MN107.v2.1'}
            </span>
            <ul className="space-y-2 list-disc pl-5 text-[13px] text-[#0a0a0a]/75">
              {(lang === 'vi' ? info.theoryHighlightsVi : info.theoryHighlightsEn).map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <a
              href="https://chunkstheory.com/chunks-theory-2026-7-pages/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-[13px] font-medium text-[#c81e16] underline"
            >
              {lang === 'vi' ? 'Đọc bản lý thuyết chính thức' : 'Read the official theory'}
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 sm:px-8 py-4 hairline-t bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-[13px] font-medium text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Đóng' : 'Close'}
          </button>

          {onSelectAndClose && (
            <button
              onClick={() => onSelectAndClose(info.type)}
              className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13px] font-semibold rounded-full px-5 py-2.5 transition-colors cursor-pointer"
            >
              {lang === 'vi'
                ? `Chọn ${isGreen ? 'Green Test' : 'Red Test'} & Điền Form`
                : `Select ${isGreen ? 'Green Test' : 'Red Test'} & Continue`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
