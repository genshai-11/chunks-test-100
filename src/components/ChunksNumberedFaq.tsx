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
      'CHUNKS không áp dụng hình thức trắc nghiệm ngữ pháp hay phần mềm chấm điểm tự động. Đây là bài Mini-Test 21 câu ngắn diễn ra trong 15 – 20 phút trực tiếp (1-on-1) cùng Chunker-in-Charge (CiC) nhằm ghi nhận phản xạ ngôn ngữ thực tế qua ba trụ cột Chuyển động, Âm thanh và Cảm xúc (MSE).',
    answerEn:
      'CHUNKS does not use multiple-choice grammar quizzes or automated scoring bots. It is a 21-question Mini-Test conducted in 15–20 minutes in-person (1-on-1) with a Chunker-in-Charge (CiC) to observe real-world speech reflex across Motion, Sound, and Emotion (MSE).',
  },
  {
    number: '02',
    questionVi: 'Hình thức kiểm tra diễn ra ở đâu? Có thi online được không?',
    questionEn: 'Where does the assessment take place? Can it be taken online?',
    answerVi:
      'Bài đánh giá được tổ chức hoàn toàn trực tiếp (Offline) 1-on-1 tại cơ sở khảo sát của CHUNKS. Tương tác trực tiếp giúp CiC quan sát toàn diện nhịp thở, ngữ điệu, ánh mắt và phản xạ cơ thể trong thời gian thực – điều mà các nền tảng trực tuyến không thể ghi nhận chân thực.',
    answerEn:
      'The session is conducted strictly in-person (Offline) 1-on-1 at a CHUNKS assessment center. In-person interaction enables the CiC to observe breath rhythm, vocal inflection, eye contact, and physical speech reflex in real time.',
  },
  {
    number: '03',
    questionVi: 'Phương pháp MSE khảo sát những khía cạnh phản xạ nào trong 21 câu?',
    questionEn: 'What dimensions of speech reflex does MSE observe across the 21 questions?',
    answerVi:
      'Bài test khảo sát 2 nhánh phản xạ chính: Khả năng duy trì sự tập trung (%c Focus — giữ vững câu từ và phản hồi tự tin sau khi nhận gợi ý) và Khả năng ứng biến linh hoạt (%r Improv — xoay chuyển ý tưởng mượt mà khi gặp tình huống bất ngờ mà vẫn giữ mạch logic).',
    answerEn:
      'The test examines two primary reflex streams: Focus durability (%c Focus — holding syntax and replying with composure after prompts) and Agile improvisation (%r Improv — smoothly pivoting ideas under unexpected conversational friction while sustaining logical coherence).',
  },
  {
    number: '04',
    questionVi: 'Ghi chú thời gian trên biểu mẫu có phải lịch hẹn chính thức?',
    questionEn: 'Is the time note on the form a confirmed appointment?',
    answerVi:
      'Không. Ghi chú chỉ giúp chúng tôi biết thời gian bạn có thể sắp xếp. Sau khi nhận đăng ký, đội ngũ CHUNKS sẽ gọi điện hoặc nhắn Zalo để thống nhất lịch hẹn trực tiếp và địa điểm.',
    answerEn:
      'No. The note simply lets us know when you might be available. CHUNKS operations will call or message you via Zalo to agree on the in-person appointment and venue.',
  },
  {
    number: '05',
    questionVi: 'Tôi có cần ôn tập ngữ pháp hay chuẩn bị kịch bản trước không?',
    questionEn: 'Do I need to review grammar rules or prepare a script beforehand?',
    answerVi:
      'Hoàn toàn không cần ôn tập hay học thuộc lòng bất kỳ câu mẫu nào. Mini-Test 21 câu được thiết kế để đo phản xạ tự nhiên ở trạng thái chân thật nhất. Trọng tâm là sự linh hoạt và khả năng kết nối ý tưởng, không chấm điểm ngữ pháp hàn lâm.',
    answerEn:
      'No rehearsal or textbook memorization is required. The 21-question Mini-Test is designed to assess spontaneous speech reflex in your natural state. We emphasize communicative agility and logical connection over rote grammar rules.',
  },
  {
    number: '06',
    questionVi: 'Nếu tôi chưa có mã giới thiệu thì có đăng ký được không?',
    questionEn: 'Can I register if I do not currently have a referral code?',
    answerVi:
      'Được. Nếu chưa có mã từ Chunkee quen biết, hệ thống sẽ tự động xếp bạn vào danh sách chờ ưu tiên PILOT100. Ngoài ra, nếu bạn là một Chunkee, bạn có thể tự tạo mã giới thiệu cá nhân ngay trên trang chủ để gửi cho bạn bè.',
    answerEn:
      'Yes. If you do not have an inviter code, the system automatically places you on the priority pilot waitlist (PILOT100). Furthermore, Chunkees can generate their own personal referral link directly from the home page.',
  },
  {
    number: '07',
    questionVi: 'Thông tin cá nhân (SĐT, Email) của tôi được bảo vệ như thế nào?',
    questionEn: 'How are my contact details and diagnostic notes protected?',
    answerVi:
      'Thông tin liên hệ được lưu trên máy chủ và chỉ bộ phận được phân quyền sử dụng để điều phối buổi đánh giá, gửi xác nhận và trao đổi với bạn.',
    answerEn:
      'Contact details are stored on the server and used by authorized staff to coordinate the assessment, send confirmation and follow up with you.',
  },
];

interface Props {
  lang: 'vi' | 'en';
}

export const ChunksNumberedFaq: React.FC<Props> = ({ lang }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              {lang === 'vi' ? 'CÂU HỎI THƯỜNG GẶP' : 'FREQUENTLY ASKED QUESTIONS'}
            </span>
          </div>

          {/* Right Column (col-span-12 md:col-span-9): Section Heading */}
          <div className="col-span-12 md:col-span-9">
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] tracking-[-0.025em] leading-tight font-semibold text-[#0a0a0a]">
              {lang === 'vi' ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'}
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
                className={`faq-item border-b border-[rgba(10,10,10,0.12)] transition-colors duration-200 ${
                  isOpen ? 'open bg-slate-50/40' : 'hover:bg-slate-50/20'
                }`}
              >
                {/* 12-Column Question Button */}
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={itemId}
                  onClick={() => toggleRow(idx)}
                  className="w-full text-left grid grid-cols-12 gap-x-4 md:gap-x-6 items-baseline py-6 md:py-7 cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c81e16]"
                >
                  {/* Tabular Number Column (col-span-2 md:col-span-3) */}
                  <div className="col-span-2 md:col-span-3">
                    <span
                      className={`tabular-nums font-mono font-bold text-[15px] md:text-[17px] transition-colors duration-200 ${
                        isOpen
                          ? 'text-[#c81e16]'
                          : 'text-[#0a0a0a]/50 group-hover:text-[#c81e16]'
                      }`}
                    >
                      {item.number}
                    </span>
                  </div>

                  {/* Question Text Column (col-span-9 md:col-span-8) */}
                  <div className="col-span-9 md:col-span-8 pr-2">
                    <span
                      className={`block font-semibold text-[17px] sm:text-[20px] md:text-[22px] tracking-[-0.02em] leading-snug transition-colors duration-200 ${
                        isOpen
                          ? 'text-[#0a0a0a]'
                          : 'text-[#0a0a0a]/85 group-hover:text-[#c81e16]'
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
                      <div className="col-span-12 md:col-start-4 md:col-span-8 max-w-[62ch] pb-7 pt-1 px-2 md:px-0">
                        <p className="text-[14.5px] sm:text-[15.5px] font-normal leading-relaxed text-[#0a0a0a]/70 tracking-[-0.01em]">
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
