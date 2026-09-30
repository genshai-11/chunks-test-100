import React from 'react';

interface StickyNavProps {
  onOpenPromptModal: () => void;
  onOpenContactModal: () => void;
}

export const StickyNav: React.FC<StickyNavProps> = ({
  onOpenPromptModal,
  onOpenContactModal,
}) => {
  const scrollTo = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md hairline-b">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">
        {/* Left: Brand Lockup */}
        <button
          onClick={() => scrollTo('top')}
          className="flex items-center gap-2.5 cursor-pointer group text-left focus-visible:outline-none"
          aria-label="Specimen Home"
        >
          <div
            className="w-[15px] h-[15px] rounded-[2px] bg-[#ff3b30] mt-[1px] shrink-0 group-hover:bg-[#c81e16] transition-colors"
            aria-hidden="true"
          />
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Specimen
          </span>
        </button>

        {/* Center: Nav links (Hidden below md) */}
        <nav
          className="hidden md:flex items-center text-[13px] font-medium text-[#0a0a0a]/60 tracking-[-0.01em]"
          aria-label="Primary Navigation"
        >
          <button
            onClick={() => scrollTo('top')}
            className="hover:text-[#0a0a0a] transition-colors cursor-pointer py-1"
          >
            Index
          </button>
          <span className="text-[rgba(10,10,10,0.25)] mx-2.5" aria-hidden="true">
            /
          </span>
          <button
            onClick={() => scrollTo('faq')}
            className="hover:text-[#0a0a0a] transition-colors cursor-pointer py-1"
          >
            Questions
          </button>
          <span className="text-[rgba(10,10,10,0.25)] mx-2.5" aria-hidden="true">
            /
          </span>
          <button
            onClick={onOpenContactModal}
            className="hover:text-[#0a0a0a] transition-colors cursor-pointer py-1"
          >
            Contact
          </button>
        </nav>

        {/* Right: 'Start free' Pill Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPromptModal}
            className="text-[13px] font-medium text-[#0a0a0a] border border-[rgba(10,10,10,0.14)] rounded-full px-4 py-[7px] hover:bg-[#0a0a0a] hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c81e16]"
          >
            Start free
          </button>
        </div>
      </div>
    </header>
  );
};
