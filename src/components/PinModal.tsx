import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, KeyRound } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function PinModal({ isOpen, onClose, onSuccess, addToast }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'admin123') {
      addToast('Mã PIN chính xác. Đã chuyển sang chế độ Quản trị!', 'success');
      onSuccess();
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
      addToast('Mã PIN không chính xác. Vui lòng thử lại!', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white dark:bg-sage-dark-card w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-sage-border dark:border-sage-dark-border z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-sage-light dark:hover:bg-sage-dark-input cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon & Title */}
            <div className="mb-5 flex flex-col items-center text-center mt-2">
              <div className="p-3.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-400 rounded-full flex-shrink-0 mb-3">
                <Lock className="w-6 h-6 text-sage" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Xác thực Quyền Quản trị
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Vui lòng nhập mã PIN bảo mật để truy cập các tính năng thêm, sửa, xóa liên kết.
              </p>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Nhập mã PIN (Gợi ý: admin123)"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (error) setError(false);
                    }}
                    autoFocus
                    className={`w-full pl-10 pr-4 py-2.5 text-sm text-center font-mono tracking-widest rounded-xl border bg-sage-cream dark:bg-sage-dark-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all focus:outline-none focus:ring-2 ${
                      error
                        ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950'
                        : 'border-sage-border dark:border-sage-dark-border focus:ring-sage focus:border-transparent'
                    }`}
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-rose-500 text-center mt-1.5 font-semibold animate-pulse">
                    Mã PIN sai! Vui lòng thử lại.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card rounded-full transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs sm:text-sm font-semibold text-white bg-sage hover:bg-sage-dark active:scale-95 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
