import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';

export interface SlotSelection {
  dateStr: string; // e.g. "2026-10-02"
  displayDate: string; // e.g. "Thứ Sáu, 02/10/2026"
  timeStr: string; // e.g. "19:00 - 19:45"
  fullSlotString: string; // e.g. "Thứ Sáu, 02/10/2026 (19:00 - 19:45)"
}

interface BookingCalendarProps {
  lang: 'vi' | 'en';
  onSelectSlot: (slot: SlotSelection) => void;
  initialDate?: string;
  initialTime?: string;
  bookedSlots?: string[]; // Optional list of already reserved slot strings
}

interface DaySlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  available: boolean;
  tag?: string;
}

const DAILY_TIME_SLOTS: DaySlot[] = [
  // Morning
  { time: '09:00 - 09:45', period: 'morning', available: true },
  { time: '10:30 - 11:15', period: 'morning', available: true },
  // Afternoon
  { time: '14:00 - 14:45', period: 'afternoon', available: true },
  { time: '15:30 - 16:15', period: 'afternoon', available: true },
  { time: '16:45 - 17:30', period: 'afternoon', available: true },
  // Evening (High Demand)
  { time: '19:00 - 19:45', period: 'evening', available: true, tag: 'HOT' },
  { time: '20:00 - 20:45', period: 'evening', available: true, tag: 'HOT' },
  { time: '21:00 - 21:45', period: 'evening', available: true },
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  lang,
  onSelectSlot,
  initialDate,
  initialTime,
  bookedSlots = [],
}) => {
  // Base date calculation
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Current view month
  const [viewDate, setViewDate] = useState(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Selected date (defaults to tomorrow if not set)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) {
        d.setHours(0, 0, 0, 0);
        return d;
      }
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  // Selected time slot
  const [selectedTime, setSelectedTime] = useState<string>(
    initialTime || '19:00 - 19:45'
  );

  const [periodFilter, setPeriodFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Month navigation
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
    // Adjust for Monday start (0 = Mon, 6 = Sun)
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  // Format date helper
  const formatDateISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatDisplayDate = (d: Date) => {
    if (lang === 'vi') {
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = weekdays[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      return `${dayName}, ${dayNum}/${monthNum}/${d.getFullYear()}`;
    }
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if a day is selectable (from today up to 45 days in future)
  const isDateSelectable = (d: Date) => {
    const timeDiff = d.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff >= 0 && dayDiff <= 45;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Emit chosen selection
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(date);

    const dateISO = formatDateISO(date);
    const displayDate = formatDisplayDate(date);
    const fullSlotString = `${displayDate} (${selectedTime})`;

    onSelectSlot({
      dateStr: dateISO,
      displayDate,
      timeStr: selectedTime,
      fullSlotString,
    });
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);

    const dateISO = formatDateISO(selectedDate);
    const displayDate = formatDisplayDate(selectedDate);
    const fullSlotString = `${displayDate} (${time})`;

    onSelectSlot({
      dateStr: dateISO,
      displayDate,
      timeStr: time,
      fullSlotString,
    });
  };

  // Filter slots for chosen period
  const visibleSlots = useMemo(() => {
    if (periodFilter === 'all') return DAILY_TIME_SLOTS;
    return DAILY_TIME_SLOTS.filter((s) => s.period === periodFilter);
  }, [periodFilter]);

  const monthTitle = useMemo(() => {
    if (lang === 'vi') {
      return `Tháng ${viewDate.getMonth() + 1}, ${viewDate.getFullYear()}`;
    }
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate, lang]);

  const weekHeaders = lang === 'vi' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="border border-[rgba(10,10,10,0.14)] bg-white p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(10,10,10,0.1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#c81e16]" />
            <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]/60">
              {lang === 'vi' ? 'LỊCH ĐÁNH GIÁ 1-ON-1 TRỰC TIẾP' : '1-ON-1 EVALUATION SCHEDULE'}
            </span>
          </div>
          <h3 className="text-[17px] font-bold text-[#0a0a0a] mt-1">
            {lang === 'vi' ? 'Chọn Ngày & Khung Giờ Đánh Giá' : 'Select Date & Available Time Slot'}
          </h3>
          <p className="text-[12.5px] text-[#0a0a0a]/65 font-light mt-0.5">
            {lang === 'vi'
              ? 'Thời lượng 45 phút với Chunker-in-Charge (CiC). Lịch đã chọn sẽ được đồng bộ trực tiếp lên hệ thống Firestore.'
              : '45-minute private evaluation with CiC. Your selection syncs automatically with Firestore.'}
          </p>
        </div>

        {/* Selected Slot Summary Ribbon */}
        <div className="bg-slate-50 border border-[rgba(10,10,10,0.12)] p-2.5 sm:p-3 min-w-[240px]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#0a0a0a]/50">
            {lang === 'vi' ? 'ĐANG CHỌN / SELECTED' : 'SELECTED WINDOW'}
          </div>
          <div className="font-bold text-[13.5px] text-[#0a0a0a] mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#c81e16]" />
            <span>{selectedTime}</span>
          </div>
          <div className="text-[12px] text-[#0a0a0a]/75 font-mono">
            {formatDisplayDate(selectedDate)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Month View (5 columns on desktop) */}
        <div className="lg:col-span-6 border border-[rgba(10,10,10,0.12)] p-4 bg-slate-50/50">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-[14px] text-[#0a0a0a] uppercase tracking-wide font-mono">
              {monthTitle}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-1.5 border border-[rgba(10,10,10,0.15)] bg-white hover:border-[#0a0a0a] text-[#0a0a0a] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-1.5 border border-[rgba(10,10,10,0.15)] bg-white hover:border-[#0a0a0a] text-[#0a0a0a] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-[#0a0a0a]/50 font-semibold mb-2 pb-1 border-b border-[rgba(10,10,10,0.08)]">
            {weekHeaders.map((head, idx) => (
              <div key={idx} className={idx >= 5 ? 'text-[#c81e16]' : ''}>
                {head}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const selectable = isDateSelectable(item.date) && item.isCurrentMonth;
              const isSelected = isSameDay(item.date, selectedDate);
              const isToday = isSameDay(item.date, today);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!selectable}
                  onClick={() => handleDateClick(item.date)}
                  className={`h-9 flex flex-col items-center justify-center text-xs font-mono transition-all relative ${
                    !item.isCurrentMonth
                      ? 'text-[#0a0a0a]/20 cursor-not-allowed'
                      : !selectable
                      ? 'text-[#0a0a0a]/30 cursor-not-allowed bg-transparent'
                      : isSelected
                      ? 'bg-[#0a0a0a] text-white font-bold ring-2 ring-[#c81e16] ring-offset-1 cursor-pointer'
                      : 'bg-white hover:bg-slate-100 hover:border-[#0a0a0a] border border-[rgba(10,10,10,0.08)] text-[#0a0a0a] cursor-pointer'
                  }`}
                >
                  <span>{item.date.getDate()}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#c81e16] absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between text-[11px] font-mono text-[#0a0a0a]/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c81e16]" />
              <span>{lang === 'vi' ? 'Hôm nay' : 'Today'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#0a0a0a] inline-block" />
              <span>{lang === 'vi' ? 'Đã chọn' : 'Selected'}</span>
            </div>
          </div>
        </div>

        {/* Available Time Slots for Selected Date (7 columns on desktop) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a]/70">
              {lang === 'vi' ? 'KHUNG GIỜ KHẢ DỤNG' : 'AVAILABLE SLOTS'}
            </span>

            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              {(['all', 'morning', 'afternoon', 'evening'] as const).map((p) => {
                const labelMap = {
                  all: lang === 'vi' ? 'Tất cả' : 'All',
                  morning: lang === 'vi' ? 'Sáng' : 'AM',
                  afternoon: lang === 'vi' ? 'Chiều' : 'PM',
                  evening: lang === 'vi' ? 'Tối' : 'Eve',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriodFilter(p)}
                    className={`px-2 py-0.5 text-[11px] font-mono border transition-colors cursor-pointer ${
                      periodFilter === p
                        ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white font-semibold'
                        : 'border-[rgba(10,10,10,0.15)] bg-white text-[#0a0a0a]/70 hover:border-[#0a0a0a]'
                    }`}
                  >
                    {labelMap[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {visibleSlots.map((slot, idx) => {
              const isSelected = selectedTime === slot.time;
              const slotSignature = `${formatDateISO(selectedDate)}_${slot.time}`;
              const isBooked = bookedSlots.includes(slotSignature);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isBooked}
                  onClick={() => handleTimeClick(slot.time)}
                  className={`p-3 border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isBooked
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'border-[#0a0a0a] bg-slate-50 ring-1 ring-[#0a0a0a]'
                      : 'border-[rgba(10,10,10,0.15)] bg-white hover:border-[#0a0a0a]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[13px] text-[#0a0a0a]">
                      <Clock className="w-3.5 h-3.5 text-[#0a0a0a]/50" />
                      <span>{slot.time}</span>
                    </div>
                    <div className="text-[11px] text-[#0a0a0a]/55 font-light">
                      {slot.period === 'morning'
                        ? (lang === 'vi' ? 'Buổi sáng (45 phút)' : 'Morning (45 mins)')
                        : slot.period === 'afternoon'
                        ? (lang === 'vi' ? 'Buổi chiều (45 phút)' : 'Afternoon (45 mins)')
                        : (lang === 'vi' ? 'Buổi tối (45 phút)' : 'Evening (45 mins)')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {slot.tag && !isBooked && (
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 bg-rose-50 text-[#c81e16] border border-rose-200 font-semibold">
                        {slot.tag}
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 text-[11.5px] text-amber-900 leading-relaxed font-light">
            {lang === 'vi'
              ? '💡 Lưu ý: Mỗi khung giờ là buổi đánh giá 1-on-1 riêng tư 45 phút. CiC sẽ gọi điện hoặc nhắn tin Zalo xác nhận link phòng trước buổi test.'
              : '💡 Note: Each slot is an exclusive 45-minute 1-on-1 session. CiC coordinates the confidential room link beforehand.'}
          </div>
        </div>
      </div>
    </div>
  );
};
