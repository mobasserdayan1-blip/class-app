export type AttendanceStatus = 'present' | 'absent' | 'excused_exit' | 'returned';

export type DescriptiveGrade = 
  | 'very_good'       // خیلی خوب
  | 'good'            // خوب
  | 'acceptable'      // قابل قبول
  | 'needs_effort'    // نیازمند تلاش
  | 'excused_absence'; // انجام‌نشده به علت خروج با اجازه

export interface Student {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  parentPhone: string;
  avatarSeed: string;
  note?: string;
}

export interface Period {
  id: string;
  order: number;
  title: string;       // مثلاً "زنگ اول (ریاضی)"
  startTime: string;   // "08:00"
  endTime: string;     // "09:30"
}

export interface ExitDetails {
  exitTime: string;          // مثلاً "10:15"
  reason: string;            // مثلاً "مراجعه به پزشک"، "حال نامساعد"، "امور اداری"
  authorizedBy: string;      // مسئول تایید (ناظم / اولیا)
  returnTime?: string;       // در صورت بازگشت
}

export interface StudentPeriodAttendance {
  status: AttendanceStatus;
  exitDetails?: ExitDetails;
  timestamp: string;
}

// نگهداری حضور و غیاب برای یک روز: studentId -> periodId -> StudentPeriodAttendance
export type DayAttendanceMap = Record<string, Record<string, StudentPeriodAttendance>>;

export interface ClassActivity {
  id: string;
  date: string;              // "1403/08/16"
  periodId: string;
  title: string;             // مثلاً "آزمون کلاسی فصل ۲" یا "حل تمرین روی تخته"
  subject: string;           // "ریاضی"، "علوم"، "ادبیات"
  type: 'quiz' | 'classwork' | 'homework' | 'project';
  description?: string;
  createdAt: string;
}

export interface ActivityEvaluation {
  id: string;
  activityId: string;
  studentId: string;
  grade: DescriptiveGrade;
  teacherFeedback?: string;
  recordedAt: string;
}
