import React from 'react';
import { ArrowUpRight, Activity, Volume2, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion, Variants } from 'motion/react';

interface Props {
  onRegister: () => void;
  lang: 'vi' | 'en';
}

export const ChunksCtaBand: React.FC<Props> = ({ onRegister, lang }) => {
  const reduceMotion = useReducedMotion();

  const dimensions = [
    {
      id: '01',
      code: 'M',
      icon: Activity,
      title: lang === 'vi' ? 'Chuyển động (Motion)' : 'Motion',
      subtitle: lang === 'vi' ? 'Thân · Ngôn ngữ cơ thể' : 'Body & Kinematics',
      desc:
        lang === 'vi'
          ? 'Khẩu hình, nhịp thở và sự giải phóng cơ hàm khi phát âm dưới áp lực đối thoại.'
          : 'Mouth articulation, breath cadence, and physical composure while speaking.',
    },
    {
      id: '02',
      code: 'S',
      icon: Volume2,
      title: lang === 'vi' ? 'Âm thanh (Sound)' : 'Sound',
      subtitle: lang === 'vi' ? 'Khẩu · Trường âm thanh' : 'Voice & Acoustic Resonance',
      desc:
        lang === 'vi'
          ? 'Độ vang, tần số rung thanh quản và nhịp điệu tự nhiên của giọng nói.'
          : 'Vocal resonance, phonation depth, and authentic rhythm when projecting spoken ideas.',
    },
    {
      id: '03',
      code: 'E',
      icon: Sparkles,
      title: lang === 'vi' ? 'Cảm xúc (Emotion)' : 'Emotion',
      subtitle: lang === 'vi' ? 'Ý · Ý niệm & Tâm thế' : 'Intent & Presence',
      desc:
        lang === 'vi'
          ? 'Ý định diễn đạt, sự tự tin và giải tỏa nỗi sợ phán xét để kết nối luồng tư duy.'
          : 'Communicative intent, grounded confidence, and shedding judgment to sustain fluid expression.',
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="mse-method"
      className="scroll-mt-24 bg-white border-y border-[var(--chunks-rule)]"
      aria-labelledby="mse-heading"
    >
      <div className="chunks-shell chunks-reveal-shell py-12 md:py-16">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-8 border-b border-[rgba(10,10,10,0.08)]">
          <div className="md:col-span-3 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-red-50 border border-red-200/80 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#c81e16]">
              <ShieldCheck size={13} />
              <span>MN107.V2.1 · MSE</span>
            </div>
            <span className="text-[12px] font-mono text-[#0a0a0a]/50 block">
              CONSCIOUS PERFORMANCE
            </span>
          </div>

          <div className="md:col-span-9 space-y-3">
            <h2
              id="mse-heading"
              className="text-[clamp(22px,2.8vw,34px)] leading-tight tracking-[-0.03em] font-bold text-[#0a0a0a]"
            >
              <span>{lang === 'vi' ? 'Ba nền tảng phản xạ ngôn ngữ (MSE): ' : 'Three Dimensions of Spoken Response (MSE): '}</span>
              <span className="text-[#c81e16]">
                {lang === 'vi' ? 'Chuyển động · Âm thanh · Cảm xúc' : 'Motion · Sound · Emotion'}
              </span>
            </h2>
            <p className="max-w-2xl text-[14.5px] text-[#0a0a0a]/70 leading-relaxed font-light">
              {lang === 'vi'
                ? 'Trong buổi Mini-Test 1-on-1, chuyên viên CiC quan sát cách Thân (Chuyển động) – Khẩu (Âm thanh) – Ý (Cảm xúc) phối hợp nhịp nhàng khi đối thoại tự nhiên, không dùng kịch bản mẫu hay chấm điểm áp lực.'
                : 'During the 1-on-1 Mini-Test, a CiC observes how Body (Motion), Voice (Sound), and Intent (Emotion) coordinate as you speak naturally—with zero memorized answers or artificial scoring.'}
            </p>
          </div>
        </div>

        {/* 3 Dimensional Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-8"
        >
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            return (
              <motion.div
                key={dim.id}
                variants={cardVariants}
                whileHover={reduceMotion ? {} : { y: -4, borderColor: '#0a0a0a' }}
                transition={{ duration: 0.2 }}
                className="group relative p-5 sm:p-6 bg-slate-50/70 hover:bg-white border border-[rgba(10,10,10,0.12)] rounded-[2px] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#c81e16] px-2 py-0.5 bg-red-50 border border-red-200/60 rounded-[2px]">
                        {dim.id} / {dim.code}
                      </span>
                      <span className="text-[11.5px] font-mono text-[#0a0a0a]/50 uppercase tracking-wider">
                        {dim.subtitle}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-[rgba(10,10,10,0.12)] flex items-center justify-center text-[#0a0a0a]/70 group-hover:text-[#c81e16] group-hover:border-[#c81e16] group-hover:scale-105 transition-all shadow-xs">
                      <Icon size={16} />
                    </div>
                  </div>

                  <h3 className="text-[18px] font-bold tracking-tight text-[#0a0a0a] group-hover:text-[#c81e16] transition-colors">
                    {dim.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-[#0a0a0a]/70 font-light leading-relaxed">
                    {dim.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between text-[11px] font-mono text-[#0a0a0a]/60">
                  <span>{lang === 'vi' ? 'Khảo sát trực tiếp' : 'Direct observation'}</span>
                  <ArrowUpRight size={14} className="text-[#0a0a0a]/40 group-hover:text-[#c81e16] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Action */}
        <div className="mt-8 pt-6 border-t border-[rgba(10,10,10,0.08)] flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12.5px] font-mono text-[#0a0a0a]/60">
            {lang === 'vi' ? '• 21 câu ngắn · 15–20 phút · Phòng test tiêu chuẩn' : '• 21 short questions · 15–20 min · Standard test room'}
          </p>
          <motion.button
            type="button"
            onClick={onRegister}
            whileHover={reduceMotion ? {} : { scale: 1.02 }}
            whileTap={reduceMotion ? {} : { scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] hover:bg-[#c81e16] text-white px-5 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <span>{lang === 'vi' ? 'Đăng ký Mini-Test ngay' : 'Request Mini-Test'}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};
