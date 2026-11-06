import React, { useState, useMemo } from 'react';
import { 
  Search, 
  CheckCheck, 
  Users, 
  UserCheck, 
  UserX, 
  LogOut, 
  X, 
  Sparkles,
  Filter
} from 'lucide-react';
import { 
  Student, 
  Period, 
  DayAttendanceMap, 
  AttendanceStatus, 
  ClassActivity, 
  ActivityEvaluation 
} from '../types';
import { StudentRow } from './StudentRow';
import { toPersianDigits } from '../utils/persianDate';

interface AttendanceManagerProps {
  students: Student[];
  periods: Period[];
  activePeriodId: string;
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  onUpdateStatus: (studentId: string, periodId: string, status: AttendanceStatus) => void;
  onBatchUpdateStatus: (studentIds: string[], periodId: string, status: AttendanceStatus) => void;
  onOpenExitModal: (student: Student) => void;
  onOpenReturnModal: (student: Student) => void;
  onOpenSmsModal: (student: Student, type: 'exit' | 'absent' | 'evaluation') => void;
  onOpenBatchModal: () => void;
  onOpenActivityGrading: (student: Student, activity: ClassActivity) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  periods,
  activePeriodId,
  attendance,
  activities,
  evaluations,
  onUpdateStatus,
  onBatchUpdateStatus,
  onOpenExitModal,
  onOpenReturnModal,
  onOpenSmsModal,
  onOpenBatchModal,
  onOpenActivityGrading,
}) => {
  // فیلتر جستجوی سریع در نام و نام خانوادگی (Feature 2 requested by user)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const currentPeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  // فیلتر کردن دانش‌آموزان با سرعت بالا
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // جستجوی نام، نام خانوادگی و کد
      const fullName = `${s.firstName} ${s.lastName} ${s.code}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      const status = attendance[s.id]?.[activePeriodId]?.status || 'present';
      return status === statusFilter;
    });
  }, [students, searchQuery, statusFilter, attendance, activePeriodId]);

  // هندلر انتخاب همه
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // حاضر کردن همه با ۱ کلیک
  const handleMarkAllPresent = () => {
    const allIds = students.map((s) => s.id);
    onBatchUpdateStatus(allIds, activePeriodId, 'present');
  };

  return (
    <div className="space-y-4">
      
      {/* نوار جستجو و فیلترهای سریع */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* کادر جستجوی سریع دانش‌آموز (Feature 2) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع: چند حرف از نام خانوادگی، نام یا کد دانش‌آموز..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* فیلترهای وضعیت در زنگ جاری */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              همه ({toPersianDigits(students.length)})
            </button>
            <button
              onClick={() => setStatusFilter('present')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'present'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              حاضر
            </button>
            <button
              onClick={() => setStatusFilter('excused_exit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'excused_exit'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              خروج با اجازه
            </button>
            <button
              onClick={() => setStatusFilter('absent')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'absent'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              غایب
            </button>
          </div>

        </div>

        {/* نوار عملیات گروهی و حاضر کردن سریع کل کلاس */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1.5"
            >
              <input
                type="checkbox"
                checked={
                  filteredStudents.length > 0 &&
                  selectedStudentIds.length === filteredStudents.length
                }
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-blue-600 pointer-events-none"
              />
              <span>
                {selectedStudentIds.length > 0
                  ? `${toPersianDigits(selectedStudentIds.length)} دانش‌آموز انتخاب شده`
                  : 'انتخاب همه دانش‌آموزان'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* دکمه ۱ کلیک: حاضر کردن کل کلاس در این زنگ */}
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>حاضر کردن همه کلاس در این زنگ</span>
            </button>

            {/* دکمه عملیات گروهی هوشمند */}
            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ثبت گروهی هوشمند نمرات و فعالیت‌ها</span>
            </button>
          </div>
        </div>
      </div>

      {/* لیست سطرهای دانش‌آموزان */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            دانش‌آموزی با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            عبارت جستجو یا فیلتر وضعیت را تغییر دهید.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              periods={periods}
              activePeriodId={activePeriodId}
              attendance={attendance}
              activities={activities}
              evaluations={evaluations}
              isSelected={selectedStudentIds.includes(student.id)}
              onToggleSelect={handleToggleSelect}
              onUpdateStatus={onUpdateStatus}
              onOpenExitModal={onOpenExitModal}
              onOpenReturnModal={onOpenReturnModal}
              onOpenSmsModal={onOpenSmsModal}
              onOpenActivityGrading={onOpenActivityGrading}
            />
          ))}
        </div>
      )}

    </div>
  );
};
