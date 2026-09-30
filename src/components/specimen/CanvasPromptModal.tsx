import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Sparkles, X } from 'lucide-react';

interface CanvasPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PROMPTS = [
  'International Typographic landing page with tabular numbers and hairline rules',
  'Minimalist 12-column executive dashboard with negative tracking and ink accents',
  'Editorial exhibition catalog reader with asymmetric notes and zero drop-shadows',
];

export const CanvasPromptModal: React.FC<CanvasPromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(
    'A numbered, Swiss / International-Typographic FAQ page rendered as a type specimen.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsGenerating(true);
    setIsDone(false);
    setTimeout(() => {
      setIsGenerating(false);
      setIsDone(true);
    }, 900);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `<div className="grid grid-cols-12 gap-x-6 border-t-[1.5px] border-[#0a0a0a]">\n  <span className="col-span-3 font-semibold tabular-nums text-[#c81e16]">01</span>\n  <h2 className="col-span-8 text-[24px] font-medium tracking-tight">Frequently asked, answered.</h2>\n</div>`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-[640px] bg-white border border-[rgba(10,10,10,0.14)] p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]">
              Infinite Canvas · Prompt to UI
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

        {/* Body */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60 mb-2">
              Natural Language Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full border border-[rgba(10,10,10,0.18)] p-3.5 text-[14px] leading-relaxed text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] resize-none"
              placeholder="Describe your screen, layout, or component..."
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/50 mb-2">
              Specimen Presets
            </span>
            <div className="flex flex-col gap-1.5">
              {PRESET_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="text-left text-[12px] text-[#0a0a0a]/75 hover:text-[#0a0a0a] hover:bg-slate-50 p-2 border border-slate-100 transition-colors truncate"
                >
                  &rarr; {p}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] text-[#0a0a0a]/60 font-mono tabular-nums">
              Engine: Inter 600 Display / Strict Grid
            </span>
            <button
              onClick={handleRun}
              disabled={isGenerating}
              className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13.5px] font-semibold rounded-full px-5 py-2.5 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Drafting UI...</span>
                </>
              ) : (
                <>
                  <span>Generate Screen</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Generated Result Output */}
          {isDone && (
            <div className="mt-4 border border-[rgba(10,10,10,0.14)] bg-slate-50 p-4">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/60 pb-2 border-b border-slate-200">
                <span>Exportable React JSX · 1440px Desktop Frame</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[#c81e16] hover:text-[#ff3b30] font-semibold cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="mt-3 text-[11.5px] font-mono text-slate-800 leading-relaxed overflow-x-auto p-2 bg-white border border-slate-200">
{`// Production Specimen Fragment
<section className="max-w-[1180px] mx-auto px-10">
  <div className="grid grid-cols-12 gap-x-6 border-t-[1.5px] border-[#0a0a0a] py-8">
    <div className="col-span-3 text-[17px] font-semibold text-[#c81e16] tabular-nums">01</div>
    <div className="col-span-8 text-[26px] font-medium tracking-tight">Frequently asked, answered.</div>
  </div>
</section>`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
