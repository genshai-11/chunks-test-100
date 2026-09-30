import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface CtaBandProps {
  onOpenCanvas: () => void;
  onBrowseLibrary: () => void;
}

export const CtaBand: React.FC<CtaBandProps> = ({
  onOpenCanvas,
  onBrowseLibrary,
}) => {
  return (
    <section className="w-full bg-[#0a0a0a] text-white mt-20 md:mt-28" aria-label="Action Callout">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-16 md:py-20">
        {/* Left Column (col-span-12 md:col-span-7): Eyebrow & Display Heading */}
        <div className="col-span-12 md:col-span-7">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#ff3b30] block">
            Still curious
          </span>
          <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.98] tracking-[-0.03em] font-semibold text-white mt-3 text-balance">
            The fastest answer is your first prompt<span className="text-[#ff3b30]">.</span>
          </h2>
        </div>

        {/* Right Column (col-span-12 md:col-span-5 md:justify-end flex): Two Action Pills */}
        <div className="col-span-12 md:col-span-5 flex md:justify-end">
          <div className="w-full max-w-[280px] flex flex-col gap-3">
            {/* Primary Pill: Open the canvas */}
            <button
              onClick={onOpenCanvas}
              className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[15px] font-bold rounded-full px-6 py-3.5 flex items-center justify-between transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Open the canvas</span>
              <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Secondary Pill: Browse the library */}
            <button
              onClick={onBrowseLibrary}
              className="border border-white/25 hover:bg-white hover:text-[#0a0a0a] text-white text-[15px] font-medium rounded-full px-6 py-3.5 flex items-center justify-between transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Browse the library</span>
              <ArrowRight className="w-4 h-4 text-current group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
