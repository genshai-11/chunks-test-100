import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

interface Props {
  onSelectGreen: () => void;
  onSelectRed: () => void;
  lang: 'vi' | 'en';
}

export const ChunksCtaBand: React.FC<Props> = ({
  onSelectGreen,
  lang,
}) => {
  return (
    <section className="w-full bg-[#0a0a0a] text-white mt-20 md:mt-28" aria-label="CHUNKS Overview & Action Callout">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-16 md:py-20">
        {/* Left Column (col-span-12 md:col-span-7): Core Theory & Ecosystem Message */}
        <div className="col-span-12 md:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#ff3b30]">
              CHUNKS PILOT · MN107.V2.1 / CONSCIOUS PERFORMANCE
            </span>
          </div>

          <h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] tracking-[-0.03em] font-bold text-white text-balance">
            {lang === 'vi' ? (
              <>
                Ba nền tảng phản xạ ngôn ngữ: <br className="hidden sm:inline" />
                <span className="text-white/90">Tập Trung</span> · <span className="text-white/90">Ứng Biến</span> · <span className="text-[#ff3b30]">Quan Sát</span>.
              </>
            ) : (
              <>
                Three pillars of conscious performance: <br className="hidden sm:inline" />
                <span className="text-white/90">Focus</span> · <span className="text-white/90">Improvisation</span> · <span className="text-[#ff3b30]">Observation</span>.
              </>
            )}
          </h2>

          <p className="text-[14.5px] md:text-[15.5px] text-white/75 font-light leading-relaxed max-w-[54ch]">
            {lang === 'vi'
              ? 'Theo CHUNKS Theory: Ngôn ngữ thực tế không nằm trên trang giấy học vẹt hay bài thi trắc nghiệm lý thuyết, mà là sự hợp nhất có ý thức giữa Chuyển động (Motion) – Âm thanh (Sound) – Cảm xúc (Emotion). Trải nghiệm trực tiếp qua bài Mini-Test 21 câu ngắn (15 – 20 phút) cùng Chunker-in-Charge để xác định vạch xuất phát phản xạ thực tế của bạn.'
              : 'According to CHUNKS Theory: Real language mastery is not textbook memorization or multiple-choice quizzes, but conscious coordination across Motion, Sound, and Emotion (MSE). Experience the 21-question Mini-Test (15–20 minutes) 1-on-1 with a CiC to map your authentic speech reflex baseline.'}
          </p>

          {/* Reference Links to official CHUNKS portals */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <a
              href="https://the-chunks.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/50 transition-colors"
            >
              <span>the-chunks.com</span>
              <ExternalLink className="w-3 h-3 text-[#ff3b30]" />
            </a>

            <a
              href="https://chunkstheory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/50 transition-colors"
            >
              <span>chunkstheory.com</span>
              <ExternalLink className="w-3 h-3 text-[#ff3b30]" />
            </a>
          </div>
        </div>

        {/* Right Column (col-span-12 md:col-span-5): Direct Action Box */}
        <div className="col-span-12 md:col-span-5 flex md:justify-end">
          <div className="w-full max-w-[320px] bg-white/5 border border-white/15 p-6 rounded-2xl space-y-4 backdrop-blur-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff3b30] font-semibold block">
                MINI-TEST 21 CÂU · 15-20 PHÚT
              </span>
              <h3 className="text-[17px] font-bold text-white mt-1">
                {lang === 'vi' ? 'Đánh Giá Trực Tiếp Offline' : 'In-Person 1-on-1 Session'}
              </h3>
              <p className="text-[12.5px] text-white/60 font-light mt-1 leading-normal">
                {lang === 'vi'
                  ? 'Ghi nhận thời gian mong muốn dự kiến. Điều phối viên sẽ liên hệ để xác nhận lịch chính thức tại cơ sở.'
                  : 'Record your expected desired window. Operations will finalize the in-person appointment.'}
              </p>
            </div>

            <button
              onClick={onSelectGreen}
              className="w-full bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[14px] font-bold rounded-full px-6 py-3.5 flex items-center justify-between transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-md"
            >
              <span>{lang === 'vi' ? 'Đăng ký Mini-Test 20p' : 'Book 20m Mini-Test'}</span>
              <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
