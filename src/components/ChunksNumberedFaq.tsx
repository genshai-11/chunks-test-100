import React, { useState } from 'react';
import { SwissGlyph } from './specimen/SwissGlyph';

interface ChunksFaqItem {
  number: string;
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
}

const CHUNKS_FAQ: ChunksFaqItem[] = [
  {
    number: '01',
    questionVi: 'Đánh giá 1-on-1 của CHUNKS là gì và khác gì bài test thông thường?',
    questionEn: 'What is the CHUNKS 1-on-1 assessment and how does it differ from tests?',
    answerVi:
      'CHUNKS không phải là bài trắc nghiệm ngữ pháp hay bài kiểm tra lý thuyết tự động. Đây là phiên làm việc trực tiếp 1-on-1 trong 45 phút cùng Chunker-in-Charge (CiC) nhằm đo lường năng lực thực thi có ý thức dưới áp lực thời gian thực qua ba trụ cột Chuyển động, Âm thanh và Cảm xúc (MSE).',
    answerEn:
      'CHUNKS is not a generic grammar quiz or automated multiple-choice test. It is an intensive 45-minute 1-on-1 session with a Chunker-in-Charge (CiC) designed to evaluate conscious performance under real-time pressure through Motion, Sound, and Emotion (MSE) resonance.',
  },
  {
    number: '02',
    questionVi: 'Green Test (%c Focus Test) đo lường điều gì qua 49 thử thách?',
    questionEn: 'What does the Green Test (%c Focus Test) measure across 49 challenges?',
    answerVi:
      'Green Test kiểm tra năng lực chú ý và duy trì cấu trúc ngữ pháp trước các yêu cầu phi tập quán (anti-habitual pressure). Bài kiểm tra đánh giá liệu bạn có thể xóa bỏ thói quen phát âm sai ngay sau đúng 1 lần sửa của CiC và giảm thiểu chỉ số quên yêu cầu (%RFC) hay không.',
    answerEn:
      'The Green Test measures sustained attention and grammar preservation under anti-habitual pressure. It assesses whether you can instantly eliminate pronunciation and habit errors after a single correction by the CiC while reducing the Requests Forgotten Coefficient (%RFC).',
  },
  {
    number: '03',
    questionVi: 'Red Test (%r Improvisation Test) kiểm tra sự linh hoạt tư duy ra sao?',
    questionEn: 'How does the Red Test (%r Improvisation Test) test cognitive agility?',
    answerVi:
      'Red Test tập trung vào ý định và sự nhanh nhạy nhận thức. Bạn sẽ chuyển hướng một ý tưởng đang diễn đạt theo các gợi ý logic ngẫu nhiên từ CiC mà vẫn giữ mạch lập luận chặt chẽ. Trả lời theo văn mẫu là điều bất khả thi, vì sự hiện diện và tính mạch lạc là trọng tâm.',
    answerEn:
      'The Red Test focuses on intention and real-time cognitive agility. You redirect an unfolding idea under sudden, random linguistic hints while preserving sequential logic. Memorized answers are impossible because presence and coherence matter most.',
  },
  {
    number: '04',
    questionVi: 'Nguyên lý Motion, Sound, Emotion (MSE) hoạt động như thế nào?',
    questionEn: 'How does the Motion, Sound, Emotion (MSE) resonance principle work?',
    answerVi:
      'MSE là hệ quy chiếu của CHUNKS Theory MN107.v2.1. Ngôn ngữ chỉ được ghi nhớ sâu khi kết hợp đồng bộ giữa cử động cơ thể (Motion), trường âm thanh phát ra (Sound) và trạng thái cảm xúc thực (Emotion). CiC sẽ quan sát độ cộng hưởng MSE này xuyên suốt 7 cấp độ.',
    answerEn:
      'MSE is the foundational framework of CHUNKS Theory MN107.v2.1. Language is permanently anchored only when body motion, vocal sound projection, and genuine emotional resonance align. The CiC observes MSE resonance across all 7 progressive levels.',
  },
  {
    number: '05',
    questionVi: 'Tại sao chiến dịch chỉ mở đúng 100 suất đăng ký qua lời mời?',
    questionEn: 'Why is this campaign strictly capped at 100 seats via referral?',
    answerVi:
      'Để đảm bảo chất lượng phản hồi chuyên sâu và tính chính xác của chỉ số pilot, mỗi ứng viên đều được kèm cặp trực tiếp bởi các CiC kỳ cựu. Hệ thống giới thiệu qua mã Chunkee đảm bảo các ứng viên tham gia đều có cam kết học tập nghiêm túc.',
    answerEn:
      'To maintain deep assessment rigor and pilot calibration, each candidate is evaluated individually by senior CiCs. The invite-only referral system via Chunkees ensures candidates arrive with high learning commitment.',
  },
  {
    number: '06',
    questionVi: 'Quy trình xếp lịch 45 phút và chuẩn bị trước buổi test diễn ra thế nào?',
    questionEn: 'How is the 45-minute session scheduled and what preparation is needed?',
    answerVi:
      'Sau khi gửi form, đội ngũ điều phối sẽ liên hệ qua Zalo hoặc điện thoại trong vòng 24 giờ để chốt khung giờ chính thức. Bạn chỉ cần chuẩn bị một không gian yên tĩnh, tai nghe có micro tốt và tinh thần cởi mở sẵn sàng thử thách.',
    answerEn:
      'After submitting the form, our operations team will contact you via Zalo or phone within 24 hours to confirm your exact slot. You only need a quiet space, headphones with a clear microphone, and an open mindset.',
  },
  {
    number: '07',
    questionVi: 'Thông tin cá nhân (SĐT, Email) của tôi được bảo mật thế nào?',
    questionEn: 'How is my personal contact information and PII protected?',
    answerVi:
      'Hệ thống áp dụng chính sách cách ly dữ liệu nghiêm ngặt. Người giới thiệu (Chunkee) chỉ nhìn thấy số lượng và tên rút gọn có che giấu. Số điện thoại và email của bạn chỉ được truy cập duy nhất bởi Admin điều phối để liên hệ xếp lịch.',
    answerEn:
      'The platform enforces strict end-to-end data isolation. The Chunkee who invited you only sees aggregated counts and masked names. Your raw phone number and email are visible exclusively to verified scheduling administrators.',
  },
];

interface Props {
  lang: 'vi' | 'en';
}

export const ChunksNumberedFaq: React.FC<Props> = ({ lang }) => {
  // Row 01 pre-opened
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleRow = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="scroll-mt-24 w-full">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        {/* 12-Column Split Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 pt-16 md:pt-24 pb-7 md:pb-10 items-baseline">
          {/* Left Column (col-span-12 md:col-span-3): Micro Eyebrow */}
          <div className="col-span-12 md:col-span-3 mb-2 md:mb-0">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
              {lang === 'vi' ? 'CÂU HỎI THƯỜNG GẶP' : 'THE QUESTIONS'}
            </span>
          </div>

          {/* Right Column (col-span-12 md:col-span-9): Section Heading */}
          <div className="col-span-12 md:col-span-9">
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] tracking-[-0.02em] leading-tight font-semibold text-[#0a0a0a]">
              {lang === 'vi'
                ? 'Bảy câu hỏi về bài đánh giá 1-on-1 trước khi đăng ký.'
                : 'Seven things candidates ask before their first 1-on-1 assessment.'}
            </h2>
          </div>
        </div>

        {/* Numbered FAQ List under single heavy 1.5px ink top rule */}
        <div
          className="border-t-[1.5px] border-[#0a0a0a]"
          role="region"
          aria-label="Frequently Asked Questions"
        >
          {CHUNKS_FAQ.map((item, idx) => {
            const isOpen = openIndex === idx;
            const itemId = `faq-item-${item.number}`;
            const buttonId = `faq-btn-${item.number}`;
            const question = lang === 'vi' ? item.questionVi : item.questionEn;
            const answer = lang === 'vi' ? item.answerVi : item.answerEn;

            return (
              <div
                key={item.number}
                className={`faq-item border-b border-[rgba(10,10,10,0.14)] transition-colors duration-200 ${
                  isOpen ? 'open' : ''
                }`}
              >
                {/* 12-Column Question Button */}
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={itemId}
                  onClick={() => toggleRow(idx)}
                  className="w-full text-left grid grid-cols-12 gap-x-4 md:gap-x-6 items-baseline py-7 md:py-8 cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c81e16]"
                >
                  {/* Tabular Number Column (col-span-2 md:col-span-3) */}
                  <div className="col-span-2 md:col-span-3">
                    <span
                      className={`tabular-nums font-semibold text-[15px] md:text-[17px] transition-colors duration-200 ${
                        isOpen
                          ? 'text-[#c81e16]'
                          : 'text-[#0a0a0a]/60 group-hover:text-[#c81e16]'
                      }`}
                    >
                      {item.number}
                    </span>
                  </div>

                  {/* Question Text Column (col-span-9 md:col-span-8) */}
                  <div className="col-span-9 md:col-span-8 pr-2">
                    <span
                      className={`block font-medium text-[20px] md:text-[26px] tracking-[-0.02em] leading-snug transition-colors duration-200 ${
                        isOpen
                          ? 'text-[#0a0a0a]'
                          : 'text-[#0a0a0a]/80 group-hover:text-[#c81e16]'
                      }`}
                    >
                      {question}
                    </span>
                  </div>

                  {/* Swiss Plus/Minus Glyph (col-span-1) */}
                  <div className="col-span-1 flex justify-end items-center self-center">
                    <SwissGlyph isOpen={isOpen} />
                  </div>
                </button>

                {/* Accordion Answer Body with 360ms cubic-bezier transition */}
                <div
                  id={itemId}
                  role="region"
                  aria-labelledby={buttonId}
                  style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 360ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        opacity: isOpen ? 1 : 0,
                        transition: isOpen
                          ? 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1) 40ms'
                          : 'opacity 200ms ease',
                      }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-x-6"
                    >
                      {/* Indented under question: md:col-start-4 md:col-span-8 */}
                      <div className="md:col-start-4 md:col-span-8 max-w-[58ch] pb-8 pt-1">
                        <p className="text-[15.5px] md:text-[16px] font-light leading-relaxed text-[#0a0a0a]/65 tracking-[-0.011em]">
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
