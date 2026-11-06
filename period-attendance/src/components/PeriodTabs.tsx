import React from 'react';
import { Clock, Plus, Users, UserX, LogOut } from 'lucide-react';
import { Period, Student, DayAttendanceMap } from '../types';
import { toPersianDigits } from '../utils/persianDate';

interface PeriodTabsProps {
  periods: Period[];
  activePeriodId: string;
  onSelectPeriod: (periodId: string) => void;
  students: Student[];
  attendance: DayAttendanceMap;
  onOpenPeriodManager: () => void;
}

export const PeriodTabs: React.FC<PeriodTabsProps> = ({
  periods,
  activePeriodId,
  onSelectPeriod,
  students,
  attendance,
  onOpenPeriodManager,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {/* لیست زنگ‌ها */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {periods.map((period) => {
              const isActive = period.id === activePeriodId;
              
              // محاسبه وضعیت زنگ جاری
              let presentCount = 0;
              let absentCount = 0;
              let exitCount = 0;

              students.forEach((s) => {
                const stat = attendance[s.id]?.[period.id]?.status || 'present';
                if (stat === 'present' || stat === 'returned') presentCount++;
                else if (stat === 'absent') absentCount++;
                else if (stat === 'excused_exit') exitCount++;
              });

              return (
                <button
                  key={period.id}
                  onClick={() => onSelectPeriod(period.id)}
                  className={`group relative flex flex-col items-start px-4 py-2.5 rounded-xl border text-right transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <span className="font-bold text-sm">
                      {period.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {toPersianDigits(period.startTime)} تا {toPersianDigits(period.endTime)}
                    </span>
                  </div>

                  {/* آمار خلاصه سریع زیر زنگ */}
                  <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Users className="w-3 h-3" />
                      {toPersianDigits(presentCount)} حاضر
                    </span>
                    {exitCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <LogOut className="w-3 h-3" />
                        {toPersianDigits(exitCount)} خروج موجه
                      </span>
                    )}
                    {absentCount > 0 && (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                        <UserX className="w-3 h-3" />
                        {toPersianDigits(absentCount)} غایب
                      </span>
                    )}
                  </div>

                  {/* خط شاخص فعال بودن */}
                  {isActive && (
                    <div className="absolute -bottom-3 right-4 left-4 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* دکمه افزودن زنگ جدید / ویرایش */}
          <button
            onClick={onOpenPeriodManager}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تنظیم زنگ‌ها</span>
          </button>

        </div>
      </div>
    </div>
  );
};
