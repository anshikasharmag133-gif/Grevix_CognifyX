import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const Toast: React.FC = () => {
  const { toast, hideToast, theme } = useStudy();

  if (!toast) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 pointer-events-none animate-fadeIn">
      <div
        className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 transition-all ${
          toast.type === 'error'
            ? isDark
              ? 'bg-[#180A0A] border-red-500/40 text-red-200'
              : 'bg-red-50 border-red-200 text-red-900'
            : toast.type === 'success'
            ? isDark
              ? 'bg-[#0B2720] border-emerald-500/50 text-emerald-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : isDark
            ? 'bg-[#0A221B] border-teal-500/40 text-teal-100'
            : 'bg-teal-50 border-teal-200 text-teal-950'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Info className="w-5 h-5 text-teal-400" />
          )}
        </div>

        <div className="flex-1 text-xs font-medium leading-relaxed">
          {toast.message}
        </div>

        <button
          onClick={hideToast}
          className="p-1 rounded-lg opacity-60 hover:opacity-100 transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
