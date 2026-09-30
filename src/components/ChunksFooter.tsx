import React from 'react';

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
  const scrollToForm = () => {
    onSelectView('booking');
    const el = document.getElementById('booking-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="w-full bg-[#ffffff] hairline-t" aria-label="Site Footer">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        {/* Main Footer Grid (py-14) */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col-span-5: Brand & Tagline Block */}
          <div className="col-span-12 md:col-span-5">
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-2 cursor-pointer group text-left focus-visible:outline-none"
              aria-label="Back to top"
            >
              <img
                src="/logo.png"
                alt="CHUNKS Logo"
                className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] object-contain shrink-0"
              />
              <span className="text-[19px] sm:text-[21px] font-bold tracking-tight text-[#0a0a0a]">
                CHUNKS TEST 100
              </span>
            </button>

            <p className="max-w-[34ch] text-[13.5px] text-[#0a0a0a]/65 leading-relaxed mt-4 font-normal tracking-[-0.011em]">
              {lang === 'vi'
                ? 'Theo CHUNKS Theory MN107.v2.1: đánh giá sự chú ý và ứng biến khi phối hợp Chuyển động, Âm thanh, Cảm xúc. Mục tiêu thử nghiệm: 100 lượt đăng ký đủ điều kiện.'
                : 'Based on CHUNKS Theory MN107.v2.1: assessing focus and improvisation through Motion, Sound and Emotion. Pilot target: 100 qualified registrations.'}
            </p>
          </div>

          {/* Col-span-3: Assessment Links */}
          <div className="col-span-6 md:col-span-3 md:col-start-7">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
              {lang === 'vi' ? 'BÀI ĐÁNH GIÁ' : 'ASSESSMENTS'}
            </span>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] font-medium text-[#0a0a0a]/60 tracking-[-0.01em]">
              <li>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  Green Test (%c Focus)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  Red Test (%r Improv)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onScrollToFaq}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  {lang === 'vi' ? 'Câu hỏi thường gặp (FAQ)' : 'FAQ Specimen'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col-span-3: Chunkee Gateway Links */}
          <div className="col-span-6 md:col-span-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
              {lang === 'vi' ? 'DÀNH CHO CHUNKEE' : 'CHUNKEES'}
            </span>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] font-medium text-[#0a0a0a]/60 tracking-[-0.01em]">
              <li>
                <button
                  type="button"
                  onClick={onOpenChunkerHub}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left font-medium"
                >
                  {lang === 'vi' ? 'Lấy link & mã QR giới thiệu' : 'Get Referral Link & QR'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenChunkerHub}
                  className="hover:text-[#ff3b30] transition-colors cursor-pointer text-left"
                >
                  {lang === 'vi' ? 'Tra cứu lượt ứng viên' : 'Lookup Registration Stats'}
                </button>
              </li>
              <li>
                <span className="text-[11px] font-mono text-[#0a0a0a]/40 block mt-1">
                  1-on-1 CiC Referral Program
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Baseline Copyright Row (py-6) */}
        <div className="hairline-t py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-[#0a0a0a]/60">
          <div className="tabular-nums font-normal">
            &copy; 2026 CHUNKS Theory. All rights reserved.
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
            MN107.V2.1 / CONSCIOUS PERFORMANCE
          </div>
        </div>
      </div>
    </footer>
  );
};
