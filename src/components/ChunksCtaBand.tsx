import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface Props {
  onRegister: () => void;
  lang: 'vi' | 'en';
}

export const ChunksCtaBand: React.FC<Props> = ({ onRegister, lang }) => {
  const reduceMotion = useReducedMotion();
  const labels = lang === 'vi' ? ['Chuyển động', 'Âm thanh', 'Cảm xúc'] : ['Motion', 'Sound', 'Emotion'];

  return (
    <section id="mse-method" className="scroll-mt-24 bg-[var(--chunks-surface)] border-y border-[var(--chunks-rule)]" aria-labelledby="mse-heading">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -18, y: 18 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="chunks-shell chunks-reveal-shell grid grid-cols-1 md:grid-cols-12 gap-6 py-[72px] md:py-[120px]"
      >
        <p className="chunks-eyebrow md:col-span-3 text-[var(--chunks-accent)]">CHUNKS TEST · BASED ON CHUNKS THEORY</p>
        <div className="md:col-span-9 min-w-0">
          <h2 id="mse-heading" className="max-w-3xl text-[clamp(20px,2.8vw,34px)] leading-tight tracking-[-0.03em] font-semibold">
            <span className="text-[var(--chunks-accent)] block">
              {lang === 'vi' ? 'Ba nền tảng phản xạ ngôn ngữ (MSE):' : 'Three dimensions of spoken response (MSE):'}
            </span>
            <span className="block mt-1.5 text-[#0a0a0a]">
              {lang === 'vi' ? 'Chuyển động · Âm thanh · Cảm xúc.' : 'Motion · Sound · Emotion.'}
            </span>
          </h2>
          <p className="mt-6 max-w-[56ch] text-[var(--chunks-muted)] leading-relaxed text-[15px]">
            {lang === 'vi'
              ? 'CiC quan sát cách ba yếu tố phối hợp khi bạn trò chuyện. Buổi Mini-Test ghi nhận phản xạ ở thời điểm hiện tại; không cần chuẩn bị câu trả lời mẫu.'
              : 'A CiC observes how these three dimensions coordinate as you speak. The Mini-Test records your live reflexes in the moment; no memorized script is needed.'}
          </p>
          <div className="mt-12 border-t border-[var(--chunks-ink)]">
            {labels.map((label, index) => (
              <motion.div
                key={label}
                whileHover={reduceMotion ? {} : { x: 4 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-[64px_1fr_40px] gap-3 items-center border-b border-[var(--chunks-rule)] py-4 cursor-default group"
              >
                <span className="chunks-meta text-[var(--chunks-accent)]">0{index + 1}</span>
                <strong className="text-[clamp(20px,2.7vw,32px)] tracking-[-0.03em] font-medium group-hover:text-[var(--chunks-accent)] transition-colors">
                  {label}
                </strong>
                <ArrowUpRight size={18} className="justify-self-end text-[var(--chunks-muted)] group-hover:text-[var(--chunks-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" aria-hidden="true" />
              </motion.div>
            ))}
          </div>
          <motion.button
            type="button"
            onClick={onRegister}
            whileHover={reduceMotion ? {} : { scale: 1.02 }}
            whileTap={reduceMotion ? {} : { scale: 0.98 }}
            className="chunks-pill mt-10"
          >
            {lang === 'vi' ? 'Gửi yêu cầu tham gia' : 'Request a Mini-Test'} <ArrowUpRight size={17} aria-hidden="true" />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};
