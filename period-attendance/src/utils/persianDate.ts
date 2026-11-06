import { AttendanceStatus, DescriptiveGrade } from '../types';

// تبدیل اعداد انگلیسی به فارسی برای زیبایی تایپوگرافی
export function toPersianDigits(n: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

// محاسبه تاریخ شمسی امروز به صورت رشته
export function getPersianToday(): {
  fullDate: string;
  dayName: string;
  dayNumber: string;
  monthName: string;
  year: string;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const parts = formatter.formatToParts(now);
  let dayName = '';
  let dayNumber = '';
  let monthName = '';
  let year = '';

  for (const part of parts) {
    if (part.type === 'weekday') dayName = part.value;
    if (part.type === 'day') dayNumber = part.value;
    if (part.type === 'month') monthName = part.value;
    if (part.type === 'year') year = part.value;
  }

  const fullDate = `${year}/${monthName}/${dayNumber}`;
  return { fullDate, dayName, dayNumber, monthName, year };
}

// وضعیت‌های حضور و غیاب
export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    textClass: string;
    borderClass: string;
    bgClass: string;
    iconName: string;
  }
> = {
  present: {
    label: 'حاضر در کلاس',
    shortLabel: 'حاضر',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconName: 'CheckCircle2',
  },
  absent: {
    label: 'غایب از مدرسه',
    shortLabel: 'غایب',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-500/30',
    bgClass: 'bg-rose-50 dark:bg-rose-950/20',
    iconName: 'XCircle',
  },
  excused_exit: {
    label: 'خروج با اجازه مدرسه',
    shortLabel: 'خروج موجه',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
    iconName: 'LogOut',
  },
  returned: {
    label: 'بازگشت پس از خروج',
    shortLabel: 'بازگشته',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    textClass: 'text-sky-700 dark:text-sky-400',
    borderClass: 'border-sky-500/30',
    bgClass: 'bg-sky-50 dark:bg-sky-950/20',
    iconName: 'LogIn',
  },
};

// مقیاس توصیفی آموزش و پرورش
export const DESCRIPTIVE_GRADES_CONFIG: Record<
  DescriptiveGrade,
  {
    label: string;
    description: string;
    colorClass: string;
    badgeClass: string;
  }
> = {
  very_good: {
    label: 'خیلی خوب',
    description: 'تسلط کامل و فراتر از انتظار بر مباحث درسی',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  good: {
    label: 'خوب',
    description: 'درک مناسب و توانایی حل مسائل با راهنمایی اندک',
    colorClass: 'text-sky-600 dark:text-sky-400',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  },
  acceptable: {
    label: 'قابل قبول',
    description: 'دستیابی به حداقل انتظارات آموزشی با کمک معلم',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  },
  needs_effort: {
    label: 'نیازمند تلاش',
    description: 'نیازمند آموزش مجدد و تمرین هدفمند',
    colorClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  },
  excused_absence: {
    label: 'انجام‌نشده (خروج با اجازه)',
    description: 'به دلیل خروج موجه در زمان این زنگ، بدون کسر امتیاز ثبت شد',
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
};
