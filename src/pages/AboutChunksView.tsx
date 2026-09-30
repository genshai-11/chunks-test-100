import React from 'react';
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';

interface Props {
  lang: 'vi' | 'en';
  onNavigateToBooking: () => void;
}

export const AboutChunksView: React.FC<Props> = ({ lang, onNavigateToBooking }) => {
  return (
    <div className="w-full text-[#0a0a0a]">
      {/* 1. Masthead / Hero */}
      <section className="w-full hairline-b bg-white">
        <div className="chunks-shell chunks-reveal-shell grid grid-cols-1 md:grid-cols-12 gap-6 py-[72px] md:py-[110px]">
          <div className="col-span-12 md:col-span-3">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#c81e16] block">
              CHUNKS THEORY · MN107.V2.1
            </span>
            <span className="text-[12px] font-mono text-[#0a0a0a]/50 mt-1 block">
              CONSCIOUS PERFORMANCE
            </span>
          </div>

          <div className="col-span-12 md:col-span-9 space-y-6">
            <h1 className="text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.98] font-bold tracking-tight text-[#0a0a0a] text-balance">
              {lang === 'vi' ? (
                <>
                  Cải thiện 3 nền tảng ngôn ngữ: <br />
                  <span className="text-[#0a0a0a]/85">Tập Trung</span> ·{' '}
                  <span className="text-[#0a0a0a]/85">Ứng Biến</span> ·{' '}
                  <span className="text-[#c81e16]">Quan Sát</span>.
                </>
              ) : (
                <>
                  Three core pillars of language: <br />
                  <span className="text-[#0a0a0a]/85">Focus</span> ·{' '}
                  <span className="text-[#0a0a0a]/85">Improv</span> ·{' '}
                  <span className="text-[#c81e16]">Observation</span>.
                </>
              )}
            </h1>

            <p className="max-w-[54ch] text-[16px] md:text-[17.5px] text-[#0a0a0a]/75 leading-relaxed font-light">
              {lang === 'vi'
                ? 'Từ 3 nghịch lý ngôn ngữ đến giả thuyết về cộng hưởng Thân – Khẩu – Ý (Motion – Sound – Emotion). CHUNKS khám phá cách ngôn ngữ cơ thể, cao độ âm thanh và cảm xúc tác động trực tiếp lên khả năng phản xạ trong thời gian thực.'
                : 'From three linguistic paradoxes to real-time resonance across Motion, Sound, and Emotion (MSE). CHUNKS explores how body language, vocal resonance, and intention drive authentic communication under pressure.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="bg-[#c81e16] hover:bg-[#ff3b30] text-white text-[14px] font-bold rounded-full px-7 py-3.5 flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <span>{lang === 'vi' ? 'Đăng ký Mini-Test 20 phút' : 'Book 20m Mini-Test'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://the-chunks.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full border border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a] text-[13px] font-medium text-[#0a0a0a] transition-colors"
              >
                <span>the-chunks.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c81e16]" />
              </a>

              <a
                href="https://chunkstheory.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full border border-[rgba(10,10,10,0.18)] hover:border-[#0a0a0a] text-[13px] font-medium text-[#0a0a0a] transition-colors"
              >
                <span>chunkstheory.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c81e16]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tam Trụ Khảo Sát: Focus, Improv, Observe */}
      <section className="w-full hairline-b bg-slate-50/50 py-16 md:py-24">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 space-y-12">
          <div className="max-w-2xl">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c81e16] block">
              CHUNKS EVALUATION SUITE
            </span>
            <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0a0a0a] mt-2">
              {lang === 'vi' ? 'Ba nhánh khảo sát năng lực phản xạ' : 'Three Diagnostic Dimensions'}
            </h2>
            <p className="text-[15px] text-[#0a0a0a]/70 font-light mt-2">
              {lang === 'vi'
                ? 'Được thiết kế theo tài liệu Special CHUNKS Theory MN107.v2.1 để ghi nhận chân thực phản xạ của người học khi nói dưới ma sát nhận thức.'
                : 'Designed under Special CHUNKS Theory MN107.v2.1 to observe authentic human performance under conversational friction.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Focus */}
            <div className="p-7 bg-white border border-[rgba(10,10,10,0.14)] space-y-4 rounded-[2px] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono font-bold text-xs">
                  %c
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0a0a0a]/50">
                  Green Focus
                </span>
              </div>
              <h3 className="text-[19px] font-bold text-[#0a0a0a]">
                {lang === 'vi' ? 'Khả Năng Tập Trung (%c)' : 'Focus Skill (%c)'}
              </h3>
              <p className="text-[14px] text-[#0a0a0a]/70 font-light leading-relaxed">
                {lang === 'vi'
                  ? 'Biết đúng là chưa đủ. Quan sát cách bạn giữ cấu trúc câu, duy trì nhịp thở và để ý sửa lỗi thói quen ngay trong lúc đang nói.'
                  : 'Knowing what is right is not enough. Measures your ability to maintain narrative composure and self-correct during active speech.'}
              </p>
              <div className="pt-2 border-t border-[rgba(10,10,10,0.08)] text-[11.5px] font-mono text-[#0a0a0a]/60">
                <span>Rèn luyện: CHUNKS Drills</span>
              </div>
            </div>

            {/* Card 2: Improv */}
            <div className="p-7 bg-white border border-[rgba(10,10,10,0.14)] space-y-4 rounded-[2px] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-[#c81e16] border border-rose-200 flex items-center justify-center font-mono font-bold text-xs">
                  %r
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0a0a0a]/50">
                  Red Improv
                </span>
              </div>
              <h3 className="text-[19px] font-bold text-[#0a0a0a]">
                {lang === 'vi' ? 'Khả Năng Ứng Biến (%r)' : 'Improvisation (%r)'}
              </h3>
              <p className="text-[14px] text-[#0a0a0a]/70 font-light leading-relaxed">
                {lang === 'vi'
                  ? 'Không có sẵn câu trả lời? Quan sát cách bạn tự tạo hướng đi, bẻ lái ý niệm trước các từ vựng và gợi ý bất ngờ mà câu chuyện vẫn hoàn toàn hợp lý.'
                  : 'No rehearsed answers? Measures your agility to redirect arguments on the fly when unexpected cues arrive while preserving logic.'}
              </p>
              <div className="pt-2 border-t border-[rgba(10,10,10,0.08)] text-[11.5px] font-mono text-[#0a0a0a]/60">
                <span>Rèn luyện: CHUNKS Battle</span>
              </div>
            </div>

            {/* Card 3: Observe */}
            <div className="p-7 bg-white border border-[rgba(10,10,10,0.14)] space-y-4 rounded-[2px] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs">
                  %i
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0a0a0a]/50">
                  Blue Observe
                </span>
              </div>
              <h3 className="text-[19px] font-bold text-[#0a0a0a]">
                {lang === 'vi' ? 'Khả Năng Quan Sát (%i)' : 'Observation (%i)'}
              </h3>
              <p className="text-[14px] text-[#0a0a0a]/70 font-light leading-relaxed">
                {lang === 'vi'
                  ? 'Quan sát trước khi phán đoán. Thấy, nghe và phản hồi với điều đang thực sự diễn ra, loại bỏ mọi bộ lọc định kiến để lắng nghe trọn vẹn ngữ cảnh.'
                  : 'Observe before judgment. Seeing and hearing what is genuinely unfolding, stripping away cognitive filters to respond to raw nuance.'}
              </p>
              <div className="pt-2 border-t border-[rgba(10,10,10,0.08)] text-[11.5px] font-mono text-[#0a0a0a]/60">
                <span>Rèn luyện: CHUNKS Mirror</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Phương Pháp MSE (Motion, Sound, Emotion) */}
      <section className="w-full hairline-b bg-white py-16 md:py-24">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="col-span-12 md:col-span-6 space-y-4">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c81e16] block">
              TAM TRỤ THÂN · KHẨU · Ý
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-[#0a0a0a] leading-tight">
              {lang === 'vi' ? 'Cộng hưởng MSE: Motion · Sound · Emotion' : 'The MSE Resonance Model'}
            </h2>
            <p className="text-[15px] text-[#0a0a0a]/75 font-light leading-relaxed">
              {lang === 'vi'
                ? 'CHUNKS tiếp cận ngôn ngữ không như một tập hợp công thức khô cứng, mà như một trạng thái vật lý sống động. Năng lực phản xạ ngôn ngữ chỉ thực sự hình thành khi có sự đồng bộ giữa ba trường năng lượng:'
                : 'CHUNKS treats language not as static grammar drills, but as a living physical state. Authentic communication manifests when three vectors align:'}
            </p>

            <ul className="space-y-3 pt-2 text-[14px] text-[#0a0a0a]/80">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#c81e16]/10 text-[#c81e16] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  M
                </div>
                <div>
                  <strong>Motion (Chuyển động cơ thể):</strong> Nhịp thở, khẩu hình, tư thế đứng/ngồi và sự giải phóng cơ hàm khi phát âm.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#c81e16]/10 text-[#c81e16] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  S
                </div>
                <div>
                  <strong>Sound (Trường âm thanh - COS):</strong> Tần số rung động, độ dày của âm thanh và nhịp điệu tự nhiên của giọng nói.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#c81e16]/10 text-[#c81e16] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  E
                </div>
                <div>
                  <strong>Emotion (Cảm xúc & Ý niệm):</strong> Sự tự tin, ý định muốn biểu đạt và sự giải tỏa rào cản sợ phán xét.
                </div>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-6 bg-slate-50 border border-[rgba(10,10,10,0.14)] p-8 rounded-none space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="CHUNKS" className="w-10 h-10 object-contain" />
              <div>
                <h4 className="text-[17px] font-bold text-[#0a0a0a]">Trung Tâm Khảo Sát CHUNKS</h4>
                <p className="text-[12px] text-[#0a0a0a]/60 font-mono">Van Phuc City · Ho Chi Minh City</p>
              </div>
            </div>

            <div className="space-y-3 text-[13px] text-[#0a0a0a]/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c81e16] shrink-0 mt-0.5" />
                <span>25 đường số 3, khu đô thị Vạn Phúc, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#c81e16] shrink-0" />
                <span>Thời lượng Mini-Test: 15 – 20 phút (Trực tiếp 1-on-1 với CiC)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#c81e16] shrink-0" />
                <span>Quy mô: Thử nghiệm giới hạn 100 lượt đăng ký đủ điều kiện</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="w-full py-3.5 bg-[#0a0a0a] hover:bg-[#c81e16] text-white text-[13.5px] font-bold rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Đăng ký giữ chỗ Mini-Test ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
