import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copySnippet = (key: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-[720px] bg-white border border-[rgba(10,10,10,0.14)] p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]">
              Component Library · Swiss Specimen Design System
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

        <div className="mt-6 space-y-6">
          {/* Specimen Token 1: Palette */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60 mb-2.5">
              01. Strict Color Allocations
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="border border-[rgba(10,10,10,0.14)] p-3 bg-white">
                <div className="w-full h-8 bg-white border border-slate-200 mb-2" />
                <span className="font-mono text-[11px] block">#ffffff</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Paper Base</span>
              </div>
              <div className="border border-[rgba(10,10,10,0.14)] p-3 bg-[#0a0a0a] text-white">
                <div className="w-full h-8 bg-[#0a0a0a] border border-white/20 mb-2" />
                <span className="font-mono text-[11px] block">#0a0a0a</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Near-Black Ink</span>
              </div>
              <div className="border border-[rgba(10,10,10,0.14)] p-3">
                <div className="w-full h-8 bg-[#ff3b30] mb-2" />
                <span className="font-mono text-[11px] block">#ff3b30</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Signal Red</span>
              </div>
              <div className="border border-[rgba(10,10,10,0.14)] p-3">
                <div className="w-full h-8 bg-[#c81e16] mb-2" />
                <span className="font-mono text-[11px] block">#c81e16</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Darker Accent</span>
              </div>
            </div>
          </div>

          {/* Specimen Token 2: Hairline Rules */}
          <div className="pt-2 border-t border-[rgba(10,10,10,0.14)]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60">
                02. Hairline Grid System
              </h4>
              <button
                onClick={() =>
                  copySnippet(
                    'hairline',
                    'border: 1px solid rgba(10, 10, 10, 0.14);'
                  )
                }
                className="text-[11px] text-[#c81e16] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'hairline' ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy CSS</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[13px] text-[#0a0a0a]/70 font-light leading-relaxed">
              Carries all structure across sections and cells without cards, drop shadows, or background fills.
            </p>
          </div>

          {/* Specimen Token 3: Typography System */}
          <div className="pt-2 border-t border-[rgba(10,10,10,0.14)]">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60 mb-2">
              03. Inter Display & Tabular Numerals
            </h4>
            <div className="space-y-2 bg-slate-50 p-4 border border-[rgba(10,10,10,0.14)]">
              <div className="text-[24px] font-semibold leading-tight tracking-[-0.03em]">
                Display Heading: -0.03em tracking
              </div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
                Micro Eyebrow: 10.5px, 600, 0.22em tracking
              </div>
              <div className="text-[15px] font-mono tabular-nums text-[#c81e16]">
                01 02 03 04 05 06 07 (font-variant-numeric: tabular-nums)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
