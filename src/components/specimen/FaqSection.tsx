import React, { useState } from 'react';
import { SwissGlyph } from './SwissGlyph';

interface FaqItemData {
  number: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItemData[] = [
  {
    number: '01',
    question: 'What exactly does Superdesign do?',
    answer:
      'Superdesign is an AI product design agent that generates production-ready UI from natural language prompts. Describe the screen or workflow you envision, and the agent lays down high-fidelity layouts, typography, and clean code directly onto an infinite canvas. Everything is engineered to be copied into real repositories and shipped without redesigning.',
  },
  {
    number: '02',
    question: 'Do I get real code or just static Figma frames?',
    answer:
      'You get production-grade React components written in TypeScript with clean Tailwind CSS styling, alongside responsive SVG and canvas assets. The exported code adheres to zero-pill discipline and strict typographic hierarchy, meaning you can drop it directly into your Next.js or Vite projects without cleanup.',
  },
  {
    number: '03',
    question: 'How does the infinite canvas handle responsive states?',
    answer:
      'Every screen generation automatically produces side-by-side viewports for mobile (390px), tablet (768px), and wide desktop (1440px). When you edit copy, adjust spacing, or refine layout rules, all three responsive viewports update in tandem across the canvas.',
  },
  {
    number: '04',
    question: 'Can I import our existing design tokens and brand fonts?',
    answer:
      'Yes. You can connect custom Google Fonts, upload brand tokens, or supply Tailwind theme configurations directly in the project settings drawer. Superdesign locks your brand invariants so generated layouts always preserve your exact palette, radius scale, and font families.',
  },
  {
    number: '05',
    question: 'What happens if a prompt produces unexpected output?',
    answer:
      'You can select any individual element or section and give surgical refinement instructions. The agent adjusts only the targeted node while preserving surrounding layout geometry. No tickets required. Real humans also review feedback daily if you ever get stuck.',
  },
  {
    number: '06',
    question: 'Is there a limit on how many screens I can generate?',
    answer:
      'The free tier includes 50 generation credits per month with full code export and canvas access. Pro and Team tiers unlock unlimited canvas workspace, team multiplayer collaboration, and private token presets with priority processing.',
  },
  {
    number: '07',
    question: 'How do I get help if something does not work?',
    answer:
      'Reach out through the in-app messenger or email our engineering desk directly. Real humans read every message, usually same day, with no canned bot replies. Ping us and we will sort it together.',
  },
];

export const FaqSection: React.FC = () => {
  // Row 01 ships pre-opened (index 0)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleRow = (index: number) => {
    // Single-open accordion logic
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="scroll-mt-24 w-full">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        {/* 12-Column Split Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 pt-16 md:pt-24 pb-7 md:pb-10 items-baseline">
          {/* Left Column (col-span-3): Micro Eyebrow */}
          <div className="col-span-12 md:col-span-3 mb-2 md:mb-0">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
              The questions
            </span>
          </div>

          {/* Right Column (col-span-9): Section Heading */}
          <div className="col-span-12 md:col-span-9">
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] tracking-[-0.02em] leading-tight font-semibold text-[#0a0a0a]">
              Seven things people ask before their first design.
            </h2>
          </div>
        </div>

        {/* Numbered FAQ List under single heavy 1.5px ink top rule */}
        <div className="border-t-[1.5px] border-[#0a0a0a]" role="region" aria-label="Frequently Asked Questions">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const itemId = `faq-item-${item.number}`;
            const buttonId = `faq-btn-${item.number}`;

            return (
              <div
                key={item.number}
                className={`faq-item border-b border-[rgba(10,10,10,0.14)] transition-colors duration-200 ${
                  isOpen ? 'open' : ''
                }`}
              >
                {/* 12-Column Question Button */}
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={itemId}
                  onClick={() => toggleRow(idx)}
                  className="w-full text-left grid grid-cols-12 gap-x-4 md:gap-x-6 items-baseline py-7 md:py-8 cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c81e16]"
                >
                  {/* Tabular Number Column (col-span-2 md:col-span-3) */}
                  <div className="col-span-2 md:col-span-3">
                    <span
                      className={`tabular-nums font-semibold text-[15px] md:text-[17px] transition-colors duration-200 ${
                        isOpen
                          ? 'text-[#c81e16]'
                          : 'text-[#0a0a0a]/60 group-hover:text-[#c81e16]'
                      }`}
                    >
                      {item.number}
                    </span>
                  </div>

                  {/* Question Text Column (col-span-9 md:col-span-8) */}
                  <div className="col-span-9 md:col-span-8 pr-2">
                    <span
                      className={`block font-medium text-[20px] md:text-[26px] tracking-[-0.02em] leading-snug transition-colors duration-200 ${
                        isOpen
                          ? 'text-[#0a0a0a]'
                          : 'text-[#0a0a0a]/80 group-hover:text-[#c81e16]'
                      }`}
                    >
                      {item.question}
                    </span>
                  </div>

                  {/* Swiss Plus/Minus Glyph (col-span-1) */}
                  <div className="col-span-1 flex justify-end items-center self-center">
                    <SwissGlyph isOpen={isOpen} />
                  </div>
                </button>

                {/* Accordion Answer Body with 360ms cubic-bezier transition */}
                <div
                  id={itemId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={isOpen ? 'faq-grid-expand' : 'faq-grid-collapse'}
                >
                  <div className="faq-content-inner">
                    <div
                      className={`grid grid-cols-1 md:grid-cols-12 gap-x-6 ${
                        isOpen ? 'faq-opacity-fade-in' : 'faq-opacity-fade-out'
                      }`}
                    >
                      {/* Indented under question: md:col-start-4 md:col-span-8 */}
                      <div className="md:col-start-4 md:col-span-8 max-w-[58ch] pb-8 pt-1">
                        <p className="text-[15.5px] md:text-[16px] font-light leading-relaxed text-[#0a0a0a]/65 tracking-[-0.011em]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
