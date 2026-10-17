import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAppStore } from '@/services/store';
import { storageService } from '@/services/storage';
import { getLearningOutcomes, getPracticeQuestions } from '@/data';
import { useRoadmapBundle } from '@/services/roadmapService';
import type { RoadmapQuestionType } from '@/types/roadmapContract';
import type { GradeCode, SubjectCode } from '@/types';
import { BookOpen, Search, X, List, LayoutGrid, Lock, PlayCircle, RotateCcw, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { matchesSearchKeyword } from '@/utils/searchHelper';
import { cn } from '@/utils/cn';
import { getDifficultyTheme, getSubjectTheme, getTierTheme, getStarsFromScore } from '@/utils/theme';
import { getSubjectName, getSubjectIcon, isQuestionTypePremiumLocked } from '@/utils/subject';
import { LatexRenderer } from '../../components/common/LatexRenderer';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { authService } from '../../services/authService';
import { ChemistryVideoDashboard } from './components/ChemistryVideoDashboard';
import { BiologyVideoDashboard } from './components/BiologyVideoDashboard';
import { PhysicsVideoDashboard } from './components/PhysicsVideoDashboard';
import { TopicTextbookMappingModal } from './components/TopicTextbookMappingModal';
import { TextbookDrawer } from '../../components/common/TextbookDrawer';
import { SeoHead } from '../../components/common/SeoHead';
import { createCourseSchema, createBreadcrumbSchema } from '../../utils/seoSchemas';
import { buildCoursePath, isCourseContext } from '@/utils/courseRoutes';

export const Roadmap: React.FC = () => {
  const { grade: routeGradeParam, subject: routeSubjectParam } = useParams<{
    grade?: GradeCode;
    subject?: SubjectCode;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedSubject, selectedGrade, progressVersion, isPremium, user } = useAppStore();

  const effectiveGrade = (routeGradeParam && isCourseContext(routeGradeParam, routeSubjectParam)) ? routeGradeParam : selectedGrade;
  const effectiveSubject = (routeSubjectParam ?? selectedSubject) as SubjectCode;

  const subjectTheme = getSubjectTheme(effectiveSubject);
  void progressVersion;

  const hasVideos = effectiveSubject === 'chemistry' || (effectiveSubject === 'biology' && effectiveGrade === 'grade10') || (effectiveSubject === 'physics' && effectiveGrade === 'grade10');

  const getInitialView = (): 'roadmap' | 'videos' => {
    const paramView = searchParams.get('view');
    if (paramView === 'roadmap' || paramView === 'videos') {
      return paramView;
    }
    const savedView = localStorage.getItem(`otv10_roadmap_view_${selectedSubject}_${selectedGrade}`);
    if (savedView === 'roadmap' || savedView === 'videos') {
      return savedView;
    }
    return 'roadmap';
  };

  const [activeView, setActiveView] = useState<'roadmap' | 'videos'>(getInitialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    const saved = localStorage.getItem('otv10_roadmap_view_mode');
    return saved === 'grid' ? 'grid' : 'list';
  });

  const handleToggleViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('otv10_roadmap_view_mode', mode);
  };

  const [mappingModalTopic, setMappingModalTopic] = useState<{ id: string; name: string } | null>(null);
  const [drawerConfig, setDrawerConfig] = useState<{ isOpen: boolean; bookName: string; pages: number[] }>({
    isOpen: false,
    bookName: '',
    pages: []
  });

  useEffect(() => {
    const paramView = searchParams.get('view');
    if (paramView === 'roadmap' || paramView === 'videos') {
      setActiveView(paramView);
      localStorage.setItem(`otv10_roadmap_view_${selectedSubject}_${selectedGrade}`, paramView);
    } else {
      const savedView = localStorage.getItem(`otv10_roadmap_view_${selectedSubject}_${selectedGrade}`);
      if (savedView === 'roadmap' || savedView === 'videos') {
        setActiveView(savedView);
      }
    }
  }, [searchParams, selectedSubject, selectedGrade]);

  const handleViewChange = (newView: 'roadmap' | 'videos') => {
    setActiveView(newView);
    setSearchParams({ view: newView });
    localStorage.setItem(`otv10_roadmap_view_${selectedSubject}_${selectedGrade}`, newView);
  };

  const { bundle, loading: bundleLoading } = useRoadmapBundle(effectiveGrade, effectiveSubject);
  const topics = React.useMemo(() => bundle?.topics || [], [bundle]);
  const questionTypes = React.useMemo(() => bundle?.questionTypes || [], [bundle]);
  const learningOutcomes = getLearningOutcomes(effectiveGrade, effectiveSubject);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'primary' | 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { }
  });

  const userId = user?.uid || 'guest';
  const readLessons = storageService.getReadLessons(userId);
  const readLessonsSet = new Set(readLessons);
  const attempts = React.useMemo(() => storageService.getAttempts(userId), [userId, progressVersion]);
  const progress = React.useMemo(() => storageService.getProgress(userId), [userId, progressVersion]);
  const allQuestions = React.useMemo(() => getPracticeQuestions(effectiveGrade, effectiveSubject), [effectiveGrade, effectiveSubject]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'need_theory' | 'need_practice' | 'completed'>('all');

  // Gom nhóm dạng bài theo từng Chuyên đề (Topic) để quản lý mở khóa độc lập theo chương
  const typesByTopic = React.useMemo(() => {
    const map = new Map<string, RoadmapQuestionType[]>();
    topics.forEach(t => {
      map.set(t.id, questionTypes.filter(type => type.topicId === t.id));
    });
    return map;
  }, [topics, questionTypes]);

  const isOptionalEnglishListeningTopic = (topicId?: string) => (
    selectedGrade === 'grade10'
    && selectedSubject === 'english'
    && topicId === 'eng10-listening-extension'
  );

  const isOptionalEnglishListeningType = (typeId: string) => {
    return isOptionalEnglishListeningTopic(questionTypes.find(type => type.id === typeId)?.topicId);
  };

  const isUnlocked = (typeId: string) => {
    if (isOptionalEnglishListeningType(typeId)) return true;
    const qType = questionTypes.find(t => t.id === typeId);
    if (!qType) return false;

    const topicTypes = typesByTopic.get(qType.topicId) || [];
    const idxInTopic = topicTypes.findIndex(t => t.id === typeId);
    if (idxInTopic === -1) return false;
    if (idxInTopic === 0) return true; // ⭐ Dạng bài đầu tiên của MỖI CHUYÊN ĐỀ luôn luôn mở khóa!

    // Các bài tiếp theo trong chuyên đề mở khóa khi bài liền trước TRONG CÙNG CHUYÊN ĐỀ đã được đọc
    return readLessonsSet.has(topicTypes[idxInTopic - 1].id);
  };

  const getQuestionTypeMetrics = React.useCallback((typeId: string) => {
    const isRead = readLessonsSet.has(typeId);
    const qAttempts = attempts.filter(a => a.questionTypeId === typeId);
    const qQuestions = allQuestions.filter(q => q.questionTypeId === typeId);
    const totalQ = qQuestions.length;
    const solvedIds = new Set(
      qAttempts
        .filter(a => a.isCorrect)
        .filter(a => !qQuestions.find(q => q.id === a.questionId)?.isMasteryHoldout)
        .map(a => a.questionId)
    );
    const solvedCount = Math.min(solvedIds.size, totalQ);
    const practicePercent = totalQ > 0 ? Math.round((solvedCount / totalQ) * 100) : 0;
    const masteryScore = progress?.masteryLevels[typeId] ?? 0;
    const starsCount = getStarsFromScore(masteryScore);
    const isCompleted = isRead && (practicePercent === 100 || starsCount >= 3 || totalQ === 0);
    const needsTheory = !isRead;
    const needsPractice = isRead && !isCompleted;

    return {
      isRead,
      totalQ,
      solvedCount,
      practicePercent,
      masteryScore,
      starsCount,
      attemptsCount: qAttempts.length,
      isCompleted,
      needsTheory,
      needsPractice
    };
  }, [readLessonsSet, attempts, allQuestions, progress]);

  const shouldShowType = React.useCallback((typeId: string) => {
    const qType = questionTypes.find(t => t.id === typeId);
    if (!qType) return false;

    if (searchQuery.trim()) {
      const topic = topics.find(t => t.id === qType.topicId);
      const matchesSearch =
        matchesSearchKeyword(qType.name, searchQuery) ||
        matchesSearchKeyword(qType.description || '', searchQuery) ||
        matchesSearchKeyword(topic?.name || '', searchQuery);
      if (!matchesSearch) return false;
    }

    if (filterStatus === 'need_theory') {
      return !readLessonsSet.has(typeId);
    }
    if (filterStatus === 'need_practice') {
      const metrics = getQuestionTypeMetrics(typeId);
      return metrics.needsPractice;
    }
    if (filterStatus === 'completed') {
      const metrics = getQuestionTypeMetrics(typeId);
      return metrics.isCompleted;
    }

    return true;
  }, [questionTypes, searchQuery, topics, filterStatus, readLessonsSet, getQuestionTypeMetrics]);

  const { totalAll, totalNeedTheory, totalNeedPractice, totalCompleted } = React.useMemo(() => {
    let needTheory = 0;
    let needPractice = 0;
    let completed = 0;

    questionTypes.forEach(t => {
      const metrics = getQuestionTypeMetrics(t.id);
      if (metrics.needsTheory) needTheory++;
      if (metrics.needsPractice) needPractice++;
      if (metrics.isCompleted) completed++;
    });

    return {
      totalAll: questionTypes.length,
      totalNeedTheory: needTheory,
      totalNeedPractice: needPractice,
      totalCompleted: completed
    };
  }, [questionTypes, getQuestionTypeMetrics]);

  const totalMatchedCount = React.useMemo(() => {
    return questionTypes.filter(t => shouldShowType(t.id)).length;
  }, [questionTypes, shouldShowType]);

  // Quản lý thu gọn / mở rộng chuyên đề (Smart Accordion tránh gây ngợp)
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});
  const [hasManuallyToggled, setHasManuallyToggled] = useState<boolean>(false);

  // Khi học sinh đổi môn hoặc khối lớp, reset trạng thái tương tác thủ công
  useEffect(() => {
    setHasManuallyToggled(false);
  }, [effectiveGrade, effectiveSubject]);

  // Tự động tìm chương đang học dở dang để mở mặc định (các chương khác tự động thu gọn)
  useEffect(() => {
    if (topics.length === 0 || hasManuallyToggled) return;

    let activeTopicId = topics[0]?.id;
    for (const topic of topics) {
      const topicTypes = typesByTopic.get(topic.id) || [];
      if (topicTypes.length === 0) continue;
      const isUnlockedAny = topicTypes.some(t => isUnlocked(t.id));
      const isCompletedAll = topicTypes.every(t => getQuestionTypeMetrics(t.id).isCompleted);

      if (isUnlockedAny && !isCompletedAll) {
        activeTopicId = topic.id;
        break;
      }
    }

    const initialCollapsed: Record<string, boolean> = {};
    topics.forEach(t => {
      initialCollapsed[t.id] = t.id !== activeTopicId;
    });
    setCollapsedTopics(initialCollapsed);
  }, [topics, typesByTopic, hasManuallyToggled, effectiveGrade, effectiveSubject, isUnlocked, getQuestionTypeMetrics]);

  const isTopicCollapsed = React.useCallback((topicId: string) => {
    // Khi đang tìm kiếm từ khóa hoặc lọc theo trạng thái, tự động mở tất cả để không giấu bài học
    if (searchQuery.trim() !== '' || filterStatus !== 'all') {
      return false;
    }
    return Boolean(collapsedTopics[topicId]);
  }, [searchQuery, filterStatus, collapsedTopics]);

  const toggleTopicCollapse = React.useCallback((topicId: string) => {
    setHasManuallyToggled(true);
    setCollapsedTopics(prev => ({
      ...prev,
      [topicId]: !Boolean(prev[topicId])
    }));
  }, []);

  const expandAllTopics = React.useCallback(() => {
    setHasManuallyToggled(true);
    const newCollapsed: Record<string, boolean> = {};
    topics.forEach(t => {
      newCollapsed[t.id] = false;
    });
    setCollapsedTopics(newCollapsed);
  }, [topics]);

  const collapseAllTopics = React.useCallback(() => {
    setHasManuallyToggled(true);
    const newCollapsed: Record<string, boolean> = {};
    topics.forEach(t => {
      newCollapsed[t.id] = true;
    });
    setCollapsedTopics(newCollapsed);
  }, [topics]);

  const handleSelectPractice = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isUnlocked(id)) {
      handleSelectType(id);
      return;
    }
    const qType = questionTypes.find(t => t.id === id);
    const topic = topics.find(t => t.id === qType?.topicId);
    const isLockedByPremium = isQuestionTypePremiumLocked(id, topic?.tier ?? 1, effectiveSubject, effectiveGrade) && !isPremium;

    if (isLockedByPremium && !isOptionalEnglishListeningTopic(topic?.id || '')) {
      setModalConfig({
        isOpen: true,
        title: "Mở khóa đặc quyền Premium 🌟",
        description: "Dạng bài này là đặc quyền nâng cao dành riêng cho tài khoản Premium. Bạn có muốn nâng cấp lên Premium ngay để mở khóa toàn bộ lộ trình không?",
        confirmLabel: "Nâng cấp Premium",
        cancelLabel: "Để sau",
        variant: "warning",
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          navigate('/premium');
        },
        onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    navigate(buildCoursePath(effectiveGrade, effectiveSubject, 'practice', id));
  };

  const handleSelectType = (id: string) => {
    if (!isUnlocked(id)) {
      const qType = questionTypes.find(t => t.id === id);
      const topicTypes = qType ? (typesByTopic.get(qType.topicId) || []) : [];
      const idxInTopic = topicTypes.findIndex(t => t.id === id);
      const prevType = idxInTopic > 0 ? topicTypes[idxInTopic - 1] : null;

      setModalConfig({
        isOpen: true,
        title: "Dạng bài đang khóa 🔒",
        description: prevType
          ? `Dạng bài này đang khóa. Hãy hoàn thành lý thuyết dạng bài trước: "${prevType.name}" trong cùng chuyên đề này để mở khóa bài học nhé!`
          : "Dạng bài này hiện đang khóa.",
        confirmLabel: "Tôi đã hiểu",
        cancelLabel: "Đóng",
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
        onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const qType = questionTypes.find(t => t.id === id);
    const topic = topics.find(t => t.id === qType?.topicId);
    const isLockedByPremium = isQuestionTypePremiumLocked(id, topic?.tier ?? 1, selectedSubject, selectedGrade) && !isPremium;

    if (isLockedByPremium && !isOptionalEnglishListeningTopic(topic?.id || '')) {
      setModalConfig({
        isOpen: true,
        title: "Mở khóa đặc quyền Premium 🌟",
        description: "Dạng bài này là đặc quyền nâng cao dành riêng cho tài khoản Premium. Bạn có muốn nâng cấp lên Premium ngay để mở khóa toàn bộ lộ trình không?",
        confirmLabel: "Nâng cấp Premium",
        cancelLabel: "Để sau",
        variant: "warning",
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          navigate('/premium');
        },
        onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    navigate(buildCoursePath(effectiveGrade, effectiveSubject, 'question-types', id));
  };


  const tiers = selectedGrade === 'grade9'
    ? [
      {
        id: 1,
        title: '🎯 CHẶNG 1: ĐẢM BẢO ĐIỂM 5 (Vững vàng nền tảng)',
        description: selectedSubject === 'math'
          ? 'Luyện thật chắc Đại số nền tảng & Căn thức để nắm chắc 5 điểm đầu tiên của đề thi.'
          : 'Ôn luyện các dạng câu hỏi Trắc nghiệm Ngữ pháp & Từ vựng nền tảng để nắm chắc 5 điểm đầu tiên.'
      },
      {
        id: 2,
        title: '🚀 CHẶNG 2: MỤC TIÊU ĐIỂM 7-8 (Tăng tốc bứt phá)',
        description: selectedSubject === 'math'
          ? 'Tăng tốc với Hệ phương trình, Toán thực tế và Hàm số & Đồ thị để đạt điểm 7-8.'
          : 'Luyện đọc quảng cáo và các cấu trúc biến đổi câu cơ bản (Bị động, Điều kiện...).'
      },
      {
        id: 3,
        title: '👑 CHẶNG 3: CHINH PHỤC ĐIỂM 9-10 (Thủ khoa bứt phá)',
        description: selectedSubject === 'math'
          ? 'Chinh phục chuyên đề Hình học đường tròn để hoàn thiện điểm 9 và vươn tới điểm 10.'
          : 'Làm chủ viết lại câu nâng cao/giới hạn từ, tìm và sửa lỗi sai, sắp xếp câu và đọc hiểu trắc nghiệm.'
      }
    ]
    : [
      {
        id: 1,
        title: '🎯 HỌC KỲ I (Nền tảng kiến thức mới)',
        description: selectedSubject === 'math'
          ? (selectedGrade === 'grade11'
            ? 'Làm quen và củng cố kiến thức Cân bằng hóa học, Hàm số lượng giác, Cấp số cộng và Cấp số nhân.'
            : 'Làm quen và củng cố kiến thức Mệnh đề, Tập hợp, Hàm số bậc hai, Bất phương trình và Hệ thức lượng.')
          : selectedSubject === 'chemistry'
            ? (selectedGrade === 'grade11'
              ? 'Tập trung ôn tập nền tảng Cân bằng hóa học, Nitrogen – Sulfur và Đại cương hóa học hữu cơ.'
              : 'Tập trung ôn tập kiến thức Cấu tạo nguyên tử, Bảng tuần hoàn, Liên kết hóa học và Phản ứng oxi hóa - khử.')
            : selectedSubject === 'biology'
              ? 'Nắm vững kiến thức sinh học tế bào, phân bào và sinh học vi sinh vật.'
              : selectedSubject === 'physics'
                ? 'Nắm chắc kiến thức động học, động lực học và các định luật bảo toàn.'
                : `Ôn tập ngữ pháp & từ vựng nửa đầu năm học ${selectedGrade === 'grade11' ? 'Lớp 11' : 'Lớp 10'}.`
      },
      {
        id: 2,
        title: '🚀 HỌC KỲ II (Tăng tốc bứt phá)',
        description: selectedSubject === 'math'
          ? (selectedGrade === 'grade11'
            ? 'Học tốt các chuyên đề về Giới hạn, Đạo hàm, Vectơ và Đường thẳng trong không gian.'
            : 'Học tốt các chuyên đề về Vectơ, Đại số tổ hợp, Thống kê, Xác suất và Oxy.')
          : selectedSubject === 'chemistry'
            ? (selectedGrade === 'grade11'
              ? 'Làm chủ các chuyên đề Hóa học hữu cơ: Hydrocarbon, Ancol, Phenol, Carbonyl và Carboxylic acid.'
              : 'Làm chủ các chuyên đề Năng lượng hóa học, Tốc độ phản ứng và nhóm Halogen.')
            : selectedSubject === 'biology'
              ? 'Học tốt di truyền học, biến dị và cơ chế truyền thông tin di truyền.'
              : selectedSubject === 'physics'
                ? 'Học tốt các chuyên đề về Năng lượng, Công, Công suất và Động lượng.'
                : `Học tốt ngữ pháp & từ vựng nửa sau năm học ${selectedGrade === 'grade11' ? 'Lớp 11' : 'Lớp 10'}.`
      },
      {
        id: 3,
        title: '👑 CHUYÊN ĐỀ HỌC TẬP (Mở rộng & Nâng cao)',
        description: selectedSubject === 'math'
          ? 'Chinh phục các chuyên đề học tập tự chọn nâng cao và bài tập vận dụng cao.'
          : selectedSubject === 'chemistry'
            ? 'Chinh phục chuyên đề tổng hợp hóa học hữu cơ, vô cơ và bài tập phân hóa 9-10 điểm.'
            : selectedSubject === 'biology'
              ? 'Chinh phục chuyên đề sinh học phân tử và bài tập di truyền nâng cao.'
              : selectedSubject === 'physics'
                ? 'Chinh phục các chuyên đề vật lý nâng cao và bài tập vận dụng cao.'
                : selectedGrade === 'grade10'
                  ? 'Luyện nghe tự chọn theo 10 Unit; chuyên đề này độc lập và không thuộc cấu trúc đề giữa kỳ/cuối kỳ.'
                  : 'Rèn luyện các cấu trúc ngữ pháp học thuật, bài đọc hiểu và viết luận nâng cao.'
      }
    ];
  const subjectName = getSubjectName(selectedSubject);
  const gradeLabel = selectedGrade === 'grade9' ? 'Lớp 9' : selectedGrade === 'grade10' ? 'Lớp 10' : selectedGrade === 'grade11' ? 'Lớp 11' : 'Phổ thông';
  const pageTitle = `Lộ Trình Học Tốt ${subjectName} ${gradeLabel} | ezonthi`;
  const pageDescription = `Bản đồ lộ trình học 3 chặng môn ${subjectName} ${gradeLabel} chuẩn hóa giúp học sinh nắm chắc kiến thức và tự tin bứt phá điểm số.`;

  const courseSchema = createCourseSchema({
    name: `${subjectName} ${gradeLabel}`,
    description: pageDescription,
    url: '/roadmap',
    courseCode: `${selectedGrade}-${selectedSubject}`
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Trang chủ', item: '/' },
    { name: gradeLabel, item: '/roadmap' },
    { name: `Lộ trình ${subjectName} ${gradeLabel}`, item: '/roadmap' }
  ]);

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-8 px-3 sm:px-6 py-3 animate-fade-in pb-12">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="/roadmap"
        robots="noindex, follow"
        jsonLd={[courseSchema, breadcrumbSchema]}
      />
      {/* Header Giới thiệu Lộ trình */}
      <div className="text-center space-y-3">
        <h1 className="text-xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2 font-sans">
          {selectedGrade === 'grade9' ? 'Lộ trình Ôn thi' : 'Lộ trình Học tốt'} môn {getSubjectIcon(selectedSubject)} {getSubjectName(selectedSubject)} {selectedGrade === 'grade9' ? 'vào 10' : selectedGrade === 'grade10' ? 'Lớp 10' : 'Lớp 11'}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Lộ trình tinh gọn giúp bạn nắm chắc kiến thức {selectedGrade === 'grade9' ? 'ôn thi vào 10' : selectedGrade === 'grade10' ? 'chương trình lớp 10' : 'chương trình lớp 11'} toàn diện, tự do rèn luyện và mở khóa mọi dạng bài.
        </p>

        {hasVideos && (
          <div className="flex justify-center items-center pt-2">
            <div className="inline-flex p-1 bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl border border-border/40">
              <button
                type="button"
                onClick={() => handleViewChange('videos')}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeView === 'videos'
                    ? selectedSubject === 'chemistry'
                      ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-sm font-black"
                      : selectedSubject === 'biology'
                        ? "bg-card text-green-600 dark:text-green-400 shadow-sm font-black"
                        : "bg-card text-blue-600 dark:text-blue-400 shadow-sm font-black"
                    : "text-muted-foreground hover:text-foreground font-bold"
                )}
              >
                📺 Video bài giảng {selectedSubject === 'chemistry' ? (selectedGrade === 'grade11' ? '(6 chương)' : '(7 chương)') : selectedSubject === 'biology' ? (selectedGrade === 'grade11' ? '(5 chương)' : '(8 chương)') : '(7 chương)'}
              </button>
              <button
                type="button"
                onClick={() => handleViewChange('roadmap')}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  activeView === 'roadmap'
                    ? selectedSubject === 'chemistry'
                      ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-sm font-black"
                      : selectedSubject === 'biology'
                        ? "bg-card text-green-600 dark:text-green-400 shadow-sm font-black"
                        : "bg-card text-blue-600 dark:text-blue-400 shadow-sm font-black"
                    : "text-muted-foreground hover:text-foreground font-bold"
                )}
              >
                📚 Lộ trình học
              </button>
            </div>
          </div>
        )}
      </div>

      {activeView === 'videos' && hasVideos ? (
        selectedSubject === 'chemistry' ? (
          <ChemistryVideoDashboard />
        ) : selectedSubject === 'biology' ? (
          <BiologyVideoDashboard />
        ) : (
          <PhysicsVideoDashboard />
        )
      ) : (
        <>
          {/* 🌟 Guest Mode Banner */}
          {!user && (
            <div className="bg-primary/7 border border-primary/20 border-l-4 border-l-primary rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 w-full mx-auto mb-8">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-black text-foreground">Bạn đang xem lộ trình học ở chế độ xem thử</h3>
                <p className="text-[11px] text-muted-foreground font-semibold">Đăng nhập tài khoản để lưu tiến trình học tập, mở khóa toàn bộ lộ trình và bắt đầu thực hành luyện tập.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await authService.signInWithGoogle();
                  } catch (err: any) {
                    alert(err.message || 'Lỗi đăng nhập bằng Google.');
                  }
                }}
                className="px-6 py-2.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* 🔍 Learning Command Bar: Tìm kiếm tức thì, Chuyển đổi Mục lục / Thẻ & Bộ lọc trạng thái */}
          <div className="flex flex-col gap-3 mb-8 bg-card/60 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-border/40 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhanh dạng bài, chuyên đề, định lý (ví dụ: vecto, hàm số, rơi tự do...)"
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-secondary/50 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    title="Xóa tìm kiếm"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                {searchQuery.trim() && (
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    Khớp {totalMatchedCount} dạng bài
                  </span>
                )}
                <div className="inline-flex p-0.5 bg-secondary/60 rounded-xl border border-border/40">
                  <button
                    type="button"
                    onClick={() => handleToggleViewMode('list')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      viewMode === 'list'
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Xem dạng danh sách mục lục (Gọn gàng, dễ tìm)"
                  >
                    <List size={14} />
                    <span>Mục lục</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleViewMode('grid')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      viewMode === 'grid'
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Xem dạng thẻ hộp"
                  >
                    <LayoutGrid size={14} />
                    <span>Thẻ hộp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 🏷️ Filter Chips: Lọc theo trạng thái học tập & Điều khiển Thu gọn / Mở rộng */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5 pt-2 border-t border-border/20">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
                    filterStatus === 'all'
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/40"
                  )}
                >
                  Tất cả ({totalAll})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('need_theory')}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
                    filterStatus === 'need_theory'
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/40"
                  )}
                >
                  📖 Cần học lý thuyết ({totalNeedTheory})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('need_practice')}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
                    filterStatus === 'need_practice'
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/40"
                  )}
                >
                  ⚡ Cần luyện tập ({totalNeedPractice})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('completed')}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
                    filterStatus === 'completed'
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/40"
                  )}
                >
                  ✓ Đã hoàn thành ({totalCompleted})
                </button>
              </div>

              {/* Điều khiển Thu gọn / Mở rộng Accordion */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={expandAllTopics}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg border border-border/40 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Mở rộng tất cả các chương"
                >
                  <ChevronDown size={14} />
                  <span>Mở rộng</span>
                </button>
                <button
                  type="button"
                  onClick={collapseAllTopics}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg border border-border/40 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Thu gọn tất cả các chương"
                >
                  <ChevronUp size={14} />
                  <span>Thu gọn</span>
                </button>
              </div>
            </div>
          </div>

          {/* Skeleton Loading State khi lần đầu tải từ R2 */}
          {bundleLoading && !bundle ? (
            <div className="space-y-12 animate-pulse pt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="space-y-4">
                  <div className="h-20 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="h-32 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                    <div className="h-32 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                    <div className="h-32 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Render từng Chặng */
            <div className="space-y-16">
              {tiers.map((tier) => {
              const tierTopics = topics.filter(t => t.tier === tier.id);

              // Lọc ra các chuyên đề có ít nhất 1 dạng bài được hiển thị
              const visibleTopics = tierTopics.filter(topic => {
                const filteredTypes = questionTypes.filter(type => type.topicId === topic.id);
                return filteredTypes.some(type => shouldShowType(type.id));
              });

              // Nếu chặng không có chuyên đề nào được hiển thị, ẩn cả chặng
              if (visibleTopics.length === 0) return null;

              return (
                <div key={tier.id} className="space-y-8">
                  {/* Tiêu đề Chặng - Thiết kế viền trái tối giản kiểu Notion */}
                  <div className={cn(
                    'p-4 md:p-6 rounded-xl border border-border/80 border-l-4 bg-card text-foreground transition-all duration-300 shadow-sm relative overflow-hidden group',
                    tier.id === 1 ? 'border-l-brand-learning' : tier.id === 2 ? 'border-l-brand-ink' : 'border-l-brand-action'
                  )}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-current/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                    <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
                      <h3 className="text-base font-black tracking-tight uppercase tracking-wider font-sans">{tier.title}</h3>
                      {tier.id === 3 && !isPremium && visibleTopics.some(topic => !isOptionalEnglishListeningTopic(topic.id)) && (
                        <span className="px-2.5 py-0.75 text-[8px] bg-brand-action text-white rounded-md font-black tracking-widest uppercase shadow-sm animate-pulse-glow">👑 Khóa Premium</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-bold mt-2 leading-relaxed relative z-10">
                      {tier.description}
                    </p>
                  </div>

                  {/* Danh sách các chuyên đề trong chặng */}
                  <div className={cn(
                    'relative border-l-2 pl-5 md:pl-8 ml-2 md:ml-5 space-y-6 md:space-y-8',
                    getTierTheme(tier.id).lineStyle
                  )}>
                    {visibleTopics.map((topic, topicIdx) => {
                      const filteredTypes = questionTypes.filter(type => type.topicId === topic.id);
                      const visibleTypes = filteredTypes.filter(type => shouldShowType(type.id));
                      const isTopicUnlocked = filteredTypes.some(type => isUnlocked(type.id));
                      const isCollapsed = isTopicCollapsed(topic.id);

                      return (
                        <div key={topic.id} className="relative group/topic">
                          {/* Điểm nút trên trục thời gian - Đồng bộ màu theo môn học */}
                          <div className={cn(
                            "absolute -left-[31px] md:-left-[45px] top-3.5 w-7 h-7 md:w-8 md:h-8 rounded-full border-4 border-background flex items-center justify-center text-[10px] md:text-xs font-black shadow-md transition-all duration-300 group-hover/topic:scale-110",
                            !isTopicUnlocked
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-900 shadow-none"
                              : subjectTheme.solid
                          )}>
                            {topicIdx + 1}
                          </div>

                          {/* Chi tiết chuyên đề */}
                          <div className="space-y-3.5">
                            {(() => {
                              const completedCount = filteredTypes.filter(type => getQuestionTypeMetrics(type.id).isCompleted).length;
                              const percent = filteredTypes.length > 0 ? Math.round((completedCount / filteredTypes.length) * 100) : 0;
                              const topicOutcomes = learningOutcomes.filter(o => o.topicId === topic.id && o.textbook && o.textbook.pages.length > 0);

                              return (
                                <div
                                  onClick={() => toggleTopicCollapse(topic.id)}
                                  className={cn(
                                    "p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs group/header select-none",
                                    isCollapsed
                                      ? "bg-card/70 hover:bg-card border-border/70 hover:border-primary/40"
                                      : "bg-card border-border/90 shadow-sm"
                                  )}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <h4 className={cn(
                                        "text-sm sm:text-base font-extrabold flex items-center gap-2 font-sans transition-colors truncate",
                                        isTopicUnlocked
                                          ? "text-foreground group-hover/header:text-primary"
                                          : "text-muted-foreground/75"
                                      )}>
                                        {topic.name}
                                      </h4>
                                      <span className="text-[10px] text-muted-foreground font-bold px-2 py-0.5 rounded-full bg-secondary border border-border/40 shrink-0">
                                        {completedCount}/{filteredTypes.length} bài
                                      </span>
                                      {completedCount === filteredTypes.length && filteredTypes.length > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                                          ✓ Hoàn thành
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      {/* Thanh tiến độ chương */}
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-16 sm:w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 shadow-inner">
                                          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                                        </div>
                                        <span className="text-[11px] text-primary font-black w-8 text-right">{percent}%</span>
                                      </div>

                                      {/* Bảng đối chiếu SGK */}
                                      {topicOutcomes.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setMappingModalTopic({ id: topic.id, name: topic.name });
                                          }}
                                          className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20 transition-all cursor-pointer shadow-2xs active:scale-95"
                                          title="Bảng đối chiếu SGK chuẩn"
                                        >
                                          <BookOpen size={11} />
                                          <span className="hidden md:inline">SGK</span>
                                        </button>
                                      )}

                                      {/* Icon Accordion Chevron */}
                                      <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground group-hover/header:text-foreground bg-secondary/70 transition-transform duration-200",
                                        isCollapsed ? "" : "rotate-180"
                                      )}>
                                        <ChevronDown size={15} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Danh sách bài học: Chỉ hiển thị khi chuyên đề ĐƯỢC MỞ RỘNG (!isCollapsed) */}
                            {!isCollapsed && (
                              <div className="space-y-3 pt-0.5 animate-in fade-in-50 duration-200">
                                {viewMode === 'list' ? (
                                  <div className="space-y-2">
                                    {visibleTypes.map((type, typeIdx) => {
                                      const diff = getDifficultyTheme(type.difficulty);
                                      const unlocked = isUnlocked(type.id);
                                      const isLockedByPremium = isQuestionTypePremiumLocked(type.id, topic.tier, selectedSubject, selectedGrade) && !isPremium && !isOptionalEnglishListeningTopic(topic.id);
                                      const metrics = getQuestionTypeMetrics(type.id);

                                      // Nút hành động chính thông minh (Single Dynamic Smart CTA)
                                      const smartCtaButton = (() => {
                                        if (!unlocked) {
                                          return (
                                            <button
                                              type="button"
                                              disabled
                                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/80 text-muted-foreground cursor-not-allowed opacity-60 inline-flex items-center gap-1.5 border border-border/30 shrink-0"
                                              title="Hoàn thành bài liền trước để mở khóa bài học này"
                                            >
                                              <Lock size={12} />
                                              <span>Đang khóa</span>
                                            </button>
                                          );
                                        }
                                        if (isLockedByPremium) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleSelectType(type.id); }}
                                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
                                            >
                                              <span>👑 Mở khóa</span>
                                            </button>
                                          );
                                        }
                                        if (!metrics.isRead) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleSelectType(type.id); }}
                                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
                                              title="Bắt đầu học lý thuyết bài giảng này"
                                            >
                                              <BookOpen size={13} />
                                              <span>Học bài</span>
                                            </button>
                                          );
                                        }
                                        if (metrics.attemptsCount === 0 || metrics.practicePercent === 0) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={(e) => handleSelectPractice(type.id, e)}
                                              className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all text-white shrink-0",
                                                subjectTheme.solid
                                              )}
                                              title="Bắt đầu luyện tập bài tập của dạng này"
                                            >
                                              <PlayCircle size={13} />
                                              <span>Luyện tập</span>
                                            </button>
                                          );
                                        }
                                        if (!metrics.isCompleted) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={(e) => handleSelectPractice(type.id, e)}
                                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
                                              title="Luyện tập thêm để nâng cao điểm số và đạt 3 sao"
                                            >
                                              <PlayCircle size={13} />
                                              <span>Luyện tiếp</span>
                                            </button>
                                          );
                                        }
                                        return (
                                          <button
                                            type="button"
                                            onClick={(e) => handleSelectPractice(type.id, e)}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                                            title="Ôn lại dạng bài đã hoàn thành"
                                          >
                                            <RotateCcw size={12} />
                                            <span>Ôn lại</span>
                                          </button>
                                        );
                                      })();

                                      return (
                                        <div
                                          key={type.id}
                                          onClick={() => handleSelectType(type.id)}
                                          className={cn(
                                            "px-3.5 py-2.5 sm:py-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer",
                                            !unlocked
                                              ? "bg-secondary/15 border-border/40 opacity-70 hover:border-border/60"
                                              : metrics.isCompleted
                                                ? "bg-emerald-500/[0.03] border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] shadow-xs"
                                                : "bg-card border-border/70 hover:border-primary/50 hover:bg-secondary/20 shadow-xs"
                                          )}
                                        >
                                          {/* Khối Trái: STT + Tên bài học + Huy hiệu độ khó */}
                                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <span className={cn(
                                              "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                                              !unlocked
                                                ? "bg-secondary text-muted-foreground"
                                                : metrics.isCompleted
                                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                  : "bg-primary/10 text-primary"
                                            )}>
                                              {!unlocked ? <Lock size={11} /> : metrics.isCompleted ? <Check size={12} /> : typeIdx + 1}
                                            </span>
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                              <h5 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors leading-snug font-sans truncate">
                                                <LatexRenderer text={type.name} />
                                              </h5>
                                              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md border border-border/30 bg-secondary/40 text-muted-foreground shrink-0">
                                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", diff.dotClass)} />
                                                {diff.text}
                                              </span>
                                              {isLockedByPremium && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                                                  👑
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Khối Giữa & Phải: Trạng thái tinh gọn + Smart CTA */}
                                          <div className="flex items-center gap-2.5 shrink-0">
                                            {/* Trạng thái Lý thuyết vắn tắt */}
                                            {metrics.isRead ? (
                                              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                <Check size={11} /> Đã học
                                              </span>
                                            ) : (
                                              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80 bg-secondary/50 px-2 py-0.5 rounded-md">
                                                Chưa học
                                              </span>
                                            )}

                                            {/* Trạng thái Luyện tập vắn tắt */}
                                            {metrics.starsCount > 0 ? (
                                              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                                {'⭐'.repeat(metrics.starsCount)} {metrics.practicePercent}%
                                              </span>
                                            ) : metrics.attemptsCount > 0 ? (
                                              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                                ⚡ {metrics.practicePercent}%
                                              </span>
                                            ) : (
                                              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80 bg-secondary/50 px-2 py-0.5 rounded-md">
                                                Chưa làm
                                              </span>
                                            )}

                                            {/* Smart CTA duy nhất */}
                                            <div onClick={(e) => e.stopPropagation()}>
                                              {smartCtaButton}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  /* Chế độ Grid Thẻ hộp với đầy đủ Lý thuyết & Luyện tập */
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-5">
                                    {visibleTypes.map((type) => {
                                      const diff = getDifficultyTheme(type.difficulty);
                                      const unlocked = isUnlocked(type.id);
                                      const isLockedByPremium = isQuestionTypePremiumLocked(type.id, topic.tier, selectedSubject, selectedGrade) && !isPremium && !isOptionalEnglishListeningTopic(topic.id);
                                      const metrics = getQuestionTypeMetrics(type.id);

                                      return (
                                        <div
                                          key={type.id}
                                          className={cn(
                                            "transition-all duration-300 border bg-card hover:shadow-md cursor-pointer rounded-2xl p-4.5 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs",
                                            !unlocked
                                              ? "opacity-65 grayscale-[30%] bg-secondary/15 border-dashed border-border/70 hover:shadow-none"
                                              : metrics.isCompleted
                                                ? 'border-emerald-500/25 hover:border-emerald-500/40 bg-emerald-500/[0.02]'
                                                : 'border-border/60 hover:border-primary/50'
                                          )}
                                          onClick={() => handleSelectType(type.id)}
                                        >
                                          <div className="space-y-2.5 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.75 rounded-lg border border-border/40 bg-secondary/50 text-muted-foreground">
                                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", diff.dotClass)} />
                                                {diff.text}
                                              </span>
                                              {!unlocked ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.75 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500">
                                                  <Lock size={10} /> Đang khóa
                                                </span>
                                              ) : isLockedByPremium ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.75 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                                  👑 Premium
                                                </span>
                                              ) : metrics.isCompleted ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.75 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                                  ✓ Hoàn thành
                                                </span>
                                              ) : metrics.isRead ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.75 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                  ⚡ Đang luyện
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.75 rounded-lg bg-primary/10 border border-primary/20 text-primary animate-pulse">
                                                  ✨ Sẵn sàng học
                                                </span>
                                              )}
                                            </div>

                                            <h5 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5 leading-snug font-sans">
                                              <LatexRenderer text={type.name} />
                                            </h5>
                                            <div className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                              <LatexRenderer text={type.description} />
                                            </div>

                                            {/* Thanh tiến độ bài tập */}
                                            <div className="space-y-1 pt-1">
                                              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                                <span>Tiến độ luyện tập</span>
                                                <span className="text-primary">{metrics.starsCount > 0 ? `${'⭐'.repeat(metrics.starsCount)} ` : ''}{metrics.practicePercent}%</span>
                                              </div>
                                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${metrics.practicePercent}%` }} />
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between border-t border-border/20 pt-3 gap-2">
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleSelectType(type.id); }}
                                              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                              <BookOpen size={12} />
                                              <span>{metrics.isRead ? 'Xem lại lý thuyết' : 'Lý thuyết'}</span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={(e) => handleSelectPractice(type.id, e)}
                                              className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer text-white shadow-xs active:scale-95",
                                                !unlocked ? "bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed" : subjectTheme.solid
                                              )}
                                            >
                                              <PlayCircle size={12} />
                                              <span>{metrics.practicePercent > 0 ? (metrics.isCompleted ? 'Ôn lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* 🎲 Thẻ hành động kết thúc chương: Luyện tập tổng hợp chương */}
                                {visibleTypes.length > 1 && isTopicUnlocked && (
                                  <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-3 text-left">
                                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Sparkles size={16} />
                                      </div>
                                      <div>
                                        <h5 className="text-xs font-bold text-foreground">Luyện tập tổng hợp: {topic.name}</h5>
                                        <p className="text-[11px] text-muted-foreground">Ôn luyện phối hợp các dạng bài trong chương để củng cố phản xạ trước khi sang chương mới.</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => handleSelectPractice(visibleTypes[0].id, e)}
                                      className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5",
                                        subjectTheme.solid
                                      )}
                                    >
                                      <PlayCircle size={14} />
                                      <span>Luyện tập chương</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

              {(searchQuery.trim() || filterStatus !== 'all') && totalMatchedCount === 0 && (
                <div className="text-center py-16 px-4 space-y-3 bg-secondary/15 rounded-3xl border border-dashed border-border/60 max-w-lg mx-auto">
                  <p className="text-sm font-semibold text-foreground">
                    {searchQuery.trim()
                      ? `Không tìm thấy bài học nào phù hợp với từ khóa "${searchQuery}"`
                      : "Chưa có bài học nào trong danh mục này"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hãy thử tìm bằng từ khóa khác hoặc bấm nút bên dưới để xem toàn bộ danh mục bài học.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    Xóa bộ lọc & Hiện tất cả
                  </button>
                </div>
              )}
          </div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel || (() => setModalConfig(prev => ({ ...prev, isOpen: false })))}
      />

      {mappingModalTopic && (
        <TopicTextbookMappingModal
          isOpen={!!mappingModalTopic}
          onClose={() => setMappingModalTopic(null)}
          topicName={mappingModalTopic.name}
          outcomes={learningOutcomes.filter(o => o.topicId === mappingModalTopic.id)}
          questionTypes={questionTypes}
          onOpenTextbookPage={(bookName, pages) => {
            setDrawerConfig({
              isOpen: true,
              bookName,
              pages
            });
          }}
        />
      )}

      <TextbookDrawer
        isOpen={drawerConfig.isOpen}
        onClose={() => setDrawerConfig(prev => ({ ...prev, isOpen: false }))}
        bookName={drawerConfig.bookName}
        pages={drawerConfig.pages}
      />
    </div>
  );
};
export default Roadmap;
