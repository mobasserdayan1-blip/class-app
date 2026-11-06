import React, { useState } from 'react';
import { LogOut, LogIn, Clock, ShieldCheck, X } from 'lucide-react';
import { Student, Period, ExitDetails } from '../types';
import { toPersianDigits } from '../utils/persianDate';

interface ExitReturnModalProps {
  isOpen: boolean;
  mode: 'exit' | 'return';
  student: Student | null;
  period: Period | null;
  currentExitDetails?: ExitDetails;
  onClose: () => void;
  onSubmitExit: (details: ExitDetails) => void;
  onSubmitReturn: (returnTime: string) => void;
}

const COMMON_REASONS = [
  'مراجعه به پزشک با هماهنگی قبلی اولیا',
  'حال نامساعد جسمی و ارجاع به درمانگاه',
  'امور اضطراری خانوادگی',
  'شرکت در مسابقات علمی یا ورزشی منطقه',
  'هماهنگی مستقیم توسط اولیای محترم',
];

export const ExitReturnModal: React.FC<ExitReturnModalProps> = ({
  isOpen,
  mode,
  student,
  period,
  currentExitDetails,
  onClose,
  onSubmitExit,
  onSubmitReturn,
}) => {
  if (!isOpen || !student || !period) return null;

  // مقداردهی اولیه ساعت جاری
  const now = new Date();
  const defaultHour = String(now.getHours()).padStart(2, '0');
  const defaultMin = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${defaultHour}:${defaultMin}`;

  // وضعیت‌های فرم خروج
  const [exitTime, setExitTime] = useState(currentTime);
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('دفتر مدیریت و معاونت انضباطی');

  // فرم بازگشت
  const [returnTime, setReturnTime] = useState(currentTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'exit') {
      const finalReason = customReason.trim() ? customReason.trim() : reason;
      onSubmitExit({
        exitTime,
        reason: finalReason,
        authorizedBy,
      });
    } else {
      onSubmitReturn(returnTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* هدر مودال */}
        <div className={`p-4 sm:p-5 flex items-center justify-between text-white ${
          mode === 'exit' ? 'bg-amber-600' : 'bg-sky-600'
        }`}>
          <div className="flex items-center gap-2.5">
            {mode === 'exit' ? (
              <div className="p-2 bg-white/20 rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 bg-white/20 rounded-xl">
                <LogIn className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold">
                {mode === 'exit' ? 'ثبت خروج با اجازه مدرسه' : 'ثبت بازگشت دانش‌آموز به مدرسه'}
              </h3>
              <p className="text-xs text-white/90">
                {student.firstName} {student.lastName} ({period.title})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          {mode === 'exit' ? (
            <>
              {/* پیام محافظت از نمرات و فعالیت‌ها */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>تضمین حقوق آموزشی:</strong> با ثبت خروج، آزمون‌ها و فعالیت‌های زنگ‌های قبلی بدون تغییر حفظ می‌شوند و آزمون‌های زنگ‌های پس از خروج، با نشان «انجام‌نشده به علت خروج موجه» ثبت خواهند شد تا نمره منفی ثبت نگردد.
                </div>
              </div>

              {/* ساعت خروج */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ساعت خروج از مدرسه
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    required
                    className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* علت خروج */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  علت خروج با اجازه
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs"
                >
                  {COMMON_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="سایر">علت دیگر (تایپ دستی)...</option>
                </select>

                {reason === 'سایر' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="علت خروج دانش‌آموز را بنویسید..."
                    required
                    className="mt-2 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs"
                  />
                )}
              </div>

              {/* تاییدکننده */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  تاییدکننده یا هماهنگ‌کننده خروج
                </label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs"
                />
              </div>
            </>
          ) : (
            <>
              {/* فرم ثبت بازگشت دانش‌آموز */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 text-sky-800 dark:text-sky-200 text-xs">
                <LogIn className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  دانش‌آموز پس از خروج مجدداً به کلاس بازگشته است. با ثبت بازگشت، وضعیت حضور در زنگ‌های آتی به حالت حاضر بازخواهد گشت.
                </div>
              </div>

              {currentExitDetails && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                  <div>ساعت خروج قبلی: {toPersianDigits(currentExitDetails.exitTime)}</div>
                  <div>علت خروج: {currentExitDetails.reason}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ساعت بازگشت به مدرسه
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    required
                    className="w-full pr-10 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {/* دکمه‌های تایید و انصراف */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors ${
                mode === 'exit' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {mode === 'exit' ? 'ثبت نهایی خروج با اجازه' : 'تایید بازگشت به مدرسه'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
