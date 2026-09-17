import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  RotateCcw,
  Target,
  Trophy,
  XCircle
} from 'lucide-react';
import LatexRenderer from '@/components/common/LatexRenderer';
import QuestionStimulusRenderer from '@/components/common/QuestionStimulusRenderer';
import { Button } from '@/components/ui/button';
import type { Question, Solution, SubjectCode } from '@/types';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { progressService } from '@/services/progressService';
import { useAppStore } from '@/services/store';
import { cn } from '@/utils/cn';

interface StoredAttempt {
  answer: string;
  isCorrect: boolean;
  updatedAt: string;
}

type StoredProgress = Record<string, StoredAttempt>;

interface StoredBookmark {
  savedAt: string;
}

type StoredBookmarks = Record<string, StoredBookmark>;

export type AdvancedLevel = 'hard' | 'very_hard' | 'extreme';
export type AdvancedProblemStyle = 'compact' | 'extended' | 'olympiad';

export interface AdvancedTopicView {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  focus: string[];
}

export interface AdvancedQuestionView extends Question {
  advancedLevel: AdvancedLevel;
  problemLength: AdvancedProblemStyle;
  estimatedMinutes: number;
  tags: string[];
  options: string[];
}

export interface AdvancedSolutionView extends Solution {
  insight: string;
}

export interface AdvancedPracticeConfig {
  subjectKey: string;
  storageKeyPrefix: string;
  selectedSubject: SubjectCode;
  subjectLabel: string;
  contextLabel: string;
  title: string;
  seoTitle: string;
  heroDescription: string;
  topics: AdvancedTopicView[];
  questions: AdvancedQuestionView[];
  solutions: AdvancedSolutionView[];
}

const levelLabel: Record<AdvancedLevel, string> = {
  hard: 'Khó',
  very_hard: 'Rất khó',
  extreme: 'Cực khó'
};

const levelStyle: Record<AdvancedLevel, string> = {
  hard: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  very_hard: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  extreme: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
};

const problemLengthLabel: Record<AdvancedProblemStyle, string> = {
  compact: 'Bài cô đọng',
  extended: 'Bài tổng hợp dài',
  olympiad: 'Bài Olympic'
};

const optionLetters = ['A', 'B', 'C', 'D'];

export const AdvancedPracticePage: React.FC<{ config: AdvancedPracticeConfig }> = ({ config }) => {
  const navigate = useNavigate();
  const { selectedGrade, selectedSubject, user } = useAppStore();
  const progressKey = `${config.storageKeyPrefix}${user?.uid || 'guest'}`;
  const bookmarksKey = `${config.storageKeyPrefix}bookmarks_${user?.uid || 'guest'}`;

  const [progress, setProgress] = useState<StoredProgress>(() => {
    try {
      const saved = localStorage.getItem(`${config.storageKeyPrefix}${user?.uid || 'guest'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<StoredBookmarks>(() => {
    try {
      const saved = localStorage.getItem(`${config.storageKeyPrefix}bookmarks_${user?.uid || 'guest'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBookmarkOnlyFilter, setIsBookmarkOnlyFilter] = useState(false);

  // Tải và đồng bộ 2 chiều giữa LocalStorage và Firestore (kế thừa trọn vẹn dữ liệu guest khi đăng nhập)
  useEffect(() => {
    if (!user?.uid) {
      try {
        const savedProgress = localStorage.getItem(`${config.storageKeyPrefix}guest`);
        setProgress(savedProgress ? JSON.parse(savedProgress) : {});
        const savedBookmarks = localStorage.getItem(`${config.storageKeyPrefix}bookmarks_guest`);
        setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : {});
      } catch {
        setProgress({});
        setBookmarks({});
      }
      return;
    }

    let isMounted = true;
    const currentProgressKey = `${config.storageKeyPrefix}${user.uid}`;
    const currentBookmarksKey = `${config.storageKeyPrefix}bookmarks_${user.uid}`;
    const guestProgressKey = `${config.storageKeyPrefix}guest`;
    const guestBookmarksKey = `${config.storageKeyPrefix}bookmarks_guest`;

    const syncWithCloud = async () => {
      try {
        const { attempts: cloudAttempts, bookmarks: cloudBookmarks } =
          await progressService.getAdvancedDataFromFirestore(user.uid, config.subjectKey);
        if (!isMounted) return;

        let localAttempts: StoredProgress = {};
        try {
          const saved = localStorage.getItem(currentProgressKey);
          localAttempts = saved ? JSON.parse(saved) : {};
        } catch {
          localAttempts = {};
        }

        let guestAttempts: StoredProgress = {};
        try {
          const savedG = localStorage.getItem(guestProgressKey);
          guestAttempts = savedG ? JSON.parse(savedG) : {};
        } catch {
          guestAttempts = {};
        }

        let localBookmarks: StoredBookmarks = {};
        try {
          const savedB = localStorage.getItem(currentBookmarksKey);
          localBookmarks = savedB ? JSON.parse(savedB) : {};
        } catch {
          localBookmarks = {};
        }

        let guestBookmarks: StoredBookmarks = {};
        try {
          const savedGB = localStorage.getItem(guestBookmarksKey);
          guestBookmarks = savedGB ? JSON.parse(savedGB) : {};
        } catch {
          guestBookmarks = {};
        }

        // Smart merge attempts: kế thừa guest attempts và so khớp với Cloud
        const mergedAttempts: StoredProgress = { ...localAttempts };
        let hasNewAttemptsFromCloud = false;
        let hasNewAttemptsFromLocal = false;

        for (const [qId, guestAttempt] of Object.entries(guestAttempts)) {
          const existing = mergedAttempts[qId];
          if (!existing || new Date(guestAttempt.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
            mergedAttempts[qId] = guestAttempt;
            hasNewAttemptsFromLocal = true;
          }
        }

        for (const [qId, cloudAttempt] of Object.entries(cloudAttempts)) {
          const localAttempt = mergedAttempts[qId];
          if (!localAttempt) {
            mergedAttempts[qId] = cloudAttempt;
            hasNewAttemptsFromCloud = true;
          } else if (new Date(cloudAttempt.updatedAt).getTime() > new Date(localAttempt.updatedAt).getTime()) {
            mergedAttempts[qId] = cloudAttempt;
            hasNewAttemptsFromCloud = true;
          }
        }

        for (const [qId, localAttempt] of Object.entries(mergedAttempts)) {
          const cloudAttempt = cloudAttempts[qId];
          if (!cloudAttempt || new Date(localAttempt.updatedAt).getTime() > new Date(cloudAttempt.updatedAt).getTime()) {
            hasNewAttemptsFromLocal = true;
            void progressService.saveAdvancedAttemptToFirestore(user.uid, config.subjectKey, qId, localAttempt);
          }
        }

        if (hasNewAttemptsFromCloud || hasNewAttemptsFromLocal || Object.keys(guestAttempts).length > 0) {
          setProgress(mergedAttempts);
          localStorage.setItem(currentProgressKey, JSON.stringify(mergedAttempts));
        }

        // Smart merge bookmarks: hợp nhất danh sách bài tâm đắc (gồm cả guest bookmarks)
        const mergedBookmarks: StoredBookmarks = { ...localBookmarks, ...guestBookmarks };
        let hasNewBookmarksFromCloud = false;
        let hasNewBookmarksFromLocal = Object.keys(guestBookmarks).length > 0;

        for (const [qId, cloudBookmark] of Object.entries(cloudBookmarks)) {
          if (!mergedBookmarks[qId]) {
            mergedBookmarks[qId] = cloudBookmark;
            hasNewBookmarksFromCloud = true;
          }
        }

        for (const qId of Object.keys(mergedBookmarks)) {
          if (!cloudBookmarks[qId]) {
            hasNewBookmarksFromLocal = true;
            void progressService.saveAdvancedBookmarkToFirestore(user.uid, config.subjectKey, qId, true);
          }
        }

        if (hasNewBookmarksFromCloud || hasNewBookmarksFromLocal) {
          setBookmarks(mergedBookmarks);
          localStorage.setItem(currentBookmarksKey, JSON.stringify(mergedBookmarks));
        }

        // Xóa sạch dữ liệu guest sau khi kế thừa hoàn tất
        if (Object.keys(guestAttempts).length > 0) {
          localStorage.removeItem(guestProgressKey);
        }
        if (Object.keys(guestBookmarks).length > 0) {
          localStorage.removeItem(guestBookmarksKey);
        }
      } catch (err) {
        console.error('Lỗi đồng bộ dữ liệu nâng cao từ Firestore:', err);
      }
    };

    void syncWithCloud();
    return () => {
      isMounted = false;
    };
  }, [config.storageKeyPrefix, config.subjectKey, user?.uid]);

  const toggleBookmark = (questionId: string) => {
    const willBookmark = !bookmarks[questionId];
    const nextBookmarks: StoredBookmarks = { ...bookmarks };
    if (willBookmark) {
      nextBookmarks[questionId] = { savedAt: new Date().toISOString() };
    } else {
      delete nextBookmarks[questionId];
    }
    setBookmarks(nextBookmarks);
    localStorage.setItem(bookmarksKey, JSON.stringify(nextBookmarks));
    if (user?.uid) {
      void progressService.saveAdvancedBookmarkToFirestore(user.uid, config.subjectKey, questionId, willBookmark);
    }
  };

  const topicQuestions = useMemo(
    () => activeTopicId
      ? config.questions.filter(question => question.topicId === activeTopicId)
      : [],
    [activeTopicId, config.questions]
  );

  const currentQuestion = topicQuestions[currentIndex];
  const currentSolution = currentQuestion
    ? config.solutions.find(solution => solution.questionId === currentQuestion.id)
    : undefined;

  const totalCompleted = Object.keys(progress).filter(id => config.questions.some(question => question.id === id)).length;
  const totalCorrect = Object.entries(progress).filter(([id, attempt]) => (
    attempt.isCorrect && config.questions.some(question => question.id === id)
  )).length;
  const accuracy = totalCompleted ? Math.round(totalCorrect / totalCompleted * 100) : 0;

  const totalBookmarks = Object.keys(bookmarks).filter(id => config.questions.some(question => question.id === id)).length;

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  };

  const openTopic = (topicId: string) => {
    const questions = config.questions.filter(question => question.topicId === topicId);
    const firstUnanswered = questions.findIndex(question => !progress[question.id]);
    setActiveTopicId(topicId);
    setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    setIsBookmarkOnlyFilter(false);
    resetQuestionState();
  };

  const moveToQuestion = (index: number) => {
    setCurrentIndex(index);
    resetQuestionState();
  };

  const submitAnswer = () => {
    if (!currentQuestion || !selectedAnswer || isSubmitted) return;
    const attempt: StoredAttempt = {
      answer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      updatedAt: new Date().toISOString()
    };
    const nextProgress: StoredProgress = {
      ...progress,
      [currentQuestion.id]: attempt
    };
    setProgress(nextProgress);
    localStorage.setItem(progressKey, JSON.stringify(nextProgress));
    setIsSubmitted(true);

    // Đồng bộ ngay lên Firestore chạy ngầm nếu đã đăng nhập
    if (user?.uid) {
      void progressService.saveAdvancedAttemptToFirestore(user.uid, config.subjectKey, currentQuestion.id, attempt);
    }
  };

  const clearProgress = () => {
    if (!window.confirm(`Xóa toàn bộ tiến độ làm bài ${config.title}? (Danh sách bài tâm đắc vẫn được giữ lại)`)) return;
    localStorage.removeItem(progressKey);
    setProgress({});
    resetQuestionState();

    if (user?.uid) {
      void progressService.clearAdvancedProgressFromFirestore(user.uid, config.subjectKey);
    }
  };

  if (selectedGrade !== 'grade10' || selectedSubject !== config.selectedSubject) {
    return (
      <>
        <Helmet>
          <title>{config.seoTitle}</title>
        </Helmet>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Target size={34} />
          </div>
          <h1 className="text-2xl font-black">Chuyên đề này dành cho {config.subjectLabel}</h1>
          <p className="text-sm text-muted-foreground font-semibold">Hãy chọn “{config.contextLabel}” trong thanh môn học để mở ngân hàng bài nâng cao.</p>
          <Button onClick={() => navigate(ROUTES.ROADMAP)}>Về lộ trình học</Button>
        </div>
      </>
    );
  }

  if (!activeTopicId || !currentQuestion) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        <Helmet>
          <title>{config.seoTitle}</title>
        </Helmet>

        {/* Khung thông báo Chế độ xem thử dành cho khách */}
        {!user && (
          <div className="bg-primary/7 border border-primary/20 border-l-4 border-l-primary rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 w-full mx-auto">
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-black text-foreground">Bạn đang xem chuyên đề nâng cao ở chế độ xem thử</h3>
              <p className="text-[11px] text-muted-foreground font-semibold">
                Kết quả làm bài và bài tâm đắc được lưu tạm trên máy. Đăng nhập tài khoản để đồng bộ tiến trình học tập lên đám mây.
              </p>
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

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 dark:border-slate-700/60 bg-[linear-gradient(135deg,rgba(8,145,178,0.12),rgba(255,255,255,0.92)_48%,rgba(249,115,22,0.10))] dark:bg-[linear-gradient(135deg,rgba(8,145,178,0.16),rgba(15,23,42,0.96)_48%,rgba(249,115,22,0.12))] p-6 sm:p-9 shadow-sm">
          <div className="absolute -right-14 -top-16 w-52 h-52 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-7 items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950 text-[11px] font-black uppercase tracking-[0.14em]">
                <Trophy size={14} /> HSG · Olympic · Trường chuyên
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">{config.title}</h1>
                <p className="mt-3 max-w-3xl text-sm sm:text-base font-semibold leading-7 text-slate-600 dark:text-slate-300">
                  {config.heroDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['hard', 'very_hard', 'extreme'] as AdvancedLevel[]).map(level => (
                  <span key={level} className={cn('px-3 py-1.5 rounded-full border text-xs font-black', levelStyle[level])}>
                    {levelLabel[level]}: {config.questions.filter(question => question.advancedLevel === level).length} câu
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-[290px]">
              <StatBox label="Đã làm" value={`${totalCompleted}/${config.questions.length}`} />
              <StatBox label="Đúng" value={String(totalCorrect)} />
              <StatBox label="Chính xác" value={`${accuracy}%`} />
              <StatBox label="Tâm đắc" value={String(totalBookmarks)} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Chọn chiến trường</p>
              <h2 className="mt-1 text-2xl font-black">{config.topics.length} mảng bài tập nâng cao</h2>
            </div>
            {totalCompleted > 0 && (
              <button onClick={clearProgress} className="text-xs font-bold text-muted-foreground hover:text-rose-600 flex items-center gap-1.5 cursor-pointer">
                <RotateCcw size={13} /> Xóa tiến độ làm bài
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {config.topics.map((topic, index) => {
              const questions = config.questions.filter(question => question.topicId === topic.id);
              const completed = questions.filter(question => progress[question.id]).length;
              const correct = questions.filter(question => progress[question.id]?.isCorrect).length;
              const topicBookmarkCount = questions.filter(question => bookmarks[question.id]).length;
              return (
                <button
                  key={topic.id}
                  onClick={() => openTopic(topic.id)}
                  className="group text-left p-5 rounded-2xl border border-border/70 bg-card hover:border-cyan-600/40 hover:shadow-lg hover:shadow-cyan-950/5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="w-10 h-10 rounded-xl bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950 flex items-center justify-center font-black text-sm">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[11px] font-black text-muted-foreground">{completed}/{questions.length} câu</span>
                  </div>
                  <h3 className="mt-4 text-base font-black group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">{topic.title}</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground min-h-10">{topic.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {topic.focus.map(item => <span key={item} className="px-2 py-1 bg-secondary/70 rounded-md text-[10px] font-bold text-muted-foreground">{item}</span>)}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">{correct} đúng</span>
                      {topicBookmarkCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                          <Bookmark size={11} className="fill-amber-500 text-amber-500" /> {topicBookmarkCount}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-700 dark:text-cyan-300">Vào làm <ChevronRight size={14} /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  const activeTopic = config.topics.find(topic => topic.id === activeTopicId)!;

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const topicCompletedCount = topicQuestions.filter(q => progress[q.id]).length;
  const topicCorrectCount = topicQuestions.filter(q => progress[q.id]?.isCorrect).length;
  const bookmarkedInTopicCount = topicQuestions.filter(q => bookmarks[q.id]).length;
  const isShortOptions = currentQuestion.options.every(opt => (opt || '').trim().length < 32);

  const displayedQuestions = isBookmarkOnlyFilter
    ? topicQuestions.filter(q => bookmarks[q.id])
    : topicQuestions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
      <Helmet>
        <title>{activeTopic.shortTitle} nâng cao – {config.subjectLabel} | ezonthi</title>
      </Helmet>

      {/* Khung thông báo Chế độ xem thử dành cho khách */}
      {!user && (
        <div className="bg-primary/7 border border-primary/20 border-l-4 border-l-primary rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 w-full mx-auto">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-black text-foreground">Bạn đang luyện tập chuyên đề ở chế độ xem thử</h3>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Kết quả làm bài và bài tâm đắc được lưu tạm trên máy. Đăng nhập tài khoản để đồng bộ điểm số lên đám mây và bảo toàn tiến trình học tập.
            </p>
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

      {/* Header Chuyên đề: Phân 2 tầng rõ ràng, không bị truncate và không scrollbar */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveTopicId(null); resetQuestionState(); }}
              className="shrink-0 gap-1.5 rounded-xl font-bold hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer"
            >
              <ArrowLeft size={15} /> Tất cả chuyên đề
            </Button>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 block">
                {config.subjectLabel} nâng cao
              </span>
              <h1 className="text-base sm:text-lg font-black text-foreground">
                {activeTopic.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-xl border border-border/50 text-xs font-black">
              <span className="text-muted-foreground font-semibold">Tiến độ:</span>
              <span className="text-foreground">{topicCompletedCount}/{topicQuestions.length}</span>
              <span className="text-emerald-700 dark:text-emerald-400">({topicCorrectCount} đúng)</span>
            </div>
            {bookmarkedInTopicCount > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-black">
                <Bookmark size={13} className="fill-amber-500 text-amber-500" />
                <span>{bookmarkedInTopicCount} tâm đắc</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-muted-foreground mb-2.5">
            <div className="flex items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/50">
              <button
                type="button"
                onClick={() => setIsBookmarkOnlyFilter(false)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer',
                  !isBookmarkOnlyFilter
                    ? 'bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Tất cả ({topicQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setIsBookmarkOnlyFilter(true)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer',
                  isBookmarkOnlyFilter
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400'
                )}
              >
                <Bookmark size={12} className={cn(bookmarkedInTopicCount > 0 && 'fill-amber-500')} />
                Bài tâm đắc ({bookmarkedInTopicCount})
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[10px]">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đúng</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Sai</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tâm đắc</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-950 dark:bg-cyan-300" /> Đang làm</span>
            </div>
          </div>

          {displayedQuestions.length > 0 ? (
            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-24 gap-1.5">
              {displayedQuestions.map((question) => {
                const originalIndex = topicQuestions.findIndex(q => q.id === question.id);
                const attempt = progress[question.id];
                const isCurrent = originalIndex === currentIndex;
                const isSaved = Boolean(bookmarks[question.id]);
                return (
                  <button
                    key={question.id}
                    onClick={() => moveToQuestion(originalIndex)}
                    className={cn(
                      'relative h-8.5 rounded-lg border text-xs font-black transition-all flex items-center justify-center cursor-pointer',
                      isCurrent
                        ? 'bg-slate-950 text-white border-slate-950 dark:bg-cyan-300 dark:text-slate-950 dark:border-cyan-300 ring-2 ring-cyan-500/25 shadow-sm'
                        : attempt?.isCorrect
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                          : attempt
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                            : 'bg-background text-muted-foreground border-border/70 hover:border-cyan-500/40 hover:text-foreground'
                    )}
                  >
                    {originalIndex + 1}
                    {isSaved && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-card" title="Đã lưu tâm đắc" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-4 px-3 rounded-xl bg-secondary/30 border border-border/50 text-center text-xs font-semibold text-muted-foreground">
              Chưa có bài nào được lưu tâm đắc trong chuyên đề này. Bấm vào nút <span className="font-black text-foreground">"Lưu bài hay"</span> ở câu hỏi bạn thích để lưu lại nhé!
            </div>
          )}
        </div>
      </div>

      <div className={cn('grid gap-5', isSubmitted ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]' : 'max-w-5xl mx-auto')}>
        <section className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-border/60 bg-secondary/25 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn('px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider', levelStyle[currentQuestion.advancedLevel])}>
                  {levelLabel[currentQuestion.advancedLevel]}
                </span>
                {currentQuestion.problemLength !== 'compact' && (
                  <span className="px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
                    {problemLengthLabel[currentQuestion.problemLength]}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground"><Clock3 size={13} /> {currentQuestion.estimatedMinutes} phút</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentQuestion.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black transition-all cursor-pointer select-none',
                    bookmarks[currentQuestion.id]
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-xs'
                      : 'bg-secondary/70 text-muted-foreground border-border/70 hover:border-amber-500/40 hover:text-foreground'
                  )}
                  title={bookmarks[currentQuestion.id] ? 'Bỏ lưu bài tâm đắc này' : 'Lưu bài này vào danh sách tâm đắc'}
                >
                  <Bookmark
                    size={13}
                    className={cn(
                      'transition-all',
                      bookmarks[currentQuestion.id] ? 'fill-amber-500 text-amber-500 scale-110' : 'text-muted-foreground'
                    )}
                  />
                  <span>{bookmarks[currentQuestion.id] ? 'Đã lưu tâm đắc' : 'Lưu bài hay'}</span>
                </button>

                <span className="text-xs font-black text-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/40">
                  Câu {currentIndex + 1} / {topicQuestions.length}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              <QuestionStimulusRenderer question={currentQuestion} />
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mt-0.5"><BrainCircuit size={20} /></span>
                <div className="text-base sm:text-lg font-bold leading-relaxed text-foreground"><LatexRenderer text={currentQuestion.content} /></div>
              </div>

              {/* Lưới lựa chọn: Tự động phân 2 cột nếu đáp án ngắn, 1 cột nếu đáp án dài */}
              <div className={cn('grid gap-3.5', isShortOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
                {currentQuestion.options.map((option, index) => {
                  const letter = optionLetters[index];
                  const selected = selectedAnswer === letter;
                  const correctOption = currentQuestion.correctAnswer === letter;
                  return (
                    <button
                      key={letter}
                      disabled={isSubmitted}
                      onClick={() => setSelectedAnswer(letter)}
                      className={cn(
                        'min-h-13 px-4 py-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer disabled:cursor-default',
                        !isSubmitted && selected && 'border-cyan-600 bg-cyan-500/10 ring-2 ring-cyan-500/20 shadow-sm',
                        !isSubmitted && !selected && 'border-border/70 hover:border-cyan-500/40 hover:bg-secondary/30',
                        isSubmitted && correctOption && 'border-emerald-500/60 bg-emerald-500/10',
                        isSubmitted && selected && !correctOption && 'border-rose-500/60 bg-rose-500/10'
                      )}
                    >
                      <span className={cn(
                        'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-xs font-black transition-colors',
                        !isSubmitted && selected ? 'bg-cyan-700 text-white border-cyan-700' :
                          isSubmitted && correctOption ? 'bg-emerald-600 text-white border-emerald-600' :
                            isSubmitted && selected ? 'bg-rose-600 text-white border-rose-600' : 'bg-secondary text-muted-foreground border-border/80'
                      )}>{letter}</span>
                      <span className="text-sm font-semibold flex-1 leading-snug"><LatexRenderer text={option} /></span>
                      {isSubmitted && correctOption && <CheckCircle2 size={18} className="ml-auto text-emerald-600 shrink-0" />}
                      {isSubmitted && selected && !correctOption && <XCircle size={18} className="ml-auto text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Card: Nút điều hướng trước/sau + Chốt đáp án cân đối */}
          <div className="p-5 sm:px-7 border-t border-border/60 bg-secondary/15 space-y-3">
            {!isSubmitted ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="rounded-xl font-bold gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Câu trước
                </Button>

                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  size="lg"
                  className="flex-1 sm:max-w-xs mx-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black shadow-md shadow-cyan-500/20 rounded-xl cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-all"
                >
                  Chốt đáp án <Target size={17} className="ml-1" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveToQuestion(currentIndex + 1)}
                  disabled={currentIndex === topicQuestions.length - 1}
                  className="rounded-xl font-bold gap-1 cursor-pointer"
                >
                  Câu sau <ArrowRight size={14} />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={cn('p-4 rounded-xl border flex items-start gap-3', isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30')}>
                  {isCorrect ? <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="text-rose-600 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-black text-sm">{isCorrect ? 'Chính xác! Làm rất tốt.' : 'Chưa chính xác.'}</p>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">Đáp án đúng là <strong>{currentQuestion.correctAnswer}</strong>. Lời giải chi tiết đã được mở bên cạnh.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={resetQuestionState} className="rounded-xl font-bold gap-1 cursor-pointer">
                    <RotateCcw size={14} /> Làm lại câu này
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentIndex < topicQuestions.length - 1) moveToQuestion(currentIndex + 1);
                      else { setActiveTopicId(null); resetQuestionState(); }
                    }}
                    size="lg"
                    className="flex-1 sm:max-w-xs mx-auto bg-slate-950 hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-950 font-black rounded-xl cursor-pointer"
                  >
                    {currentIndex < topicQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành chuyên đề'} <ArrowRight size={15} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {isSubmitted && currentSolution && (
          <aside className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-border/60 bg-amber-500/6">
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-amber-700 dark:text-amber-300">Lời giải sau khi nộp</p>
              <h2 className="mt-1 font-black flex items-center gap-2"><Flame size={17} className="text-orange-600" /> Phân tích và lời giải từng bước</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/7 border border-amber-500/20 text-sm leading-6">
                <h3 className="mb-1.5 text-[11px] font-black uppercase tracking-wide text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <BrainCircuit size={14} /> Nhận dạng bài toán
                </h3>
                <div className="font-medium text-muted-foreground">
                  <LatexRenderer text={currentSolution.recognition} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/7 border border-cyan-500/15 text-sm leading-6">
                <h3 className="mb-1.5 text-[11px] font-black uppercase tracking-wide text-cyan-800 dark:text-cyan-200 flex items-center gap-1.5">
                  <Target size={14} /> Mấu chốt riêng của câu
                </h3>
                <div className="font-semibold">
                <LatexRenderer text={currentSolution.insight} />
                </div>
              </div>
              <div className="space-y-5">
                {currentSolution.detailedSteps.map(step => (
                  <div key={step.order} className="flex gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950 flex items-center justify-center text-[11px] font-black shrink-0">{step.order}</span>
                    <div className="min-w-0 space-y-1.5">
                      <h3 className="text-sm font-black">{step.title}</h3>
                      <div className="text-xs font-semibold leading-5 text-muted-foreground"><LatexRenderer text={step.explanation} /></div>
                      {step.formula && <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-sm overflow-x-auto"><LatexRenderer text={step.formula} block /></div>}
                      {step.result && <div className="text-sm font-black text-emerald-700 dark:text-emerald-300"><LatexRenderer text={step.result} /></div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/60">
                <h3 className="text-xs font-black text-rose-700 dark:text-rose-300">Bẫy dễ mắc</h3>
                <ul className="mt-2 space-y-1.5 text-xs font-semibold text-muted-foreground">
                  {currentSolution.commonMistakes.map(mistake => <li key={mistake}>• <LatexRenderer text={mistake} /></li>)}
                </ul>
              </div>
              {currentSolution.reviewSuggestions.length > 0 && (
                <div className="pt-4 border-t border-border/60">
                  <h3 className="text-xs font-black text-sky-700 dark:text-sky-300">Nếu em chưa theo kịp lời giải</h3>
                  <ul className="mt-2 space-y-1.5 text-xs font-medium text-muted-foreground">
                    {currentSolution.reviewSuggestions.map(suggestion => <li key={suggestion}>• <LatexRenderer text={suggestion} /></li>)}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-950/50 px-3 py-3 text-center">
    <div className="text-lg font-black text-slate-950 dark:text-white">{value}</div>
    <div className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
  </div>
);

export default AdvancedPracticePage;
