import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Copy, Check, Edit2, Trash2, Globe, Calendar, Tag } from 'lucide-react';
import { Link } from '../types';

interface LinkCardProps {
  key?: string | number;
  link: Link;
  isReadOnly?: boolean;
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
  onCopySuccess: () => void;
}

export default function LinkCard({
  link,
  isReadOnly = false,
  onEdit,
  onDelete,
  onCopySuccess,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Extract hostname for shortened URL and favicon
  const getDomain = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace('www.', '');
    } catch {
      return urlStr;
    }
  };

  const domain = getDomain(link.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Format date: e.g., "03 Tháng 7, 2026"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Assign nice badge colors based on category
  const getCategoryStyles = (cat: string) => {
    const norm = cat.toLowerCase().trim();
    if (norm === 'tin học' || norm === 'công việc' || norm === 'work' || norm === 'it') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
    }
    if (norm === 'học tập' || norm === 'study' || norm === 'education') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
    }
    if (norm === 'giải trí' || norm === 'entertainment' || norm === 'music' || norm === 'video') {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
    }
    if (norm === 'công cụ' || norm === 'tools' || norm === 'utility') {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30';
    }
    if (norm === 'tin tức' || norm === 'news' || norm === 'blog') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
    }
    return 'bg-slate-500/10 text-slate-400 border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white dark:bg-sage-dark-card rounded-2xl border border-sage-border dark:border-sage-dark-border p-5 shadow-xs hover:shadow-sm hover:border-sage dark:hover:border-sage transition-all flex flex-col justify-between h-full"
    >
      <div>
        {/* Card Header: Favicon + Domain + Category */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Favicon Container */}
            <div className="w-9 h-9 rounded-xl bg-sage-light dark:bg-sage-dark-input flex items-center justify-center flex-shrink-0 overflow-hidden border border-sage-border/50 dark:border-sage-dark-border/50">
              {imgError ? (
                <Globe className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              ) : (
                <img
                  src={faviconUrl}
                  alt={domain}
                  onError={() => setImgError(true)}
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            {/* Domain & Date */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-full font-mono">
                {domain}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(link.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getCategoryStyles(
              link.category
            )} truncate max-w-[120px]`}
          >
            {link.category}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-1.5 group-hover:text-sage dark:group-hover:text-sage transition-colors">
          {link.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed min-h-[48px]">
          {link.description || <span className="italic text-slate-300 dark:text-slate-600">Không có mô tả...</span>}
        </p>
      </div>

      {/* Tags and Action Bar */}
      <div>
        {/* Tags */}
        {link.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-4 h-[24px] overflow-hidden">
            {link.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sage-light/60 dark:bg-sage-dark-input/60 text-sage-deep dark:text-slate-400 border border-sage-border/40 dark:border-sage-dark-border/40"
              >
                #{tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 font-semibold self-center ml-0.5">
                +{link.tags.length - 3}
              </span>
            )}
          </div>
        ) : (
          <div className="mb-4 h-[24px]"></div> // Placeholder spacing
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3.5 border-t border-sage-border/50 dark:border-sage-dark-border">
          <div className="flex items-center gap-1.5">
            {/* Open Link */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-sage hover:text-white hover:bg-sage dark:text-sage dark:hover:text-slate-950 dark:hover:bg-sage border border-sage hover:border-transparent dark:hover:border-transparent transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở</span>
            </a>

            {/* Quick Copy */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                copied
                  ? 'bg-sage-light dark:bg-sage text-sage-deep dark:text-slate-950 border-transparent'
                  : 'bg-white hover:bg-sage-light dark:bg-sage-dark-input dark:hover:bg-sage-dark-card text-slate-600 dark:text-slate-300 border-sage-border dark:border-sage-dark-border'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Chép'}</span>
            </button>
          </div>

          {/* Admin Operations */}
          {!isReadOnly && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit && onEdit(link)}
                title="Sửa thông tin"
                className="p-1.5 rounded-full text-slate-400 hover:text-sage hover:bg-sage-light dark:hover:bg-sage-dark-card transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete && onDelete(link)}
                title="Xóa liên kết"
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-450 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
