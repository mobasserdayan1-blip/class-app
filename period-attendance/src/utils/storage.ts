import {
  Student,
  Period,
  DayAttendanceMap,
  ClassActivity,
  ActivityEvaluation,
} from '../types';

export const DEFAULT_PERIODS: Period[] = [
  {
    id: 'p1',
    order: 1,
    title: 'زنگ اول (ریاضی)',
    startTime: '08:00',
    endTime: '09:30',
  },
  {
    id: 'p2',
    order: 2,
    title: 'زنگ دوم (علوم تجربی)',
    startTime: '09:45',
    endTime: '11:00',
  },
  {
    id: 'p3',
    order: 3,
    title: 'زنگ سوم (فارسی و نگارش)',
    startTime: '11:15',
    endTime: '12:30',
  },
  {
    id: 'p4',
    order: 4,
    title: 'زنگ چهارم (قرآن و پرورشی)',
    startTime: '12:45',
    endTime: '13:45',
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 's1',
    code: '101',
    firstName: 'امیرعلی',
    lastName: 'رضایی',
    parentPhone: '09121112233',
    avatarSeed: 'Amirali',
    note: 'دانش‌آموز فعال و نماینده کلاس',
  },
  {
    id: 's2',
    code: '102',
    firstName: 'محمدطاها',
    lastName: 'کریمی',
    parentPhone: '09122223344',
    avatarSeed: 'Mohammad',
    note: 'عضو تیم والیبال مدرسه',
  },
  {
    id: 's3',
    code: '103',
    firstName: 'کیان',
    lastName: 'کاظمی',
    parentPhone: '09123334455',
    avatarSeed: 'Kian',
    note: 'دارای برگه پزشکی درمانگاه',
  },
  {
    id: 's4',
    code: '104',
    firstName: 'آریا',
    lastName: 'صادقی',
    parentPhone: '09124445566',
    avatarSeed: 'Arya',
  },
  {
    id: 's5',
    code: '105',
    firstName: 'سید علی',
    lastName: 'حسینی',
    parentPhone: '09125556677',
    avatarSeed: 'Ali',
  },
  {
    id: 's6',
    code: '106',
    firstName: 'پارسا',
    lastName: 'محمدی',
    parentPhone: '09126667788',
    avatarSeed: 'Parsa',
  },
  {
    id: 's7',
    code: '107',
    firstName: 'بردیا',
    lastName: 'ابراهیمی',
    parentPhone: '09127778899',
    avatarSeed: 'Bardia',
  },
  {
    id: 's8',
    code: '108',
    firstName: 'دانیال',
    lastName: 'مرادی',
    parentPhone: '09128889900',
    avatarSeed: 'Danial',
  },
  {
    id: 's9',
    code: '109',
    firstName: 'رادین',
    lastName: 'نجفی',
    parentPhone: '09129990011',
    avatarSeed: 'Radin',
  },
  {
    id: 's10',
    code: '110',
    firstName: 'امیرحسین',
    lastName: 'باقری',
    parentPhone: '09131112233',
    avatarSeed: 'Amirhossein',
  },
  {
    id: 's11',
    code: '111',
    firstName: 'ماهان',
    lastName: 'قاسمی',
    parentPhone: '09132223344',
    avatarSeed: 'Mahan',
  },
  {
    id: 's12',
    code: '112',
    firstName: 'سامان',
    lastName: 'احمدی',
    parentPhone: '09133334455',
    avatarSeed: 'Saman',
  },
];

// داده‌های اولیه نمونه حضور و غیاب برای نمایش دقیق سناریوی مطرح شده توسط کاربر:
// کیان کاظمی: زنگ اول و دوم حاضر، زنگ سوم خروج با اجازه (مراجعه به دندانپزشکی)، زنگ چهارم به دلیل خروج زودهنگام غایب
// دانیال مرادی: کل روز غایب
// بردیا ابراهیمی: زنگ دوم خارج شده، زنگ سوم برگشته
export function getInitialAttendance(students: Student[], periods: Period[]): DayAttendanceMap {
  const map: DayAttendanceMap = {};
  const now = new Date().toISOString();

  for (const s of students) {
    map[s.id] = {};
    for (const p of periods) {
      map[s.id][p.id] = {
        status: 'present',
        timestamp: now,
      };
    }
  }

  // سناریوی کاربر برای دانش‌آموز کیان کاظمی (s3)
  if (map['s3']) {
    map['s3']['p1'] = { status: 'present', timestamp: now };
    map['s3']['p2'] = { status: 'present', timestamp: now };
    map['s3']['p3'] = {
      status: 'excused_exit',
      exitDetails: {
        exitTime: '11:20',
        reason: 'مراجعه به پزشک متخصص با هماهنگی ولی',
        authorizedBy: 'دفتر مدیریت / معاون انضباطی',
      },
      timestamp: now,
    };
    map['s3']['p4'] = {
      status: 'absent',
      exitDetails: {
        exitTime: '11:20',
        reason: 'عدم بازگشت پس از خروج زودهنگام موجه در زنگ قبلی',
        authorizedBy: 'دفتر مدرسه',
      },
      timestamp: now,
    };
  }

  // سناریوی دانش‌آموز غایب کامل دانیال مرادی (s8)
  if (map['s8']) {
    for (const p of periods) {
      map['s8'][p.id] = { status: 'absent', timestamp: now };
    }
  }

  // سناریوی خروج و بازگشت بردیا ابراهیمی (s7)
  if (map['s7']) {
    map['s7']['p1'] = { status: 'present', timestamp: now };
    map['s7']['p2'] = {
      status: 'excused_exit',
      exitDetails: {
        exitTime: '10:05',
        reason: 'انجام آزمایش خون و چکاپ پزشکی',
        authorizedBy: 'ناظم مدرسه',
        returnTime: '11:30',
      },
      timestamp: now,
    };
    map['s7']['p3'] = {
      status: 'returned',
      exitDetails: {
        exitTime: '10:05',
        reason: 'بازگشت به مدرسه پس از انجام آزمایش',
        authorizedBy: 'ناظم مدرسه',
        returnTime: '11:30',
      },
      timestamp: now,
    };
    map['s7']['p4'] = { status: 'present', timestamp: now };
  }

  return map;
}

export const DEFAULT_ACTIVITIES: ClassActivity[] = [
  {
    id: 'act1',
    date: '1403/08/16',
    periodId: 'p1',
    title: 'آزمون کوتاه کتبی فصل اول (ریاضی)',
    subject: 'ریاضی',
    type: 'quiz',
    description: '۵ سوال حل مساله معادله و هندسه پایه',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act2',
    date: '1403/08/16',
    periodId: 'p3',
    title: 'انشای کلاسی و خوانش متن ادبی',
    subject: 'فارسی',
    type: 'classwork',
    description: 'ارزیابی لحن خوانش و مهارت نگارش درس ۳',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_EVALUATIONS: ActivityEvaluation[] = [
  // فعالیت ۱ در زنگ ۱: کیان کاظمی حاضر بوده و نمره‌اش ثبت شده (نکته مهم کاربر: نباید با خروج در زنگ ۳ پاک شود!)
  {
    id: 'eval_act1_s1',
    activityId: 'act1',
    studentId: 's1',
    grade: 'very_good',
    teacherFeedback: 'پاسخ‌های کامل و دقیق',
    recordedAt: new Date().toISOString(),
  },
  {
    id: 'eval_act1_s2',
    activityId: 'act1',
    studentId: 's2',
    grade: 'good',
    teacherFeedback: 'حل مناسب با دقت در محاسبات',
    recordedAt: new Date().toISOString(),
  },
  {
    id: 'eval_act1_s3',
    activityId: 'act1',
    studentId: 's3',
    grade: 'very_good',
    teacherFeedback: 'در آزمون زنگ اول شرکت کرد و عملکرد عالی داشت',
    recordedAt: new Date().toISOString(),
  },
  // فعالیت ۲ در زنگ ۳: کیان کاظمی در زنگ ۳ خارج شده؛ پس باید «انجام‌نشده به علت خروج» باشد و نه صفر!
  {
    id: 'eval_act2_s1',
    activityId: 'act2',
    studentId: 's1',
    grade: 'very_good',
    teacherFeedback: 'خوانش روان با رعایت اصول نگارشی',
    recordedAt: new Date().toISOString(),
  },
  {
    id: 'eval_act2_s3',
    activityId: 'act2',
    studentId: 's3',
    grade: 'excused_absence',
    teacherFeedback: 'انجام‌نشده به علت خروج با اجازه مدرسه جهت مراجعه به پزشک (بدون امتیاز منفی)',
    recordedAt: new Date().toISOString(),
  },
];

// Helper functions for LocalStorage
const STORAGE_KEYS = {
  STUDENTS: 'teacher_assistant_students_v1',
  PERIODS: 'teacher_assistant_periods_v1',
  ATTENDANCE: 'teacher_assistant_attendance_v1',
  ACTIVITIES: 'teacher_assistant_activities_v1',
  EVALUATIONS: 'teacher_assistant_evaluations_v1',
  CLASS_INFO: 'teacher_assistant_class_info_v1',
};

export interface ClassInfo {
  schoolName: string;
  className: string;
  academicYear: string;
  teacherName: string;
}

export const DEFAULT_CLASS_INFO: ClassInfo = {
  schoolName: 'دبیرستان شهید بهشتی',
  className: 'کلاس نهم (شعبه ۱)',
  academicYear: '۱۴۰۴-۱۴۰۳',
  teacherName: 'استاد دایان',
};

export function loadClassInfo(): ClassInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASS_INFO);
    return raw ? JSON.parse(raw) : DEFAULT_CLASS_INFO;
  } catch {
    return DEFAULT_CLASS_INFO;
  }
}

export function saveClassInfo(info: ClassInfo) {
  localStorage.setItem(STORAGE_KEYS.CLASS_INFO, JSON.stringify(info));
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : DEFAULT_STUDENTS;
  } catch {
    return DEFAULT_STUDENTS;
  }
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function loadPeriods(): Period[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIODS);
    return raw ? JSON.parse(raw) : DEFAULT_PERIODS;
  } catch {
    return DEFAULT_PERIODS;
  }
}

export function savePeriods(periods: Period[]) {
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
}

export function loadAttendance(students: Student[], periods: Period[]): DayAttendanceMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) return getInitialAttendance(students, periods);
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return getInitialAttendance(students, periods);
  }
}

export function saveAttendance(att: DayAttendanceMap) {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(att));
}

export function loadActivities(): ClassActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : DEFAULT_ACTIVITIES;
  } catch {
    return DEFAULT_ACTIVITIES;
  }
}

export function saveActivities(activities: ClassActivity[]) {
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

export function loadEvaluations(): ActivityEvaluation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    return raw ? JSON.parse(raw) : DEFAULT_EVALUATIONS;
  } catch {
    return DEFAULT_EVALUATIONS;
  }
}

export function saveEvaluations(evals: ActivityEvaluation[]) {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
}

export function resetToDemoData(): {
  students: Student[];
  periods: Period[];
  attendance: DayAttendanceMap;
  activities: ClassActivity[];
  evaluations: ActivityEvaluation[];
  classInfo: ClassInfo;
} {
  const students = DEFAULT_STUDENTS;
  const periods = DEFAULT_PERIODS;
  const attendance = getInitialAttendance(students, periods);
  const activities = DEFAULT_ACTIVITIES;
  const evaluations = DEFAULT_EVALUATIONS;
  const classInfo = DEFAULT_CLASS_INFO;

  saveStudents(students);
  savePeriods(periods);
  saveAttendance(attendance);
  saveActivities(activities);
  saveEvaluations(evaluations);
  saveClassInfo(classInfo);

  return { students, periods, attendance, activities, evaluations, classInfo };
}
