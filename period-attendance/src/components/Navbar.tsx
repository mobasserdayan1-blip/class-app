import React from 'react';
import { 
  School, 
  Sun, 
  Moon, 
  Printer, 
  FileSpreadsheet, 
  RotateCcw,
  Sliders,
  Calendar
} from 'lucide-react';
import { ClassInfo } from '../utils/storage';
import { toPersianDigits, getPersianToday } from '../utils/persianDate';

interface NavbarProps {
  activeTab: 'overview' | 'attendance' | 'activities';
  setActiveTab: (tab: 'overview' | 'attendance' | 'activities') => void;
  classInfo: ClassInfo;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenPrintModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  onOpenPeriodManager: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  classInfo,
  isDark,
  setIsDark,
  onOpenPrintModal,
  onExportCsv,
  onResetData,
  onOpenPeriodManager,
}) => {
  const today = getPersianToday();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* بخش راست: عنوان و هویت مدرسه */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {classInfo.schoolName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{classInfo.className}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {today.dayName}، {toPersianDigits(today.dayNumber)} {today.monthName}
                </span>
              </div>
            </div>
          </div>

          {/* بخش میانی: تب‌های اصلی برنامه */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              نمای امروز معلم
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'attendance'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              دفتر حضور و غیاب زنگ‌ها
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'activities'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              فعالیت‌ها و آزمون‌ها
            </button>
          </nav>

          {/* بخش چپ: دکمه‌های کنترلی سریع */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPeriodManager}
              title="تنظیمات زنگ‌های مدرسه"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={onExportCsv}
              title="خروجی فایل اکسل (CSV)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>خروجی اکسل</span>
            </button>

            <button
              onClick={onOpenPrintModal}
              title="چاپ کارنامه و گزارش روزانه"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'حالت روز' : 'حالت شب'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onResetData}
              title="بارگذاری مجدد داده‌های نمونه"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
