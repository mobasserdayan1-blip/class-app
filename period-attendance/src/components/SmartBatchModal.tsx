import React, { useState } from 'react';
import { Sparkles, Users, CheckCircle2, X, FileCheck2, ArrowRight } from 'lucide-react';
import { 
  Student, 
  Period, 
  DayAttendanceMap, 
  ClassActivity, 
  DescriptiveGrade, 
  ActivityEvaluation 
} from '../types';
import { DESCRIPTIVE_GRADES_CONFIG, toPersianDigits } from '../utils/persianDate';

interface SmartBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  periods: Period[];
  activePeriodId: string;
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  selectedStudentIds: string[];
  onApplyBatchEvaluation: (
    activityId: string,
    targetType: 'all_present' | 'selected' | 'unrecorded',
    grade: DescriptiveGrade,
    feedback?: string
  ) => void;
}

export const SmartBatchModal: React.FC<SmartBatchModalProps> = ({
  isOpen,
  onClose,
  students,
  periods,
  activePeriodId,
  attendance,
  activities,
  evaluations,
  selectedStudentIds,
  onApplyBatchEvaluation,
}) => {
  if (!isOpen) return null;

  const currentPeriod = periods.find((p) => p.id === activePeriodId) || periods[0];
  const periodActivities = activities.filter((a) => a.periodId === activePeriodId);

  // فعالیت انتخابی
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    periodActivities[0]?.id || activities[0]?.id || ''
  );

  // جامعه هدف
  const [targetType, setTargetType] = useState<'all_present' | 'selected' | 'unrecorded'>('all_present');

  // نمره توصیفی مد نظر
  const [selectedGrade, setSelectedGrade] = useState<DescriptiveGrade>('very_good');

  // یادداشت اختیاری معلم
  const [feedback, setFeedback] = useState('انجام کامل و مطلوب فعالیت کلاسی');

  // محاسبه تعداد نفرات تحت تاثیر
  const presentCount = students.filter((s) => {
    const st = attendance[s.id]?.[activePeriodId]?.status;
    return st === 'present' || st === 'returned';
  }).length;

  const selectedCount = selectedStudentIds.length;

  const unrecordedCount = students.filter((s) => {
    const st = attendance[s.id]?.[activePeriodId]?.status;
    const isPresent = st === 'present' || st === 'returned';
    if (!isPresent) return false;
    const hasEval = evaluations.some(
      (e) => e.activityId === selectedActivityId && e.studentId === s.id
    );
    return !hasEval;
  }).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) return;
    onApplyBatchEvaluation(selectedActivityId, targetType, selectedGrade, feedback.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* هدر */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">ثبت گروهی هوشمند نمرات و فعالیت‌ها</h3>
              <p className="text-xs text-white/90">
                ثبت سریع بازخورد کلاسی برای چند دانش‌آموز در چند ثانیه
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

        {/* بدنه فرم */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          {/* انتخاب آزمون یا فعالیت */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              آزمون یا فعالیت مورد نظر:
            </label>
            {activities.length === 0 ? (
              <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200">
                ابتدا یک آزمون یا فعالیت در تب «فعالیت‌ها و آزمون‌ها» تعریف کنید.
              </div>
            ) : (
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.subject}) - مرتبط با {periods.find(p => p.id === a.periodId)?.title || 'زنگ'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* جامعه هدف برای ثبت گروهی (۳ حالت مشخص شده توسط کاربر) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              اعمال ارزشیابی روی کدام گروه انجام شود؟
            </label>
            <div className="space-y-2">
              
              {/* گزینه ۱: همه حاضرین این زنگ */}
              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                targetType === 'all_present'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'all_present'}
                    onChange={() => setTargetType('all_present')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      همه حاضرین در {currentPeriod.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      افرادی که در کلاس حاضرند (خارج‌شدگان مستثنی می‌شوند)
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                  {toPersianDigits(presentCount)} نفر
                </span>
              </label>

              {/* گزینه ۲: فقط ثبت‌نشده‌ها */}
              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                targetType === 'unrecorded'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'unrecorded'}
                    onChange={() => setTargetType('unrecorded')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      فقط دانش‌آموزان ثبت‌نشده
                    </div>
                    <div className="text-[11px] text-slate-500">
                      حاضرینی که هنوز برای این فعالیت ارزشیابی نشده‌اند
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900">
                  {toPersianDigits(unrecordedCount)} نفر
                </span>
              </label>

              {/* گزینه ۳: فقط افراد انتخاب‌شده */}
              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                targetType === 'selected'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'selected'}
                    onChange={() => setTargetType('selected')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      فقط افراد تیک‌خورده / انتخاب‌شده
                    </div>
                    <div className="text-[11px] text-slate-500">
                      دانش‌آموزانی که با چک‌باکس علامت زدید
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900">
                  {toPersianDigits(selectedCount)} نفر
                </span>
              </label>

            </div>
          </div>

          {/* انتخاب نمره توصیفی */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              بازخورد توصیفی مورد نظر:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['very_good', 'good', 'acceptable', 'needs_effort'] as DescriptiveGrade[]).map((grade) => {
                const conf = DESCRIPTIVE_GRADES_CONFIG[grade];
                const isSelected = selectedGrade === grade;

                return (
                  <button
                    type="button"
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {conf.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {conf.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* بازخورد متنی اختیاری معلم */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              توضیح یا یادداشت توصیفی معلم (اختیاری):
            </label>
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="مثلاً: فعالیت کلاسی عالی، تسلط مناسب..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
            />
          </div>

          {/* دکمه‌های تایید */}
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
              disabled={!selectedActivityId}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              ثبت گروهی نمرات
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
