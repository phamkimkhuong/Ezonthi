import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAppStore } from '../../services/store';
import {
  BookOpen,
  Map,
  Bookmark,
  GraduationCap,
  Award,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  Lock,
  Users,
  Sparkles,
  LifeBuoy,
  TrendingUp,
  BookMarked,
  BookText,
  Loader,
  Sun,
  Moon,
  MessageSquareHeart,
  Bell,
  Target
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { SurveyModal } from '../../features/survey/SurveyModal';
import { AdminChatWidget } from '../chat/AdminChatWidget';
import { surveyService } from '../../services/surveyService';
import { UNIFIED_SURVEY } from '../../data/surveyData';
import type { SurveyConfig } from '../../types/surveyTypes';
import { storageService } from '../../services/storage';
import { progressService } from '../../services/progressService';
import { teacherService } from '../../services/teacherService';
import { authService } from '../../services/authService';
import { teacherAccessService } from '../../services/teacherAccessService';
import { PolicyModal } from '../common/PolicyModal';
import { ProfileModal } from '../common/ProfileModal';
import { DictionaryModal } from '../dictionary/DictionaryModal';
import { QuickLookupPopover } from '../dictionary/QuickLookupPopover';
import { FloatingDictionaryWidget } from '../dictionary/FloatingDictionaryWidget';
import { QuickLookupWrapper } from '../dictionary/QuickLookupWrapper';
import { cn } from '../../utils/cn';
import { getQuestionTypes, loadSubjectData, isSubjectDataLoaded } from '../../data';
import { getSubjectName, getSubjectIcon, getSubjectFromQuestionTypeId } from '../../utils/subject';
import { ROUTES } from '../../constants/routes';
import { changeCourseContext, COURSE_ROUTES, parseCoursePath } from '../../utils/courseRoutes';
import type { GradeCode, SubjectCode } from '../../types';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    darkMode,
    toggleDarkMode,
    selectedSubject,
    selectedGrade,
    setCourse,
    user,
    progressVersion,
    isPremium,
    isLoadingData,
    setIsLoadingData,
    isProfileModalOpen,
    setIsProfileModalOpen,
    unreadNotificationCount,
    setNotifications
  } = useAppStore();
  void progressVersion;
  const courseRoute = parseCoursePath(location.pathname);
  const courseSection = courseRoute?.section;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('otv10_sidebar_collapsed') === 'true';
  });
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveCollapsed = isMobile ? false : isSidebarCollapsed;
  const [isTeacher, setIsTeacher] = useState(false);
  const [realPendingCount, setRealPendingCount] = useState(0);
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    if (user) {
      notificationService.fetchNotifications(user.uid, selectedGrade).then((list) => {
        setNotifications(list);
      });
    } else {
      setNotifications([]);
    }
  }, [user, selectedGrade, setNotifications]);

  useEffect(() => {
    if (user && surveyService.shouldShowSurvey()) {
      const timer = setTimeout(() => {
        setActiveSurvey(UNIFIED_SURVEY);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDirectGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await authService.signInWithGoogle();
      useAppStore.getState().refreshProgress();
    } catch (err: any) {
      alert(err.message || 'Lỗi đăng nhập bằng Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const getActiveContextLabel = () => {
    const gradeLabel = selectedGrade === 'grade9'
      ? 'Lớp 9'
      : selectedGrade === 'grade11'
        ? 'Lớp 11'
        : selectedGrade === 'grade12'
          ? 'Lớp 12'
          : 'Lớp 10';
    const subjectLabel = getSubjectName(selectedSubject);
    const icon = getSubjectIcon(selectedSubject);
    return `${icon} ${subjectLabel} - ${gradeLabel}`;
  };

  const handleContextChange = (grade: GradeCode, subject: SubjectCode) => {
    const nextPath = changeCourseContext(location.pathname, grade, subject);
    setCourse(grade, subject);
    setIsContextDropdownOpen(false);
    navigate(nextPath);
  };

  const courseGroups = [
    {
      grade: 'grade9',
      gradeTitle: 'Lớp 9 Ôn vào 10',
      courses: [
        { code: 'math', name: 'Toán học', icon: '📐', isLocked: false },
        { code: 'english', name: 'Tiếng Anh', icon: '🗣️', isLocked: false },
      ]
    },
    {
      grade: 'grade10',
      gradeTitle: 'Lớp 10',
      courses: [
        { code: 'math', name: 'Toán học', icon: '📐', isLocked: false },
        { code: 'english', name: 'Tiếng Anh', icon: '🗣️', isLocked: false },
        { code: 'physics', name: 'Vật lý', icon: '⚛️', isLocked: false },
        { code: 'chemistry', name: 'Hóa học', icon: '⚗️', isLocked: false },
        { code: 'biology', name: 'Sinh học', icon: '🧬', isLocked: false },
        { code: 'history', name: 'Lịch sử', icon: '📜', isLocked: false },
      ]
    },
    {
      grade: 'grade11',
      gradeTitle: 'Lớp 11',
      courses: [
        { code: 'math', name: 'Toán học', icon: '📐', isLocked: false },
        { code: 'english', name: 'Tiếng Anh', icon: '🗣️', isLocked: false },
        { code: 'chemistry', name: 'Hóa học', icon: '⚗️', isLocked: false },
        { code: 'physics', name: 'Vật lý', icon: '⚛️', isLocked: false },
        { code: 'biology', name: 'Sinh học', icon: '🧬', isLocked: false },
      ]
    },
    {
      grade: 'future',
      gradeTitle: 'Lớp 12 (Sắp ra mắt)',
      courses: [
        { code: 'biology', name: 'Sinh học', icon: '🧬', isLocked: true },
      ]
    }
  ];

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('otv10_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Tự động nạp động dữ liệu môn học khi người dùng đổi Khối lớp hoặc Môn học
  useEffect(() => {
    let active = true;
    const load = async () => {
      const alreadyLoaded = isSubjectDataLoaded(selectedGrade, selectedSubject);
      if (!alreadyLoaded) {
        setIsLoadingData(true);
      }
      try {
        await loadSubjectData(selectedGrade, selectedSubject);
      } catch (err) {
        console.error("Lỗi khi nạp dữ liệu môn học:", err);
      } finally {
        if (active) {
          setIsLoadingData(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedGrade, selectedSubject, setIsLoadingData]);

  // Tự động đảm bảo thông tin hồ sơ của học sinh tồn tại trong Firestore collection 'users'
  useEffect(() => {
    if (user) {
      progressService.saveUserProfile(user);
    }
  }, [user]);

  // Khóa triệt để thanh cuộn của window/body trên Desktop để App Shell (sidebar + main) không bao giờ bị đẩy trôi
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlHeight = document.documentElement.style.height;

    const applyLayoutScrollLock = () => {
      if (window.innerWidth >= 768) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.documentElement.style.height = '100%';
        window.scrollTo(0, 0);
      } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.height = '';
      }
    };

    applyLayoutScrollLock();
    window.addEventListener('resize', applyLayoutScrollLock);

    return () => {
      window.removeEventListener('resize', applyLayoutScrollLock);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.height = prevHtmlHeight;
    };
  }, []);

  // Cập nhật tiêu đề động (Dynamic Title SEO)
  useEffect(() => {
    const path = location.pathname;
    const brandName = 'ezonthi';

    // Các trang có SeoHead riêng phải tự kiểm soát title, tránh layout ghi đè sau khi render.
    if (
      path === '/' ||
      path.startsWith('/on-thi-vao-10') ||
      path.startsWith('/lop-10') ||
      path.startsWith(ROUTES.ABOUT) ||
      (courseSection && ['roadmap', 'question-types', 'practice', 'advanced'].includes(courseSection))
    ) {
      return;
    }

    if (path.startsWith(ROUTES.TEACHER)) {
      document.title = `Góc Giáo Viên | ${brandName}`;
      return;
    }
    if (path.startsWith(ROUTES.ABOUT)) {
      document.title = `Giới Thiệu Nền Tảng | ${brandName}`;
      return;
    }
    if (path.startsWith(ROUTES.PREMIUM)) {
      document.title = `Nâng cấp Premium | ${brandName}`;
      return;
    }
    if (path.startsWith(ROUTES.SUPPORT)) {
      document.title = `Hỗ Trợ & Góp Ý | ${brandName}`;
      return;
    }
    if (courseSection === 'mistakes' || path.startsWith(ROUTES.MISTAKES)) {
      document.title = `Sổ Tay Sửa Lỗi Sai | ${brandName}`;
      return;
    }
    if (courseSection === 'exam' || path.startsWith(ROUTES.EXAM)) {
      const gradeLabel = selectedGrade === 'grade9' ? 'Lớp 9' : selectedGrade === 'grade10' ? 'Lớp 10' : selectedGrade === 'grade11' ? 'Lớp 11' : '9 - 12';
      document.title = `Thi Thử & Kiểm Tra ${gradeLabel} | ${brandName}`;
      return;
    }
    if (courseSection === 'ai-tutor' || path.startsWith(ROUTES.AI_TUTOR)) {
      document.title = `Gia Sư Socratic | ${brandName}`;
      return;
    }
    if (courseSection === 'vocabulary' || path.startsWith(ROUTES.VOCABULARY)) {
      document.title = `Từ Vựng Tiếng Anh Lớp 10 | ${brandName}`;
      return;
    }
    if (courseSection === 'grammar' || path.startsWith(ROUTES.GRAMMAR)) {
      document.title = `Cẩm Nang Ngữ Pháp Tiếng Anh (Lớp 9 - 12) | ${brandName}`;
      return;
    }

    // Theo môn và lớp
    const subjectLabel = selectedSubject === 'math' ? 'Toán Học' : selectedSubject === 'english' ? 'Tiếng Anh' : selectedSubject === 'chemistry' ? 'Hóa Học' : '';
    const gradeLabel = selectedGrade === 'grade9' ? 'Lớp 9' : selectedGrade === 'grade10' ? 'Lớp 10' : selectedGrade === 'grade11' ? 'Lớp 11' : '9-12';

    if (selectedGrade === 'grade9' && selectedSubject === 'english') {
      document.title = `Luyện Thi Vào 10 Môn Tiếng Anh | ${brandName}`;
    } else if (selectedGrade === 'grade9' && selectedSubject === 'math') {
      document.title = `Luyện Thi Vào 10 Môn Toán | ${brandName}`;
    } else if (subjectLabel) {
      document.title = `Học Tốt ${subjectLabel} ${gradeLabel} | ${brandName}`;
    } else {
      document.title = `${brandName} | Nền tảng Học tốt & Luyện thi Lớp 9 - 12`;
    }
  }, [selectedGrade, selectedSubject, location.pathname, courseSection]);

  useEffect(() => {
    let cancelled = false;
    setIsTeacher(false);
    setRealPendingCount(0);

    if (!user) {
      return () => {
        cancelled = true;
      };
    }

    teacherAccessService.isTeacher(user).then((allowed) => {
      if (!cancelled) {
        setIsTeacher(allowed);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Lấy số lượng bài chờ chấm thực tế trên Firestore để hiển thị Badge ở góc Giáo viên
  useEffect(() => {
    if (!user || !isTeacher) {
      setRealPendingCount(0);
      return;
    }

    const fetchRealPendingCount = async () => {
      try {
        const count = await teacherService.getRealPendingCount();
        setRealPendingCount(count);
      } catch (e) {
        console.error("Lỗi khi load real pending count ở sidebar:", e);
      }
    };

    fetchRealPendingCount();

    // Tự động tải lại mỗi 180 giây để báo bài mới cho Giáo viên (tiết kiệm Firestore read)
    const interval = setInterval(fetchRealPendingCount, 180000);
    return () => clearInterval(interval);
  }, [user, isTeacher]);



  const menuItems = [
    { path: COURSE_ROUTES.dashboard(selectedGrade, selectedSubject), label: 'Bảng điều khiển', icon: GraduationCap },
    { path: COURSE_ROUTES.roadmap(selectedGrade, selectedSubject), label: 'Lộ trình học', icon: Map },
    { path: COURSE_ROUTES.practice(selectedGrade, selectedSubject), label: 'Luyện tập', icon: BookOpen },
    ...(selectedGrade === 'grade10' && (selectedSubject === 'physics' || selectedSubject === 'math' || selectedSubject === 'chemistry' || selectedSubject === 'biology')
      ? [{
          path: COURSE_ROUTES.advanced(selectedGrade, selectedSubject),
          label: 'Chuyên đề nâng cao',
          icon: Target
        }]
      : []),
    ...(selectedSubject === 'english'
      ? [
          { path: COURSE_ROUTES.grammar(selectedGrade, selectedSubject), label: 'Ngữ pháp', icon: BookText },
          ...(selectedGrade === 'grade10'
            ? [{ path: COURSE_ROUTES.vocabulary(selectedGrade, selectedSubject), label: 'Từ vựng 10', icon: BookMarked }]
            : [])
        ]
      : []),
    { path: COURSE_ROUTES.aiTutor(selectedGrade, selectedSubject), label: 'Gia sư', icon: Sparkles },
    { path: COURSE_ROUTES.mistakes(selectedGrade, selectedSubject), label: 'Sổ lỗi sai', icon: Bookmark },
    {
      path: COURSE_ROUTES.exam(selectedGrade, selectedSubject),
      label: selectedGrade === 'grade9' ? 'Thi thử vào 10' : 'Thi thử & Kiểm tra',
      icon: Award
    },
    { path: ROUTES.AFFILIATE, label: 'Góc Đối Tác', icon: TrendingUp }
  ];

  // Tính toán nhanh tiến độ tổng quát
  const currentUserId = user?.uid || 'guest';
  const progress = storageService.getProgress(currentUserId);
  const currentQuestionTypes = getQuestionTypes(selectedGrade, selectedSubject);
  const currentCompletedCount = progress.completedLessons.filter(id => getSubjectFromQuestionTypeId(id) === selectedSubject).length;

  const canShowTeacherMenu = user ? (isTeacher || teacherAccessService.isBootstrapTeacher(user)) : false;

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (courseSection === 'dashboard') return 'Bảng điều khiển';
    if (courseSection === 'roadmap') return 'Lộ trình học';
    if (courseSection === 'question-types') return 'Dạng bài chi tiết';
    if (courseSection === 'practice') return 'Luyện tập';
    if (courseSection === 'advanced') return 'Chuyên đề nâng cao';
    if (courseSection === 'grammar') return 'Ngữ pháp Tiếng Anh';
    if (courseSection === 'vocabulary') return 'Từ vựng Tiếng Anh 10';
    if (courseSection === 'ai-tutor') return 'Gia sư Socratic';
    if (courseSection === 'mistakes') return 'Sổ lỗi sai';
    if (courseSection === 'exam') return selectedGrade === 'grade9' ? 'Thi thử vào 10' : 'Thi thử & Kiểm tra';
    if (path.startsWith('/dashboard')) return 'Bảng điều khiển';
    if (path.startsWith('/roadmap')) return 'Lộ trình học';
    if (path.startsWith('/question-types')) return 'Dạng bài chi tiết';
    if (path.startsWith('/practice')) return 'Luyện tập';
    if (path.startsWith(ROUTES.ADVANCED_PHYSICS_10)) return 'Chuyên đề nâng cao';
    if (path.startsWith(ROUTES.ADVANCED_MATH_10)) return 'Chuyên đề nâng cao';
    if (path.startsWith(ROUTES.ADVANCED_CHEMISTRY_10)) return 'Chuyên đề nâng cao';
    if (path.startsWith(ROUTES.ADVANCED_BIOLOGY_10)) return 'Chuyên đề nâng cao';
    if (path.startsWith('/grammar')) return 'Ngữ pháp Tiếng Anh';
    if (path.startsWith('/vocabulary')) return 'Từ vựng Tiếng Anh 10';
    if (path.startsWith('/ai-tutor')) return 'Gia sư Socratic';
    if (path.startsWith('/mistakes')) return 'Sổ lỗi sai';
    if (path.startsWith('/exam')) return selectedGrade === 'grade9' ? 'Thi thử vào 10' : 'Thi thử & Kiểm tra';
    if (path.startsWith('/news')) return 'Bảng Tin Thông Báo & Diễn Đàn';
    if (path.startsWith('/about')) return 'Giới thiệu nền tảng';
    if (path.startsWith('/teacher')) return 'Góc Giáo viên';
    if (path.startsWith('/affiliate')) return 'Góc Đối Tác Affiliate';
    if (path.startsWith('/support')) return 'Hỗ trợ & Góp ý';
    return 'Bảng điều khiển';
  };

  const logoPng = darkMode ? '/logo-removebg.png' : '/logo.png';
  const logoWebp = darkMode ? '/logo-removebg.png' : '/logo.webp';
  const shouldNoIndex = Boolean(courseRoute) || [
    ROUTES.DASHBOARD,
    ROUTES.ROADMAP,
    ROUTES.PRACTICE,
    ROUTES.ADVANCED_PHYSICS_10,
    ROUTES.ADVANCED_MATH_10,
    ROUTES.ADVANCED_CHEMISTRY_10,
    ROUTES.ADVANCED_BIOLOGY_10,
    ROUTES.EXAM,
    ROUTES.AI_TUTOR,
    ROUTES.MISTAKES,
    ROUTES.TEACHER,
    ROUTES.AFFILIATE,
    ROUTES.VOCABULARY,
    ROUTES.GRAMMAR,
    ROUTES.NEWS
  ].some(route => location.pathname === route || location.pathname.startsWith(`${route}/`));

  const prevSectionRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const currentSectionKey = `${selectedGrade}_${selectedSubject}_${courseSection || location.pathname.split('/')[1] || ''}`;
    if (prevSectionRef.current !== undefined && prevSectionRef.current !== currentSectionKey) {
      window.scrollTo(0, 0);
    }
    prevSectionRef.current = currentSectionKey;
  }, [courseSection, location.pathname, selectedGrade, selectedSubject]);

  return (
    <div className="min-h-screen md:min-h-0 md:h-screen md:overflow-hidden bg-background text-foreground flex flex-col md:flex-row font-sans transition-colors duration-200 overscroll-none">
      {shouldNoIndex && (
        <Helmet>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
      )}

      {/* 📱 Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(ROUTES.ABOUT)}>
          <picture>
            <source srcSet={logoWebp} type="image/webp" />
            <img src={logoPng} alt="ezonthi logo" width="240" height="131" className="h-10 w-auto max-w-[150px] object-contain shrink-0" />
          </picture>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.NEWS)}
              aria-label="Bảng tin thông báo"
              className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground border border-border/30 transition-all cursor-pointer flex items-center justify-center active:scale-95 relative"
              title="Bảng tin thông báo"
            >
              <Bell size={16} className={cn(unreadNotificationCount > 0 ? "text-brand-action animate-bounce" : "text-muted-foreground")} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none shadow-sm animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
            className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground border border-border/30 transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title={darkMode ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
          >
            {darkMode ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-brand-ink" />
            )}
          </button>

          <button
            onClick={() => navigate(ROUTES.SUPPORT)}
            aria-label="Trợ giúp"
            className={cn(
              "p-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border",
              location.pathname.startsWith(ROUTES.SUPPORT)
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground border-border/20"
            )}
          >
            <LifeBuoy size={16} className="text-primary shrink-0" />
            <span className="hidden sm:inline">Hỗ trợ</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-navigation"
            className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/75 transition-colors"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        id="sidebar-navigation"
        className={`
        fixed md:sticky top-0 left-0 bottom-0 z-50 md:z-30
        glass flex flex-col h-screen overflow-y-auto overscroll-contain
        transition-all duration-300 md:translate-x-0
        ${effectiveCollapsed ? 'w-64 md:w-22' : 'w-64 md:w-68'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className={cn(
          "border-b border-border/40 hidden md:flex items-center justify-center cursor-pointer group",
          effectiveCollapsed ? "p-4 h-20" : "px-4 py-4"
        )} onClick={() => navigate(ROUTES.ABOUT)}>
          {effectiveCollapsed ? (
            <picture>
              <source srcSet={logoWebp} type="image/webp" />
              <img src={logoPng} alt="ezonthi logo" width="240" height="131" className="w-12 h-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-300" />
            </picture>
          ) : (
            <picture>
              <source srcSet={logoWebp} type="image/webp" />
              <img src={logoPng} alt="ezonthi logo" width="240" height="131" className="h-auto w-full max-w-[240px] object-contain shrink-0 group-hover:scale-105 transition-transform duration-300" />
            </picture>
          )}
        </div>

        <div className={cn("px-4 py-3.5 border-b border-border/20 md:hidden", effectiveCollapsed && "px-2.5 py-3")}>
          <div className="relative">
            <button
              onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
              aria-label="Chọn khối học và môn học"
              aria-haspopup="true"
              aria-expanded={isContextDropdownOpen}
              className="w-full px-4 py-2.5 text-xs font-black rounded-2xl bg-secondary/50 border border-border/30 text-foreground transition-all flex items-center justify-between cursor-pointer shadow-sm active:scale-95"
            >
              <span className="truncate">{getActiveContextLabel()}</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0 ml-1.5", isContextDropdownOpen && "rotate-180")} />
            </button>

            {isContextDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsContextDropdownOpen(false)} />
                <div className="absolute left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/40 rounded-3xl shadow-xl p-3 space-y-3 z-40 max-h-[300px] overflow-y-auto">
                  {courseGroups.map((group) => (
                    <div key={group.grade} className="space-y-1.5">
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider px-2 block">
                        {group.gradeTitle}
                      </span>
                      <div className="space-y-0.5">
                        {group.courses.map((course) => {
                          const isActive = !course.isLocked && selectedGrade === group.grade && selectedSubject === course.code;
                          return (
                            <button
                              key={course.code}
                              disabled={course.isLocked}
                              aria-label={`Chọn môn ${course.name} - ${group.gradeTitle} ${course.isLocked ? '(Đã khóa)' : ''}`}
                              onClick={() => {
                                if (course.isLocked) return;
                                handleContextChange(group.grade as GradeCode, course.code as SubjectCode);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer relative",
                                course.isLocked
                                  ? "text-muted-foreground/50 cursor-not-allowed opacity-60"
                                  : isActive
                                    ? "bg-primary/10 text-primary font-black border-l-4 border-primary pl-2 shadow-inner"
                                    : "text-foreground hover:bg-secondary/60"
                              )}
                            >
                              <span className="shrink-0">{course.icon}</span>
                              <span className="flex-1 truncate">{course.name}</span>
                              {isActive && <Check size={14} className="text-primary absolute right-3" />}
                              {course.isLocked && <Lock size={10} className="text-muted-foreground/40 absolute right-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                aria-label={item.label}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-extrabold transition-all duration-300 cursor-pointer active:scale-98",
                  effectiveCollapsed && "justify-center px-2 py-3.5 gap-0",
                  isActive
                    ? 'bg-primary/10 text-primary border-l-[3px] border-primary pl-3.5 shadow-sm shadow-primary/5'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
                title={effectiveCollapsed ? item.label : undefined}
              >
                <Icon size={19} className={cn("shrink-0", isActive ? 'text-primary' : 'text-muted-foreground')} />
                {!effectiveCollapsed && (
                  <span>
                    {item.label}
                  </span>
                )}
                {!effectiveCollapsed && isActive && <ChevronRight size={14} className="ml-auto text-primary" />}
              </button>
            );
          })}

          {canShowTeacherMenu && (
            <div className={cn("pt-4 border-t border-border/20 mt-4", effectiveCollapsed && "pt-3 border-t border-border/10 mt-3")}>
              <button
                onClick={() => {
                  navigate('/teacher');
                  setIsSidebarOpen(false);
                }}
                aria-label="Góc Giáo viên"
                className={cn(
                  "w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-black transition-all duration-300 cursor-pointer border border-dashed relative active:scale-98",
                  effectiveCollapsed && "justify-center px-2 py-3.5 gap-0",
                  location.pathname === '/teacher'
                    ? "bg-brand-learning/10 text-brand-learning border-brand-learning/40"
                    : "text-brand-learning hover:bg-brand-learning/7 border-brand-learning/25"
                )}
                title={effectiveCollapsed ? "Góc Giáo viên 👩‍🏫" : undefined}
              >
                <Users size={19} className="text-brand-learning shrink-0" />
                {!effectiveCollapsed && <span>Góc Giáo viên 👩‍🏫</span>}
                {realPendingCount > 0 && (
                  <span className={cn(
                    "bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center shrink-0",
                    effectiveCollapsed
                      ? "absolute top-1 right-1.5 w-4 h-4 text-[8px]"
                      : "ml-auto w-5 h-5 shadow-md shadow-rose-500/20"
                  )}>
                    {realPendingCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {user && (
            <div className={cn("pt-3 mt-3 border-t border-border/20", effectiveCollapsed && "pt-2 mt-2")}>
              {(() => {
                const isSurveyCompleted = surveyService.getSurveyState().completed;
                return (
                  <button
                    onClick={() => {
                      setActiveSurvey(UNIFIED_SURVEY);
                      setIsSidebarOpen(false);
                    }}
                    aria-label="Khảo sát & Góp ý"
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer border border-dashed relative active:scale-98 text-brand-action hover:bg-brand-action/8 border-brand-action/30",
                      effectiveCollapsed && "justify-center px-2 py-3.5 gap-0",
                      !isSurveyCompleted && "ring-2 ring-brand-action/20 bg-brand-action/7"
                    )}
                    title={effectiveCollapsed ? "Khảo sát & Góp ý 💬" : undefined}
                  >
                    <MessageSquareHeart size={19} className="text-brand-action shrink-0" />
                    {!effectiveCollapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="truncate">Khảo sát & Góp ý 💬</span>
                        {!isSurveyCompleted && (
                          <span className="px-2 py-0.5 text-[9px] bg-brand-action text-white rounded-md font-black animate-pulse shadow-sm shrink-0 ml-1.5">
                            Mới 🎁
                          </span>
                        )}
                      </div>
                    )}
                    {effectiveCollapsed && !isSurveyCompleted && (
                      <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-action animate-ping" />
                    )}
                  </button>
                );
              })()}
            </div>
          )}
        </nav>

        {user && !isPremium && !effectiveCollapsed && (
          <div className="mx-4 my-3.5 p-4.5 rounded-2xl glass-premium text-center shrink-0 border border-amber-500/25 shadow-md shadow-amber-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-amber-400/20 rounded-full blur-xl -mr-3 -mt-3 group-hover:scale-125 transition-transform duration-500" />
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 block mb-1 tracking-wider uppercase flex items-center justify-center gap-1">
              👑 NÂNG CẤP PREMIUM
            </span>
            <p className="text-[9px] text-amber-700/80 dark:text-amber-300/80 font-bold mb-3">Mở khóa Gia sư & Chặng 3</p>
            <button
              onClick={() => { setIsSidebarOpen(false); navigate('/premium'); }}
              aria-label="Kích hoạt Premium"
              className="w-full py-2 bg-brand-action hover:bg-brand-action/90 text-white font-black text-[11px] rounded-lg shadow-md hover:shadow-lg hover:shadow-brand-action/10 active:scale-95 transition-all cursor-pointer animate-pulse-glow"
            >
              Kích hoạt ngay
            </button>
          </div>
        )}

        <div className={cn("p-4 border-t border-border/50 bg-secondary/20", effectiveCollapsed && "p-3")}>
          <div className={cn("flex items-center gap-3", effectiveCollapsed && "flex-col gap-1.5 justify-center")}>
            {user ? (
              <>
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:bg-secondary/60 p-1.5 rounded-xl transition-all"
                  onClick={() => {
                    useAppStore.setState({ isAutoProfileModal: false });
                    setIsProfileModalOpen(true);
                  }}
                  title="Cài đặt tài khoản"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border shrink-0 transition-transform hover:scale-105 active:scale-95",
                      isPremium ? "border-amber-400/60 shadow-md shadow-amber-400/10" : "border-primary/20"
                    )}
                  >
                    <span className={cn("text-xs font-black", isPremium ? "text-amber-500" : "text-primary")}>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  {!effectiveCollapsed && (
                    <div className="flex flex-col min-w-0 flex-1 text-left">
                      <span className="text-xs font-extrabold truncate text-foreground leading-none flex items-center gap-1.5">
                        {user.displayName || 'Học sinh'}
                        {isPremium && (
                          <span className="px-1.5 py-0.5 text-[7px] bg-brand-action text-white rounded-sm font-black tracking-widest shrink-0 leading-none">PREMIUM</span>
                        )}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold truncate leading-none mt-2">{user.email}</span>
                      <span className="text-[9px] text-primary font-extrabold hover:underline leading-none mt-2.5 self-start active:scale-95">
                        Cài đặt tài khoản
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                disabled={isAuthLoading}
                onClick={handleDirectGoogleSignIn}
                aria-label="Đăng nhập bằng tài khoản Google"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-[11px] py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isAuthLoading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <>🔑 Đăng nhập Google</>
                )}
              </button>
            )}
          </div>
        </div>

        <div className={cn(
          "pt-4 pb-6 px-4 border-t border-border/20 flex items-center justify-center text-center",
          effectiveCollapsed && "p-2"
        )}>
          {!effectiveCollapsed ? (
            <div className="flex items-center justify-center gap-2 flex-wrap text-[9px] text-muted-foreground font-bold">
              <span>VERSION PRO MAX V2</span>
              <span>•</span>
              <button
                onClick={() => setShowPolicyModal(true)}
                aria-label="Xem điều khoản sử dụng và chính sách bảo mật"
                className="hover:text-primary hover:underline transition-colors cursor-pointer"
              >
                Điều khoản & Chính sách
              </button>
            </div>
          ) : (
            <span className="text-[9px] text-muted-foreground font-bold">PRO</span>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen md:min-h-0 md:max-h-screen md:overflow-y-auto bg-background overscroll-contain">

        <header className="hidden md:flex items-center justify-between px-8 py-4.5 bg-card/60 backdrop-blur-lg border-b border-border/30 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4.5">
            <button
              onClick={toggleSidebarCollapse}
              aria-label={isSidebarCollapsed ? "Mở rộng menu bên" : "Thu gọn menu bên"}
              aria-expanded={!isSidebarCollapsed}
              className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground border border-border/50 hover:bg-secondary transition-all cursor-pointer hidden md:flex items-center justify-center shrink-0 active:scale-95"
              title={isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              {isSidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-xl font-black tracking-tight text-foreground capitalize leading-tight shrink-0">
                {getHeaderTitle()}
              </h1>
              <div className="relative">
                <button
                  onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                  aria-label="Chọn khối học và môn học"
                  aria-haspopup="true"
                  aria-expanded={isContextDropdownOpen}
                  className="px-3.5 py-1.5 text-xs font-black rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/40 hover:border-primary/30 text-foreground transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>{getActiveContextLabel()}</span>
                  <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0", isContextDropdownOpen && "rotate-180")} />
                </button>

                {isContextDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsContextDropdownOpen(false)} />
                    <div className="absolute left-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/40 rounded-3xl shadow-xl p-3 space-y-3.5 z-40 animate-fade-in">
                      {courseGroups.map((group) => (
                        <div key={group.grade} className="space-y-1.5">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider px-2 block">
                            {group.gradeTitle}
                          </span>
                          <div className="space-y-0.5">
                            {group.courses.map((course) => {
                              const isActive = !course.isLocked && selectedGrade === group.grade && selectedSubject === course.code;
                              return (
                                <button
                                  key={course.code}
                                  disabled={course.isLocked}
                                  aria-label={`Chọn môn ${course.name} - ${group.gradeTitle} ${course.isLocked ? '(Đã khóa)' : ''}`}
                                  onClick={() => {
                                    if (course.isLocked) return;
                                    handleContextChange(group.grade as GradeCode, course.code as SubjectCode);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer relative",
                                    course.isLocked
                                      ? "text-muted-foreground/50 cursor-not-allowed opacity-60"
                                      : isActive
                                        ? "bg-primary/10 text-primary font-black border-l-4 border-primary pl-2 shadow-inner"
                                        : "text-foreground hover:bg-secondary/60 hover:translate-x-1"
                                  )}
                                >
                                  <span className="shrink-0">{course.icon}</span>
                                  <span className="flex-1 truncate">{course.name}</span>
                                  {isActive && <Check size={14} className="text-primary absolute right-3" />}
                                  {course.isLocked && <Lock size={10} className="text-muted-foreground/40 absolute right-3" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.NEWS)}
                aria-label="Thông báo học tập & Bảng tin"
                className={cn(
                  "px-3 py-1.5 text-xs font-extrabold rounded-2xl border transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 relative",
                  location.pathname.startsWith(ROUTES.NEWS)
                    ? "bg-primary/12 text-primary border-primary/40 shadow-sm shadow-primary/5 font-black"
                    : "bg-secondary/50 hover:bg-secondary border-border/40 text-foreground"
                )}
                title="Bảng tin thông báo"
              >
                <Bell size={16} className={cn(unreadNotificationCount > 0 ? "text-brand-action animate-bounce" : "text-muted-foreground")} />
                <span className="hidden lg:inline font-bold">Thông báo</span>
                {unreadNotificationCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none shadow-sm animate-pulse ml-0.5">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
              className="px-3 py-1.5 text-xs font-extrabold rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/40 text-foreground transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title={darkMode ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
            >
              {darkMode ? (
                <>
                  <Sun size={15} className="text-amber-400 fill-amber-400/20" />
                  <span className="hidden lg:inline text-amber-500 font-bold">Giao diện Sáng</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-brand-ink fill-brand-ink/15" />
                  <span className="hidden lg:inline text-brand-ink font-bold">Giao diện Tối</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate(ROUTES.SUPPORT)}
              aria-label="Trợ giúp"
              className={cn(
                "px-3 py-1.5 text-xs font-extrabold rounded-2xl border transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95",
                location.pathname.startsWith(ROUTES.SUPPORT)
                  ? "bg-primary/12 text-primary border-primary/40 shadow-sm shadow-primary/5"
                  : "bg-secondary/50 hover:bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
              )}
              title="Trợ giúp"
            >
              <LifeBuoy size={16} className="text-primary shrink-0" />
              <span>Trợ giúp</span>
            </button>

            <div className="flex items-center gap-1.5 bg-secondary/40 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-border/20 shadow-sm">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mastery:</span>
              <span className="text-xs font-black text-primary bg-primary/8 px-2 py-0.5 rounded-lg border border-primary/10">
                {isLoadingData ? '... dạng' : `${currentCompletedCount}/${currentQuestionTypes.length} dạng`}
              </span>
            </div>

            {!user ? (
              <button
                disabled={isAuthLoading}
                onClick={handleDirectGoogleSignIn}
                aria-label="Đăng nhập bằng tài khoản Google"
                className="px-3.5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:pointer-events-none h-9"
              >
                {isAuthLoading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="currentColor" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                    </svg>
                    <span>Đăng nhập với Google</span>
                  </>
                )}
              </button>
            ) : !isPremium ? (
              <button
                onClick={() => navigate(ROUTES.PREMIUM)}
                aria-label="Nâng cấp tài khoản Premium"
                className="px-3.5 py-2 bg-brand-action hover:bg-brand-action/90 text-white font-black text-xs rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                👑 Lên Premium
              </button>
            ) : null}
          </div>
        </header>

        {/* ⚡ Content Wrapper */}
        <div className={cn(
          "flex-1 animate-fade-in relative",
          courseSection === 'ai-tutor' || location.pathname.startsWith(ROUTES.AI_TUTOR) ? "p-2 md:p-3" : "p-4 md:p-8"
        )}>
          {/* Top Progress Bar khi nạp dữ liệu môn học trong nền */}
          {isLoadingData && (
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20 overflow-hidden pointer-events-none">
              <div className="h-full bg-primary animate-pulse w-full" />
            </div>
          )}

          {isLoadingData && !isSubjectDataLoaded(selectedGrade, selectedSubject) ? (
            <div className="flex h-[60vh] w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader size={36} className="animate-spin text-primary" />
                <h3 className="text-sm font-black text-foreground">Đang tải dữ liệu học tập...</h3>
                <p className="text-xs font-semibold text-muted-foreground">Vui lòng chờ trong giây lát.</p>
              </div>
            </div>
          ) : (
            <React.Suspense fallback={
              <div className="flex h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader size={36} className="animate-spin text-primary" />
                  <h3 className="text-sm font-black text-foreground">Đang tải trang...</h3>
                </div>
              </div>
            }>
              {selectedSubject === 'english' ? (
                <QuickLookupWrapper>
                  <Outlet />
                </QuickLookupWrapper>
              ) : (
                <Outlet />
              )}
            </React.Suspense>
          )}
        </div>
      </main>

      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Chỉ hiển thị tính năng Từ điển khi học sinh đang học môn Tiếng Anh */}
      {selectedSubject === 'english' && (
        <>
          <DictionaryModal />
          <QuickLookupPopover />
          <FloatingDictionaryWidget />
        </>
      )}

      {/* Popup Khảo sát người dùng (Onboarding & Feedback) */}
      {activeSurvey && (
        <SurveyModal
          isOpen={!!activeSurvey}
          config={activeSurvey}
          onClose={() => setActiveSurvey(null)}
        />
      )}

      {/* Chat Widget Nổi Trực Tiếp Với Admin ezonthi */}
      <AdminChatWidget />
    </div>
  );
};
export default AppLayout;
