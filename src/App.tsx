import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link2,
  Plus,
  Search,
  Share2,
  Sun,
  Moon,
  FolderOpen,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Link2Off,
  Tag,
  ArrowUpDown,
  BookOpen,
  Info,
  CornerRightDown,
  Shield,
  Eye,
  Database,
  Cloud,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Link, CategoryOption, ToastMessage, ToastType, SortOption } from './types';
import ToastContainer from './components/ToastContainer';
import ConfirmModal from './components/ConfirmModal';
import LinkFormModal from './components/LinkFormModal';
import ShareModal from './components/ShareModal';
import LinkCard from './components/LinkCard';
import PinModal from './components/PinModal';
import { db, handleFirestoreError, OperationType, hasFirebaseConfig } from './lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, addDoc } from 'firebase/firestore';

// Pre-defined beautiful preset categories
const PRESET_CATEGORIES: CategoryOption[] = [
  { id: 'cat-work', name: 'Tin học', color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900' },
  { id: 'cat-study', name: 'Học tập', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900' },
  { id: 'cat-ent', name: 'Giải trí', color: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900' },
  { id: 'cat-tool', name: 'Công cụ', color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900' },
  { id: 'cat-news', name: 'Tin tức', color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900' },
  { id: 'cat-other', name: 'Khác', color: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-800' },
];

// High quality realistic pre-loaded links
const DEFAULT_LINKS: Link[] = [
  {
    id: 'link-1',
    title: 'Google Search',
    url: 'https://www.google.com',
    description: 'Công cụ tìm kiếm thông tin lớn nhất thế giới, hỗ trợ tìm kiếm và định vị tri thức nhanh chóng.',
    category: 'Công cụ',
    tags: ['search', 'google', 'daily'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'link-2',
    title: 'GitHub Nền Tảng Lưu Trữ Code',
    url: 'https://github.com',
    description: 'Nền tảng lưu trữ mã nguồn, đóng góp cộng đồng mã nguồn mở và quản lý dự án lập trình phổ biến nhất thế giới.',
    category: 'Tin học',
    tags: ['code', 'developer', 'github'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'link-3',
    title: 'Vercel Hosting',
    url: 'https://vercel.com',
    description: 'Dịch vụ lưu trữ máy chủ serverless tuyệt vời cho các ứng dụng React, Next.js và web tĩnh với tốc độ phản hồi cực nhanh.',
    category: 'Công cụ',
    tags: ['hosting', 'web', 'deploy'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'link-4',
    title: 'Học tập lập trình W3Schools',
    url: 'https://www.w3schools.com',
    description: 'Nơi tự học phát triển ứng dụng web miễn phí hàng đầu với hàng nghìn bài giảng thực hành HTML, CSS, JavaScript, SQL.',
    category: 'Học tập',
    tags: ['learn', 'html', 'css', 'javascript'],
    createdAt: new Date().toISOString(), // today
  }
];

export default function App() {
  // Application Data States
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(PRESET_CATEGORIES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('admin');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isFirebaseLocked, setIsFirebaseLocked] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Shared Link View States
  const [isShareView, setIsShareView] = useState(false);
  const [sharedLinks, setSharedLinks] = useState<Link[] | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Modals Controller States
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<Link | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Load Theme and Firestore on Mount
  useEffect(() => {
    // 1. Theme Configuration
    setTheme('dark');
    document.documentElement.classList.add('dark');

    // 2. Parse Share URL Parameter if exists
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
      try {
        const binaryStr = atob(shareData);
        const bytes = new Uint8Array(Array.from(binaryStr, (char) => char.charCodeAt(0)));
        const jsonStr = new TextDecoder().decode(bytes);
        const decodedCompact = JSON.parse(jsonStr);
        
        // Map compact structures back to standard link structure
        const decoded: Link[] = decodedCompact.map((c: any, index: number) => ({
          id: `shared-${index}`,
          title: c.t || '',
          url: c.u || '',
          description: c.d || '',
          category: c.c || 'Khác',
          tags: c.g || [],
          createdAt: c.a || new Date().toISOString(),
        }));
        setSharedLinks(decoded);
        setIsShareView(true);
        addToast('Đã tải kho liên kết chia sẻ thành công!', 'info');
        return; // Skip loading from Firestore if in share mode
      } catch (err) {
        console.error('Failed to parse share parameter', err);
        addToast('Không thể giải mã đường dẫn chia sẻ!', 'error');
      }
    }

    // 3. Firestore Sync for Links
    setFirebaseStatus('connecting');
    setErrorMsg(null);

    const linksCol = collection(db, 'links');
    const unsubscribeLinks = onSnapshot(linksCol, (snapshot) => {
      setFirebaseStatus('connected');
      setIsFirebaseLocked(false);
      setErrorMsg(null);

      if (snapshot.empty) {
        // Seed default links
        DEFAULT_LINKS.forEach(async (link) => {
          try {
            await setDoc(doc(db, 'links', link.id), {
              ...link,
              updatedAt: new Date().toISOString()
            });
          } catch (err) {
            console.error('Lỗi khởi tạo liên kết mặc định:', err);
          }
        });
      } else {
        const loadedLinks: Link[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedLinks.push({
            id: doc.id,
            title: data.title || '',
            url: data.url || '',
            description: data.description || '',
            category: data.category || '',
            tags: data.tags || [],
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || data.createdAt || '',
          } as Link);
        });
        setLinks(loadedLinks);
      }
    }, (error: any) => {
      console.error('Lỗi kết nối Firebase / Firestore:', error);
      setErrorMsg(error?.message || String(error));
      setFirebaseStatus('error');
      // Set to defaults as visual backup
      setLinks((prev) => prev.length === 0 ? DEFAULT_LINKS : prev);
      addToast('Lỗi kết nối Firebase: ' + (error?.message || error), 'error');
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeLinks();
    };
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toast System Actions
  const addToast = (message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRoleChange = (role: 'admin' | 'viewer') => {
    if (role === 'admin') {
      setIsPinModalOpen(true);
    } else {
      setUserRole('viewer');
      addToast('Đã chuyển sang quyền: Người xem', 'info');
    }
  };

  const handlePinSuccess = () => {
    setUserRole('admin');
  };

  // Categories Dynamic Adder
  const handleAddCategory = (name: string): CategoryOption => {
    if (userRole === 'viewer') {
      addToast('Bạn đang ở chế độ Người xem. Không thể thêm chuyên mục mới!', 'warning');
      return { id: '', name: '', color: '' };
    }
    const colors = [
      'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
      'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900',
      'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900',
      'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900',
      'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900',
      'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCatId = `cat-${Date.now()}`;
    const newCat: CategoryOption = {
      id: newCatId,
      name,
      color: randomColor,
    };
    
    setCategories((prev) => [...prev, newCat]);
    addToast(`Đã thêm chuyên mục "${name}"`, 'success');
    return newCat;
  };

  // Link Management Operations
  const handleSaveLink = async (linkData: {
    title: string;
    url: string;
    description: string;
    category: string;
    tags: string[];
  }) => {
    if (userRole === 'viewer') {
      addToast('Bạn đang ở chế độ Người xem. Không thể lưu liên kết!', 'warning');
      return;
    }

    if (editingLink) {
      // Editing Firestore - Phải truyền đầy đủ 'id' và 'createdAt' để đảm bảo đi qua bộ quy tắc bảo mật (firestore.rules)
      try {
        await updateDoc(doc(db, 'links', editingLink.id), { 
          id: editingLink.id,
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          category: linkData.category,
          tags: linkData.tags,
          createdAt: editingLink.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        addToast('Cập nhật liên kết thành công!', 'success');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `links/${editingLink.id}`);
      }
    } else {
      // Adding New Firestore with addDoc - Bắt buộc phải có thuộc tính 'id' trong payload để đi qua bộ quy tắc bảo mật (firestore.rules)
      try {
        const tempId = doc(collection(db, 'links')).id;
        const newDocPayload = {
          id: tempId,
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          category: linkData.category,
          tags: linkData.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'links'), newDocPayload);
        addToast('Đã lưu thêm liên kết mới thành công!', 'success');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `links`);
      }
    }

    setIsLinkFormOpen(false);
    setEditingLink(null);
  };

  const handleDeleteTrigger = (link: Link) => {
    if (userRole === 'viewer') {
      addToast('Bạn đang ở chế độ Người xem. Không thể xóa liên kết!', 'warning');
      return;
    }
    setLinkToDelete(link);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userRole === 'viewer') {
      addToast('Bạn đang ở chế độ Người xem. Không thể xóa liên kết!', 'warning');
      return;
    }
    if (!linkToDelete) return;

    try {
      await deleteDoc(doc(db, 'links', linkToDelete.id));
      addToast('Đã xóa liên kết thành công!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `links/${linkToDelete.id}`);
    }
    setIsConfirmOpen(false);
    setLinkToDelete(null);
  };

  // Test Firebase connection by writing a mock document to links collection
  const testFirebaseConnection = async () => {
    try {
      const testDoc = {
        id: doc(collection(db, 'links')).id, // Thêm id để đi qua rules kiểm tra của Firestore
        title: 'Kiểm tra kết nối Firebase',
        url: 'https://firebase.google.com',
        description: `Kiểm tra thành công lúc ${new Date().toLocaleTimeString()} (Ứng dụng kết nối trực tiếp)`,
        category: 'Công cụ',
        tags: ['test', 'firebase'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'links'), testDoc);
      addToast('Kết nối Firestore thành công! Ghi thành công tài liệu ID: ' + docRef.id, 'success');
    } catch (error: any) {
      console.error('Lỗi kiểm tra Firebase:', error);
      addToast('Lỗi kiểm tra Firebase: ' + (error?.message || error), 'error');
    }
  };

  const handleEditTrigger = (link: Link) => {
    if (userRole === 'viewer') {
      addToast('Bạn đang ở chế độ Người xem. Không thể chỉnh sửa liên kết!', 'warning');
      return;
    }
    setEditingLink(link);
    setIsLinkFormOpen(true);
  };

  // Extract all unique tags dynamically
  const allUniqueTags = useMemo(() => {
    const activeList = isShareView ? (sharedLinks || []) : links;
    const tagsSet = new Set<string>();
    activeList.forEach((link) => {
      link.tags.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [links, sharedLinks, isShareView]);

  // Main Search/Filtering/Sorting Pipeline
  const filteredLinks = useMemo(() => {
    const activeList = isShareView ? (sharedLinks || []) : links;
    let result = [...activeList];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (l) => l.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    // Tag Filter
    if (selectedTag !== 'all') {
      result = result.filter((l) => l.tags.includes(selectedTag));
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.url.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query) ||
          l.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sorting Logic
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'az') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else if (sortBy === 'za') {
      result.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    }

    return result;
  }, [links, sharedLinks, isShareView, selectedCategory, selectedTag, searchQuery, sortBy]);

  // View switch out of share view back to my dashboard
  const handleReturnToDashboard = () => {
    // Clear url query and refresh
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    window.location.href = url.pathname; // triggers reload without search param
  };

  return (
    <div className="min-h-screen bg-sage-cream dark:bg-sage-dark-bg text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-sage-dark-card/80 backdrop-blur-md border-b border-sage-border dark:border-sage-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center text-white shadow-sm">
              <Link2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center flex-wrap gap-1.5">
                {isShareView ? 'Kho Liên Kết Chia Sẻ' : 'Kho Liên Kết Của Tôi'}
                {isShareView ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sage-light dark:bg-sage-dark-border text-sage-deep dark:text-sage-border border border-sage-border dark:border-sage-dark-border flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Công khai
                  </span>
                ) : (
                  <>
                    {firebaseStatus === 'connecting' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center gap-1">
                        <Cloud className="w-3 h-3 animate-pulse" /> Đang kết nối...
                      </span>
                    )}
                    {firebaseStatus === 'error' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                        <Link2Off className="w-3 h-3" /> Lỗi kết nối Firebase
                      </span>
                    )}
                    {firebaseStatus === 'connected' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1" title="Kết nối và đồng bộ hóa đám mây Firebase hoạt động bình thường.">
                        <Cloud className="w-3 h-3" /> Đã kết nối Firebase
                      </span>
                    )}
                  </>
                )}
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">
                {isShareView ? 'Trang danh sách liên kết được gửi từ người dùng' : 'Lưu trữ, sắp xếp và chia sẻ liên kết yêu thích'}
              </p>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-2">

            {/* Role Switcher */}
            {!isShareView && (
              <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1 rounded-xl border border-sage-border dark:border-sage-dark-border gap-0.5 mr-1">
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    userRole === 'admin'
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  title="Quyền người quản trị: Có toàn quyền thêm, sửa, xóa liên kết"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Quản trị</span>
                </button>
                <button
                  onClick={() => handleRoleChange('viewer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    userRole === 'viewer'
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  title="Quyền người xem: Chỉ xem danh sách liên kết, không có quyền chỉnh sửa"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Người xem</span>
                </button>
              </div>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              className="p-2.5 rounded-xl border border-sage-border dark:border-sage-dark-border text-slate-500 dark:text-slate-400 hover:bg-sage-light dark:hover:bg-sage-dark-card transition-all cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {isShareView ? (
              /* Public / Share Mode CTAs */
              <button
                onClick={handleReturnToDashboard}
                className="px-5 py-2 text-xs sm:text-sm font-semibold bg-sage hover:bg-sage-dark text-white rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Tạo kho riêng</span>
              </button>
            ) : (
              /* Admin/Dashboard mode CTAs */
              <>
                <button
                  onClick={() => setIsShareOpen(true)}
                  disabled={links.length === 0}
                  title="Chia sẻ kho liên kết"
                  className="p-2.5 rounded-xl border border-sage-border dark:border-sage-dark-border text-slate-500 dark:text-slate-400 hover:bg-sage-light dark:hover:bg-sage-dark-card transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 sm:px-3.5"
                >
                  <Share2 className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline text-xs font-semibold">Chia sẻ</span>
                </button>

                {userRole !== 'viewer' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={testFirebaseConnection}
                      title="Kiểm tra kết nối và ghi thử document mẫu vào Firebase"
                      className="px-4 py-2 border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Kiểm tra Firebase</span>
                      <span className="sm:hidden">Test</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingLink(null);
                        setIsLinkFormOpen(true);
                      }}
                      className="px-5 py-2 bg-sage text-white rounded-full text-sm font-medium hover:bg-sage-dark transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      <span>Thêm liên kết</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </header>

      {/* 2. Main Content Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl text-red-650 dark:text-red-400 text-xs sm:text-sm">
            <div className="flex gap-2.5 items-center">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-bold">Lỗi kết nối Firebase / Firestore:</p>
                <p className="mt-1 font-mono text-[11px] bg-red-500/5 p-2 rounded border border-red-500/10 whitespace-pre-wrap">{errorMsg}</p>
                <p className="mt-2 text-xs opacity-80">
                  Mẹo: Hãy đảm bảo bạn đã tạo Database trong Firebase Console, kích hoạt Firestore ở chế độ test (allow read, write: if true) hoặc cập nhật Security Rules phù hợp.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Viewer Mode Alert Banner */}
        {!isShareView && userRole === 'viewer' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-650 dark:text-amber-400 text-xs sm:text-sm"
          >
            <div className="flex gap-2.5 items-center">
              <Eye className="w-4.5 h-4.5 flex-shrink-0" />
              <p className="leading-relaxed">
                Bạn đang xem ở chế độ <strong className="font-bold">Người xem</strong>. Các tính năng Thêm, Sửa, Xóa đã được ẩn đi để bảo vệ dữ liệu.
              </p>
            </div>
            <button
              onClick={() => handleRoleChange('admin')}
              className="px-3.5 py-1.5 bg-amber-500 text-white dark:bg-amber-600 font-bold rounded-full text-xs hover:bg-amber-600 dark:hover:bg-amber-700 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Chuyển sang Quản trị
            </button>
          </motion.div>
        )}

        {/* Share Mode Jumbotron */}
        {isShareView && (
          <div className="mb-6 p-4 bg-sage-light/50 dark:bg-sage-dark-border/10 rounded-2xl border border-sage-border/60 dark:border-sage-dark-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2 bg-sage-light dark:bg-sage-dark-border/40 rounded-xl text-sage-deep dark:text-sage-border mt-1 sm:mt-0">
                <Info className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Bạn đang xem kho liên kết của bạn bè chia sẻ!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Trang này ở chế độ chỉ cho xem (Read-only). Bạn có thể sao chép nhanh hoặc mở liên kết bất cứ lúc nào.
                </p>
              </div>
            </div>
            <button
              onClick={handleReturnToDashboard}
              className="text-xs font-bold text-sage hover:text-sage-dark dark:text-sage hover:underline flex items-center gap-0.5 cursor-pointer flex-shrink-0"
            >
              Trở lại kho của tôi <CornerRightDown className="w-3.5 h-3.5 rotate-270" />
            </button>
          </div>
        )}

        {/* 3. Search, Filter, Sort Controls Panel */}
        <div className="bg-white dark:bg-sage-dark-card border border-sage-border dark:border-sage-dark-border rounded-2xl p-4 shadow-sm mb-8 space-y-4">
          
          {/* Row 1: Search & Sort */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, địa chỉ URL, mô tả hoặc nhãn tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-transparent bg-sage-light dark:bg-sage-dark-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Sorting Select */}
            <div className="relative min-w-[200px] flex-shrink-0">
              <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-transparent bg-sage-light dark:bg-sage-dark-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage transition-all appearance-none cursor-pointer"
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="az">Tên A - Z</option>
                <option value="za">Tên Z - A</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Categories Scrollable Selector */}
          <div className="border-t border-sage-border/40 dark:border-sage-dark-border pt-3 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" /> Lọc theo chuyên mục
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all flex-shrink-0 border ${
                  selectedCategory === 'all'
                    ? 'bg-sage border-sage text-white shadow-sm'
                    : 'bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card text-sage-deep dark:text-slate-300 border-transparent'
                }`}
              >
                Tất cả chuyên mục
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all flex-shrink-0 border ${
                      isSelected
                        ? 'bg-sage border-sage text-white shadow-sm'
                        : 'bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card text-sage-deep dark:text-slate-300 border-transparent'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Tags Cloud filter (Only show if tags exist) */}
          {allUniqueTags.length > 0 && (
            <div className="border-t border-sage-border/40 dark:border-sage-dark-border pt-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Lọc theo nhãn tag
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    selectedTag === 'all'
                      ? 'bg-sage text-white shadow-sm'
                      : 'bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card text-sage-deep dark:text-slate-400'
                  }`}
                >
                  Tất cả nhãn
                </button>
                {allUniqueTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-sage border-sage text-white shadow-sm'
                          : 'bg-sage-light hover:bg-[#e4e7dd] dark:bg-sage-dark-input dark:hover:bg-sage-dark-card text-sage-deep dark:text-slate-400 border-transparent'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 4. Filter Stats & Reset Info */}
        <div className="mb-5 flex justify-between items-center text-xs text-slate-450 dark:text-slate-500">
          <p>
            Tìm thấy <strong className="text-slate-700 dark:text-slate-300 font-semibold">{filteredLinks.length}</strong> liên kết
            {(selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery) && ' khớp bộ lọc'}
          </p>
          {(selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag('all');
                setSearchQuery('');
              }}
              className="text-sage font-bold hover:underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* 5. Links Display Stage */}
        <AnimatePresence mode="popLayout">
          {filteredLinks.length > 0 ? (
            /* Cards Grid Layout */
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  isReadOnly={isShareView || userRole === 'viewer'}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteTrigger}
                  onCopySuccess={() => addToast('Đã sao chép liên kết vào khay nhớ tạm!', 'success')}
                />
              ))}
            </motion.div>
          ) : (
            /* Beautiful empty state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-sage-dark-card border border-sage-border dark:border-sage-dark-border rounded-2xl py-16 px-4 text-center max-w-xl mx-auto shadow-sm flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-sage-light dark:bg-sage-dark-border/60 flex items-center justify-center text-sage mb-5">
                <Link2Off className="w-8 h-8" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {searchQuery || selectedCategory !== 'all' || selectedTag !== 'all'
                  ? 'Không có kết quả khớp bộ lọc'
                  : 'Chưa có liên kết nào ở đây'}
              </h3>
              
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-6 leading-relaxed">
                {searchQuery || selectedCategory !== 'all' || selectedTag !== 'all'
                  ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm nút Xóa bộ lọc phía trên để hiển thị lại toàn bộ.'
                  : 'Hãy thêm các trang web, đường dẫn, ghi chú liên kết công việc hoặc giải trí đầu tiên để quản lý dễ dàng.'}
              </p>

              {!isShareView && userRole !== 'viewer' && (
                <button
                  onClick={() => {
                    setEditingLink(null);
                    setIsLinkFormOpen(true);
                  }}
                  className="px-5 py-2 bg-sage hover:bg-sage-dark text-white text-sm font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Hãy thêm liên kết đầu tiên của bạn
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* 6. Footer section */}
      <footer className="mt-16 border-t border-sage-border dark:border-sage-dark-border py-8 bg-white dark:bg-sage-dark-card/40 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Kho Liên Kết Của Tôi. Thiết kế "Natural Tones" hiện đại, tinh giản. Tác giả: <strong className="font-bold text-slate-600 dark:text-slate-300">Thầy. Võ Châu Thanh</strong></p>
          <p className="flex items-center gap-1 font-semibold">
            <span>Thích hợp triển khai tĩnh trên</span>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sage hover:underline">Vercel</a>
          </p>
        </div>
      </footer>

      {/* 7. Modals Stage */}
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Add / Edit Form Modal */}
      <LinkFormModal
        isOpen={isLinkFormOpen}
        onClose={() => {
          setIsLinkFormOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveLink}
        initialData={editingLink}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Xóa liên kết này?"
        message={`Bạn có chắc chắn muốn xóa liên kết "${linkToDelete?.title}" không? Thao tác này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setLinkToDelete(null);
        }}
      />

      {/* Sharing Panel Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        links={links}
        onCopySuccess={() => addToast('Đã sao chép link chia sẻ vào khay nhớ tạm thành công!', 'success')}
      />

      {/* Admin PIN Verification Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        addToast={addToast}
      />

    </div>
  );
}
