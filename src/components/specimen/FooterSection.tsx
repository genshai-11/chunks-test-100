import React from 'react';

interface FooterSectionProps {
  onOpenCanvas: () => void;
  onBrowseLibrary: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
  onScrollToTop: () => void;
  onScrollToFaq: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onOpenCanvas,
  onBrowseLibrary,
  onOpenContact,
  onOpenAbout,
  onScrollToTop,
  onScrollToFaq,
}) => {
  return (
    <footer id="footer" className="w-full bg-[#ffffff] hairline-t" aria-label="Site Footer">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        {/* Main Footer Grid (py-14) */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col-span-5: Brand & Tagline Block */}
          <div className="col-span-12 md:col-span-5">
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-2 cursor-pointer group text-left focus-visible:outline-none"
              aria-label="Back to top"
            >
              <div
                className="w-[14px] h-[14px] rounded-[2px] bg-[#ff3b30] shrink-0 group-hover:bg-[#c81e16] transition-colors"
                aria-hidden="true"
              />
              <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                Specimen
              </span>
            </button>

            <p className="max-w-[34ch] text-[13.5px] text-[#0a0a0a]/65 leading-relaxed mt-4 font-normal tracking-[-0.011em]">
              An AI product design agent. Prompt in, shippable UI out, on an infinite canvas.
            </p>
          </div>

          {/* Col-span-3: Product Links */}
          <div className="col-span-6 md:col-span-3 md:col-start-7">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
              Product
            </span>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] font-medium text-[#0a0a0a]/60 tracking-[-0.01em]">
              <li>
                <button
                  onClick={onOpenCanvas}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  Canvas
                </button>
              </li>
              <li>
                <button
                  onClick={onBrowseLibrary}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  Library
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCanvas}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Col-span-3: Company Links */}
          <div className="col-span-6 md:col-span-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
              Company
            </span>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] font-medium text-[#0a0a0a]/60 tracking-[-0.01em]">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={onScrollToFaq}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Baseline Copyright Row (py-6) */}
        <div className="hairline-t py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-[#0a0a0a]/60">
          <div className="tabular-nums font-normal">
            &copy; 2026 Specimen, all rights reserved.
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
            International / Typographic
          </div>
        </div>
      </div>
    </footer>
  );
};
