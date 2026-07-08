import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Share2, Eye, Info, CheckSquare, Square } from 'lucide-react';
import { Link } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: Link[];
  onCopySuccess: () => void;
}

export default function ShareModal({ isOpen, onClose, links, onCopySuccess }: ShareModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Auto select all links by default when opening
  useEffect(() => {
    setSelectedIds(links.map((l) => l.id));
  }, [links, isOpen]);

  // Generate share URL based on selection
  useEffect(() => {
    if (selectedIds.length === 0) {
      setShareUrl('');
      return;
    }

    const selectedLinks = links.filter((l) => selectedIds.includes(l.id));
    
    // Map to compact structure to minimize URL length
    const compact = selectedLinks.map((l) => ({
      t: l.title,
      u: l.url,
      d: l.description,
      c: l.category,
      g: l.tags,
      a: l.createdAt,
    }));

    try {
      const jsonStr = JSON.stringify(compact);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      const binaryStr = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
      const base64 = btoa(binaryStr);
      
      // Build absolute URL with query param
      const url = new URL(window.location.href);
      url.searchParams.set('share', base64);
      setShareUrl(url.toString());
    } catch (err) {
      console.error('Error generating share URL', err);
      setShareUrl('');
    }
  }, [selectedIds, links]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === links.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(links.map((l) => l.id));
    }
  };

  const handleToggleLink = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share URL: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative bg-white dark:bg-sage-dark-card w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-sage-border dark:border-sage-dark-border z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-sage-light dark:hover:bg-sage-dark-input cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-start gap-3">
          <div className="p-3 bg-sage-light dark:bg-sage-dark-border/20 text-sage dark:text-sage rounded-xl flex-shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Chia sẻ kho liên kết
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tạo trang web tĩnh công khai chỉ cho xem. Rất thích hợp để nhúng vào bio mạng xã hội hoặc chia sẻ cho nhóm.
            </p>
          </div>
        </div>

        {/* Information Callout */}
        <div className="flex gap-2.5 p-3 bg-sage-light/50 dark:bg-sage-dark-border/10 border border-sage-border dark:border-sage-dark-border rounded-xl text-sage-deep dark:text-sage text-xs mb-5">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Hệ thống mã hóa dữ liệu <strong>trực tiếp vào đường dẫn</strong>. Người nhận có thể xem ngay lập tức mà không cần tài khoản hay kết nối máy chủ!
          </p>
        </div>

        {/* Link List Selection */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chọn liên kết muốn chia sẻ ({selectedIds.length}/{links.length})
            </span>
            <button
              onClick={handleToggleSelectAll}
              className="text-xs text-sage hover:text-sage-dark dark:text-sage font-bold cursor-pointer"
            >
              {selectedIds.length === links.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto border border-sage-border dark:border-sage-dark-border rounded-xl divide-y divide-sage-border/30 dark:divide-sage-dark-border bg-sage-cream dark:bg-sage-dark-input/50">
            {links.map((link) => {
              const isChecked = selectedIds.includes(link.id);
              return (
                <div
                  key={link.id}
                  onClick={() => handleToggleLink(link.id)}
                  className="flex items-center gap-3 p-3 text-sm cursor-pointer hover:bg-sage-light dark:hover:bg-sage-dark-card transition-colors"
                >
                  <button className="text-slate-400 hover:text-sage dark:hover:text-sage">
                    {isChecked ? (
                      <CheckSquare className="w-4.5 h-4.5 text-sage" />
                    ) : (
                      <Square className="w-4.5 h-4.5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-grow">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {link.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {link.url}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage-light dark:bg-sage-dark-border text-sage-deep dark:text-sage-border flex-shrink-0 font-medium">
                    {link.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Link Result Box */}
        {shareUrl ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Đường dẫn chia sẻ công khai
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-grow px-3 py-2 text-xs font-mono bg-sage-cream dark:bg-sage-dark-input border border-sage-border dark:border-sage-dark-border rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-5 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-sage-dark text-white'
                    : 'bg-sage text-white hover:bg-sage-dark'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-sage hover:text-sage-dark dark:hover:text-sage flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Xem thử trang chia sẻ
              </a>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-rose-500 font-semibold py-4">
            Vui lòng chọn ít nhất một liên kết để tạo đường dẫn chia sẻ!
          </p>
        )}

        {/* Footer actions */}
        <div className="flex justify-end pt-4 mt-4 border-t border-sage-border dark:border-sage-dark-border">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card rounded-full transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
}
