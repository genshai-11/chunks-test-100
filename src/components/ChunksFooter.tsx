import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

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
    window.setTimeout(() => document.getElementById('booking-form')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 100);
  };

  return (
    <footer id="footer" className="chunks-footer" aria-label={lang === 'vi' ? 'Chân trang CHUNKS' : 'CHUNKS footer'}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -18, y: 18 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="chunks-shell chunks-reveal-shell pt-16"
      >
        <div className="chunks-footer-grid pb-16 md:pb-[68px]">
          <p className="chunks-eyebrow md:col-span-3 text-[var(--chunks-accent-soft)]">CHUNKS / NEXT STEP</p>
          <div className="col-span-2 md:col-span-9">
            <h2 className="max-w-[19ch] text-[clamp(34px,4.8vw,64px)] font-semibold tracking-[-0.04em] leading-[1.1]">
              {lang === 'vi' ? <>Đừng đoán phản xạ.<br /><span className="text-[var(--chunks-accent-soft)]">Hãy quan sát nó.</span></> : <>Don't guess your response.<br /><span className="text-[var(--chunks-accent-soft)]">Observe it.</span></>}
            </h2>
            <button type="button" onClick={scrollToForm} className="mt-8 inline-flex items-center gap-5 rounded-full bg-white text-black hover:bg-[var(--chunks-accent-hover)] hover:text-white px-5 py-3 text-[13px] font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {lang === 'vi' ? 'Tìm hiểu cách đăng ký' : 'How to register'} <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="chunks-footer-grid border-t chunks-footer-rule py-10 md:pb-14 text-[13px]">
          <div className="col-span-2 md:col-span-5">
            <button type="button" onClick={onScrollToTop} className="flex items-center gap-3 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-white" aria-label={lang === 'vi' ? 'CHUNKS: về đầu trang' : 'CHUNKS: back to top'}>
              <img src="/logo.png" alt="CHUNKS" className="chunks-footer-logo" />
              <span className="font-semibold tracking-tight text-[18px] whitespace-nowrap">CHUNKS TEST 100</span>
            </button>
            <p className="mt-4 max-w-[38ch] text-white/65 leading-relaxed">
              {lang === 'vi'
                ? 'CHUNKS Test 100 — Buổi khảo sát phản xạ nói tiếng Anh 1-on-1 trực tiếp cùng Chunker-in-Charge dựa trên CHUNKS Theory.'
                : 'CHUNKS Test 100 — In-person 1-on-1 spoken English reflex assessment with a Chunker-in-Charge based on CHUNKS Theory.'}
            </p>
          </div>
          <div className="col-span-1 md:col-span-4">
            <h3 className="chunks-eyebrow text-white/55">{lang === 'vi' ? 'BÀI ĐÁNH GIÁ' : 'ASSESSMENT'}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <button type="button" onClick={scrollToForm} className="chunks-footer-link cursor-pointer text-left">
                  {lang === 'vi' ? 'Mini-Test 21 câu ngắn' : '21-Question Mini-Test'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('booking');
                    window.setTimeout(() => (document.getElementById('mse-method') || document.getElementById('mse'))?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 100);
                  }}
                  className="chunks-footer-link cursor-pointer text-left"
                >
                  {lang === 'vi' ? 'Phương pháp MSE (Motion · Sound · Emotion)' : 'MSE Method (Motion · Sound · Emotion)'}
                </button>
              </li>
              <li>
                <button type="button" onClick={onScrollToFaq} className="chunks-footer-link cursor-pointer text-left">
                  {lang === 'vi' ? 'Câu hỏi thường gặp (FAQ)' : 'Frequently Asked Questions (FAQ)'}
                </button>
              </li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-3">
            <h3 className="chunks-eyebrow text-white/55">{lang === 'vi' ? 'DÀNH CHO CHUNKEE' : 'CHUNKEES'}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li><button type="button" onClick={onOpenChunkerHub} className="chunks-footer-link cursor-pointer">{lang === 'vi' ? 'Lấy link & QR giới thiệu' : 'Get Referral Link & QR'}</button></li>
              <li><a href="https://the-chunks.com/" target="_blank" rel="noopener noreferrer" className="chunks-footer-link">the-chunks.com ↗</a></li>
              <li><a href="https://chunkstheory.com/chunks-theory-2026-7-pages/" target="_blank" rel="noopener noreferrer" className="chunks-footer-link">chunkstheory.com ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t chunks-footer-rule py-6 flex flex-col sm:flex-row justify-between gap-4 text-white/55 chunks-meta text-[10px]">
          <span>CHUNKS TEST · Based on CHUNKS Theory</span>
          <button type="button" onClick={onScrollToTop} className="text-left sm:text-right hover:text-white cursor-pointer">{lang === 'vi' ? 'VỀ ĐẦU TRANG' : 'BACK TO TOP'} ↑</button>
        </div>
      </motion.div>
    </footer>
  );
};
