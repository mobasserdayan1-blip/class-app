import React, { useState } from 'react';
import { FileCheck2, X, Plus } from 'lucide-react';
import { Period } from '../types';

interface NewActivityModalProps {
  isOpen: boolean;
  periods: Period[];
  activePeriodId: string;
  onClose: () => void;
  onCreateActivity: (data: {
    title: string;
    subject: string;
    periodId: string;
    type: 'quiz' | 'classwork' | 'homework' | 'project';
    description?: string;
  }) => void;
}

const SUBJECT_OPTIONS = ['ریاضی', 'علوم تجربی', 'فارسی و نگارش', 'قرآن و معارف', 'مطالعات اجتماعی', 'زبان انگلیسی', 'کار و فناوری'];

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  periods,
  activePeriodId,
  onClose,
  onCreateActivity,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [periodId, setPeriodId] = useState(activePeriodId);
  const [type, setType] = useState<'quiz' | 'classwork' | 'homework' | 'project'>('quiz');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalSubject = customSubject.trim() ? customSubject.trim() : subject;
    onCreateActivity({
      title: title.trim(),
      subject: finalSubject,
      periodId,
      type,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* هدر */}
        <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">تعریف آزمون یا فعالیت کلاسی جدید</h3>
              <p className="text-xs text-white/90">
                اختصاص به یک زنگ تحصیلی مشخص
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان آزمون یا فعالیت:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: آزمون کلاسی درس سوم، حل تمرین صفحه ۴۵..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                مربوط به کدام زنگ؟
              </label>
              <select
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع فعالیت:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
              >
                <option value="quiz">آزمون کتبی / کوییز</option>
                <option value="classwork">فعالیت و تمرین کلاسی</option>
                <option value="homework">تکلیف منزل</option>
                <option value="project">پروژه و تحقیق</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              نام درس:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
              <option value="other">درس دیگر (تایپ دستی)...</option>
            </select>

            {subject === 'other' && (
              <input
                type="text"
                required
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="نام درس را وارد کنید..."
                className="mt-2 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              توضیحات تکمیلی (اختیاری):
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اهداف آموزشی یا مشخصات سوالات..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs"
            />
          </div>

          {/* دکمه‌های تایید */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              ایجاد فعالیت
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
