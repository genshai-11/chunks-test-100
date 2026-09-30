import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onSelectGreen: () => void;
  onSelectRed?: () => void;
  lang: 'vi' | 'en';
}

export const ChunksCtaBand: React.FC<Props> = ({
  onSelectGreen,
  lang,
}) => {
  return (
    <section
      className="relative w-full bg-gradient-to-br from-[#0a0a0c] via-[#121216] to-[#08080a] text-white mt-20 md:mt-28 border-y border-white/10 overflow-hidden"
      aria-label="CHUNKS Overview & Action Callout"
    >
      {/* Subtle background ambient glow */}
      <div
        className="absolute top-0 right-1/4 w-[420px] h-[420px] bg-[#c81e16]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-[1180px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center py-16 md:py-20">
        {/* Left Column (col-span-12 md:col-span-7): Core MSE Foundations */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="col-span-12 md:col-span-7 space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#ff3b30] font-mono">
              CHUNKS PILOT · MN107.V2.1 / CONSCIOUS SPEECH REFLEX
            </span>
          </div>

          <h2 className="text-[clamp(1.9rem,3.8vw,3.2rem)] leading-[1.05] tracking-[-0.03em] font-bold text-white text-balance">
            {lang === 'vi' ? (
              <>
                Ba nền tảng phản xạ ngôn ngữ (MSE): <br className="hidden sm:inline" />
                <span className="text-white/90">Chuyển động</span> · <span className="text-white/90">Âm thanh</span> · <span className="text-[#ff3b30]">Cảm xúc</span>.
              </>
            ) : (
              <>
                Three Pillars of Conscious Speech Reflex: <br className="hidden sm:inline" />
                <span className="text-white/90">Motion</span> · <span className="text-white/90">Sound</span> · <span className="text-[#ff3b30]">Emotion</span>.
              </>
            )}
          </h2>

          <p className="text-[14.5px] md:text-[15.5px] text-white/75 font-light leading-relaxed max-w-[54ch]">
            {lang === 'vi'
               ? 'Dựa trên CHUNKS Theory MN107.v2.1, CiC quan sát cách Chuyển động, Âm thanh và Cảm xúc (MSE) phối hợp khi bạn đối thoại. Mini-Test 21 câu trong 15–20 phút là cơ hội ghi nhận phản xạ hiện tại; không cần học thuộc mẫu câu trước buổi gặp.'
               : 'Based on CHUNKS Theory MN107.v2.1, the CiC observes how Motion, Sound and Emotion (MSE) work together as you speak. The 21-question, 15–20 minute Mini-Test records your responses in the moment; no memorized script needed.'}
          </p>

          {/* Reference Links to official CHUNKS portals */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <a
              href="https://the-chunks.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:border-[#ff3b30] hover:bg-white/10 transition-all cursor-pointer"
            >
              <span>the-chunks.com</span>
              <ExternalLink className="w-3 h-3 text-[#ff3b30]" />
            </a>

            <a
              href="https://chunkstheory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:border-[#ff3b30] hover:bg-white/10 transition-all cursor-pointer"
            >
              <span>chunkstheory.com</span>
              <ExternalLink className="w-3 h-3 text-[#ff3b30]" />
            </a>
          </div>
        </motion.div>

        {/* Right Column (col-span-12 md:col-span-5): Direct Action Box */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          className="col-span-12 md:col-span-5 flex md:justify-end"
        >
          <div className="w-full max-w-[340px] bg-white/[0.04] hover:bg-white/[0.06] border border-white/15 hover:border-white/25 p-6 rounded-2xl space-y-4 backdrop-blur-md transition-all shadow-xl">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff3b30] font-bold block">
                MINI-TEST 21 CÂU · 15 - 20 PHÚT
              </span>
              <h3 className="text-[18px] font-bold text-white mt-1">
                {lang === 'vi' ? 'Đánh Giá Trực Tiếp Offline' : 'In-Person 1-on-1 Session'}
              </h3>
              <p className="text-[13px] text-white/65 font-light mt-1.5 leading-relaxed">
                {lang === 'vi'
                  ? 'Ghi nhận thời gian mong muốn dự kiến. Điều phối viên sẽ liên hệ để xác nhận lịch chính thức tại cơ sở.'
                  : 'Record your expected desired window. Operations will finalize the in-person appointment.'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSelectGreen}
              className="w-full bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[14px] font-bold rounded-full px-6 py-3.5 flex items-center justify-between transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg"
            >
               <span>{lang === 'vi' ? 'Gửi yêu cầu tham gia' : 'Request your Mini-Test'}</span>
              <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
