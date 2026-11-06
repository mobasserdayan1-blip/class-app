import React, { useState } from 'react';
import { 
  FileCheck2, 
  Plus, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Users, 
  Clock, 
  BookOpen, 
  Edit3, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { 
  Student, 
  Period, 
  DayAttendanceMap, 
  ClassActivity, 
  ActivityEvaluation, 
  DescriptiveGrade 
} from '../types';
import { 
  DESCRIPTIVE_GRADES_CONFIG, 
  toPersianDigits 
} from '../utils/persianDate';

interface ActivityManagerProps {
  students: Student[];
  periods: Period[];
  activePeriodId: string;
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  onOpenNewActivityModal: () => void;
  onOpenBatchModal: () => void;
  onOpenGradingModal: (student: Student, activity: ClassActivity) => void;
  onDeleteActivity: (activityId: string) => void;
  onQuickGrade: (activityId: string, studentId: string, grade: DescriptiveGrade) => void;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
  students,
  periods,
  activePeriodId,
  attendance,
  activities,
  evaluations,
  onOpenNewActivityModal,
  onOpenBatchModal,
  onOpenGradingModal,
  onDeleteActivity,
  onQuickGrade,
}) => {
  // انتخاب فعالیت فعال برای مشاهده جدول نمرات
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    activities[0]?.id || ''
  );

  const activeActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];
  const activityPeriod = periods.find((p) => p.id === activeActivity?.periodId);

  return (
    <div className="space-y-6">
      
      {/* نوار سربرگ فعالیت‌ها */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>آزمون‌ها و فعالیت‌های کلاسی</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ارزشیابی کیفی و توصیفی دانش‌آموزان به تفکیک زنگ با حفظ کامل سوابق زنگ‌های قبل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBatchModal}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>ثبت گروهی هوشمند</span>
          </button>
          
          <button
            onClick={onOpenNewActivityModal}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف فعالیت یا آزمون جدید</span>
          </button>
        </div>
      </div>

      {/* انتخاب بین آزمون‌ها */}
      {activities.length === 0 ? (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            هنوز فعالیتی ثبت نشده است
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            برای ثبت آزمون کلاسی، پرسش شفاهی یا تکالیف روی دکمه زیر کلیک کنید.
          </p>
          <button
            onClick={onOpenNewActivityModal}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            تعریف اولین فعالیت
          </button>
        </div>
      ) : (
        <>
          {/* کارت‌های تب فعالیت‌ها */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {activities.map((act) => {
              const isSelected = act.id === (activeActivity?.id || selectedActivityId);
              const p = periods.find((item) => item.id === act.periodId);
              
              // تعداد ارزشیابی شده
              const evalsForThis = evaluations.filter((e) => e.activityId === act.id);

              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedActivityId(act.id)}
                  className={`p-3.5 rounded-xl border text-right transition-all shrink-0 min-w-[220px] ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="truncate">{act.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {act.subject}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>{p?.title || 'زنگ کلاسی'}</span>
                    <span className="tabular-nums">
                      {toPersianDigits(evalsForThis.length)} ثبت‌شده
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* جزئیات فعالیت انتخاب‌شده و جدول ارزشیابی دانش‌آموزان */}
          {activeActivity && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              
              {/* خلاصه فعالیت جاری */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {activeActivity.title}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                      درس: {activeActivity.subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({activityPeriod?.title})
                    </span>
                  </div>
                  {activeActivity.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {activeActivity.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteActivity(activeActivity.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                    title="حذف این فعالیت"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* جدول ارزشیابی دانش‌آموزان */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">کد</th>
                      <th className="py-2.5 px-3">نام و نام خانوادگی</th>
                      <th className="py-2.5 px-3">وضعیت حضور در این زنگ</th>
                      <th className="py-2.5 px-3">ارزشیابی توصیفی</th>
                      <th className="py-2.5 px-3 text-left">اقدام سریع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((student) => {
                      const att = attendance[student.id]?.[activeActivity.periodId] || {
                        status: 'present',
                      };
                      const evalRec = evaluations.find(
                        (e) => e.activityId === activeActivity.id && e.studentId === student.id
                      );

                      // بررسی سناریوی خروج با اجازه
                      const isExcusedExit =
                        att.status === 'excused_exit' ||
                        (att.status === 'absent' && att.exitDetails);

                      const isAbsent = att.status === 'absent' && !att.exitDetails;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {toPersianDigits(student.code)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="py-2.5 px-3">
                            {isExcusedExit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                خروج موجه در این زنگ
                              </span>
                            ) : isAbsent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 font-medium">
                                غایب در این زنگ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                حاضر در کلاس
                              </span>
                            )}
                          </td>

                          {/* ستون وضعیت نمره */}
                          <td className="py-2.5 px-3">
                            {isExcusedExit ? (
                              <div className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800">
                                <span>انجام‌نشده به علت خروج با اجازه (بدون نمره منفی)</span>
                              </div>
                            ) : evalRec ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-lg border font-bold ${
                                    DESCRIPTIVE_GRADES_CONFIG[evalRec.grade].badgeClass
                                  }`}
                                >
                                  {DESCRIPTIVE_GRADES_CONFIG[evalRec.grade].label}
                                </span>
                                {evalRec.teacherFeedback && (
                                  <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
                                    ({evalRec.teacherFeedback})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5" />
                                هنوز ثبت نشده
                              </span>
                            )}
                          </td>

                          {/* کلیدهای سریع انتخاب نمره برای حاضرین */}
                          <td className="py-2.5 px-3 text-left">
                            {isExcusedExit ? (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                محفوظ از نمره منفی
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() =>
                                    onQuickGrade(activeActivity.id, student.id, 'very_good')
                                  }
                                  title="ثبت سریع: خیلی خوب"
                                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                    evalRec?.grade === 'very_good'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  خیلی خوب
                                </button>
                                <button
                                  onClick={() =>
                                    onQuickGrade(activeActivity.id, student.id, 'good')
                                  }
                                  title="ثبت سریع: خوب"
                                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                    evalRec?.grade === 'good'
                                      ? 'bg-sky-600 text-white'
                                      : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 hover:bg-sky-100'
                                  }`}
                                >
                                  خوب
                                </button>
                                <button
                                  onClick={() => onOpenGradingModal(student, activeActivity)}
                                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                                >
                                  بیشتر...
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
