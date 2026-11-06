/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PeriodTabs } from './components/PeriodTabs';
import { TeacherTodayOverview } from './components/TeacherTodayOverview';
import { AttendanceManager } from './components/AttendanceManager';
import { ActivityManager } from './components/ActivityManager';
import { ExitReturnModal } from './components/ExitReturnModal';
import { SmartBatchModal } from './components/SmartBatchModal';
import { NewActivityModal } from './components/NewActivityModal';
import { ActivityGradingModal } from './components/ActivityGradingModal';
import { SmsModal } from './components/SmsModal';
import { PeriodManagerModal } from './components/PeriodManagerModal';
import { PrintReportModal } from './components/PrintReportModal';

import {
  Student,
  Period,
  DayAttendanceMap,
  ClassActivity,
  ActivityEvaluation,
  AttendanceStatus,
  DescriptiveGrade,
  ExitDetails,
} from './types';

import {
  loadStudents,
  saveStudents,
  loadPeriods,
  savePeriods,
  loadAttendance,
  saveAttendance,
  loadActivities,
  saveActivities,
  loadEvaluations,
  saveEvaluations,
  loadClassInfo,
  saveClassInfo,
  resetToDemoData,
  ClassInfo,
} from './utils/storage';

import { 
  getPersianToday, 
  toPersianDigits, 
  ATTENDANCE_STATUS_CONFIG, 
  DESCRIPTIVE_GRADES_CONFIG 
} from './utils/persianDate';

export default function App() {
  // اطلاعات کلاس و تنظیمات
  const [classInfo, setClassInfo] = useState<ClassInfo>(loadClassInfo);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [periods, setPeriods] = useState<Period[]>(loadPeriods);
  const [attendance, setAttendance] = useState<DayAttendanceMap>(() =>
    loadAttendance(loadStudents(), loadPeriods())
  );
  const [activities, setActivities] = useState<ClassActivity[]>(loadActivities);
  const [evaluations, setEvaluations] = useState<ActivityEvaluation[]>(loadEvaluations);

  // تب فعال و زنگ فعال
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'activities'>('overview');
  const [activePeriodId, setActivePeriodId] = useState<string>(() => loadPeriods()[0]?.id || 'p1');

  // حالت تم تاریک / روشن
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // پایداری داده‌ها هنگام تغییر
  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    savePeriods(periods);
  }, [periods]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveEvaluations(evaluations);
  }, [evaluations]);

  // وضعیت مودال‌ها
  const [exitModal, setExitModal] = useState<{
    isOpen: boolean;
    mode: 'exit' | 'return';
    student: Student | null;
    period: Period | null;
  }>({
    isOpen: false,
    mode: 'exit',
    student: null,
    period: null,
  });

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [newActivityModalOpen, setNewActivityModalOpen] = useState(false);
  const [periodManagerModalOpen, setPeriodManagerModalOpen] = useState(false);
  const [printReportModalOpen, setPrintReportModalOpen] = useState(false);

  const [gradingModal, setGradingModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    activity: ClassActivity | null;
  }>({
    isOpen: false,
    student: null,
    activity: null,
  });

  const [smsModal, setSmsModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    type: 'exit' | 'absent' | 'evaluation';
    period: Period | null;
  }>({
    isOpen: false,
    student: null,
    type: 'exit',
    period: null,
  });

  // اطمینان از معتبر بودن activePeriodId
  useEffect(() => {
    if (periods.length > 0 && !periods.some((p) => p.id === activePeriodId)) {
      setActivePeriodId(periods[0].id);
    }
  }, [periods, activePeriodId]);

  // ۱. به‌روزرسانی سریع وضعیت حضور در یک زنگ
  const handleUpdateStatus = (studentId: string, periodId: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const next = { ...prev };
      if (!next[studentId]) next[studentId] = {};
      next[studentId] = {
        ...next[studentId],
        [periodId]: {
          status,
          timestamp: new Date().toISOString(),
        },
      };
      return next;
    });
  };

  // ۲. به‌روزرسانی گروهی حضور
  const handleBatchUpdateStatus = (
    studentIds: string[],
    periodId: string,
    status: AttendanceStatus
  ) => {
    setAttendance((prev) => {
      const next = { ...prev };
      const now = new Date().toISOString();
      studentIds.forEach((sid) => {
        if (!next[sid]) next[sid] = {};
        next[sid] = {
          ...next[sid],
          [periodId]: {
            status,
            timestamp: now,
          },
        };
      });
      return next;
    });
  };

  // ۳. ثبت خروج با اجازه (با انتقال هوشمند وضعیت به زنگ‌های بعدی و محافظت از فعالیت‌ها)
  const handleSubmitExit = (details: ExitDetails) => {
    const { student, period } = exitModal;
    if (!student || !period) return;

    setAttendance((prev) => {
      const next = { ...prev };
      const sMap = { ...(next[student.id] || {}) };
      const now = new Date().toISOString();

      // زنگ فعلی خروج با اجازه
      sMap[period.id] = {
        status: 'excused_exit',
        exitDetails: details,
        timestamp: now,
      };

      // زنگ‌های بعدی تا قبل از بازگشت به عنوان غایب به علت خروج موجه نشان‌گذاری شوند
      const currentOrder = period.order;
      periods.forEach((p) => {
        if (p.order > currentOrder) {
          sMap[p.id] = {
            status: 'absent',
            exitDetails: {
              ...details,
              reason: `غایب به دلیل خروج زودهنگام موجه در زنگ قبلی (${details.reason})`,
            },
            timestamp: now,
          };
        }
      });

      next[student.id] = sMap;
      return next;
    });

    // همچنین در تمام آزمون‌های این زنگ و زنگ‌های بعد، وضعیت «انجام‌نشده به علت خروج» ثبت گردد
    const affectedPeriods = periods.filter((p) => p.order >= period.order).map((p) => p.id);
    const affectedActivities = activities.filter((a) => affectedPeriods.includes(a.periodId));

    setEvaluations((prev) => {
      const nextEvals = [...prev];
      affectedActivities.forEach((act) => {
        const existingIdx = nextEvals.findIndex(
          (e) => e.activityId === act.id && e.studentId === student.id
        );
        const evalItem: ActivityEvaluation = {
          id: existingIdx >= 0 ? nextEvals[existingIdx].id : `eval_${Date.now()}_${act.id}`,
          activityId: act.id,
          studentId: student.id,
          grade: 'excused_absence',
          teacherFeedback: `انجام‌نشده به علت خروج با اجازه مدرسه (${details.reason}) - بدون نمره منفی`,
          recordedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          nextEvals[existingIdx] = evalItem;
        } else {
          nextEvals.push(evalItem);
        }
      });
      return nextEvals;
    });

    setExitModal({ isOpen: false, mode: 'exit', student: null, period: null });
  };

  // ۴. ثبت بازگشت دانش‌آموز پس از خروج
  const handleSubmitReturn = (returnTime: string) => {
    const { student, period } = exitModal;
    if (!student || !period) return;

    setAttendance((prev) => {
      const next = { ...prev };
      const sMap = { ...(next[student.id] || {}) };
      const now = new Date().toISOString();

      // این زنگ به عنوان بازگشته ثبت شود
      const prevRec = sMap[period.id];
      sMap[period.id] = {
        status: 'returned',
        exitDetails: prevRec?.exitDetails
          ? { ...prevRec.exitDetails, returnTime }
          : { exitTime: '', reason: 'بازگشت به مدرسه', authorizedBy: 'دفتر', returnTime },
        timestamp: now,
      };

      // زنگ‌های پس از این زنگ به حالت حاضر بازگردند
      periods.forEach((p) => {
        if (p.order > period.order) {
          sMap[p.id] = {
            status: 'present',
            timestamp: now,
          };
        }
      });

      next[student.id] = sMap;
      return next;
    });

    setExitModal({ isOpen: false, mode: 'return', student: null, period: null });
  };

  // ۵. ثبت گروهی هوشمند نمرات
  const handleApplyBatchEvaluation = (
    activityId: string,
    targetType: 'all_present' | 'selected' | 'unrecorded',
    grade: DescriptiveGrade,
    feedback?: string
  ) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    // جامعه هدف
    let eligibleStudents: Student[] = [];

    if (targetType === 'all_present') {
      eligibleStudents = students.filter((s) => {
        const st = attendance[s.id]?.[activity.periodId]?.status;
        return st === 'present' || st === 'returned';
      });
    } else if (targetType === 'unrecorded') {
      eligibleStudents = students.filter((s) => {
        const st = attendance[s.id]?.[activity.periodId]?.status;
        const isPresent = st === 'present' || st === 'returned';
        if (!isPresent) return false;
        const hasEval = evaluations.some(
          (e) => e.activityId === activityId && e.studentId === s.id
        );
        return !hasEval;
      });
    } else {
      eligibleStudents = students.filter((s) => {
        const st = attendance[s.id]?.[activity.periodId]?.status;
        return st === 'present' || st === 'returned';
      });
    }

    setEvaluations((prev) => {
      const next = [...prev];
      const now = new Date().toISOString();

      eligibleStudents.forEach((student) => {
        const existingIdx = next.findIndex(
          (e) => e.activityId === activityId && e.studentId === student.id
        );

        const newEval: ActivityEvaluation = {
          id: existingIdx >= 0 ? next[existingIdx].id : `eval_${Date.now()}_${student.id}`,
          activityId,
          studentId: student.id,
          grade,
          teacherFeedback: feedback || undefined,
          recordedAt: now,
        };

        if (existingIdx >= 0) {
          next[existingIdx] = newEval;
        } else {
          next.push(newEval);
        }
      });

      return next;
    });
  };

  // ۶. ذخیره ارزشیابی انفرادی
  const handleSaveEvaluation = (data: {
    activityId: string;
    studentId: string;
    grade: DescriptiveGrade;
    teacherFeedback?: string;
  }) => {
    setEvaluations((prev) => {
      const next = [...prev];
      const idx = next.findIndex(
        (e) => e.activityId === data.activityId && e.studentId === data.studentId
      );

      const item: ActivityEvaluation = {
        id: idx >= 0 ? next[idx].id : `eval_${Date.now()}`,
        activityId: data.activityId,
        studentId: data.studentId,
        grade: data.grade,
        teacherFeedback: data.teacherFeedback,
        recordedAt: new Date().toISOString(),
      };

      if (idx >= 0) next[idx] = item;
      else next.push(item);

      return next;
    });
  };

  // ۷. ثبت سریع نمره از جدول
  const handleQuickGrade = (activityId: string, studentId: string, grade: DescriptiveGrade) => {
    handleSaveEvaluation({ activityId, studentId, grade });
  };

  // ۸. تعریف فعالیت جدید
  const handleCreateActivity = (data: {
    title: string;
    subject: string;
    periodId: string;
    type: 'quiz' | 'classwork' | 'homework' | 'project';
    description?: string;
  }) => {
    const newAct: ClassActivity = {
      id: `act_${Date.now()}`,
      date: getPersianToday().fullDate,
      periodId: data.periodId,
      title: data.title,
      subject: data.subject,
      type: data.type,
      description: data.description,
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => [newAct, ...prev]);

    // اگر دانش‌آموزی در این زنگ خارج بوده، وضعیت خروج موجه خودکار ثبت شود
    const exitedInThisPeriod = students.filter((s) => {
      const st = attendance[s.id]?.[data.periodId]?.status;
      return st === 'excused_exit' || (st === 'absent' && attendance[s.id]?.[data.periodId]?.exitDetails);
    });

    if (exitedInThisPeriod.length > 0) {
      setEvaluations((prev) => {
        const next = [...prev];
        exitedInThisPeriod.forEach((s) => {
          next.push({
            id: `eval_auto_${Date.now()}_${s.id}`,
            activityId: newAct.id,
            studentId: s.id,
            grade: 'excused_absence',
            teacherFeedback: 'انجام‌نشده به علت خروج با اجازه مدرسه',
            recordedAt: new Date().toISOString(),
          });
        });
        return next;
      });
    }
  };

  // ۹. حذف فعالیت
  const handleDeleteActivity = (activityId: string) => {
    if (confirm('آیا از حذف این فعالیت اطمینان دارید؟')) {
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      setEvaluations((prev) => prev.filter((e) => e.activityId !== activityId));
    }
  };

  // ۱۰. خروجی اکسل با کدگذاری UTF-8 BOM جهت نمایش بدون مشکل حروف فارسی
  const handleExportCsv = () => {
    const today = getPersianToday();
    let csv = '\uFEFF'; // BOM برای اکسل فارسی
    csv += `گزارش حضور و غیاب و ارزشیابی کلاس - ${classInfo.schoolName} - ${classInfo.className}\n`;
    csv += `تاریخ: ${today.fullDate} (${today.dayName}) - دبیر: ${classInfo.teacherName}\n\n`;

    // سطر هدر جدول
    const headers = ['ردیف', 'کد دانش‌آموزی', 'نام', 'نام خانوادگی', 'موبایل ولی'];
    periods.forEach((p) => {
      headers.push(`وضعیت ${p.title}`);
    });
    activities.forEach((act) => {
      headers.push(`نمره: ${act.title} (${act.subject})`);
    });
    headers.push('یادداشت و جزئیات خروج موجه');

    csv += headers.map((h) => `"${h}"`).join(',') + '\n';

    // سطر داده‌های هر دانش‌آموز
    students.forEach((s, idx) => {
      const row: string[] = [
        String(idx + 1),
        s.code,
        s.firstName,
        s.lastName,
        s.parentPhone,
      ];

      // ستون‌های زنگ‌ها
      let exitNotes = '';
      periods.forEach((p) => {
        const rec = attendance[s.id]?.[p.id];
        const status = rec?.status || 'present';
        row.push(ATTENDANCE_STATUS_CONFIG[status].label);
        if (rec?.exitDetails) {
          exitNotes += `[خروج ${p.title} ساعت ${rec.exitDetails.exitTime}: ${rec.exitDetails.reason}] `;
        }
      });

      // ستون‌های فعالیت‌ها
      activities.forEach((act) => {
        const att = attendance[s.id]?.[act.periodId];
        const isOut = att?.status === 'excused_exit' || (att?.status === 'absent' && att.exitDetails);
        const evalRec = evaluations.find((e) => e.activityId === act.id && e.studentId === s.id);

        if (isOut) {
          row.push('انجام‌نشده (خروج با اجازه)');
        } else if (evalRec) {
          row.push(DESCRIPTIVE_GRADES_CONFIG[evalRec.grade].label);
        } else {
          row.push('ثبت‌نشده');
        }
      });

      row.push(exitNotes || '-');
      csv += row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gozaresh_Klas_${today.fullDate.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ۱۱. بازنشانی به داده‌های نمونه
  const handleResetData = () => {
    if (confirm('آیا مایل به بازنشانی اطلاعات به سناریوی نمونه هستید؟')) {
      const reset = resetToDemoData();
      setStudents(reset.students);
      setPeriods(reset.periods);
      setAttendance(reset.attendance);
      setActivities(reset.activities);
      setEvaluations(reset.evaluations);
      setClassInfo(reset.classInfo);
      setActivePeriodId(reset.periods[0].id);
    }
  };

  const currentPeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* نوار ناوبری اصلی */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        classInfo={classInfo}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenPrintModal={() => setPrintReportModalOpen(true)}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        onOpenPeriodManager={() => setPeriodManagerModalOpen(true)}
      />

      {/* نوار انتخاب زنگ‌ها */}
      <PeriodTabs
        periods={periods}
        activePeriodId={activePeriodId}
        onSelectPeriod={(id) => setActivePeriodId(id)}
        students={students}
        attendance={attendance}
        onOpenPeriodManager={() => setPeriodManagerModalOpen(true)}
      />

      {/* محتوای اصلی بر اساس تب فعال */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <TeacherTodayOverview
            students={students}
            periods={periods}
            attendance={attendance}
            activities={activities}
            evaluations={evaluations}
            activePeriodId={activePeriodId}
            onSelectPeriod={setActivePeriodId}
            onOpenExitModal={(s) =>
              setExitModal({ isOpen: true, mode: 'exit', student: s, period: currentPeriod })
            }
            onOpenReturnModal={(s) =>
              setExitModal({ isOpen: true, mode: 'return', student: s, period: currentPeriod })
            }
            onOpenSmsModal={(s, type) =>
              setSmsModal({ isOpen: true, student: s, type, period: currentPeriod })
            }
            onOpenBatchModal={() => setBatchModalOpen(true)}
            onOpenActivityModal={() => setNewActivityModalOpen(true)}
            onNavigateToAttendance={() => setActiveTab('attendance')}
            onNavigateToActivities={() => setActiveTab('activities')}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceManager
            students={students}
            periods={periods}
            activePeriodId={activePeriodId}
            attendance={attendance}
            activities={activities}
            evaluations={evaluations}
            onUpdateStatus={handleUpdateStatus}
            onBatchUpdateStatus={handleBatchUpdateStatus}
            onOpenExitModal={(s) =>
              setExitModal({ isOpen: true, mode: 'exit', student: s, period: currentPeriod })
            }
            onOpenReturnModal={(s) =>
              setExitModal({ isOpen: true, mode: 'return', student: s, period: currentPeriod })
            }
            onOpenSmsModal={(s, type) =>
              setSmsModal({ isOpen: true, student: s, type, period: currentPeriod })
            }
            onOpenBatchModal={() => setBatchModalOpen(true)}
            onOpenActivityGrading={(s, act) =>
              setGradingModal({ isOpen: true, student: s, activity: act })
            }
          />
        )}

        {activeTab === 'activities' && (
          <ActivityManager
            students={students}
            periods={periods}
            activePeriodId={activePeriodId}
            attendance={attendance}
            activities={activities}
            evaluations={evaluations}
            onOpenNewActivityModal={() => setNewActivityModalOpen(true)}
            onOpenBatchModal={() => setBatchModalOpen(true)}
            onOpenGradingModal={(s, act) =>
              setGradingModal({ isOpen: true, student: s, activity: act })
            }
            onDeleteActivity={handleDeleteActivity}
            onQuickGrade={handleQuickGrade}
          />
        )}
      </main>

      {/* مودال‌های تعاملی */}
      <ExitReturnModal
        isOpen={exitModal.isOpen}
        mode={exitModal.mode}
        student={exitModal.student}
        period={exitModal.period}
        currentExitDetails={
          exitModal.student && exitModal.period
            ? attendance[exitModal.student.id]?.[exitModal.period.id]?.exitDetails
            : undefined
        }
        onClose={() => setExitModal({ isOpen: false, mode: 'exit', student: null, period: null })}
        onSubmitExit={handleSubmitExit}
        onSubmitReturn={handleSubmitReturn}
      />

      <SmartBatchModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        students={students}
        periods={periods}
        activePeriodId={activePeriodId}
        attendance={attendance}
        activities={activities}
        evaluations={evaluations}
        selectedStudentIds={[]}
        onApplyBatchEvaluation={handleApplyBatchEvaluation}
      />

      <NewActivityModal
        isOpen={newActivityModalOpen}
        periods={periods}
        activePeriodId={activePeriodId}
        onClose={() => setNewActivityModalOpen(false)}
        onCreateActivity={handleCreateActivity}
      />

      <ActivityGradingModal
        isOpen={gradingModal.isOpen}
        student={gradingModal.student}
        activity={gradingModal.activity}
        currentAttendanceStatus={
          gradingModal.student && gradingModal.activity
            ? attendance[gradingModal.student.id]?.[gradingModal.activity.periodId]?.status || 'present'
            : 'present'
        }
        currentEvaluation={
          gradingModal.student && gradingModal.activity
            ? evaluations.find(
                (e) =>
                  e.activityId === gradingModal.activity?.id &&
                  e.studentId === gradingModal.student?.id
              )
            : undefined
        }
        onClose={() => setGradingModal({ isOpen: false, student: null, activity: null })}
        onSaveEvaluation={handleSaveEvaluation}
      />

      <SmsModal
        isOpen={smsModal.isOpen}
        student={smsModal.student}
        type={smsModal.type}
        period={smsModal.period}
        attendance={attendance}
        classInfo={classInfo}
        onClose={() => setSmsModal({ isOpen: false, student: null, type: 'exit', period: null })}
      />

      <PeriodManagerModal
        isOpen={periodManagerModalOpen}
        periods={periods}
        onClose={() => setPeriodManagerModalOpen(false)}
        onSavePeriods={(newP) => {
          setPeriods(newP);
          savePeriods(newP);
        }}
      />

      <PrintReportModal
        isOpen={printReportModalOpen}
        students={students}
        periods={periods}
        attendance={attendance}
        activities={activities}
        evaluations={evaluations}
        classInfo={classInfo}
        onClose={() => setPrintReportModalOpen(false)}
        onExportCsv={handleExportCsv}
      />

    </div>
  );
}
