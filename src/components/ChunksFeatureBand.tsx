import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const ChunksFeatureBand: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-[var(--chunks-primary)] text-white" aria-label="Mini-Test format">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="chunks-shell chunks-reveal-shell grid grid-cols-2 md:grid-cols-4"
      >
        {['CHUNKS TEST', 'BASED ON CHUNKS THEORY', '03 / 21 CÂU NGẮN', '04 / 1-ON-1 CÙNG CIC'].map((label, index) => (
          <span key={label} className={`chunks-meta uppercase py-[18px] px-3 sm:px-4 border-white/20 ${index < 3 ? 'border-r' : ''} ${index < 2 ? 'max-md:border-b' : ''} first:pl-0 truncate`}>
            {label}
          </span>
        ))}
      </motion.div>
    </section>
  );
};
