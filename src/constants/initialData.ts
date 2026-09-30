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
  titleVi: 'Green Test — Focus Test (%c)',
  titleEn: 'Green Test — Focus Test (%c)',
  subtitleVi: 'Đánh giá khả năng duy trì sự chú ý khi nói',
  subtitleEn: 'Assessing sustained attention while speaking',
  coefficientVi: '%c (Tập trung) & %RFC (Tỉ lệ Quên Yêu Cầu)',
  coefficientEn: '%c (Focus) & %RFC (Requests Forgotten Coefficient)',
  duration: '45 phút (1-on-1 với CiC)',
  challengesCount: 49,
  levelsCount: 7,
  coreQuestionVi: 'Bạn có thể giữ một ý tưởng và cấu trúc câu, tiếp tục thực hiện yêu cầu sau khi được sửa lỗi?',
  coreQuestionEn: 'Can you preserve an idea and sentence structure, and stay with a request after a correction?',
  focusVi: 'CiC quan sát cách bạn phối hợp Chuyển động–Âm thanh–Cảm xúc (MSE), phản hồi sau tiếng chuông và nhận biết lỗi vừa được sửa khi áp lực ngôn ngữ và yêu cầu vận động tăng lên.',
  focusEn: 'The CiC observes how you coordinate Motion–Sound–Emotion (MSE), respond after the bell and stay aware of a correction as linguistic and movement demands increase.',
  theoryHighlightsVi: [
    '45 phút, 49 thử thách qua 7 cấp độ; gồm 21 thử thách nghe, 21 thử thách nói và 7 thử thách tổng hợp.',
    'Lỗi lặp lại, chậm phản hồi và quên yêu cầu làm tăng %RFC, ảnh hưởng đến điểm tập trung %c.',
    'Mục đích là quan sát điều gì xảy ra sau khi lỗi được sửa, không chỉ kiểm tra vốn từ vựng.',
  ],
  theoryHighlightsEn: [
    '45 minutes, 49 challenges across 7 levels: 21 listening, 21 speaking and 7 integrated challenges.',
    'Repeated mistakes, delays and missed requests raise %RFC, affecting the focus score %c.',
    'The assessment observes what happens after a correction, rather than testing vocabulary alone.',
  ],
};

export const RED_TEST_INFO: AssessmentInfo = {
  type: 'red',
  titleVi: 'Red Test — Improvisation Test (%r)',
  titleEn: 'Red Test — Improvisation Test (%r)',
  subtitleVi: 'Đánh giá khả năng ứng biến và giữ mạch logic',
  subtitleEn: 'Assessing improvisation and sequential logic',
  coefficientVi: '%r (Ứng biến) & %RFC (Tỉ lệ Quên Yêu Cầu)',
  coefficientEn: '%r (Improvisation) & %RFC (Requests Forgotten Coefficient)',
  duration: '45 phút (1-on-1 với CiC)',
  challengesCount: 49,
  levelsCount: 7,
  coreQuestionVi: 'Bạn có thể chuyển hướng một ý tưởng theo các gợi ý bất ngờ mà vẫn giữ mạch logic?',
  coreQuestionEn: 'Can you redirect an idea under unexpected hints while keeping the sequence logical?',
  focusVi: 'CiC quan sát cách bạn đưa từng gợi ý vào câu chuyện theo đúng thứ tự, điều chỉnh hướng diễn đạt và duy trì sự phối hợp Chuyển động–Âm thanh–Cảm xúc (MSE) trong lúc nói.',
  focusEn: 'The CiC observes how you incorporate hints in order, change the direction of an idea and maintain Motion–Sound–Emotion (MSE) coordination while speaking.',
  theoryHighlightsVi: [
    '45 phút, 49 thử thách qua 7 phiên; gồm 21 thử thách nói tiếng Việt, 21 thử thách nói tiếng Anh và 7 thử thách tổng hợp.',
    'Gợi ý xuất hiện lần lượt; bạn cần dùng chúng theo thứ tự và kết thúc câu trả lời bằng gợi ý cuối.',
    'Tính mạch lạc và logic theo trình tự là trọng tâm; ngữ pháp hoàn hảo không phải tiêu chí chính.',
  ],
  theoryHighlightsEn: [
    '45 minutes, 49 challenges across 7 sessions: 21 Vietnamese speaking, 21 English speaking and 7 integrated challenges.',
    'Hints arrive one by one; use them in order and end the response with the final hint.',
    'Coherence and sequential logic matter most; perfect grammar is not the main criterion.',
  ],
};
