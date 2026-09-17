import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/services/store';
import { storageService } from '@/services/storage';
import { getLearningOutcomes } from '@/data';
import { useRoadmapBundle } from '@/services/roadmapService';
import type { RoadmapQuestionType } from '@/types/roadmapContract';
import { ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getDifficultyTheme, getSubjectTheme, getTierTheme } from '@/utils/theme';
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

export const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedSubject, selectedGrade, progressVersion, isPremium, user } = useAppStore();
  const subjectTheme = getSubjectTheme(selectedSubject);
  void progressVersion;

  const hasVideos = selectedSubject === 'chemistry' || (selectedSubject === 'biology' && selectedGrade === 'grade10') || (selectedSubject === 'physics' && selectedGrade === 'grade10');

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

  const { bundle, loading: bundleLoading } = useRoadmapBundle(selectedGrade, selectedSubject);
  const topics = React.useMemo(() => bundle?.topics || [], [bundle]);
  const questionTypes = React.useMemo(() => bundle?.questionTypes || [], [bundle]);
  const learningOutcomes = getLearningOutcomes(selectedGrade, selectedSubject);

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

  const shouldShowType = (typeId: string) => {
    const qType = questionTypes.find(t => t.id === typeId);
    if (!qType) return false;

    if (isUnlocked(typeId)) return true; // Hiển thị các bài đã mở khóa

    const topicTypes = typesByTopic.get(qType.topicId) || [];
    const firstLockedInTopicIdx = topicTypes.findIndex(t => !isUnlocked(t.id));
    const idxInTopic = topicTypes.findIndex(t => t.id === typeId);

    // Trong mỗi chuyên đề, chỉ hiển thị thêm duy nhất 1 bài khóa tiếp theo
    return idxInTopic === firstLockedInTopicIdx;
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
    navigate(`/question-types/${id}`);
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
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight flex items-center justify-center gap-2 font-sans">
          {selectedGrade === 'grade9' ? 'Lộ trình Ôn thi' : 'Lộ trình Học tốt'} môn {getSubjectIcon(selectedSubject)} {getSubjectName(selectedSubject)} {selectedGrade === 'grade9' ? 'vào 10' : selectedGrade === 'grade10' ? 'Lớp 10' : 'Lớp 11'}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-bold">
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
                    'relative border-l-2 pl-5 md:pl-8 ml-2 md:ml-5 space-y-10 md:space-y-12',
                    getTierTheme(tier.id).lineStyle
                  )}>
                    {visibleTopics.map((topic, topicIdx) => {
                      const filteredTypes = questionTypes.filter(type => type.topicId === topic.id);
                      const visibleTypes = filteredTypes.filter(type => shouldShowType(type.id));
                      const isTopicUnlocked = filteredTypes.some(type => isUnlocked(type.id));

                      return (
                        <div key={topic.id} className="relative group/topic">
                          {/* Điểm nút trên trục thời gian - Đồng bộ màu theo môn học */}
                          <div className={cn(
                            "absolute -left-[31px] md:-left-[45px] top-0.5 w-7 h-7 md:w-8 md:h-8 rounded-full border-4 border-background flex items-center justify-center text-[10px] md:text-xs font-black shadow-md transition-all duration-300 group-hover/topic:scale-110",
                            !isTopicUnlocked
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-900 shadow-none"
                              : subjectTheme.solid
                          )}>
                            {topicIdx + 1}
                          </div>

                          {/* Chi tiết chuyên đề */}
                          <div className="space-y-5">
                            {(() => {
                              const completedCount = filteredTypes.filter(type => readLessonsSet.has(type.id)).length;
                              const percent = filteredTypes.length > 0 ? Math.round((completedCount / filteredTypes.length) * 100) : 0;
                              const topicOutcomes = learningOutcomes.filter(o => o.topicId === topic.id && o.textbook && o.textbook.pages.length > 0);

                              return (
                                <div className="flex flex-col gap-1.5 pl-1">
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <h4 className={cn(
                                      "text-base font-extrabold flex items-center gap-2 font-sans transition-colors",
                                      isTopicUnlocked
                                        ? "text-foreground group-hover/topic:text-primary"
                                        : "text-muted-foreground/75"
                                    )}>
                                      {topic.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 shadow-inner">
                                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                                      </div>
                                      <span className="text-[10px] text-primary font-black">{percent}% hoàn thành</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                      {topic.id === 'eng10-listening-extension'
                                        ? `${filteredTypes.length} bài luyện nghe tự chọn`
                                        : `${filteredTypes.length} dạng bài thi cốt lõi`}
                                    </span>
                                    {topicOutcomes.length > 0 && (
                                      <button
                                        onClick={() => setMappingModalTopic({ id: topic.id, name: topic.name })}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer shadow-2xs active:scale-95"
                                      >
                                        <BookOpen size={12} />
                                        Bảng đối chiếu SGK chuẩn
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Danh sách dạng bài */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-5">
                              {visibleTypes.map((type) => {
                                const diff = getDifficultyTheme(type.difficulty);
                                const isRead = readLessonsSet.has(type.id);
                                const unlocked = isUnlocked(type.id);
                                const isLockedByPremium = isQuestionTypePremiumLocked(type.id, topic.tier, selectedSubject, selectedGrade) && !isPremium && !isOptionalEnglishListeningTopic(topic.id);

                                return (
                                  <div
                                    key={type.id}
                                    className={cn(
                                      "transition-all duration-300 border bg-card hover:shadow-md cursor-pointer rounded-xl p-4.5 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-sm",
                                      !unlocked
                                        ? "opacity-60 grayscale-[40%] bg-secondary/10 dark:bg-slate-900/10 border-dashed border-border/80 hover:shadow-none cursor-not-allowed"
                                        : isRead
                                          ? 'border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/[0.01]'
                                          : 'border-border/60 hover:border-primary/50'
                                    )}
                                    onClick={() => handleSelectType(type.id)}
                                  >
                                    <div className="space-y-2.5 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                          {/* Badge độ khó tối giản với chấm màu */}
                                          <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2.5 py-0.75 rounded-lg border border-border/40 bg-secondary/50 text-muted-foreground">
                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", diff.dotClass)} />
                                            {diff.text}
                                          </span>
                                          {!unlocked ? (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.75 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500">
                                              🔒 Đang khóa
                                            </span>
                                          ) : isLockedByPremium ? (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.75 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                              👑 Khóa Premium
                                            </span>
                                          ) : isRead ? (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.75 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                              ✓ Đã đọc
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.75 rounded-lg bg-primary/10 border border-primary/20 text-primary animate-pulse">
                                              ✨ Sẵn sàng học
                                            </span>
                                          )}
                                        </div>

                                        <h5 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 leading-snug font-sans">
                                          <LatexRenderer text={type.name} />
                                        </h5>
                                        <div className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                          <LatexRenderer text={type.description} />
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end border-t border-border/20 pt-3.5 text-[10px] font-bold text-muted-foreground">
                                        {!unlocked ? (
                                          <span className="text-slate-400 dark:text-slate-600 flex items-center gap-0.5 font-bold">
                                            Học bài trước để mở khóa
                                          </span>
                                        ) : (
                                          <span className="text-primary hover:underline flex items-center gap-0.5 font-extrabold">
                                            {isRead ? 'Xem lại lý thuyết' : 'Học chi tiết'} <ArrowRight size={10} />
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
