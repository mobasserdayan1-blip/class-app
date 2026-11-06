import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Phone, X } from 'lucide-react';
import { Student, Period, DayAttendanceMap } from '../types';
import { ClassInfo } from '../utils/storage';
import { getPersianToday, toPersianDigits } from '../utils/persianDate';

interface SmsModalProps {
  isOpen: boolean;
  student: Student | null;
  type: 'exit' | 'absent' | 'evaluation';
  period: Period | null;
  attendance: DayAttendanceMap;
  classInfo: ClassInfo;
  onClose: () => void;
}

export const SmsModal: React.FC<SmsModalProps> = ({
  isOpen,
  student,
  type,
  period,
  attendance,
  classInfo,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  const today = getPersianToday();
  const [copied, setCopied] = useState(false);

  // واکشی سابقه زنگ
  const rec = period ? attendance[student.id]?.[period.id] : undefined;

  let defaultText = '';

  if (type === 'exit') {
    const exitTime = rec?.exitDetails?.exitTime || '۱۰:۱۵';
    const reason = rec?.exitDetails?.reason || 'مراجعه به پزشک با هماهنگی اولیا';
    const periodTitle = period?.title || 'زنگ تحصیلی';

    defaultText = `اولیاء گرامی دانش‌آموز ${student.firstName} ${student.lastName}،
با سلام؛
به استحضار می‌رساند فرزند محترمتان در تاریخ ${today.fullDate} در ${periodTitle} (ساعت ${toPersianDigits(exitTime)}) با اجازه مدرسه و به علت «${reason}» از مدرسه خارج شده است.
سوابق آزمون‌های قبلی ایشان محفوظ می‌باشد.

با احترام،
${classInfo.schoolName} (${classInfo.teacherName})`;
  } else if (type === 'absent') {
    defaultText = `اولیاء گرامی دانش‌آموز ${student.firstName} ${student.lastName}،
با سلام؛
به استحضار می‌رساند فرزند شما در تاریخ ${today.fullDate} در کلاس درس حضور نداشته است.
خواهشمند است در اسرع وقت علت غیبت را با دفتر مدرسه هماهنگ فرمایید.

با احترام،
${classInfo.schoolName} - ${classInfo.className}`;
  } else {
    defaultText = `اولیاء گرامی دانش‌آموز ${student.firstName} ${student.lastName}،
با سلام؛
گزارش ارزشیابی توصیفی و پیشرفت تحصیلی فرزند شما در سامانه کلاسی ثبت گردید.

با احترام،
${classInfo.teacherName} - ${classInfo.schoolName}`;
  }

  const [messageText, setMessageText] = useState(defaultText);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* هدر */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">تولید خودکار متن پیامک به اولیا</h3>
              <p className="text-xs text-white/90">
                گیرنده: ولی دانش‌آموز {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بدنه */}
        <div className="p-5 space-y-4 text-sm">
          
          {/* شماره تماس */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">شماره موبایل ولی:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {toPersianDigits(student.parentPhone)}
              </span>
            </div>

            <a
              href={`sms:${student.parentPhone}?body=${encodeURIComponent(messageText)}`}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              ارسال مستقیم پیامک
            </a>
          </div>

          {/* متن پیامک با امکان ویرایش */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                متن پیامک آماده (قابل ویرایش):
              </label>
              <span className="text-[11px] text-slate-400">
                {toPersianDigits(messageText.length)} نویسه
              </span>
            </div>
            <textarea
              rows={7}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs leading-relaxed"
            />
          </div>

          {/* دکمه‌های اقدام */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              بستن
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'متن پیامک کپی شد!' : 'کپی متن پیامک'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
