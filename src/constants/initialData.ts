import { TimeSlotOption, AssessmentInfo } from '../types';

export const TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  {
    id: 'weekday-evening',
    labelVi: 'Tối ngày trong tuần (19:00 - 21:00)',
    labelEn: 'Weekday Evening (19:00 - 21:00)',
    descriptionVi: 'Khung giờ phổ biến nhất cho người đi làm (Thứ 2 - Thứ 6)',
    descriptionEn: 'Most preferred by busy professionals (Mon - Fri)',
    badge: 'Phổ biến / Popular',
  },
  {
    id: 'weekend-morning',
    labelVi: 'Sáng cuối tuần (09:00 - 11:00)',
    labelEn: 'Weekend Morning (09:00 - 11:00)',
    descriptionVi: 'Trí não tỉnh táo nhất cho bài kiểm tra áp lực cao (Thứ 7 - CN)',
    descriptionEn: 'Peak cognitive clarity for high-pressure testing (Sat - Sun)',
    badge: 'Tối ưu MSE / Best MSE',
  },
  {
    id: 'weekend-afternoon',
    labelVi: 'Chiều cuối tuần (14:00 - 16:00)',
    labelEn: 'Weekend Afternoon (14:00 - 16:00)',
    descriptionVi: 'Thời gian thảnh thơi, không vướng bận lịch họp (Thứ 7 - CN)',
    descriptionEn: 'Focused block without weekday meeting interruptions',
  },
  {
    id: 'weekday-afternoon',
    labelVi: 'Chiều ngày trong tuần (14:00 - 16:00)',
    labelEn: 'Weekday Afternoon (14:00 - 16:00)',
    descriptionVi: 'Dành cho lịch làm việc linh hoạt hoặc ca chiều',
    descriptionEn: 'Suited for flexible working hours or afternoon slots',
  },
];

export const GREEN_TEST_INFO: AssessmentInfo = {
  type: 'green',
  titleVi: 'Mini-Test 21 Câu — Nhánh Focus (%c)',
  titleEn: 'Mini-Test 21 Questions — Focus Stream (%c)',
  subtitleVi: 'Khảo sát độ nhạy phản xạ và sự tập trung khi nói trực tiếp (Offline)',
  subtitleEn: 'Assessing speech reflex and sustained focus in-person (Offline)',
  coefficientVi: '%c (Tập trung phản xạ) & Khảo sát MSE',
  coefficientEn: '%c (Focus Reflex) & MSE Observation',
  duration: '15 - 20 phút (Trực tiếp Offline 1-on-1)',
  challengesCount: 21,
  levelsCount: 3,
  coreQuestionVi: 'Bạn có thể duy trì sự chú ý, làm theo nhịp phản xạ và phối hợp lời nói khi đối thoại trực tiếp?',
  coreQuestionEn: 'Can you maintain focused speech reflex and follow conversational rhythm in-person?',
  focusVi: 'CiC quan sát trực tiếp sự phối hợp Chuyển động–Âm thanh–Cảm xúc (MSE), tốc độ bắt nhịp và phản xạ ngôn ngữ của bạn qua 21 câu hỏi khảo sát thực tế.',
  focusEn: 'The CiC observes your Motion–Sound–Emotion (MSE) coordination and speech reflex directly through 21 practical diagnostic questions.',
  theoryHighlightsVi: [
    'Thời lượng nhanh gọn: 15 - 20 phút với đúng 21 câu hỏi kiểm tra phản xạ tức thì.',
    'Hình thức Offline: Thực hiện trực tiếp 1-on-1 cùng CiC tại không gian tiêu chuẩn CHUNKS.',
    'Không yêu cầu ôn tập trước; mục đích là ghi nhận phản xạ tự nhiên của bạn ở thời điểm hiện tại.',
  ],
  theoryHighlightsEn: [
    'Concise duration: 15 - 20 minutes with 21 immediate reflex questions.',
    'In-Person (Offline): Conducted 1-on-1 with a CiC in a dedicated CHUNKS assessment room.',
    'No preparation required; the goal is to observe natural speech reflex as it is today.',
  ],
};

export const RED_TEST_INFO: AssessmentInfo = {
  type: 'red',
  titleVi: 'Mini-Test 21 Câu — Nhánh Improvisation (%r)',
  titleEn: 'Mini-Test 21 Questions — Improvisation Stream (%r)',
  subtitleVi: 'Khảo sát khả năng ứng biến linh hoạt và giữ mạch logic trực tiếp (Offline)',
  subtitleEn: 'Assessing improvisation and logical flow in-person (Offline)',
  coefficientVi: '%r (Ứng biến linh hoạt) & Khảo sát MSE',
  coefficientEn: '%r (Improvisation) & MSE Observation',
  duration: '15 - 20 phút (Trực tiếp Offline 1-on-1)',
  challengesCount: 21,
  levelsCount: 3,
  coreQuestionVi: 'Bạn có thể lập tức xoay chuyển ý tưởng khi nhận gợi ý bất ngờ mà câu chuyện vẫn mạch lạc?',
  coreQuestionEn: 'Can you pivot your thoughts smoothly under unexpected cues while staying coherent?',
  focusVi: 'CiC đưa ra các gợi ý ngẫu nhiên qua 21 câu hỏi ngắn để quan sát cách bạn bẻ lái ý tưởng và duy trì nhịp nói tự tin trong phòng đánh giá trực tiếp.',
  focusEn: 'The CiC provides spontaneous cues across 21 short challenges to observe how you pivot ideas and maintain vocal confidence in an in-person setting.',
  theoryHighlightsVi: [
    'Thời lượng nhanh gọn: 15 - 20 phút với 21 tình huống phản xạ bẻ lái ý niệm.',
    'Hình thức Offline: Đánh giá trực tiếp 1-on-1 với CiC, tạo ma sát hội thoại thực tế.',
    'Trọng tâm là sự linh hoạt và tính logic; không bắt bẻ ngữ pháp học thuật.',
  ],
  theoryHighlightsEn: [
    'Concise duration: 15 - 20 minutes with 21 spontaneous redirection challenges.',
    'In-Person (Offline): 1-on-1 live session with a CiC to simulate real conversation friction.',
    'Focuses on agility and narrative flow rather than textbook grammar.',
  ],
};
