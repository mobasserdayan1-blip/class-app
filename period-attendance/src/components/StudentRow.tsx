import React from 'react';
import { 
  Check, 
  X, 
  LogOut, 
  LogIn, 
  Clock, 
  MessageSquare, 
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { 
  Student, 
  Period, 
  DayAttendanceMap, 
  AttendanceStatus, 
  ClassActivity, 
  ActivityEvaluation 
} from '../types';
import { 
  toPersianDigits, 
  ATTENDANCE_STATUS_CONFIG, 
  DESCRIPTIVE_GRADES_CONFIG 
} from '../utils/persianDate';

interface StudentRowProps {
  student: Student;
  periods: Period[];
  activePeriodId: string;
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  isSelected: boolean;
  onToggleSelect: (studentId: string) => void;
  onUpdateStatus: (studentId: string, periodId: string, status: AttendanceStatus) => void;
  onOpenExitModal: (student: Student) => void;
  onOpenReturnModal: (student: Student) => void;
  onOpenSmsModal: (student: Student, type: 'exit' | 'absent' | 'evaluation') => void;
  onOpenActivityGrading: (student: Student, activity: ClassActivity) => void;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  periods,
  activePeriodId,
  attendance,
  activities,
  evaluations,
  isSelected,
  onToggleSelect,
  onUpdateStatus,
  onOpenExitModal,
  onOpenReturnModal,
  onOpenSmsModal,
  onOpenActivityGrading,
}) => {
  // وضعیت دانش‌آموز در زنگ انتخابی جاری
  const currentRecord = attendance[student.id]?.[activePeriodId] || {
    status: 'present',
    timestamp: '',
  };
  const currentStatus = currentRecord.status;
  const statusConfig = ATTENDANCE_STATUS_CONFIG[currentStatus];

  // فعالیت‌های مرتبط با زنگ جاری
  const periodActivities = activities.filter((a) => a.periodId === activePeriodId);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-150 p-4 ${
        isSelected
          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-xs'
          : currentStatus === 'absent'
          ? 'bg-rose-50/30 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/40'
          : currentStatus === 'excused_exit'
          ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40'
          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* اطلاعات شناسایی دانش‌آموز و چک‌باکس انتخاب گروهی */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(student.id)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
          />

          {/* آواتار با حروف اول */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 text-sm">
            {student.firstName[0]}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {student.firstName} {student.lastName}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                #{toPersianDigits(student.code)}
              </span>
            </div>
            {student.note && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {student.note}
              </div>
            )}
          </div>
        </div>

        {/* خط زمانی وضعیت در تمام زنگ‌های روز (Timeline across all bells) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {periods.map((period) => {
            const periodRec = attendance[student.id]?.[period.id] || { status: 'present' };
            const isCurrentPeriod = period.id === activePeriodId;
            const pConfig = ATTENDANCE_STATUS_CONFIG[periodRec.status];

            return (
              <div
                key={period.id}
                title={`${period.title}: ${pConfig.label}`}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg border text-[11px] transition-all min-w-[58px] ${
                  isCurrentPeriod
                    ? 'ring-2 ring-blue-500 font-bold'
                    : 'opacity-85'
                } ${pConfig.badgeClass}`}
              >
                <span className="text-[9px] opacity-75 font-mono">
                  زنگ {toPersianDigits(period.order)}
                </span>
                <span className="truncate max-w-[54px] font-medium">
                  {pConfig.shortLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* دکمه‌های کنترل وضعیت زنگ جاری */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* دکمه حاضر */}
          <button
            onClick={() => onUpdateStatus(student.id, activePeriodId, 'present')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'present'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>حاضر</span>
          </button>

          {/* دکمه غایب */}
          <button
            onClick={() => onUpdateStatus(student.id, activePeriodId, 'absent')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'absent' && !currentRecord.exitDetails
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>غایب</span>
          </button>

          {/* دکمه خروج با اجازه مدرسه */}
          <button
            onClick={() => onOpenExitModal(student)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'excused_exit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج با اجازه</span>
          </button>

          {/* دکمه بازگشت به مدرسه */}
          {currentStatus === 'excused_exit' || (currentStatus === 'absent' && currentRecord.exitDetails) ? (
            <button
              onClick={() => onOpenReturnModal(student)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 hover:bg-sky-200 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ثبت بازگشت</span>
            </button>
          ) : null}

          {/* پیامک به اولیا */}
          <button
            onClick={() => onOpenSmsModal(student, currentStatus === 'excused_exit' ? 'exit' : 'absent')}
            title="تولید خودکار متن پیامک اطلاع‌رسانی به ولی"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* جزئیات خروج موجه در صورت وجود در زنگ انتخابی */}
      {currentRecord.exitDetails && (
        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">گزارش خروج موجه:</span>
            <span>ساعت: {toPersianDigits(currentRecord.exitDetails.exitTime)}</span>
            <span aria-hidden="true">·</span>
            <span>علت: {currentRecord.exitDetails.reason}</span>
            <span aria-hidden="true">·</span>
            <span>تایید: {currentRecord.exitDetails.authorizedBy}</span>
          </div>

          {currentRecord.exitDetails.returnTime && (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              بازگشت به مدرسه در ساعت {toPersianDigits(currentRecord.exitDetails.returnTime)}
            </span>
          )}
        </div>
      )}

      {/* فعالیت‌های زنگ جاری برای این دانش‌آموز */}
      {periodActivities.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            فعالیت‌های این زنگ:
          </span>

          {periodActivities.map((act) => {
            const evalRecord = evaluations.find(
              (e) => e.activityId === act.id && e.studentId === student.id
            );

            // آیا دانش‌آموز در این زنگ خارج بوده است؟
            const isOut = currentStatus === 'excused_exit' || (currentStatus === 'absent' && currentRecord.exitDetails);

            if (isOut && (!evalRecord || evalRecord.grade === 'excused_absence')) {
              return (
                <div
                  key={act.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                >
                  <span className="font-medium">{act.title}:</span>
                  <span>انجام‌نشده به علت خروج (بدون نمره منفی)</span>
                </div>
              );
            }

            if (evalRecord) {
              const gradeConfig = DESCRIPTIVE_GRADES_CONFIG[evalRecord.grade];
              return (
                <button
                  key={act.id}
                  onClick={() => onOpenActivityGrading(student, act)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md border font-medium transition-colors ${gradeConfig.badgeClass}`}
                >
                  <span>{act.title}:</span>
                  <span className="font-bold">{gradeConfig.label}</span>
                </button>
              );
            }

            return (
              <button
                key={act.id}
                onClick={() => onOpenActivityGrading(student, act)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors"
              >
                <span>{act.title}:</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                  <HelpCircle className="w-3 h-3" />
                  ثبت نشده
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
