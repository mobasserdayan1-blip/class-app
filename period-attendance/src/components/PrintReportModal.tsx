import React from 'react';
import { Printer, Download, X, FileSpreadsheet, School } from 'lucide-react';
import { Student, Period, DayAttendanceMap, ClassActivity, ActivityEvaluation } from '../types';
import { ClassInfo } from '../utils/storage';
import { 
  getPersianToday, 
  toPersianDigits, 
  ATTENDANCE_STATUS_CONFIG, 
  DESCRIPTIVE_GRADES_CONFIG 
} from '../utils/persianDate';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  periods: Period[];
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  classInfo: ClassInfo;
  onExportCsv: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  students,
  periods,
  attendance,
  activities,
  evaluations,
  classInfo,
  onExportCsv,
}) => {
  if (!isOpen) return null;

  const today = getPersianToday();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* نوار ابزار بالا - مخفی در هنگام پرینت */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">پیش‌نمایش چاپ سیاهه حضور و غیاب و کارنامه روزانه</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>دانلود فایل اکسل</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>ارسال به چاپگر (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* برگه قابل چاپ (Printable Canvas) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 font-sans print:p-0">
          
          {/* سربرگ رسمی وزارت آموزش و پرورش / مدرسه */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-600">جمهوری اسلامی ایران - وزارت آموزش و پرورش</div>
                <div className="text-lg font-black">{classInfo.schoolName}</div>
                <div className="text-xs font-semibold text-slate-700">
                  دفتر آمار، حضور و غیاب زنگ‌ها و ارزشیابی توصیفی · {classInfo.className}
                </div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-1">
                  <School className="w-6 h-6 text-slate-800" />
                </div>
                <div className="text-[11px] font-bold">سال تحصیلی {classInfo.academicYear}</div>
              </div>

              <div className="text-left space-y-1 text-xs">
                <div>تاریخ گزارش: <strong className="font-mono">{today.fullDate}</strong></div>
                <div>روز: <strong>{today.dayName}</strong></div>
                <div>دبیر / آموزگار: <strong>{classInfo.teacherName}</strong></div>
              </div>
            </div>
          </div>

          {/* جدول اصلی حضور و غیاب زنگ‌ها */}
          <div className="mb-6">
            <h4 className="font-bold text-sm text-slate-900 mb-2 border-r-4 border-blue-600 pr-2">
              ۱. گزارش حضور، غیبت و خروج زودهنگام به تفکیک زنگ‌های تحصیلی
            </h4>
            <table className="w-full text-right text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="p-2 border border-slate-300 w-12 text-center">ردیف</th>
                  <th className="p-2 border border-slate-300">نام و نام خانوادگی</th>
                  <th className="p-2 border border-slate-300 w-16 text-center">کد</th>
                  {periods.map((p) => (
                    <th key={p.id} className="p-2 border border-slate-300 text-center">
                      <div>{p.title}</div>
                      <div className="text-[10px] font-normal text-slate-500 font-mono">
                        {toPersianDigits(p.startTime)} - {toPersianDigits(p.endTime)}
                      </div>
                    </th>
                  ))}
                  <th className="p-2 border border-slate-300">توضیحات و علت خروج</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  let exitNotes = '';
                  periods.forEach((p) => {
                    const rec = attendance[student.id]?.[p.id];
                    if (rec?.exitDetails) {
                      exitNotes += `خروج ${p.title} (ساعت ${toPersianDigits(rec.exitDetails.exitTime)} - ${rec.exitDetails.reason}) `;
                    }
                  });

                  return (
                    <tr key={student.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">
                        {toPersianDigits(idx + 1)}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono">
                        {toPersianDigits(student.code)}
                      </td>
                      {periods.map((p) => {
                        const rec = attendance[student.id]?.[p.id] || { status: 'present' };
                        const conf = ATTENDANCE_STATUS_CONFIG[rec.status];

                        return (
                          <td
                            key={p.id}
                            className={`p-2 border border-slate-300 text-center font-medium ${
                              rec.status === 'excused_exit'
                                ? 'bg-amber-50 text-amber-900 font-bold'
                                : rec.status === 'absent'
                                ? 'bg-rose-50 text-rose-900 font-bold'
                                : rec.status === 'returned'
                                ? 'bg-sky-50 text-sky-900'
                                : 'text-slate-800'
                            }`}
                          >
                            {conf.shortLabel}
                          </td>
                        );
                      })}
                      <td className="p-2 border border-slate-300 text-[11px] text-slate-600">
                        {exitNotes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* جدول نتایج آزمون‌ها و فعالیت‌ها */}
          {activities.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-sm text-slate-900 mb-2 border-r-4 border-emerald-600 pr-2">
                ۲. نتایج ارزشیابی‌های کیفی-توصیفی و آزمون‌های کلاسی امروز
              </h4>
              <table className="w-full text-right text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="p-2 border border-slate-300 w-12 text-center">ردیف</th>
                    <th className="p-2 border border-slate-300">نام و نام خانوادگی</th>
                    {activities.map((act) => (
                      <th key={act.id} className="p-2 border border-slate-300 text-center">
                        <div>{act.title}</div>
                        <div className="text-[10px] font-normal text-slate-500">
                          {act.subject} - {periods.find(p => p.id === act.periodId)?.title}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">
                        {toPersianDigits(idx + 1)}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold">
                        {student.firstName} {student.lastName}
                      </td>
                      {activities.map((act) => {
                        const att = attendance[student.id]?.[act.periodId];
                        const isOut = att?.status === 'excused_exit' || (att?.status === 'absent' && att.exitDetails);
                        const evalRec = evaluations.find(
                          (e) => e.activityId === act.id && e.studentId === student.id
                        );

                        if (isOut) {
                          return (
                            <td key={act.id} className="p-2 border border-slate-300 text-center bg-amber-50 text-amber-900 font-semibold">
                              انجام‌نشده (خروج با اجازه)
                            </td>
                          );
                        }

                        if (!evalRec) {
                          return (
                            <td key={act.id} className="p-2 border border-slate-300 text-center text-slate-400">
                              ثبت‌نشده
                            </td>
                          );
                        }

                        return (
                          <td key={act.id} className="p-2 border border-slate-300 text-center font-bold">
                            {DESCRIPTIVE_GRADES_CONFIG[evalRec.grade].label}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* امضاهای رسمی انتهای برگه */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs text-slate-700">
            <div>
              <div className="font-bold">امضای آموزگار / دبیر کلاس:</div>
              <div className="mt-8 font-semibold">{classInfo.teacherName}</div>
            </div>
            <div>
              <div className="font-bold">امضای معاونت انضباطی و آموزشی:</div>
              <div className="mt-8 font-semibold">........................................</div>
            </div>
            <div>
              <div className="font-bold">مهر و امضای مدیریت آموزشگاه:</div>
              <div className="mt-8 font-semibold">{classInfo.schoolName}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
