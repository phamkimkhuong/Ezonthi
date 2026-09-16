import React, { useState, useEffect, useMemo } from 'react';
import '@fontsource/source-serif-4/vietnamese-400.css';
import '@fontsource/source-serif-4/vietnamese-600.css';
import '@fontsource/source-serif-4/vietnamese-700.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestions, getSolutions, getLearningOutcomes } from '@/data';
import { useRoadmapBundle } from '@/services/roadmapService';
import type { RoadmapQuestionType } from '@/types/roadmapContract';
import { useAppStore } from '@/services/store';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { authService } from '@/services/authService';
import { TextbookDrawer } from '@/components/common/TextbookDrawer';
import { Question, Solution } from '@/types';
import { Button } from '@/components/ui/button';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import {
  AlertTriangle,
  Activity,
  ArrowLeft,
  PlayCircle,
  LockKeyhole,
  Lightbulb,
  CornerDownRight,
  BookOpen,
  Volume2,
  VolumeX,
  Crown
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { getSubjectTheme, getStarsFromScore } from '@/utils/theme';
import { getSubjectFromQuestionTypeId, getSubjectName, getSubjectIcon, isQuestionTypePremiumLocked } from '@/utils/subject';
import { storageService } from '@/services/storage';
import { progressService } from '@/services/progressService';
import { convertLatexToSpeechText } from '@/utils/speech';
import { SeoHead } from '@/components/common/SeoHead';
import { createBreadcrumbSchema, createFAQSchema, createQuizSchema } from '@/utils/seoSchemas';

export const QuestionTypeDetail: React.FC = () => {
  const { questionTypeId } = useParams<{ questionTypeId: string }>();
  const navigate = useNavigate();
  const { selectedSubject, selectedGrade, setSubject, user, refreshProgress, isPremium } = useAppStore();

  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Chỉ kích hoạt Floating Bar trên màn hình Mobile (width < 768px)
      // và khi học sinh đã cuộn qua khỏi header banner (scrollY > 220px)
      if (window.innerWidth < 768 && window.scrollY > 220) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const routeSubject = getSubjectFromQuestionTypeId(questionTypeId) ?? selectedSubject;
  const { bundle, loading: bundleLoading } = useRoadmapBundle(selectedGrade, routeSubject);
  const routeQuestions = getQuestions(selectedGrade, routeSubject);
  const routeSolutions = getSolutions(selectedGrade, routeSubject);

  useEffect(() => {
    const subjectFromRoute = getSubjectFromQuestionTypeId(questionTypeId);
    if (subjectFromRoute && subjectFromRoute !== selectedSubject) {
      setSubject(subjectFromRoute);
    }
  }, [questionTypeId, selectedSubject, setSubject]);

  // Tìm dạng bài trực tiếp trong quá trình render (Derived State từ R2 Bundle)
  const detail: RoadmapQuestionType | null = useMemo(() => {
    if (!questionTypeId || !bundle) return null;
    return bundle.questionTypes.find(t => t.id === questionTypeId) || null;
  }, [questionTypeId, bundle]);

  // Tìm câu hỏi mẫu đi kèm trực tiếp (Derived State)
  const exampleQuestion: Question | null = detail
    ? (detail.exampleQuestionId
      ? routeQuestions.find(item => item.id === detail.exampleQuestionId)
      : routeQuestions.find(item => item.questionTypeId === detail.id)) || null
    : null;

  // Tìm lời giải mẫu đi kèm trực tiếp (Derived State)
  const exampleSolution: Solution | null = exampleQuestion
    ? routeSolutions.find(s => s.questionId === exampleQuestion.id) || null
    : null;

  const [visitedTabIds, setVisitedTabIds] = useState<Set<string>>(new Set());
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, string>>({});
  const [passedCheckpointIds, setPassedCheckpointIds] = useState<Set<string>>(new Set());
  const [showLessonCompletedMsg, setShowLessonCompletedMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('theory');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isTextbookOpen, setIsTextbookOpen] = useState(false);

  const outcomes = getLearningOutcomes(selectedGrade, routeSubject);
  const currentOutcome = outcomes.find(o => o.questionTypeIds.includes(detail?.id || ''));
  const textbookData = currentOutcome?.textbook;
  const requiresTheoryCompletion =
    selectedGrade === 'grade11' &&
    routeSubject === 'physics' &&
    Boolean(detail?.theory?.length);
  const isPracticeLockedByTheory = requiresTheoryCompletion && !showLessonCompletedMsg;
  const isTypeLockedByPremium = detail
    ? isQuestionTypePremiumLocked(detail.id, 1, routeSubject, selectedGrade) && !isPremium
    : false;

  useEffect(() => {
    if (!detail) return;
    const defaultTab = detail.theory && detail.theory.length > 0
      ? 'theory'
      : (detail.subTypes && detail.subTypes.length > 0 ? 'subtypes' : 'recognition_mistakes');

    setVisitedTabIds(new Set([defaultTab]));
    setCheckpointAnswers({});
    setActiveTab(defaultTab);
    setShowLessonCompletedMsg(false);

    const userId = user?.uid || 'guest';
    const readLessons = storageService.getReadLessons(userId);
    const requiredCheckpointIds = (detail.theoryCheckpoints ?? []).map(item => item.id);
    const storedCheckpointIds = new Set(storageService.getPassedTheoryCheckpoints(userId));
    const restoredPassedIds = new Set(
      requiredCheckpointIds.filter(id => storedCheckpointIds.has(id))
    );
    setPassedCheckpointIds(restoredPassedIds);
    const hasPassedRequiredCheckpoints =
      requiredCheckpointIds.length === 0 ||
      requiredCheckpointIds.every(id => restoredPassedIds.has(id));

    if (readLessons.includes(detail.id) && hasPassedRequiredCheckpoints) {
      setShowLessonCompletedMsg(true);
    } else {
      const availableIds: string[] = [];
      if (detail.theory && detail.theory.length > 0) availableIds.push('theory');
      if (detail.subTypes && detail.subTypes.length > 0) availableIds.push('subtypes');
      availableIds.push('recognition_mistakes');
      availableIds.push('method');
      availableIds.push('example');

      if (availableIds.length === 1 && requiredCheckpointIds.length === 0) {
        if (user) {
          progressService.saveLessonRead(user.uid, detail.id);
        } else {
          storageService.saveLessonRead(userId, detail.id);
        }
        refreshProgress();
        setShowLessonCompletedMsg(true);
      }
    }
  }, [questionTypeId, detail, user, refreshProgress]);

  // Hủy đọc thoại khi rời trang
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Hủy đọc thoại khi chuyển tab
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlayingSpeech(false);
  }, [activeTab]);

  useEffect(() => {
    if (detail) {
      localStorage.setItem('otv10_last_active_theory', detail.id);
    }
  }, [detail]);

  const activeTabTextArray = React.useMemo(() => {
    if (!detail) return [];
    switch (activeTab) {
      case 'theory':
        return detail.theory || [];
      case 'subtypes':
        return (detail.subTypes || []).flatMap(s => [
          s.name,
          'Ví dụ minh họa: ' + s.example,
          s.note ? 'Phương pháp giải: ' + s.note : ''
        ]).filter(Boolean);
      case 'recognition_mistakes':
        return [
          'Dấu hiệu nhận biết trong đề bài:',
          ...(detail.recognitionSigns || []),
          ...(detail.commonMistakes && detail.commonMistakes.length > 0
            ? ['Các lỗi thường gặp và bẫy cần tránh:', ...(detail.commonMistakes || [])]
            : [])
        ];
      case 'method':
        return (detail.solvingSteps || []).map((s, i) => `Bước ${i + 1}: ${s}`);
      case 'example':
        if (!exampleQuestion) return [];
        return [
          'Ví dụ mẫu:',
          exampleQuestion.content,
          ...(exampleQuestion.options || []),
          ...(exampleSolution
            ? [
              'Phân tích giải mẫu:',
              'Tư duy nhận diện: ' + exampleSolution.recognition,
              ...exampleSolution.detailedSteps.map(s => `Bước ${s.order}: ${s.title}. ${s.explanation}`),
              'Đáp án cuối cùng: ' + exampleSolution.finalAnswer
            ]
            : [])
        ];
      default:
        return [];
    }
  }, [activeTab, detail, exampleQuestion, exampleSolution]);

  if (bundleLoading && !detail) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
        <div className="h-28 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl" />
        <div className="h-64 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 text-center text-muted-foreground font-semibold">
        Không tìm thấy thông tin chi tiết dạng bài. Vui lòng quay lại lộ trình.
      </div>
    );
  }

  // Lấy chính xác môn học và theme
  const currentSubject = getSubjectFromQuestionTypeId(detail.id) ?? selectedSubject;
  const theme = getSubjectTheme(currentSubject);
  const subjectName = getSubjectName(currentSubject);
  const subjectIcon = getSubjectIcon(currentSubject);

  const requiresLoginForPractice = !user;

  // Lấy thông tin tiến độ học tập (Mastery Score & Stars) của người học
  const userId = user?.uid || 'guest';
  const progress = storageService.getProgress(userId);
  const masteryScore = progress.masteryLevels[detail.id] || 0;
  const starsCount = getStarsFromScore(masteryScore);

  // Xây dựng tab items
  const tabItems: TabItem[] = [];

  if (detail.theory && detail.theory.length > 0) {
    tabItems.push({
      id: 'theory',
      label: '📖 Định nghĩa & Lý thuyết',
      content: (
        <div className={cn("border bg-card p-4 sm:p-6 rounded-xl space-y-4 shadow-sm", theme.border)}>
          <h4 className="font-extrabold text-sm md:text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/30">
            <BookOpen size={18} className={theme.iconColor} /> Khái niệm & Định nghĩa cơ bản cần nắm:
          </h4>
          <div className="space-y-4 text-sm md:text-base font-reading text-foreground/90 leading-8 pl-1">
            {detail.theory.map((para: string, idx: number) => (
              <div key={idx} className="prose dark:prose-invert max-w-none leading-relaxed">
                <LatexRenderer text={para} />
              </div>
            ))}
          </div>

          {detail.theoryCheckpoints && detail.theoryCheckpoints.length > 0 && (
            <div className="space-y-4 border-t border-border/40 pt-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                  Tự kiểm tra trước khi luyện tập
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  Chọn đúng đáp án để xác nhận bạn đã nắm phần lý thuyết cốt lõi.
                </p>
              </div>

              {detail.theoryCheckpoints.map((checkpoint, checkpointIndex) => {
                const selectedAnswer = checkpointAnswers[checkpoint.id];
                const hasPassed = passedCheckpointIds.has(checkpoint.id);
                const optionLabels = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={checkpoint.id}
                    className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4"
                  >
                    <p className="text-xs md:text-sm font-extrabold leading-relaxed text-foreground">
                      Câu {checkpointIndex + 1}: <LatexRenderer text={checkpoint.question} />
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {checkpoint.options.map((option, optionIndex) => {
                        const answer = optionLabels[optionIndex];
                        const isSelected = selectedAnswer === answer;
                        const isCorrectOption = hasPassed && answer === checkpoint.correctAnswer;

                        return (
                          <button
                            key={answer}
                            type="button"
                            disabled={hasPassed}
                            onClick={() => handleCheckpointAnswer(checkpoint.id, answer)}
                            className={cn(
                              "rounded-xl border px-3 py-2.5 text-left text-xs font-semibold leading-relaxed transition-colors",
                              isCorrectOption
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : isSelected
                                  ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                  : "border-border/60 bg-background hover:border-cyan-500/40 hover:bg-cyan-500/5"
                            )}
                          >
                            <span className="mr-1.5 font-black">{answer}.</span>
                            <LatexRenderer text={option} />
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer && (
                      <div
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed",
                          hasPassed
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        )}
                      >
                        {hasPassed
                          ? <>✓ Chính xác. <LatexRenderer text={checkpoint.explanation} /></>
                          : 'Chưa đúng. Hãy đọc lại phần lý thuyết phía trên và chọn lại.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )
    });
  }

  if (detail.subTypes && detail.subTypes.length > 0) {
    tabItems.push({
      id: 'subtypes',
      label: '🎯 Các dạng toán con',
      content: (
        <div className={cn("border bg-card p-4 sm:p-6 rounded-xl space-y-4 shadow-sm", theme.border)}>
          <h4 className="font-extrabold text-sm md:text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/30">
            <PlayCircle size={18} className={cn(theme.iconColor, "animate-pulse")} /> Phân dạng chi tiết thường gặp trong đề thi:
          </h4>
          <div className="grid grid-cols-1 gap-5">
            {detail.subTypes.map((sub, idx: number) => (
              <div key={idx} className="flex flex-col bg-secondary/30 dark:bg-slate-900/20 p-4.5 rounded-2xl border border-border/10 hover:border-border/30 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm", theme.badge)}>
                    {idx + 1}
                  </div>
                  <div className="text-sm font-bold text-foreground pt-0.5">
                    <LatexRenderer text={sub.name} />
                  </div>
                </div>

                <div className="mt-3.5 pl-9 space-y-3">
                  <div className="p-4 bg-card border border-border/40 rounded-2xl text-xs md:text-sm font-medium text-foreground shadow-sm leading-relaxed">
                    <span className="text-amber-500 font-extrabold block mb-2 text-xs">
                      🔬 Ví dụ đề minh họa:
                    </span>
                    <LatexRenderer text={sub.example} />
                  </div>
                  {sub.note && (
                    <div className="text-xs text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-xl border border-border/20">
                      <span className="font-extrabold text-foreground">💡 Phương pháp giải:</span> <LatexRenderer text={sub.note} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  tabItems.push(
    {
      id: 'recognition_mistakes',
      label: '💡 Nhận biết & Tránh lỗi',
      content: (
        <div className="space-y-5">
          <div className={cn("border bg-card p-4 sm:p-6 rounded-xl space-y-4 shadow-sm", theme.border)}>
            <h4 className="font-extrabold text-sm md:text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/30">
              <Lightbulb size={18} className="text-amber-500" /> Dấu hiệu nhận biết trong đề bài:
            </h4>
            <ul className="space-y-3.5 pl-1">
              {detail.recognitionSigns.map((sign: string, idx: number) => (
                <li key={idx} className="text-xs md:text-sm font-medium text-foreground/80 flex items-start gap-2.5 leading-relaxed">
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", theme.dot)} />
                  <LatexRenderer text={sign} />
                </li>
              ))}
            </ul>
          </div>

          {detail.commonMistakes && detail.commonMistakes.length > 0 && (
            <div className="border border-rose-500/10 bg-rose-50/5 dark:bg-rose-950/5 p-4 sm:p-6 rounded-xl space-y-4 shadow-sm">
              <h4 className="font-extrabold text-sm md:text-base text-rose-600 dark:text-rose-400 flex items-center gap-2 pb-2 border-b border-rose-500/10">
                <AlertTriangle size={18} className="text-rose-500 animate-pulse" /> Các bẫy học sinh hay mắc phải (Lỗi thường gặp):
              </h4>
              <ul className="space-y-3.5 pl-1">
                {detail.commonMistakes.map((mistake: string, idx: number) => (
                  <li key={idx} className="text-xs md:text-sm font-medium text-rose-700 dark:text-rose-300 flex items-start gap-3 leading-relaxed bg-rose-100/30 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-500/10">
                    <CornerDownRight size={15} className="shrink-0 mt-1 text-rose-500" />
                    <LatexRenderer text={mistake} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'method',
      label: '📝 Quy trình giải',
      content: (
        <div className={cn("border bg-card p-4 sm:p-6 rounded-xl space-y-4 shadow-sm", theme.border)}>
          <h4 className="font-extrabold text-sm md:text-base text-foreground flex items-center gap-2 pb-2 border-b border-border/30">
            <Activity size={18} className={theme.iconColor} /> Các bước thực hiện chuẩn chỉ:
          </h4>
          <div className="space-y-4 pl-1">
            {detail.solvingSteps.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-3.5 items-start">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm", theme.badge)}>
                  {idx + 1}
                </div>
                <div className="text-xs md:text-sm font-medium text-foreground/80 leading-relaxed pt-0.5">
                  <LatexRenderer text={step} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'example',
      label: '🔬 Ví dụ mẫu',
      content: (
        <div className="space-y-5">
          {exampleQuestion ? (
            <>
              {/* Đề bài ví dụ */}
              <div className={cn("border bg-card overflow-hidden rounded-xl shadow-sm", theme.border)}>
                <div className="bg-slate-50/50 dark:bg-slate-900/10 py-3.5 px-5 border-b border-border/30">
                  <span className="text-[10px] md:text-xs font-black text-foreground/80 uppercase tracking-wider">Đề bài ví dụ</span>
                </div>
                <div className="p-5 font-semibold text-xs md:text-sm leading-relaxed text-foreground">
                  <LatexRenderer text={exampleQuestion.content} />
                  {exampleQuestion.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
                      {exampleQuestion.options.map((opt: string, i: number) => (
                        <div key={i} className="p-4 bg-secondary/40 rounded-2xl border border-border/10 hover:border-border/30 transition-colors font-medium">
                          <LatexRenderer text={opt} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lời giải mẫu */}
              {exampleSolution && (
                <div className={cn("border bg-card overflow-hidden rounded-xl shadow-sm", theme.border)}>
                  <div className="bg-slate-50/50 dark:bg-slate-900/10 py-3.5 px-5 border-b border-border/30">
                    <span className="text-[10px] md:text-xs font-black text-foreground/80 uppercase tracking-wider">Lời giải phân tích từng bước</span>
                  </div>
                  <div className="p-5 space-y-6">
                    <div className={cn(
                      "text-xs md:text-sm font-medium text-foreground/80 p-4 rounded-2xl border leading-relaxed",
                      theme.bg,
                      theme.border
                    )}>
                      <span className="font-extrabold text-foreground block mb-1.5">💡 Tư duy nhận diện:</span>
                      <LatexRenderer text={exampleSolution.recognition} />
                    </div>

                    <div className="space-y-6 pl-1">
                      {exampleSolution.detailedSteps.map((step: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <h5 className="font-extrabold text-xs md:text-sm text-foreground flex items-center gap-2">
                            <span className={cn("w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] text-white shrink-0 shadow-sm", theme.dot)}>
                              {step.order}
                            </span>
                            <LatexRenderer text={step.title} />
                          </h5>
                          <div className="pl-7 space-y-2.5 text-xs md:text-sm font-medium text-muted-foreground leading-relaxed">
                            <LatexRenderer text={step.explanation} />
                            {step.formula && (
                              <div className="p-3 bg-secondary/40 rounded-xl text-foreground border border-border/5 my-2">
                                <LatexRenderer text={step.formula} block={true} />
                              </div>
                            )}
                            {step.result && (
                              <p className={cn("font-bold text-xs md:text-sm", theme.text)}>
                                👉 Kết quả bước: <LatexRenderer text={step.result} />
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/50 pt-4.5 flex flex-col sm:flex-row justify-between text-xs md:text-sm gap-3 px-1">
                      <div className="font-extrabold text-foreground">
                        Đáp án cuối cùng: <span className={cn("font-black ml-1.5", theme.text)}><LatexRenderer text={exampleSolution.finalAnswer} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs md:text-sm font-semibold bg-card rounded-2xl border border-border/50">
              Hiện tại chưa có ví dụ mẫu cho dạng bài này.
            </div>
          )}
        </div>
      )
    }
  );
  const toggleSpeechPlayback = () => {
    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    } else {
      window.speechSynthesis.cancel();
      if (activeTabTextArray.length === 0) return;

      const fullSpeechText = activeTabTextArray
        .map(t => convertLatexToSpeechText(t, currentSubject))
        .join('. ');

      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      utterance.lang = 'vi-VN';

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onend = () => {
        setIsPlayingSpeech(false);
      };

      utterance.onerror = () => {
        setIsPlayingSpeech(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
    }
  };

  const persistCompletionIfReady = (
    visitedIds: Set<string>,
    passedIds: Set<string>
  ) => {
    if (!detail) return;
    const availableTabIds = tabItems.map(item => item.id);
    const requiredCheckpointIds = (detail.theoryCheckpoints ?? []).map(item => item.id);
    const hasVisitedAllTabs =
      availableTabIds.length > 0 && availableTabIds.every(id => visitedIds.has(id));
    const hasPassedAllCheckpoints =
      requiredCheckpointIds.length === 0 ||
      requiredCheckpointIds.every(id => passedIds.has(id));

    if (hasVisitedAllTabs && hasPassedAllCheckpoints) {
      const userId = user?.uid || 'guest';
      const readLessons = storageService.getReadLessons(userId);
      if (!readLessons.includes(detail.id)) {
        if (user) {
          progressService.saveLessonRead(user.uid, detail.id);
        } else {
          storageService.saveLessonRead(userId, detail.id);
        }
        refreshProgress();
      }
      setShowLessonCompletedMsg(true);
    }
  };

  const handleCheckpointAnswer = (checkpointId: string, answer: string) => {
    if (!detail) return;
    setCheckpointAnswers(previous => ({ ...previous, [checkpointId]: answer }));
    const checkpoint = detail.theoryCheckpoints?.find(item => item.id === checkpointId);
    if (!checkpoint || answer !== checkpoint.correctAnswer) return;

    if (user) {
      progressService.saveTheoryCheckpointPassed(user.uid, checkpointId);
    } else {
      storageService.saveTheoryCheckpointPassed('guest', checkpointId);
    }
    refreshProgress();

    setPassedCheckpointIds(previous => {
      const next = new Set(previous);
      next.add(checkpointId);
      persistCompletionIfReady(visitedTabIds, next);
      return next;
    });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (!detail) return;
    setVisitedTabIds(prev => {
      const next = new Set(prev);
      next.add(tabId);
      persistCompletionIfReady(next, passedCheckpointIds);
      return next;
    });
  };

  const gradeLabel = selectedGrade === 'grade9' ? 'Lớp 9' : selectedGrade === 'grade10' ? 'Lớp 10' : selectedGrade === 'grade11' ? 'Lớp 11' : 'Phổ thông';

  const pageTitle = detail
    ? `${detail.name} - ${subjectName} ${gradeLabel} | ezonthi`
    : `Dạng Bài Học Tốt ${subjectName} ${gradeLabel} | ezonthi`;

  const pageDescription = detail
    ? `Hướng dẫn lý thuyết, phương pháp giải, bẫy thường gặp và bài tập mẫu dạng ${detail.name} môn ${subjectName} ${gradeLabel} bám sát chương trình GDPT mới.`
    : `Hệ thống dạng bài học tập môn ${subjectName} ${gradeLabel} chuẩn hóa giúp học sinh bứt phá điểm số.`;

  const canonicalPath = detail ? `/question-types/${detail.id}` : '/roadmap';

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Trang chủ', item: '/' },
    { name: gradeLabel, item: '/roadmap' },
    { name: `${subjectName} ${gradeLabel}`, item: '/roadmap' },
    ...(detail ? [{ name: detail.name, item: `/question-types/${detail.id}` }] : [])
  ]);

  const faqItems = detail
    ? [
        ...(detail.recognitionSigns || []).map((sign, idx) => ({
          question: `Dấu hiệu nhận biết dạng bài ${detail.name} (Ý ${idx + 1})?`,
          answer: sign
        })),
        ...(detail.commonMistakes || []).map((mistake, idx) => ({
          question: `Lỗi sai thường gặp khi làm dạng bài ${detail.name} (Bẫy ${idx + 1})?`,
          answer: mistake
        }))
      ]
    : [];
  const faqSchema = createFAQSchema(faqItems);

  const quizQuestions = detail?.theoryCheckpoints
    ? detail.theoryCheckpoints.map(cp => ({
        text: cp.question,
        options: cp.options,
        answer: cp.correctAnswer
      }))
    : [];
  const quizSchema = detail && quizQuestions.length > 0 ? createQuizSchema({
    name: `Tự kiểm tra lý thuyết: ${detail.name}`,
    description: `Bài tự kiểm tra lý thuyết dạng ${detail.name} môn ${subjectName} ${gradeLabel}`,
    url: `/question-types/${detail.id}`,
    questions: quizQuestions
  }) : null;

  const jsonLdSchemas = [
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : []),
    ...(quizSchema ? [quizSchema] : [])
  ];

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-6 px-3 sm:px-6 py-3 animate-fade-in pb-20 md:pb-6">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalPath}
        jsonLd={jsonLdSchemas}
      />

      {/* Header Dạng bài - Hero Section phẳng tràn viền mỏng nhẹ */}
      <div className="py-1 space-y-3 font-sans">
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Back về lộ trình - Icon button inline gọn gàng */}
          <button
            onClick={() => navigate('/roadmap?view=roadmap')}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/50 bg-card hover:bg-secondary text-foreground cursor-pointer transition-colors shrink-0 mr-0.5"
            aria-label="Quay về lộ trình học"
          >
            <ArrowLeft size={16} />
          </button>

          <span className={cn('text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-border/40', theme.badge)}>
            {subjectIcon} {subjectName} {selectedGrade === 'grade9' ? 'Lớp 9' : selectedGrade === 'grade10' ? 'Lớp 10' : 'Lớp 11'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs bg-secondary/60 text-muted-foreground border border-border/40 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
              detail.difficulty === 'hard' ? 'bg-rose-500' :
                detail.difficulty === 'medium' ? 'bg-amber-500' :
                  'bg-emerald-500'
            )} />
            Độ khó: {detail.difficulty === 'hard' ? 'Nâng cao' : detail.difficulty === 'medium' ? 'Trung bình' : 'Cơ bản'}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-snug">
          <LatexRenderer text={detail.name} />
        </h1>
        <div className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl font-semibold">
          <LatexRenderer text={detail.description} />
        </div>
      </div>

      {/* Bố cục 2 cột chính - Kích hoạt sớm từ breakpoint md */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 items-start">
        {/* Cột trái (70-75%): Tabs chi tiết học tập */}
        <div className="md:col-span-2 xl:col-span-3 space-y-4">
          <Tabs
            items={tabItems}
            defaultTabId={detail.theory && detail.theory.length > 0 ? 'theory' : (detail.subTypes && detail.subTypes.length > 0 ? 'subtypes' : 'recognition_mistakes')}
            className="w-full"
            tabHeaderClassName="gap-2"
            tabContentClassName="mt-2"
            activeTabClassName={theme.solid}
            onTabChange={handleTabChange}
            afterHeader={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 select-none">
                {showLessonCompletedMsg ? (
                  <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] flex items-center gap-1.5 animate-fade-in shadow-xs">
                    <span>✓ Bạn đã hoàn thành lý thuyết và mở khóa bài tiếp theo!</span>
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-muted-foreground pt-1">
                    Tiến trình lý thuyết: {visitedTabIds.size}/{tabItems.length} phần
                    {detail.theoryCheckpoints && detail.theoryCheckpoints.length > 0 && (
                      <> • Tự kiểm tra: {passedCheckpointIds.size}/{detail.theoryCheckpoints.length}</>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {textbookData && (
                    <button
                      onClick={() => setIsTextbookOpen(true)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-xl border shadow-xs transition-all active:scale-95 cursor-pointer h-7",
                        "text-brand-ink border-brand-ink/25 hover:bg-brand-ink/7 bg-brand-ink/5"
                      )}
                    >
                      <BookOpen size={12} /> Tương ứng với SGK (Trang {textbookData.pages[0]} - {textbookData.pages[textbookData.pages.length - 1]})
                    </button>
                  )}

                  <button
                    onClick={toggleSpeechPlayback}
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1.5 rounded-xl border shadow-xs transition-all active:scale-95 cursor-pointer h-7",
                      isPlayingSpeech
                        ? "bg-rose-500 border-rose-600 text-white hover:bg-rose-600 animate-pulse"
                        : "text-brand-learning border-brand-learning/25 hover:bg-brand-learning/7"
                    )}
                  >
                    {isPlayingSpeech ? (
                      <>
                        <VolumeX size={12} /> Dừng đọc bài
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} /> Nghe đọc bài giảng
                      </>
                    )}
                  </button>
                </div>
              </div>
            }
          />
        </div>

        {/* Cột phải (30%): Sidebar thông tin + Mastery + CTA Luyện tập (Sticky & Cuộn độc lập khi quá dài) */}
        <div className="md:col-span-1 space-y-6 md:sticky md:top-24 md:max-h-[calc(100vh-120px)] md:overflow-y-auto pr-1.5 scrollbar-thin">

          {/* Card Luyện tập & Mastery */}
          <div className={cn("border overflow-hidden bg-card shadow-sm rounded-xl", theme.border)}>
            <div className={cn("p-4 border-b border-border/10", theme.bg)}>
              <h4 className="font-extrabold text-xs md:text-sm text-foreground flex items-center gap-1.5">
                🎯 Tiến độ học tập
              </h4>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              {/* Mastery Progress Bar & Stars */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground">Mức thành thạo:</span>
                  <span className={theme.text}>{masteryScore}/100</span>
                </div>

                {/* Thanh Progress */}
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/40 p-0.5">
                  <div
                    className={cn("h-full transition-all duration-500 rounded-full", theme.dot)}
                    style={{ width: `${masteryScore}%` }}
                  />
                </div>

                {/* Stars Display */}
                <div className="flex justify-between items-center pt-1.5 border-t border-border/20">
                  <span className="text-xs text-muted-foreground font-semibold">Đánh giá:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((starNum) => (
                      <span
                        key={starNum}
                        className={cn(
                          "text-base transition-all duration-300",
                          starNum <= starsCount ? "scale-110" : "opacity-30 grayscale"
                        )}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed italic text-center pt-2 font-semibold">
                  {starsCount === 3
                    ? "✨ Đã đạt cấp độ Thành Thạo hoàn hảo!"
                    : starsCount === 2
                      ? "💪 Đã có 2 sao, luyện thêm chút để đạt đỉnh cao!"
                      : starsCount === 1
                        ? "📚 Đang tiến bộ tốt, hãy tiếp tục luyện tập nhé!"
                        : "🌱 Bắt đầu luyện tập để nhận những ngôi sao đầu tiên!"}
                </p>
              </div>

              {/* Nút Bắt đầu Luyện tập chính */}
              {requiresLoginForPractice ? (
                <Button
                  onClick={async () => {
                    try {
                      await authService.signInWithGoogle();
                    } catch (err: any) {
                      alert(err.message || 'Lỗi đăng nhập bằng Google.');
                    }
                  }}
                  className="w-full font-bold text-xs py-3.5 flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-md bg-amber-500 hover:bg-amber-600 border border-amber-600 text-white rounded-xl cursor-pointer"
                >
                  <LockKeyhole size={16} /> Đăng nhập để luyện tập
                </Button>
              ) : isTypeLockedByPremium ? (
                <Button
                  onClick={() => navigate('/premium')}
                  className="w-full font-bold text-xs py-3.5 flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-md bg-brand-action hover:bg-brand-action/90 text-white rounded-xl cursor-pointer"
                >
                  <Crown size={16} /> Mở khóa Luyện tập (Gói Premium)
                </Button>
              ) : (
                <>
                  <Button
                    disabled={isPracticeLockedByTheory}
                    onClick={() => navigate(`/practice/${detail.id}`)}
                    className={cn(
                      "w-full font-bold text-xs py-3.5 flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-md transition-all hover:shadow-lg rounded-xl cursor-pointer",
                      theme.solid
                    )}
                  >
                    {isPracticeLockedByTheory ? (
                      <><LockKeyhole size={16} /> Học xong lý thuyết để mở khóa</>
                    ) : (
                      <><PlayCircle size={16} /> Bắt đầu Luyện tập ngay</>
                    )}
                  </Button>
                  {isPracticeLockedByTheory && (
                    <p className="text-[10px] font-semibold leading-relaxed text-muted-foreground text-center">
                      Xem đủ các phần lý thuyết, nhận dạng, phương pháp và ví dụ trước khi làm bài.
                    </p>
                  )}
                </>
              )}

              {requiresLoginForPractice && (
                <div className="flex gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-700 dark:text-amber-400 font-semibold">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>Yêu cầu đăng nhập trước khi nộp bài thi/luyện tập môn học.</span>
                </div>
              )}
            </div>
          </div>
          {/* Card Thông tin chung */}
          <div className="border border-border/80 bg-card p-4 rounded-xl shadow-sm space-y-3 text-xs font-semibold text-muted-foreground">
            <div className="flex justify-between items-center border-b border-border/30 pb-2">
              <span>⏱️ Thời gian ôn luyện:</span>
              <span className="text-foreground font-bold">~15-20 phút</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🎒 Khối lớp học tập:</span>
              <span className="text-foreground font-bold">Lớp {selectedGrade === 'grade9' ? '9' : selectedGrade === 'grade10' ? '10' : '11'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Action Bar trên Mobile (Chỉ xuất hiện khi cuộn qua Banner tiêu đề) */}
      <div className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-40 shadow-lg flex items-center justify-between gap-3 transition-all duration-300 transform",
        showFloatingBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="flex flex-col truncate max-w-[60%]">
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Đang xem bài học</span>
          <span className="text-xs font-black text-foreground truncate">{detail.name}</span>
        </div>

        {requiresLoginForPractice ? (
          <Button
            onClick={async () => {
              try {
                await authService.signInWithGoogle();
              } catch (err: any) {
                alert(err.message || 'Lỗi đăng nhập bằng Google.');
              }
            }}
            className="font-bold text-xs py-2.5 px-4 shrink-0 shadow-md bg-amber-500 hover:bg-amber-600 text-white"
          >
            Đăng nhập
          </Button>
        ) : isTypeLockedByPremium ? (
          <Button
            onClick={() => navigate('/premium')}
            className="font-bold text-xs py-2.5 px-4 shrink-0 shadow-md bg-brand-action hover:bg-brand-action/90 text-white"
          >
            <Crown size={14} /> Mở khóa Premium
          </Button>
        ) : (
          <Button
            disabled={isPracticeLockedByTheory}
            onClick={() => navigate(`/practice/${detail.id}`)}
            className={cn(
              "font-bold text-xs py-2.5 px-4 shrink-0 shadow-md text-white active:scale-95 transition-transform",
              theme.solid
            )}
          >
            {isPracticeLockedByTheory ? 'Học xong để mở khóa' : 'Luyện tập ngay'}
          </Button>
        )}
      </div>

      {textbookData && (
        <TextbookDrawer
          isOpen={isTextbookOpen}
          onClose={() => setIsTextbookOpen(false)}
          pages={textbookData.pages}
          bookName={textbookData.bookName}
        />
      )}

    </div>
  );
};

export default QuestionTypeDetail;
