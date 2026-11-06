import React, { useState } from 'react';
import { Sliders, Plus, Trash2, Clock, X, Check } from 'lucide-react';
import { Period } from '../types';
import { toPersianDigits } from '../utils/persianDate';

interface PeriodManagerModalProps {
  isOpen: boolean;
  periods: Period[];
  onClose: () => void;
  onSavePeriods: (updatedPeriods: Period[]) => void;
}

export const PeriodManagerModal: React.FC<PeriodManagerModalProps> = ({
  isOpen,
  periods,
  onClose,
  onSavePeriods,
}) => {
  if (!isOpen) return null;

  const [periodList, setPeriodList] = useState<Period[]>(JSON.parse(JSON.stringify(periods)));

  const handleUpdate = (id: string, field: keyof Period, value: any) => {
    setPeriodList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleAddPeriod = () => {
    const nextOrder = periodList.length + 1;
    const newP: Period = {
      id: `p_${Date.now()}`,
      order: nextOrder,
      title: `زنگ ${toPersianDigits(nextOrder)}`,
      startTime: '13:00',
      endTime: '14:00',
    };
    setPeriodList([...periodList, newP]);
  };

  const handleDeletePeriod = (id: string) => {
    if (periodList.length <= 1) {
      alert('حداقل وجود یک زنگ آموزشی الزامی است.');
      return;
    }
    const updated = periodList
      .filter((p) => p.id !== id)
      .map((p, index) => ({ ...p, order: index + 1 }));
    setPeriodList(updated);
  };

  const handleSave = () => {
    onSavePeriods(periodList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* هدر */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">تنظیم زنگ‌های تحصیلی مدرسه</h3>
              <p className="text-xs text-white/80">
                تعریف تعداد زنگ‌های دلخواه و ساعات هر زنگ برای کلاس
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بدنه */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
          <div className="space-y-3">
            {periodList.map((period, index) => (
              <div
                key={period.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {toPersianDigits(index + 1)}
                  </span>
                  <input
                    type="text"
                    value={period.title}
                    onChange={(e) => handleUpdate(period.id, 'title', e.target.value)}
                    placeholder="عنوان زنگ..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">از</span>
                    <input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handleUpdate(period.id, 'startTime', e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <span className="text-slate-400">تا</span>
                    <input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handleUpdate(period.id, 'endTime', e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    onClick={() => handleDeletePeriod(period.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddPeriod}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن زنگ تحصیلی جدید</span>
          </button>
        </div>

        {/* دکمه‌های فوتر */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>ذخیره تنظیمات زنگ‌ها</span>
          </button>
        </div>

      </div>
    </div>
  );
};
