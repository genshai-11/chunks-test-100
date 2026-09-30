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
    questionVi: 'Bài Mini-Test 21 câu của CHUNKS là gì và khác gì bài test thông thường?',
    questionEn: 'What is the CHUNKS 21-question Mini-Test and how does it differ from traditional tests?',
    answerVi:
      'CHUNKS không dùng bài trắc nghiệm lý thuyết hay phần mềm chấm điểm tự động. Đây là bài Mini-Test 21 câu ngắn diễn ra trong 15 – 20 phút trực tiếp (1-on-1) cùng Chunker-in-Charge (CiC) nhằm ghi nhận phản xạ ngôn ngữ thực tế qua ba trụ cột Chuyển động, Âm thanh và Cảm xúc (MSE).',
    answerEn:
      'CHUNKS is not a multiple-choice quiz or automated app test. It is a concise 21-question Mini-Test conducted in 15–20 minutes 1-on-1 with a Chunker-in-Charge (CiC) to observe real-world speech reflex across Motion, Sound, and Emotion (MSE).',
  },
  {
    number: '02',
    questionVi: 'Hình thức kiểm tra diễn ra ở đâu? Có thi online được không?',
    questionEn: 'Where does the assessment take place? Can it be done online?',
    answerVi:
      'Bài đánh giá được tổ chức trực tiếp (Offline) 1-on-1 tại không gian tiêu chuẩn của CHUNKS. Việc tương tác trực tiếp giúp CiC quan sát toàn diện nhịp thở, độ tự tin và phản xạ cơ thể trong thời gian thực – điều mà các ứng dụng trực tuyến không thể ghi nhận đầy đủ.',
    answerEn:
      'The session is conducted strictly in-person (Offline) 1-on-1 at CHUNKS. Direct interaction enables the CiC to observe vocal confidence, posture, and natural speech rhythm in real time, which online tools cannot capture.',
  },
  {
    number: '03',
    questionVi: '21 câu hỏi trong 15–20 phút khảo sát những yếu tố nào?',
    questionEn: 'What do the 21 challenges in 15–20 minutes evaluate?',
    answerVi:
      'Bài test khảo sát 2 nhánh phản xạ chính: Khả năng duy trì sự tập trung (%c Focus — giữ vững câu từ và phản hồi tự tin sau khi được gợi ý) và Khả năng ứng biến linh hoạt (%r Improv — bẻ lái ý tưởng mượt mà khi nhận các ngữ cảnh bất ngờ mà vẫn giữ mạch logic).',
    answerEn:
      'The 21 challenges evaluate two key dimensions: Focus reflex (%c — staying composed and maintaining narrative rhythm after corrections) and Agile improvisation (%r — smoothly redirecting an idea when faced with unexpected cues while preserving logic).',
  },
  {
    number: '04',
    questionVi: 'Khung giờ chọn trên biểu mẫu (Calendar) có phải là giờ chốt chính thức?',
    questionEn: 'Is the time selected on the calendar considered the final confirmed slot?',
    answerVi:
      'Khung giờ trên lịch biểu mẫu là thời gian mong muốn dự kiến của bạn. Sau khi tiếp nhận thông tin, điều phối viên CHUNKS sẽ chủ động gọi điện hoặc nhắn tin Zalo để thống nhất lịch hẹn trực tiếp chính thức và gửi hướng dẫn đường đi tới cơ sở.',
    answerEn:
      'The calendar selection records your desired expected window. After receiving your submission, CHUNKS operations will contact you via phone or Zalo to finalize the appointment and provide directions to the location.',
  },
  {
    number: '05',
    questionVi: 'Tôi có cần ôn tập ngữ pháp hay chuẩn bị kịch bản trước không?',
    questionEn: 'Do I need to review grammar rules or prepare a script beforehand?',
    answerVi:
      'Hoàn toàn không cần ôn tập hay học thuộc câu mẫu. Mini-test 21 câu được xây dựng để đo phản xạ tự nhiên của bạn ở thời điểm hiện tại. Trọng tâm là sự linh hoạt và kết nối logic, không chấm điểm ngữ pháp hàn lâm.',
    answerEn:
      'No prior preparation or rehearsed script is needed. The 21-question mini-test measures your spontaneous reflex in real time. We prioritize agility and communicative flow over textbook grammar.',
  },
  {
    number: '06',
    questionVi: 'Nếu tôi chưa có mã giới thiệu thì có thể đăng ký giữ chỗ không?',
    questionEn: 'Can I register if I do not currently have a referral code?',
    answerVi:
      'Được. Nếu chưa có mã từ Chunkee quen biết, hệ thống sẽ tự động xếp bạn vào danh sách chờ ưu tiên PILOT100. Ngoài ra, nếu bạn là một Chunkee, bạn có thể tự tạo mã giới thiệu cá nhân ngay trên trang chủ để gửi cho bạn bè.',
    answerEn:
      'Yes. If you do not have an inviter code, you can register via the priority pilot waitlist (PILOT100). Furthermore, Chunkees can generate their own personal referral link directly from the home page.',
  },
  {
    number: '07',
    questionVi: 'Thông tin cá nhân (SĐT, Email) của tôi được bảo vệ như thế nào?',
    questionEn: 'How are my contact details and diagnostic results protected?',
    answerVi:
      'Thông tin cá nhân được mã hóa và bảo mật nghiêm ngặt trên hệ thống máy chủ, chỉ phục vụ điều phối lịch hẹn và thông báo kết quả 1-on-1 giữa bạn và CiC; CHUNKS cam kết không chia sẻ dữ liệu cho bên thứ ba.',
    answerEn:
      'Your personal details are stored securely on our backend, accessed only by verified operations staff to schedule your in-person session; CHUNKS never shares your contact information with third parties.',
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
