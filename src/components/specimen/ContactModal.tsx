import React, { useState } from 'react';
import { Check, Send, X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !note.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-[520px] bg-white border border-[rgba(10,10,10,0.14)] p-6 sm:p-8 relative">
        <div className="flex items-start justify-between border-b border-[rgba(10,10,10,0.14)] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30]" aria-hidden="true" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]">
              Direct Desk · No Tickets Required
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

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0a0a0a]">
              Message received.
            </h3>
            <p className="text-[14px] text-[#0a0a0a]/70 max-w-[34ch] mx-auto leading-relaxed">
              Real humans read every message, usually same day, with no canned bot replies. Ping us anytime and we will sort it together.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <p className="text-[14.5px] text-[#0a0a0a]/70 leading-relaxed font-light">
              Have a question about token invariants, custom fonts, or private team workspaces? Ping us and we will sort it together.
            </p>

            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60 mb-1.5">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border border-[rgba(10,10,10,0.18)] px-3 py-2.5 text-[14px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/60 mb-1.5">
                Question or Prompt Feedback
              </label>
              <textarea
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Tell us what you are building or what you need..."
                className="w-full border border-[rgba(10,10,10,0.18)] p-3 text-[14px] text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11.5px] text-[#0a0a0a]/50">
                Average reply time: under 3 hours
              </span>
              <button
                type="submit"
                className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[13.5px] font-semibold rounded-full px-5 py-2.5 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Send message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
