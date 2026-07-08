import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-sage-dark-card border-sage-border dark:border-sage-dark-border';
          let textColor = 'text-slate-800 dark:text-slate-200';
          let iconColor = 'text-sage';
          let Icon = Info;

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
              textColor = 'text-emerald-800 dark:text-emerald-200';
              iconColor = 'text-emerald-500';
              Icon = CheckCircle;
              break;
            case 'error':
              bgColor = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50';
              textColor = 'text-rose-800 dark:text-rose-200';
              iconColor = 'text-rose-500';
              Icon = AlertCircle;
              break;
            case 'warning':
              bgColor = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50';
              textColor = 'text-amber-800 dark:text-amber-200';
              iconColor = 'text-amber-500';
              Icon = AlertTriangle;
              break;
            case 'info':
              bgColor = 'bg-sage-light dark:bg-sage-dark-border/20 border-sage-border dark:border-sage-dark-border';
              textColor = 'text-sage-deep dark:text-sage-border';
              iconColor = 'text-sage';
              Icon = Info;
              break;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto ${bgColor}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <p className={`text-sm font-semibold flex-grow ${textColor}`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0 p-1 rounded-full hover:bg-sage-light dark:hover:bg-sage-dark-input"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
