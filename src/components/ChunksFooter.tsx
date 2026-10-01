import React from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, useReducedMotion, Variants } from 'motion/react';

interface Props {
  onSelectView: (view: 'booking' | 'chunker' | 'admin') => void;
  onOpenChunkerHub: () => void;
  lang: 'vi' | 'en';
  onScrollToTop: () => void;
  onScrollToFaq: () => void;
}

export const ChunksFooter: React.FC<Props> = ({
  onSelectView,
  onOpenChunkerHub,
  lang,
  onScrollToTop,
  onScrollToFaq,
}) => {
  const reduceMotion = useReducedMotion();
  const scrollToForm = () => {
    onSelectView('booking');
    window.setTimeout(
      () =>
        document
          .getElementById('booking-form')
          ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }),
      100
    );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: 'easeOut' },
    },
  };

  return (
    <footer
      id="footer"
      className="chunks-footer"
      aria-label={lang === 'vi' ? 'Chân trang CHUNKS' : 'CHUNKS footer'}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="chunks-shell chunks-reveal-shell pt-8 md:pt-12"
      >
        {/* 3-Column Navigation Grid */}
        <motion.div
          variants={itemVariants}
          className="chunks-footer-grid py-10 md:pb-14 text-[13px]"
        >
          {/* Brand Block */}
          <div className="col-span-2 md:col-span-5">
            <button
              type="button"
              onClick={onScrollToTop}
              className="flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-white"
              aria-label={lang === 'vi' ? 'CHUNKS: về đầu trang' : 'CHUNKS: back to top'}
            >
              <img
                src="/logo.png"
                alt="CHUNKS"
                className="chunks-footer-logo transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-semibold tracking-tight text-[18px] whitespace-nowrap text-white group-hover:text-[var(--chunks-accent-soft)] transition-colors">
                CHUNKS TEST 100
              </span>
            </button>
            <p className="mt-4 max-w-[38ch] text-white/65 leading-relaxed text-[13.5px]">
              {lang === 'vi'
                ? 'CHUNKS Test 100 — Buổi khảo sát phản xạ nói tiếng Anh 1-on-1 trực tiếp cùng Chunker-in-Charge dựa trên CHUNKS Theory.'
                : 'CHUNKS Test 100 — In-person 1-on-1 spoken English reflex assessment with a Chunker-in-Charge based on CHUNKS Theory.'}
            </p>
          </div>

          {/* Column 2: Assessment */}
          <div className="col-span-1 md:col-span-4">
            <h3 className="chunks-eyebrow text-white/55">
              {lang === 'vi' ? 'BÀI ĐÁNH GIÁ' : 'ASSESSMENT'}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="chunks-footer-link cursor-pointer text-left group flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--chunks-accent-soft)]">
                    →
                  </span>
                  <span>{lang === 'vi' ? 'Mini-Test 21 câu ngắn' : '21-Question Mini-Test'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('booking');
                    window.setTimeout(
                      () =>
                        (
                          document.getElementById('mse-method') ||
                          document.getElementById('mse')
                        )?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }),
                      100
                    );
                  }}
                  className="chunks-footer-link cursor-pointer text-left group flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--chunks-accent-soft)]">
                    →
                  </span>
                  <span>
                    {lang === 'vi'
                      ? 'Phương pháp MSE (Motion · Sound · Emotion)'
                      : 'MSE Method (Motion · Sound · Emotion)'}
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onScrollToFaq}
                  className="chunks-footer-link cursor-pointer text-left group flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--chunks-accent-soft)]">
                    →
                  </span>
                  <span>
                    {lang === 'vi'
                      ? 'Câu hỏi thường gặp (FAQ)'
                      : 'Frequently Asked Questions (FAQ)'}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Chunkees & Ecosystem */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="chunks-eyebrow text-white/55">
              {lang === 'vi' ? 'DÀNH CHO CHUNKEE' : 'CHUNKEES'}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <button
                  type="button"
                  onClick={onOpenChunkerHub}
                  className="chunks-footer-link cursor-pointer text-left group flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--chunks-accent-soft)]">
                    →
                  </span>
                  <span>
                    {lang === 'vi' ? 'Lấy link & QR giới thiệu' : 'Get Referral Link & QR'}
                  </span>
                </button>
              </li>
              <li>
                <a
                  href="https://the-chunks.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chunks-footer-link group flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--chunks-accent-soft)]">
                    →
                  </span>
                  <span>the-chunks.com ↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://chunkstheory.com/chunks-theory-2026-7-pages/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chunks-footer-link group flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--chunks-accent-soft)]">
                    →
                  </span>
                  <span>chunkstheory.com ↗</span>
                </a>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar: Copyright & Back-to-Top */}
        <motion.div
          variants={itemVariants}
          className="border-t chunks-footer-rule py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/55 chunks-meta text-[11px]"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-white/80">
              CHUNKS TEST · Based on CHUNKS Theory
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>© 2026 CHUNKS. All rights reserved.</span>
          </div>

          <motion.button
            type="button"
            onClick={onScrollToTop}
            whileHover={reduceMotion ? {} : { y: -2 }}
            whileTap={reduceMotion ? {} : { scale: 0.96 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white/80 hover:text-white transition-all text-[11px] font-mono group cursor-pointer"
            aria-label={lang === 'vi' ? 'Về đầu trang' : 'Back to top'}
          >
            <span>{lang === 'vi' ? 'VỀ ĐẦU TRANG' : 'BACK TO TOP'}</span>
            <ArrowUp className="w-3 h-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </motion.button>
        </motion.div>
      </motion.div>
    </footer>
  );
};
