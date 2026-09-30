import React from 'react';

interface HeroSectionProps {
  onJumpToFaq: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onJumpToFaq }) => {
  return (
    <section className="w-full hairline-b">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-x-6 pt-20 md:pt-28 pb-16 md:pb-20">
        {/* Left Column (col-span-3): Micro Eyebrow */}
        <div className="col-span-12 md:col-span-3 mb-6 md:mb-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] leading-tight">
            <span className="block text-[#0a0a0a]/60">Support</span>
            <span className="block text-[#c81e16] mt-0.5">/ Reference</span>
          </div>
        </div>

        {/* Right Column (col-span-9): Headline, Lead & Tabular Meta */}
        <div className="col-span-12 md:col-span-9">
          <h1 className="text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.94] tracking-[-0.03em] font-semibold text-[#0a0a0a] text-balance">
            Frequently
            <br />
            asked<span className="text-[#ff3b30]">,</span> answered<span className="text-[#ff3b30]">.</span>
          </h1>

          <p className="max-w-[44ch] text-[16px] md:text-[17px] text-[#0a0a0a]/65 leading-relaxed mt-6 font-normal tracking-[-0.011em]">
            Everything about generating production-ready UI from a single prompt. Read top to bottom,
            or jump to a number. No tickets required.
          </p>

          {/* Tabular-nums Meta Row */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-[rgba(10,10,10,0.14)] text-[12.5px] font-medium text-[#0a0a0a]/60 tabular-nums">
            <button
              onClick={onJumpToFaq}
              className="hover:text-[#0a0a0a] transition-colors cursor-pointer text-left"
            >
              <span className="font-bold text-[#0a0a0a]">07</span> Questions
            </button>

            <span className="w-px h-3.5 bg-[rgba(10,10,10,0.15)] shrink-0" aria-hidden="true" />

            <div>
              <span className="font-bold text-[#0a0a0a]">2 min</span> Read
            </div>

            <span className="w-px h-3.5 bg-[rgba(10,10,10,0.15)] shrink-0" aria-hidden="true" />

            <div>
              Updated <span className="font-bold text-[#0a0a0a]">Jun 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
