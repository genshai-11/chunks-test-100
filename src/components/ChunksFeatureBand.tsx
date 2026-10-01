import React from 'react';
import { motion, useReducedMotion, Variants } from 'motion/react';
import { Sparkles, Compass, Timer, UserCheck } from 'lucide-react';

interface FeatureItem {
  id: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const FEATURES: FeatureItem[] = [
  {
    id: '01',
    label: 'CHUNKS TEST',
    sub: 'Tiêu chuẩn khảo sát',
    icon: Sparkles,
  },
  {
    id: '02',
    label: 'CHUNKS THEORY',
    sub: 'Định vị MN107.v2.1',
    icon: Compass,
  },
  {
    id: '03',
    label: '21 CÂU NGẮN',
    sub: '15 – 20 phút tập trung',
    icon: Timer,
  },
  {
    id: '04',
    label: '1-ON-1 CÙNG CIC',
    sub: 'Đánh giá trực tiếp',
    icon: UserCheck,
  },
];

export const ChunksFeatureBand: React.FC = () => {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="bg-[var(--chunks-primary)] text-white border-y border-white/10" aria-label="Mini-Test format">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="chunks-shell chunks-reveal-shell grid grid-cols-2 md:grid-cols-4"
      >
        {FEATURES.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={reduceMotion ? {} : { y: -2, backgroundColor: 'rgba(255,255,255,0.04)' }}
              transition={{ duration: 0.2 }}
              className={`group relative flex items-center gap-3.5 py-4 px-3 sm:px-5 border-white/15 transition-colors cursor-default ${
                index < 3 ? 'border-r' : ''
              } ${index < 2 ? 'max-md:border-b' : ''} first:pl-2`}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-[var(--chunks-accent-soft)] group-hover:bg-[var(--chunks-accent)] group-hover:text-white group-hover:scale-105 transition-all">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-[12px] sm:text-[13px] font-bold tracking-wider uppercase text-white truncate group-hover:text-[var(--chunks-accent-soft)] transition-colors">
                  {item.label}
                </span>
                <span className="text-[10.5px] font-mono text-white/60 truncate">
                  {item.sub}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};
