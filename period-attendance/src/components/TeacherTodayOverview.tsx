import React from 'react';
import { 
  Users, 
  UserX, 
  LogOut, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageSquare, 
  Sparkles,
  ArrowLeft,
  LogIn
} from 'lucide-react';
import { 
  Student, 
  Period, 
  DayAttendanceMap, 
  ClassActivity, 
  ActivityEvaluation 
} from '../types';
import { toPersianDigits, ATTENDANCE_STATUS_CONFIG } from '../utils/persianDate';

interface TeacherTodayOverviewProps {
  students: Student[];
  periods: Period[];
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  activePeriodId: string;
  onSelectPeriod: (periodId: string) => void;
  onOpenExitModal: (student: Student) => void;
  onOpenReturnModal: (student: Student) => void;
  onOpenSmsModal: (student: Student, type: 'exit' | 'absent' | 'evaluation') => void;
  onOpenBatchModal: () => void;
  onOpenActivityModal: (activity?: ClassActivity) => void;
  onNavigateToAttendance: () => void;
  onNavigateToActivities: () => void;
}

export const TeacherTodayOverview: React.FC<TeacherTodayOverviewProps> = ({
  students,
  periods,
  attendance,
  activities,
  evaluations,
  activePeriodId,
  onSelectPeriod,
  onOpenExitModal,
  onOpenReturnModal,
  onOpenSmsModal,
  onOpenBatchModal,
  onOpenActivityModal,
  onNavigateToAttendance,
  onNavigateToActivities,
}) => {
  const currentPeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  // محاسبه آمار کلی
  const totalStudentsCount = students.length;

  // وضعیت در زنگ جاری
  let presentNowCount = 0;
  let absentNowCount = 0;
  let exitNowCount = 0;

  students.forEach((s) => {
    const status = attendance[s.id]?.[currentPeriod?.id]?.status || 'present';
    if (status === 'present' || status === 'returned') presentNowCount++;
    else if (status === 'absent') absentNowCount++;
    else if (status === 'excused_exit') exitNowCount++;
  });

  // استخراج دانش‌آموزانی که در هر یک از زنگ‌های امروز خروج با اجازه داشته‌اند
  const exitedStudents: {
    student: Student;
    period: Period;
    exitDetails: any;
    isReturned: boolean;
  }[] = [];

  students.forEach((student) => {
    periods.forEach((period) => {
      const record = attendance[student.id]?.[period.id];
      if (record?.status === 'excused_exit' && record.exitDetails) {
        // آیا بعداً برگشته است؟
        const laterReturned = periods.some(
          (p) => p.order > period.order && attendance[student.id]?.[p.id]?.status === 'returned'
        );
        exitedStudents.push({
          student,
          period,
          exitDetails: record.exitDetails,
          isReturned: laterReturned,
        });
      }
    });
  });

  // دانش‌آموزانی که امروز غایب بوده‌اند (حداقل یک زنگ غایب سنتی و نه خروج)
  const absentStudents: {
    student: Student;
    absentPeriods: Period[];
  }[] = [];

  students.forEach((student) => {
    const absPeriods = periods.filter(
      (p) => attendance[student.id]?.[p.id]?.status === 'absent' && !attendance[student.id]?.[p.id]?.exitDetails
    );
    if (absPeriods.length > 0) {
      absentStudents.push({ student, absentPeriods: absPeriods });
    }
  });

  // فعالیت‌ها و آزمون‌های ثبت‌نشده:
  // برای هر فعالیت، چه تعداد از حاضرین هنوز ارزیابی نشده‌اند؟
  const pendingActivityItems: {
    activity: ClassActivity;
    period: Period | undefined;
    totalEligible: number;
    evaluatedCount: number;
    pendingStudents: Student[];
  }[] = activities.map((activity) => {
    const actPeriod = periods.find((p) => p.id === activity.periodId);
    // فقط حاضرین این زنگ واجد شرایط ارزیابی هستند
    const eligibleStudents = students.filter((s) => {
      const st = attendance[s.id]?.[activity.periodId]?.status;
      return st === 'present' || st === 'returned';
    });
    const evaluatedIds = new Set(
      evaluations.filter((e) => e.activityId === activity.id).map((e) => e.studentId)
    );
    const pendingStudents = eligibleStudents.filter((s) => !evaluatedIds.has(s.id));

    return {
      activity,
      period: actPeriod,
      totalEligible: eligibleStudents.length,
      evaluatedCount: eligibleStudents.length - pendingStudents.length,
      pendingStudents,
    };
  });

  const totalPendingEvaluations = pendingActivityItems.reduce(
    (sum, item) => sum + item.pendingStudents.length,
    0
  );

  return (
    <div className="space-y-6">
      
      {/* پیام راهنمای هوشمند بالای صفحه */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-100 text-xs font-medium mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>داشبورد اختصاصی مدیریت کلاس و زنگ‌ها</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              نمای امروز معلم · {currentPeriod?.title}
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
              وضعیت حضور، خروج‌های موجه و نتایج فعالیت‌ها در هر زنگ ثبت شده و خروج موجه هیچ نمره منفی به دانش‌آموز وارد نمی‌کند.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-sm transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>ثبت گروهی هوشمند</span>
            </button>
            <button
              onClick={() => onOpenActivityModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/20 rounded-xl transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>آزمون یا فعالیت جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* کارت‌های شاخص کلیدی عملکرد (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* کل دانش‌آموزان و حاضرین */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">حاضرین زنگ جاری</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(presentNowCount)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              از {toPersianDigits(totalStudentsCount)} نفر
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            نرخ حضور: {toPersianDigits(Math.round((presentNowCount / totalStudentsCount) * 100))}%
          </div>
        </div>

        {/* خروج‌های زودهنگام با اجازه */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">خروج با اجازه امروز</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(exitedStudents.length)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">مورد ثبت‌شده</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            سوابق آزمون‌های قبلی محفوظ است
          </div>
        </div>

        {/* غایبین امروز */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">غایبین مدرسه</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(absentStudents.length)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">نفر</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            امکان ارسال پیامک فوری به اولیا
          </div>
        </div>

        {/* آزمون‌ها و فعالیت‌های ثبت‌نشده */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">ارزشیابی‌های ثبت‌نشده</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(totalPendingEvaluations)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">نفر - فعالیت</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            {toPersianDigits(activities.length)} آزمون / فعالیت تعریف‌شده
          </div>
        </div>

      </div>

      {/* ۲ ستون اصلی: ستون راست (خروج و غیبت‌ها) و ستون چپ (آزمون‌ها و ثبت‌نشده‌ها) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* بخش اول: دانش‌آموزان دارای خروج موجه */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                خروج‌های زودهنگام با اجازه مدرسه
              </h2>
            </div>
            <button
              onClick={onNavigateToAttendance}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>مشاهده در دفتر حضور</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {exitedStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              امروز هیچ موردی از خروج زودهنگام ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {exitedStudents.map(({ student, period, exitDetails, isReturned }) => (
                <div
                  key={`${student.id}-${period.id}`}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                        {period.title}
                      </span>
                      {isReturned && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                          بازگشته
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        ساعت خروج: {toPersianDigits(exitDetails.exitTime)}
                      </span>
                      <span>علت: {exitDetails.reason}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      تاییدکننده: {exitDetails.authorizedBy}
                    </div>
                  </div>

                  {/* دکمه‌های اقدام سریع */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isReturned ? (
                      <button
                        onClick={() => onOpenReturnModal(student)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 rounded-lg transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>ثبت بازگشت</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => onOpenSmsModal(student, 'exit')}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>پیامک اولیا</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* بخش دوم: غایبین امروز مدرسه */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <UserX className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                غایبین امروز مدرسه
              </h2>
            </div>
            <button
              onClick={onNavigateToAttendance}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>مشاهده همه در دفتر</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {absentStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              همه دانش‌آموزان در مدرسه حضور دارند.
            </div>
          ) : (
            <div className="space-y-3">
              {absentStudents.map(({ student, absentPeriods }) => (
                <div
                  key={student.id}
                  className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 font-medium">
                        کد {toPersianDigits(student.code)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      زنگ‌های غیبت: {absentPeriods.map((p) => p.title).join('، ')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      تماس ولی: {toPersianDigits(student.parentPhone)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenSmsModal(student, 'absent')}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>پیامک غیبت به ولی</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* بخش سوم: آزمون‌ها و ارزشیابی‌های امروز */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                وضعیت آزمون‌ها و فعالیت‌های کلاسی امروز
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                بررسی سریع فعالیت‌ها و جلوگیری از تضییع نمره دانش‌آموزانی که با اجازه خارج شده‌اند
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToActivities}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>مدیریت کامل فعالیت‌ها</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingActivityItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            هنوز برای امروز فعالیتی ثبت نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingActivityItems.map(({ activity, period, totalEligible, evaluatedCount, pendingStudents }) => {
              const isCompleted = pendingStudents.length === 0;

              return (
                <div
                  key={activity.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {activity.title}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                          درس {activity.subject}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        مرتبط با {period?.title || 'زنگ کلاسی'}
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="px-2 py-0.5 text-xs rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        تکمیل شده
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {toPersianDigits(pendingStudents.length)} ثبت‌نشده
                      </span>
                    )}
                  </div>

                  {/* نوار پیشرفت ارزشیابی */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>ارزشیابی‌های ثبت‌شده</span>
                      <span className="tabular-nums font-mono">
                        {toPersianDigits(evaluatedCount)} از {toPersianDigits(totalEligible)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${totalEligible > 0 ? (evaluatedCount / totalEligible) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* دکمه‌های اقدام برای فعالیت */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onOpenActivityModal(activity)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      ویرایش و ثبت انفرادی
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={onOpenBatchModal}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        ثبت گروهی هوشمند
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
