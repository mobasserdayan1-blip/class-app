import React, { useState } from 'react';
import { FileCheck2, X, ShieldAlert, Check } from 'lucide-react';
import { 
  Student, 
  ClassActivity, 
  DescriptiveGrade, 
  ActivityEvaluation,
  AttendanceStatus 
} from '../types';
import { 
  DESCRIPTIVE_GRADES_CONFIG, 
  ATTENDANCE_STATUS_CONFIG 
} from '../utils/persianDate';

interface ActivityGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  activity: ClassActivity | null;
  currentAttendanceStatus: AttendanceStatus;
  currentEvaluation?: ActivityEvaluation;
  onSaveEvaluation: (evaluation: {
    activityId: string;
    studentId: string;
    grade: DescriptiveGrade;
    teacherFeedback?: string;
  }) => void;
}

export const ActivityGradingModal: React.FC<ActivityGradingModalProps> = ({
  isOpen,
  onClose,
  student,
  activity,
  currentAttendanceStatus,
  currentEvaluation,
  onSaveEvaluation,
}) => {
  if (!isOpen || !student || !activity) return null;

  const isExcusedExit = currentAttendanceStatus === 'excused_exit';
  const isAbsent = currentAttendanceStatus === 'absent';

  const defaultGrade: DescriptiveGrade = isExcusedExit
    ? 'excused_absence'
    : currentEvaluation?.grade || 'very_good';

  const [grade, setGrade] = useState<DescriptiveGrade>(defaultGrade);
  const [feedback, setFeedback] = useState(
    currentEvaluation?.teacherFeedback ||
      (isExcusedExit ? 'انجام‌نشده به علت خروج با اجازه مدرسه (بدون کسر نمره)' : '')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEvaluation({
      activityId: activity.id,
      studentId: student.id,
      grade,
      teacherFeedback: feedback.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* هدر */}
        <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">ثبت ارزشیابی توصیفی</h3>
              <p className="text-xs text-white/90">
                {student.firstName} {student.lastName} · {activity.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بدنه */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          {/* هشدار هوشمند در صورت خروج موجه در زمان فعالیت */}
          {isExcusedExit && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                دانش‌آموز در این زنگ با اجازه خارج شده است. بر اساس آیین‌نامه، وضعیت باید به عنوان <strong>«انجام‌نشده به علت خروج»</strong> ثبت شود تا نمره منفی دریافت نکند.
              </div>
            </div>
          )}

          {/* مقیاس‌های توصیفی */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              سطح عملکرد دانش‌آموز:
            </label>
            <div className="space-y-1.5">
              {(
                [
                  'very_good',
                  'good',
                  'acceptable',
                  'needs_effort',
                  'excused_absence',
                ] as DescriptiveGrade[]
              ).map((g) => {
                const conf = DESCRIPTIVE_GRADES_CONFIG[g];
                const isSelected = grade === g;

                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{conf.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {conf.description}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* بازخورد توصیفی معلم */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              یادداشت توصیفی معلم برای کارنامه:
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="توضیحات تکمیلی معلم در مورد یادگیری..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
            />
          </div>

          {/* دکمه‌های تایید */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              ذخیره ارزشیابی
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
