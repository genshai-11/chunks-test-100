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
          <h2 id="mse-heading" className="max-w-[23ch] text-[clamp(32px,4vw,56px)] leading-[1.08] tracking-[-0.04em] font-semibold">
            <span className="text-[var(--chunks-accent)]">{lang === 'vi' ? 'Ba nền tảng phản xạ ngôn ngữ (MSE):' : 'Three dimensions of spoken response (MSE):'}</span><br />
            {lang === 'vi' ? 'Chuyển động · Âm thanh · Cảm xúc.' : 'Motion · Sound · Emotion.'}
          </h2>
          <p className="mt-6 max-w-[56ch] text-[var(--chunks-muted)] leading-relaxed">
            {lang === 'vi'
              ? 'CiC quan sát cách ba yếu tố phối hợp khi bạn trò chuyện. Buổi Mini-Test ghi nhận phản xạ ở thời điểm hiện tại; không cần chuẩn bị câu trả lời mẫu.'
              : 'A CiC observes how these three dimensions work together as you speak. The Mini-Test records your responses in the moment; no memorized script is needed.'}
          </p>
          <div className="mt-12 border-t border-[var(--chunks-ink)]">
            {labels.map((label, index) => (
              <div key={label} className="grid grid-cols-[64px_1fr_40px] gap-3 items-center border-b border-[var(--chunks-rule)] py-4">
                <span className="chunks-meta text-[var(--chunks-accent)]">0{index + 1}</span>
                <strong className="text-[clamp(20px,2.7vw,32px)] tracking-[-0.03em] font-medium">{label}</strong>
                <ArrowUpRight size={18} className="justify-self-end text-[var(--chunks-muted)]" aria-hidden="true" />
              </div>
            ))}
          </div>
          <button type="button" onClick={onRegister} className="chunks-pill mt-10">
            {lang === 'vi' ? 'Gửi yêu cầu tham gia' : 'Request a Mini-Test'} <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};
