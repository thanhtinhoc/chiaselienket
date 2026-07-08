import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, FolderPlus, Tag, HelpCircle, Link as LinkIcon, Check } from 'lucide-react';
import { Link, CategoryOption } from '../types';

interface LinkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: {
    title: string;
    url: string;
    description: string;
    category: string;
    tags: string[];
  }) => void;
  initialData: Link | null;
  categories: CategoryOption[];
  onAddCategory: (name: string) => CategoryOption;
}

export default function LinkFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  onAddCategory,
}: LinkFormModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCatInput, setShowAddCatInput] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{ title?: string; url?: string; category?: string }>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setTags(initialData.tags);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      // Default to the first category if available
      setCategory(categories[0]?.name || '');
      setTags([]);
    }
    setTagInput('');
    setNewCatName('');
    setShowAddCatInput(false);
    setErrors({});
  }, [initialData, isOpen, categories]);

  // Handle Tag addition
  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle adding custom category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (name) {
      // Check if category already exists (case insensitive)
      const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        setCategory(existing.name);
        setNewCatName('');
        setShowAddCatInput(false);
      } else {
        const newCat = onAddCategory(name);
        setCategory(newCat.name);
        setNewCatName('');
        setShowAddCatInput(false);
      }
    }
  };

  const validateUrl = (testUrl: string) => {
    try {
      // Try parsing URL, or test regex
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          'localhost|' + // localhost
          '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})' + // IP
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      );
      return !!pattern.test(testUrl);
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; url?: string; category?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề liên kết';
    }

    let formattedUrl = url.trim();
    if (!formattedUrl) {
      newErrors.url = 'Vui lòng nhập đường dẫn URL';
    } else {
      // Auto prepended protocol if user did not supply it
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      
      if (!validateUrl(formattedUrl)) {
        newErrors.url = 'Đường dẫn URL không đúng định dạng (Ví dụ: https://example.com)';
      }
    }

    if (!category) {
      newErrors.category = 'Vui lòng chọn hoặc thêm một chuyên mục';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      url: formattedUrl,
      description: description.trim(),
      category,
      tags,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white dark:bg-sage-dark-card w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-sage-border dark:border-sage-dark-border z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-sage" />
                {initialData ? 'Chỉnh sửa liên kết' : 'Thêm liên kết mới'}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-sage-light dark:hover:bg-sage-dark-input"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tiêu đề */}
              <div>
                <label htmlFor="title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title-input"
                  type="text"
                  placeholder="Ví dụ: Google Search, GitHub, Tin tức công nghệ..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-sage-cream dark:bg-sage-dark-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all focus:outline-none focus:ring-2 ${
                    errors.title
                      ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950'
                      : 'border-sage-border dark:border-sage-dark-border focus:ring-sage focus:border-transparent'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Đường dẫn URL */}
              <div>
                <label htmlFor="url-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Đường dẫn (URL) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="url-input"
                    type="text"
                    placeholder="example.com hoặc https://google.com"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.url) setErrors({ ...errors, url: undefined });
                    }}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-sage-cream dark:bg-sage-dark-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all focus:outline-none focus:ring-2 ${
                      errors.url
                        ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950'
                        : 'border-sage-border dark:border-sage-dark-border focus:ring-sage focus:border-transparent'
                    }`}
                  />
                </div>
                {errors.url ? (
                  <p className="text-xs text-rose-500 mt-1">{errors.url}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Gợi ý: Hệ thống sẽ tự động thêm <code className="font-mono bg-sage-light dark:bg-sage-dark-input px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">https://</code> nếu thiếu.
                  </p>
                )}
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label htmlFor="desc-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Mô tả ngắn
                </label>
                <textarea
                  id="desc-input"
                  placeholder="Ghi chú nhanh về liên kết này (phím tắt, tài khoản, tác dụng...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-sage-border dark:border-sage-dark-border bg-sage-cream dark:bg-sage-dark-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                />
              </div>

              {/* Chuyên mục & Thêm Chuyên mục */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="category-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Chuyên mục <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCatInput(!showAddCatInput)}
                    className="text-xs text-sage hover:text-sage-dark font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    {showAddCatInput ? 'Hủy thêm chuyên mục' : 'Thêm chuyên mục mới'}
                  </button>
                </div>

                {/* Custom Category Input Form */}
                <AnimatePresence>
                  {showAddCatInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-3 bg-sage-light/50 dark:bg-sage-dark-input p-3 rounded-xl border border-sage-border dark:border-sage-dark-border"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tên chuyên mục mới..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateCategory(e);
                            }
                          }}
                          className="flex-grow px-3 py-1.5 text-xs rounded-lg border border-sage-border dark:border-sage-dark-border bg-white dark:bg-sage-dark-card text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleCreateCategory(e)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-sage hover:bg-sage-dark rounded-full flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Thêm
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showAddCatInput && (
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) setErrors({ ...errors, category: undefined });
                    }}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-sage-cream dark:bg-sage-dark-input text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      errors.category
                        ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950'
                        : 'border-sage-border dark:border-sage-dark-border focus:ring-sage focus:border-transparent'
                    }`}
                  >
                    <option value="" disabled>-- Chọn chuyên mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.category && (
                  <p className="text-xs text-rose-500 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Nhãn tag */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Nhãn tag
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Gõ nhãn tag rồi nhấn enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-sage-border dark:border-sage-dark-border bg-sage-cream dark:bg-sage-dark-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-4 bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card text-sage-deep dark:text-slate-200 rounded-full transition-all font-bold text-xs cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>

                {/* Display tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 max-h-24 overflow-y-auto p-1 bg-sage-cream dark:bg-sage-dark-input/45 rounded-xl border border-sage-border dark:border-sage-dark-border">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-semibold bg-sage-light dark:bg-sage-dark-border text-sage-deep dark:text-sage-border border border-sage-border dark:border-sage-dark-border"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-sage dark:hover:bg-sage-dark text-sage-deep/50 hover:text-white dark:text-sage border border-transparent"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-sage-border dark:border-sage-dark-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card rounded-full transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-sage hover:bg-sage-dark active:scale-95 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {initialData ? 'Lưu thay đổi' : 'Thêm liên kết'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

