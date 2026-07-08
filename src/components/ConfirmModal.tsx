import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white dark:bg-sage-dark-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-sage-border dark:border-sage-dark-border z-10"
          >
            {/* Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-sage-light dark:hover:bg-sage-dark-input"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-rose-600 dark:text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card rounded-full transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Xác nhận xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
