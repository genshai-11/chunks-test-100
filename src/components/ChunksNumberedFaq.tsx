import React, { useState } from 'react';
import { SwissGlyph } from './SwissGlyph';

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
      'Green Test quan sát cách bạn giữ sự chú ý, phối hợp Chuyển động–Âm thanh–Cảm xúc (MSE) và tiếp tục thực hiện yêu cầu sau khi CiC sửa lỗi. Các lỗi lặp lại, chậm phản hồi hoặc quên yêu cầu được ghi nhận trong %RFC, qua đó ảnh hưởng đến chỉ số tập trung %c.',
    answerEn:
      'The Green Test observes how you maintain attention and Motion–Sound–Emotion (MSE) coordination after the CiC corrects a mistake. Repeated errors, delays and missed requests contribute to %RFC and affect the focus score %c.',
  },
  {
    number: '03',
    questionVi: 'Red Test (%r Improvisation Test) kiểm tra sự linh hoạt tư duy ra sao?',
    questionEn: 'How does the Red Test (%r Improvisation Test) test cognitive agility?',
    answerVi:
      'Red Test quan sát khả năng chuyển hướng một ý tưởng theo các gợi ý ngôn ngữ xuất hiện bất ngờ mà vẫn giữ logic theo đúng thứ tự. Người tham gia cần kết nối các gợi ý ngay trong lúc nói; ngữ pháp hoàn hảo không phải trọng tâm.',
    answerEn:
      'The Red Test observes how you redirect an unfolding idea as unexpected language hints arrive while preserving their sequence and logic. You connect the hints while speaking; perfect grammar is not the main focus.',
  },
  {
    number: '04',
    questionVi: 'Nguyên lý Motion, Sound, Emotion (MSE) hoạt động như thế nào?',
    questionEn: 'How does the Motion, Sound, Emotion (MSE) resonance principle work?',
    answerVi:
      'Theo CHUNKS Theory MN107.v2.1, MSE là sự phối hợp giữa Chuyển động (Motion), Âm thanh (Sound) và Cảm xúc/ý tưởng (Emotion/idea). CiC quan sát sự phối hợp này trong thử thách; lý thuyết không bảo đảm rằng một lần đánh giá sẽ thay đổi thói quen ngôn ngữ.',
    answerEn:
      'In CHUNKS Theory MN107.v2.1, MSE combines Motion, Sound and Emotion/idea. The CiC observes their coordination during challenges; one assessment does not guarantee a change in language habits.',
  },
  {
    number: '05',
    questionVi: 'Mục tiêu 100 lượt đăng ký của chương trình là gì?',
    questionEn: 'What does the pilot target of 100 registrations mean?',
    answerVi:
      'CHUNKS đặt mục tiêu tiếp nhận 100 ứng viên đủ điều kiện để điều phối các buổi đánh giá trực tiếp cùng CiC. Đây là mục tiêu của chương trình, không phải số chỗ còn trống đã được hệ thống xác nhận. Mã giới thiệu giúp ghi nhận người giới thiệu.',
    answerEn:
      'CHUNKS aims to receive 100 qualified candidates for live sessions with a CiC. This is a pilot target, not a verified count of available seats. Referral codes attribute each invitation to its referrer.',
  },
  {
    number: '06',
    questionVi: 'Quy trình xếp lịch 45 phút và chuẩn bị trước buổi test diễn ra thế nào?',
    questionEn: 'How is the 45-minute session scheduled and what preparation is needed?',
    answerVi:
      'Sau khi gửi yêu cầu, đội ngũ điều phối cần liên hệ qua Zalo hoặc điện thoại để xác nhận lịch; khung giờ trên biểu mẫu chỉ là lựa chọn ưu tiên. Bạn có thể chuẩn bị không gian yên tĩnh và tai nghe có micro cho buổi đánh giá.',
    answerEn:
      'After you submit a request, the operations team needs to contact you by Zalo or phone to confirm the appointment; the time in the form is only a preference. You can prepare a quiet space and a headset with a microphone.',
  },
  {
    number: '07',
    questionVi: 'Thông tin cá nhân (SĐT, Email) của tôi được bảo mật thế nào?',
    questionEn: 'How is my personal contact information protected?',
    answerVi:
      'CHUNKS dự định chỉ cho phép nhân sự điều phối được xác thực xem số điện thoại và email của ứng viên. Tuy nhiên, hệ thống đang được rà soát bảo mật; vui lòng cân nhắc trước khi gửi thông tin cá nhân cho đến khi việc kiểm tra hoàn tất.',
    answerEn:
      'CHUNKS intends to limit access to candidate phone numbers and email addresses to verified operations staff. Security review is in progress; consider this before submitting personal data until the review is complete.',
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
