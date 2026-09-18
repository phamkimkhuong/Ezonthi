import React, { useCallback, useEffect, useLayoutEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/services/store';
import { storageService } from '@/services/storage';
import { progressService } from '@/services/progressService';
import { logCustomEvent } from '@/services/firebase';
import { getPracticeQuestions, getQuestionTypes, getSolutions, getTopics } from '@/data';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';

import { Question, Solution, StructuredAnswer, UserAttempt, SubjectCode, GradeCode } from '@/types';
import { AlertTriangle, BookOpenCheck, ArrowLeft, Crown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getSubjectTheme } from '@/utils/theme';
import { formatAnswerForDisplay, validateAnswer, isAnswerComplete } from '@/utils/answerValidator';
import { getSubjectFromQuestionTypeId, getGradeCodeFromQuestionTypeId, getSubjectName, isQuestionTypePremiumLocked } from '@/utils/subject';
import { SeoHead } from '@/components/common/SeoHead';
import { createBreadcrumbSchema } from '@/utils/seoSchemas';
import { buildCoursePath, isCourseContext } from '@/utils/courseRoutes';

import confetti from 'canvas-confetti';

// Import subcomponents
import { TopicSelectionView } from './components/TopicSelectionView';
import { PracticeConfigView } from './components/PracticeConfigView';
import { ExamConfigView } from './components/ExamConfigView';
import { ExamPracticeView } from './components/ExamPracticeView';
import { QuestionCard } from './components/QuestionCard';
import { ResultCard } from './components/ResultCard';
import { useEnglishQuestionFilter } from './hooks/useEnglishQuestionFilter';
import { useProofUpload } from './hooks/useProofUpload';
import { AdaptivePracticeStatus } from './components/AdaptivePracticeStatus';
import {
  buildAdaptivePracticeSequence,
  type AdaptivePracticeSequenceResult,
} from './utils/adaptivePracticeSequence';

const getNow = () => Date.now();

export const PracticeEngine: React.FC = () => {
  const { grade: routeGradeParam, subject: routeSubjectParam, questionTypeId } = useParams<{
    grade?: GradeCode;
    subject?: SubjectCode;
    questionTypeId?: string;
  }>();
  const navigate = useNavigate();
  const { selectedSubject, selectedGrade, setSubject, user, progressVersion, refreshProgress, isPremium } = useAppStore();
  void progressVersion;

  const effectiveGrade = (routeGradeParam && isCourseContext(routeGradeParam, routeSubjectParam)) ? routeGradeParam : selectedGrade;
  const routeSubject = ((routeSubjectParam && isCourseContext(effectiveGrade, routeSubjectParam))
    ? routeSubjectParam
    : (getSubjectFromQuestionTypeId(questionTypeId) ?? selectedSubject)) as SubjectCode;
  const routeSubjectTheme = getSubjectTheme(routeSubject);

  const currentQuestionTypes = useMemo(() => getQuestionTypes(effectiveGrade, routeSubject), [effectiveGrade, routeSubject]);
  const currentQuestions = useMemo(
    () => getPracticeQuestions(effectiveGrade, routeSubject),
    [effectiveGrade, routeSubject]
  );
  const currentSolutions = useMemo(() => getSolutions(effectiveGrade, routeSubject), [effectiveGrade, routeSubject]);
  const isGrade10English = routeSubject === 'english' && effectiveGrade === 'grade10';
  const grade10EnglishSelectionOptions = isGrade10English
    ? getTopics('grade10', 'english').map(topic => ({
        id: topic.id,
        name: topic.name.replace(/^Chuyên đề \d+:\s*/, ''),
        desc: `Trộn toàn bộ dạng bài hiện có thuộc ${topic.name}.`
      }))
    : undefined;

  useEffect(() => {
    const start = Date.now();
    return () => {
      const durationSeconds = Math.round((Date.now() - start) / 1000);
      const durationMinutes = Math.round((durationSeconds / 60) * 100) / 100;
      if (durationSeconds > 2) {
        logCustomEvent('study_session_end', {
          subject: getSubjectName(routeSubject),
          duration_minutes: durationMinutes,
          duration_seconds: durationSeconds,
          mode: 'practice'
        });
      }
    };
  }, [routeSubject]);

  const tensesReviewBestScore = useMemo(() => {
    void progressVersion;
    const userId = user?.uid || 'guest';
    const attempts = storageService.getAttempts(userId);
    const reviewAttempts = attempts.filter(a => a.selectedSubTense === 'tenses_review');

    const sessions: Record<string, { correct: number; total: number }> = {};
    reviewAttempts.forEach(a => {
      let sessionId = '';
      if (a.id.startsWith('attempt-tenses_review-')) {
        const parts = a.id.split('-');
        sessionId = parts.slice(2, -1).join('-');
      }
      if (!sessionId) {
        sessionId = a.createdAt.substring(0, 19);
      }
      if (!sessions[sessionId]) {
        sessions[sessionId] = { correct: 0, total: 0 };
      }
      sessions[sessionId].total += 1;
      if (a.isCorrect) {
        sessions[sessionId].correct += 1;
      }
    });

    let bestScore = 0;
    Object.values(sessions).forEach(s => {
      if (s.correct > bestScore) {
        bestScore = s.correct;
      }
    });
    return bestScore;
  }, [user, progressVersion]);

  const tensesReviewAttemptsCount = useMemo(() => {
    void progressVersion;
    const userId = user?.uid || 'guest';
    const attempts = storageService.getAttempts(userId);
    const reviewAttempts = attempts.filter(a => a.selectedSubTense === 'tenses_review');
    const uniqueSessionIds = new Set<string>();
    reviewAttempts.forEach(a => {
      let sessionId = '';
      if (a.id.startsWith('attempt-tenses_review-')) {
        const parts = a.id.split('-');
        sessionId = parts.slice(2, -1).join('-');
      }
      if (!sessionId) {
        sessionId = a.createdAt.substring(0, 19);
      }
      uniqueSessionIds.add(sessionId);
    });
    return uniqueSessionIds.size;
  }, [user, progressVersion]);

  const globalProgressPercent = useMemo(() => {
    void progressVersion;
    const userId = user?.uid || 'guest';
    const attempts = storageService.getAttempts(userId);
    const correctQIds = new Set<string>();
    const trackedQuestions = (routeSubject === 'english' && selectedGrade !== 'grade10')
      ? currentQuestions.filter(q => q.questionTypeId === 'eng-qt6')
      : currentQuestions;
    const trackedQuestionIds = new Set(trackedQuestions.map(question => question.id));
    attempts.forEach(a => {
      if (a.isCorrect && trackedQuestionIds.has(a.questionId)) {
        correctQIds.add(a.questionId);
      }
    });
    const totalQCount = trackedQuestions.length;
    if (totalQCount === 0) return 0;
    const percent = Math.round((correctQIds.size / totalQCount) * 100);
    return percent === 0 ? 0 : Math.max(1, percent);
  }, [user, progressVersion, currentQuestions, selectedGrade, routeSubject]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [structuredAnswer, setStructuredAnswer] = useState<StructuredAnswer>({});

  const {
    proofImages,
    setProofImages,
    totalUploadStats,
    handlePauseUpload,
    handleResumeUpload,
    handleCancelUpload,
    executeUpload,
    clearUpload
  } = useProofUpload();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<UserAttempt | null>(null);
  const [pastAttempts, setPastAttempts] = useState<UserAttempt[]>([]);

  // Tab chọn thì cho phần Thì động từ cơ bản (eng-qt6)
  const [selectedSubTense, setSelectedSubTense] = useState<'all' | 'present_simple' | 'past_simple' | 'present_continuous' | 'past_continuous' | 'present_perfect' | 'future_simple' | 'exam' | 'to_v' | 'v_ing' | 'v0' | 'verb_combo' | 'tenses_review' | 'prep_phrasal' | 'comparison' | 'word_position' | null>(null);
  const [grammarSection, setGrammarSection] = useState<'dang1' | 'dang2' | 'dang3' | 'dang4' | 'dang5' | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [selectedTensesForCombo, setSelectedTensesForCombo] = useState<string[]>([
    'present_simple',
    'past_simple',
    'present_continuous',
    'past_continuous',
    'present_perfect',
    'future_simple'
  ]);
  const [isConfiguringAll, setIsConfiguringAll] = useState(false);

  // States cho tính năng Luyện thi trắc nghiệm (Exam Mode)
  const [isConfiguringExam, setIsConfiguringExam] = useState(false);
  const [examTenses, setExamTenses] = useState<string[]>([
    'present_simple',
    'past_simple',
    'present_continuous',
    'past_continuous',
    'present_perfect',
    'future_simple'
  ]);
  const [examQuestionCount, setExamQuestionCount] = useState<number>(20);
  const [examTimeLimit, setExamTimeLimit] = useState<number>(15); // số phút, 0 = không giới hạn
  const [isExamMode, setIsExamMode] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOption }
  const [examTimeLeft, setExamTimeLeft] = useState<number>(0); // giây còn lại
  const [examTotalTimeSpent, setExamTotalTimeSpent] = useState<number>(0);

  const loadedQuestionIdRef = useRef<string | null>(null);
  const bubbleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bubbleContainerRef.current) {
      const activeEl = bubbleContainerRef.current.querySelector<HTMLElement>(`[data-bubble-index="${currentIdx}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIdx]);

  // Quản lý mức độ gợi ý (0: không gợi ý, 1: hiện gợi ý bước 1, 2: hiện gợi ý bước 2,...)
  const [hintLevel, setHintLevel] = useState(0);
  const [questionStartAt, setQuestionStartAt] = useState(() => Date.now());

  // Derived States - Tính toán trực tiếp trong lúc render
  const isMath = routeSubject === 'math';
  const isChemistry = routeSubject === 'chemistry';
  const isPhysics = routeSubject === 'physics';
  const isBiology = routeSubject === 'biology';
  const isHistory = routeSubject === 'history';
  const usesAdaptivePractice = isMath || isChemistry || isPhysics || isBiology || isHistory;
  const qList = currentQuestions;

  const filteredQuestions = useEnglishQuestionFilter(
    questionTypeId,
    qList,
    selectedSubTense,
    customQuestions,
    isExamMode,
    examQuestions
  );
  const isGrade10CustomReviewActive = isGrade10English
    && questionTypeId === undefined
    && selectedSubTense === 'all'
    && customQuestions !== null;

  // Giữ snapshot cố định trong cả phiên. Nếu sắp xếp lại ngay sau mỗi lần nộp,
  // currentIdx có thể trỏ sang câu khác trong khi ResultCard vẫn giữ trạng thái
  // của câu vừa làm. Snapshot chỉ được tái tạo khi rời và vào lại dạng bài.
  const [adaptivePracticeStatus, setAdaptivePracticeStatus] = useState<AdaptivePracticeSequenceResult | null>(null);

  useLayoutEffect(() => {
    if (!usesAdaptivePractice || isExamMode || !questionTypeId) {
      setAdaptivePracticeStatus(null);
      return;
    }

    const attemptsAtSessionStart = storageService.getAttempts(user?.uid || 'guest');
    setAdaptivePracticeStatus(buildAdaptivePracticeSequence(filteredQuestions, attemptsAtSessionStart));
  }, [filteredQuestions, isExamMode, questionTypeId, user?.uid, usesAdaptivePractice]);

  // Các môn có metadata luyện tập dùng snapshot thích nghi để giữ nguyên câu
  // hiện tại trong suốt phiên. Chế độ thi luôn giữ nguyên thứ tự đề.
  const questions = useMemo(() => {
    if (isExamMode) return filteredQuestions;
    if (usesAdaptivePractice && adaptivePracticeStatus) return adaptivePracticeStatus.questions;
    return filteredQuestions;
  }, [adaptivePracticeStatus, filteredQuestions, isExamMode, usesAdaptivePractice]);

  const questionAtIdx = questions[currentIdx] || null;

  const currentQuestionType = useMemo(() => {
    if (!questionAtIdx) return null;
    const availableTypes = currentQuestionTypes;
    return availableTypes.find(type => type.id === questionAtIdx.questionTypeId) || null;
  }, [questionAtIdx, currentQuestionTypes]);

  const solutionDetail: Solution | null = questionAtIdx
    ? currentSolutions.find(s => s.questionId === questionAtIdx.id) || null
    : null;

  const completedQuestionIds = useMemo(() => {
    if (isExamMode) {
      if (!isExamSubmitted) {
        return new Set(Object.keys(examAnswers));
      } else {
        return new Set(examQuestions.map(q => q.id));
      }
    }

    const userId = user?.uid || 'guest';
    const attempts = storageService.getAttempts(userId);

    // Tìm lần làm gần nhất cho từng câu hỏi
    const latestAttemptsByQId: Record<string, UserAttempt> = {};
    attempts.forEach(a => {
      if (a.questionTypeId === questionTypeId) {
        const existing = latestAttemptsByQId[a.questionId];
        if (!existing || new Date(a.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
          latestAttemptsByQId[a.questionId] = a;
        }
      }
    });

    const completed = new Set<string>();
    Object.entries(latestAttemptsByQId).forEach(([qId]) => {
      completed.add(qId);
    });

    void progressVersion;
    return completed;
  }, [user, questionTypeId, progressVersion, isExamMode, isExamSubmitted, examAnswers, examQuestions]);

  const getSubTenseProgress = useCallback((qIds: string[]) => {
    const done = qIds.filter(id => completedQuestionIds.has(id)).length;
    return Math.round((done / qIds.length) * 100);
  }, [completedQuestionIds]);

  const resetQuestionState = useCallback(() => {
    loadedQuestionIdRef.current = null;
    setStructuredAnswer({});
    clearUpload();
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setHintLevel(0);
    setQuestionStartAt(Date.now());
    setPastAttempts([]);
  }, [
    clearUpload,
    setStructuredAnswer,
    setSelectedOption,
    setIsSubmitted,
    setIsSubmitting,
    setSubmitError,
    setHintLevel,
    setQuestionStartAt,
    setPastAttempts
  ]);

  useEffect(() => {
    if (!questionTypeId) return;
    const inferredSubject = getSubjectFromQuestionTypeId(questionTypeId);
    const inferredGrade = getGradeCodeFromQuestionTypeId(questionTypeId);

    // Nếu đang ở trong URL ngữ cảnh khóa học (/app/:grade/:subject/...)
    if (routeSubjectParam && inferredSubject && inferredSubject !== routeSubjectParam) {
      // Bất đồng môn học giữa URL và questionTypeId (VD: /app/grade10/english/practice/math10-qt1)
      // Điều hướng an toàn sang đúng URL môn học của questionTypeId thay vì ép Store gây vòng lặp vô hạn
      const targetGrade = inferredGrade || effectiveGrade;
      navigate(buildCoursePath(targetGrade, inferredSubject, 'practice', questionTypeId), { replace: true });
      return;
    }

    if (routeGradeParam && inferredGrade && inferredGrade !== routeGradeParam) {
      navigate(buildCoursePath(inferredGrade, inferredSubject || routeSubjectParam || selectedSubject, 'practice', questionTypeId), { replace: true });
      return;
    }

    // Với các route legacy không có routeSubjectParam:
    if (!routeSubjectParam && inferredSubject && inferredSubject !== selectedSubject) {
      setSubject(inferredSubject);
    }
  }, [questionTypeId, routeSubjectParam, routeGradeParam, effectiveGrade, selectedSubject, setSubject, navigate]);

  // Reset index và state khi chuyển đổi dạng bài hoặc môn học
  useEffect(() => {
    setCurrentIdx(0);
    resetQuestionState();
    setSelectedSubTense(null);
    setCustomQuestions(null);
    setIsConfiguringAll(false);
    setIsConfiguringExam(false);
    setIsExamMode(false);
    setIsExamSubmitted(false);
    setExamQuestions([]);
    setExamAnswers({});
    setGrammarSection(null);
  }, [routeSubject, questionTypeId, resetQuestionState]);

  // Reset index và state khi chuyển đổi dạng thì động từ cơ bản
  useEffect(() => {
    setCurrentIdx(0);
    resetQuestionState();
    if (selectedSubTense !== 'exam') {
      setIsConfiguringExam(false);
      setIsExamMode(false);
      setIsExamSubmitted(false);
      setExamQuestions([]);
      setExamAnswers({});
    }
  }, [selectedSubTense, resetQuestionState]);

  const checkedTopicsRef = useRef<Set<string>>(new Set());

  // Khi LocalStorage trống (máy mới), tải attempt của dạng bài từ nguồn chuẩn.
  useEffect(() => {
    if (!user || !questionTypeId || isExamMode) return;
    if (checkedTopicsRef.current.has(questionTypeId)) return;

    const localAttempts = storageService.getTopicAttemptsLocal(user.uid, questionTypeId);
    if (localAttempts.length === 0) {
      checkedTopicsRef.current.add(questionTypeId);
      progressService.getTopicAttempts(user.uid, questionTypeId).then(remoteTopicAttempts => {
        if (remoteTopicAttempts.length > 0) {
          storageService.saveTopicAttemptsLocal(user.uid, questionTypeId, remoteTopicAttempts);
          refreshProgress();
        }
      });
    }
  }, [user, questionTypeId, isExamMode, refreshProgress]);

  // Tự động kích hoạt Sync gộp phiên luyện tập khi học sinh rời trang (Route change) hoặc đóng/chuyển tab web (beforeunload / visibilitychange)
  useEffect(() => {
    if (!user || !questionTypeId || isExamMode) return;

    const handleSync = () => {
      progressService.flushPendingAttempts(user.uid, questionTypeId);
    };

    const handleVisibilityOrUnload = () => {
      if (document.visibilityState === 'hidden') {
        handleSync();
      }
    };

    window.addEventListener('beforeunload', handleVisibilityOrUnload);
    document.addEventListener('visibilitychange', handleVisibilityOrUnload);

    return () => {
      // Khi học sinh chuyển trang (Route Change / Unmount) -> Kích hoạt Sync ngay!
      handleSync();
      window.removeEventListener('beforeunload', handleVisibilityOrUnload);
      document.removeEventListener('visibilitychange', handleVisibilityOrUnload);
    };
  }, [user, questionTypeId, isExamMode]);

  // Tự động kiểm tra bài làm cũ của học sinh đối với câu hỏi này để tránh bắt làm lại từ đầu.
  // Chỉ đọc LocalStorage — dữ liệu đã được cập nhật realtime mỗi khi nộp bài, không cần gọi Firestore.
  useEffect(() => {
    if (isExamMode) return;
    if (questions.length === 0) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const cacheKey = `${currentQ.id}_${user?.uid || 'guest'}_${progressVersion}`;
    if (loadedQuestionIdRef.current === cacheKey) {
      return;
    }

    loadedQuestionIdRef.current = cacheKey;

    const userId = user?.uid || 'guest';
    const userAttemptsLocal = storageService.getAttempts(userId);
    const attemptsForQ = userAttemptsLocal
      .filter(a => a.questionId === currentQ.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestAttempt = attemptsForQ[0] || null;

    if (latestAttempt) {
      setExistingAttempt(latestAttempt);
      setIsSubmitted(true);
      setIsCorrect(latestAttempt.isCorrect);
      setPastAttempts(attemptsForQ.slice(1, 3));
    } else {
      setExistingAttempt(null);
      setIsSubmitted(false);
      setIsCorrect(false);
      clearUpload();
      setPastAttempts([]);
    }
  }, [currentIdx, questionTypeId, questions, user, progressVersion, isExamMode, clearUpload]);

  const handleExamSubmit = useCallback(async (isTimeOut = false) => {
    if (isExamSubmitted) return;

    if (isTimeOut) {
      alert('Hết giờ làm bài thi! Hệ thống đang tự động nộp bài làm của bạn.');
    } else {
      const confirmSubmit = window.confirm('Bạn có chắc chắn muốn nộp bài thi trắc nghiệm này không?');
      if (!confirmSubmit) return;
    }

    setIsExamSubmitted(true);

    const attemptsToSave: UserAttempt[] = [];
    const averageTimeSpent = Math.max(1, Math.round(examTotalTimeSpent / examQuestions.length));
    const sessionId = getNow();
    const sessionTimestamp = new Date().toISOString();

    for (const q of examQuestions) {
      const selectedAns = examAnswers[q.id] || '';
      const finalAns = selectedAns ? formatAnswerForDisplay(q, selectedAns) : 'Chưa trả lời';
      const correct = validateAnswer(q, selectedAns);
      const attemptId = selectedSubTense === 'tenses_review'
        ? `attempt-tenses_review-${sessionId}-${q.id}`
        : `attempt-${getNow()}-${q.id}`;

      const attemptData: UserAttempt = {
        id: attemptId,
        userId: user?.uid || 'guest',
        questionId: q.id,
        questionTypeId: q.questionTypeId,
        userAnswer: finalAns,
        gradingMode: 'auto',
        isCorrect: correct,
        timeSpent: averageTimeSpent,
        createdAt: sessionTimestamp,
        selectedSubTense: selectedSubTense || 'exam'
      };

      attemptsToSave.push(attemptData);
      storageService.saveAttempt(user?.uid || 'guest', attemptData);

      logCustomEvent('ai_grading_completed', {
        subjectId: routeSubject,
        examId: sessionId.toString(),
        questionTypeId: q.questionTypeId,
        questionId: q.id,
        isExam: true,
        isCorrect: correct
      });

      if (!correct && user) {
        const localMistakes = storageService.getMistakes(user.uid);
        const activeMistake = localMistakes.find(m => m.questionId === q.id);
        if (activeMistake) {
          progressService.saveMistake(user.uid, activeMistake);
        }
      }
    }

    if (user) {
      try {
        progressService.saveUserProfile(user);
        await Promise.all(
          attemptsToSave.map(attempt => progressService.saveAttempt(user.uid, attempt))
        );
        await progressService.flushPendingAttempts(user.uid, questionTypeId);
      } catch (err) {
        console.error("Lỗi khi đồng bộ kết quả thi trắc nghiệm lên Firestore:", err);
      }
    }

    refreshProgress();

    const score = examQuestions.filter(q => validateAnswer(q, examAnswers[q.id] || '')).length;
    const pct = (score / examQuestions.length) * 100;
    if (pct >= 80 || (selectedSubTense === 'tenses_review' && pct >= 75)) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 }
      });
    }
  }, [
    isExamSubmitted,
    examTotalTimeSpent,
    examQuestions,
    examAnswers,
    selectedSubTense,
    user,
    routeSubject,
    refreshProgress,
    setIsExamSubmitted
  ]);

  // Hiệu ứng đếm ngược thời gian thi
  useEffect(() => {
    if (!isExamMode || isExamSubmitted) return;

    const timer = setInterval(() => {
      if (examTimeLimit > 0) {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleExamSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }
      setExamTotalTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamMode, isExamSubmitted, examTimeLimit, handleExamSubmit]);

  // Phím tắt bàn phím điều hướng chuyển câu (Mũi tên Trái ← / Phải →)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable);
      if (isInput) return;

      if (e.key === 'ArrowRight') {
        if (currentIdx < questions.length - 1) {
          e.preventDefault();
          clearUpload();
          setCurrentIdx(prev => prev + 1);
          resetQuestionState();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIdx > 0) {
          e.preventDefault();
          clearUpload();
          setCurrentIdx(prev => prev - 1);
          resetQuestionState();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, questions.length, clearUpload, resetQuestionState]);

  const startExamPractice = () => {
    if (examTenses.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dạng bài để luyện thi!');
      return;
    }

    let pool: Question[] = [];
    if (isGrade10English) {
      const selectedTopicIds = new Set(examTenses);
      pool = qList.filter(question => selectedTopicIds.has(question.topicId));
    } else examTenses.forEach(tense => {
      let filtered: Question[] = [];
      if (tense === 'present_simple') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 5 && num <= 24) || (num >= 102 && num <= 121));
        });
      } else if (tense === 'past_simple') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 25 && num <= 44) || (num >= 122 && num <= 141));
        });
      } else if (tense === 'present_continuous') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 45 && num <= 64) || (num >= 142 && num <= 161));
        });
      } else if (tense === 'past_continuous') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 65 && num <= 84) || (num >= 162 && num <= 181));
        });
      } else if (tense === 'present_perfect') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && (num >= 182 && num <= 201);
        });
      } else if (tense === 'future_simple') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && (num >= 202 && num <= 221);
        });
      } else if (tense === 'module1') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 5 && num <= 221;
        });
      } else if (tense === 'module2') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 222 && num <= 261;
        });
      } else if (tense === 'module3') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 262 && num <= 301;
        });
      } else if (tense === 'module4') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 302 && num <= 331;
        });
      } else if (tense === 'module5') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 332 && num <= 361;
        });
      }
      pool = [...pool, ...filtered];
    });

    if (pool.length === 0) {
      alert('Không tìm thấy câu hỏi tương ứng!');
      return;
    }

    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const finalQuestions = shuffled.slice(0, examQuestionCount);
    setExamQuestions(finalQuestions);
    setExamAnswers({});
    setExamTimeLeft(examTimeLimit * 60);
    setExamTotalTimeSpent(0);
    setIsExamMode(true);
    setIsExamSubmitted(false);
    setIsConfiguringExam(false);
    setSelectedSubTense('exam');
    setCurrentIdx(0);
    resetQuestionState();
  };

  const startTensesReview = () => {
    const pool = qList.filter(q => {
      if (q.questionTypeId !== 'eng-qt6') return false;
      const num = parseInt(q.id.replace('eng-q', ''), 10);
      return num >= 5 && num <= 221;
    });

    if (pool.length === 0) {
      alert('Không tìm thấy câu hỏi tương ứng!');
      return;
    }

    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const finalQuestions = shuffled.slice(0, 20);
    setExamQuestions(finalQuestions);
    setExamAnswers({});
    setExamTimeLimit(15);
    setExamTimeLeft(15 * 60);
    setExamTotalTimeSpent(0);
    setIsExamMode(true);
    setIsExamSubmitted(false);
    setIsConfiguringExam(false);
    setSelectedSubTense('tenses_review');
    setCurrentIdx(0);
    resetQuestionState();
  };

  const handleRetry = () => {
    if (existingAttempt) {
      setPastAttempts(prev => {
        const filtered = prev.filter(a => a.id !== existingAttempt.id);
        return [existingAttempt, ...filtered].slice(0, 2);
      });
    }
    setExistingAttempt(null);
    clearUpload();
    setIsSubmitted(false);
    setIsCorrect(false);
    setStructuredAnswer({});
    setSelectedOption(null);
    setSubmitError(null);
    setHintLevel(0);
    setQuestionStartAt(Date.now());
  };

  const handleOptionSelect = (optLetter: string) => {
    if (isExamMode) {
      if (isExamSubmitted) return;
      setExamAnswers(prev => ({ ...prev, [questions[currentIdx].id]: optLetter }));
      return;
    }
    if (isSubmitted) return;
    setSelectedOption(optLetter);
  };

  const handleSubmit = async () => {
    if (questions.length === 0 || isSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const currentQ = questions[currentIdx];
    const isMath = routeSubject === 'math';

    const answerInput = currentQ.answerSchema
      ? structuredAnswer
      : selectedOption || '';
    const finalAnswer = currentQ.answerSchema
      ? formatAnswerForDisplay(currentQ, answerInput)
      : formatAnswerForDisplay(currentQ, answerInput);
    const attemptId = `attempt-${getNow()}`;
    let uploadedProofImages: UserAttempt['proofImages'] = [];

    try {
      if (user && proofImages.length > 0) {
        uploadedProofImages = await executeUpload(user.uid, attemptId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể upload ảnh bài làm. Vui lòng thử lại.';
      setSubmitError(message);
      setIsSubmitting(false);
      return;
    }

    const correct = validateAnswer(currentQ, answerInput);
    const gradingMode: 'auto' | 'manual' = 'auto';

    setIsCorrect(correct);
    setIsSubmitted(true);
    setIsSubmitting(false);

    if (correct) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    const attemptData: UserAttempt = {
      id: attemptId,
      userId: user?.uid || 'guest',
      questionId: currentQ.id,
      questionTypeId: currentQ.questionTypeId,
      userAnswer: finalAnswer,
      ...(!isMath && currentQ.answerSchema ? { finalAnswer: structuredAnswer } : {}),
      ...(uploadedProofImages.length > 0 ? { proofImages: uploadedProofImages } : {}),
      gradingMode,
      isCorrect: correct,
      timeSpent: Math.round((getNow() - questionStartAt) / 1000),
      createdAt: new Date().toISOString(),
      ...(selectedSubTense ? { selectedSubTense } : {})
    };

    setExistingAttempt(attemptData);
    storageService.saveAttempt(user?.uid || 'guest', attemptData);

    logCustomEvent(gradingMode === 'auto' ? 'ai_grading_completed' : 'request_teacher_grading', {
      subjectId: routeSubject,
      questionTypeId: currentQ.questionTypeId,
      questionId: currentQ.id,
      hasProofImages: uploadedProofImages.length > 0,
      isCorrect: correct
    });

    if (user) {
      progressService.saveUserProfile(user);
      progressService.saveAttempt(user.uid, attemptData);
      if (!correct) {
        const localMistakes = storageService.getMistakes(user.uid);
        const activeMistake = localMistakes.find(m => m.questionId === currentQ.id);
        if (activeMistake) {
          progressService.saveMistake(user.uid, activeMistake);
        }
      }
    }

    refreshProgress();
  };

  const handleNext = () => {
    clearUpload();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      resetQuestionState();
    } else {
      const goBack = window.confirm('Chúc mừng bạn đã hoàn thành tất cả câu hỏi ôn tập của dạng bài này! Bạn có muốn quay lại danh sách không?');
      if (goBack) {
        if (isGrade10CustomReviewActive) {
          setCustomQuestions(null);
          setSelectedSubTense(null);
          setCurrentIdx(0);
          resetQuestionState();
        } else if (questionTypeId === 'eng-qt6') {
          setSelectedSubTense(null);
        } else {
          navigate('/practice');
        }
      }
    }
  };

  const startCustomReview = () => {
    const isGlobal = grammarSection === null;
    if (isGlobal) {
      if (selectedTensesForCombo.length < 1) return;
    } else {
      if (selectedTensesForCombo.length < 2) return;
    }

    let pool: Question[] = [];
    if (isGrade10English) {
      const selectedTopicIds = new Set(selectedTensesForCombo);
      pool = qList.filter(question => selectedTopicIds.has(question.topicId));
    } else selectedTensesForCombo.forEach(tense => {
      let filtered: Question[] = [];
      if (tense === 'present_simple') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 5 && num <= 24) || (num >= 102 && num <= 121));
        });
      } else if (tense === 'past_simple') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 25 && num <= 44) || (num >= 122 && num <= 141));
        });
      } else if (tense === 'present_continuous') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 45 && num <= 64) || (num >= 142 && num <= 161));
        });
      } else if (tense === 'past_continuous') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && ((num >= 65 && num <= 84) || (num >= 162 && num <= 181));
        });
      } else if (tense === 'present_perfect') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && (num >= 182 && num <= 201);
        });
      } else if (tense === 'future_simple') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && (num >= 202 && num <= 221);
        });
      } else if (tense === 'module1') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 5 && num <= 221;
        });
      } else if (tense === 'module2') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 222 && num <= 261;
        });
      } else if (tense === 'module3') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 262 && num <= 301;
        });
      } else if (tense === 'module4') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 302 && num <= 331;
        });
      } else if (tense === 'module5') {
        filtered = qList.filter(q => {
          const num = parseInt(q.id.replace('eng-q', ''), 10);
          return q.questionTypeId === 'eng-qt6' && num >= 332 && num <= 361;
        });
      }
      pool = [...pool, ...filtered];
    });

    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const limited = shuffled.slice(0, 40);

    setCustomQuestions(limited);
    setSelectedSubTense('all');
    setIsConfiguringAll(false);
    setCurrentIdx(0);
    resetQuestionState();
  };

  const triggerNextHint = () => {
    if (solutionDetail) {
      const maxSteps = solutionDetail.detailedSteps.length + (currentQuestionType ? 1 : 0);
      setHintLevel(prev => (prev < maxSteps ? prev + 1 : 0));
    }
  };

  // Render switches

  if ((questionTypeId === 'eng-qt6' || (isGrade10English && questionTypeId === undefined)) && isConfiguringExam) {
    return (
      <ExamConfigView
        grammarSection={grammarSection}
        examTenses={examTenses}
        setExamTenses={setExamTenses}
        examQuestionCount={examQuestionCount}
        setExamQuestionCount={setExamQuestionCount}
        examTimeLimit={examTimeLimit}
        setExamTimeLimit={setExamTimeLimit}
        setIsConfiguringExam={setIsConfiguringExam}
        startExamPractice={startExamPractice}
        selectionOptions={grade10EnglishSelectionOptions}
      />
    );
  }

  if ((questionTypeId === 'eng-qt6' || (isGrade10English && questionTypeId === undefined)) && isConfiguringAll) {
    return (
      <PracticeConfigView
        grammarSection={grammarSection}
        selectedTensesForCombo={selectedTensesForCombo}
        setSelectedTensesForCombo={setSelectedTensesForCombo}
        setIsConfiguringAll={setIsConfiguringAll}
        startCustomReview={startCustomReview}
        selectionOptions={grade10EnglishSelectionOptions}
      />
    );
  }

  if (isExamMode) {
    return (
      <ExamPracticeView
        questions={questions}
        currentIdx={currentIdx}
        setCurrentIdx={setCurrentIdx}
        examAnswers={examAnswers}
        setExamAnswers={setExamAnswers}
        isExamSubmitted={isExamSubmitted}
        setIsExamSubmitted={setIsExamSubmitted}
        examTimeLimit={examTimeLimit}
        examTimeLeft={examTimeLeft}
        examTotalTimeSpent={examTotalTimeSpent}
        selectedSubTense={selectedSubTense}
        setSelectedSubTense={setSelectedSubTense}
        setIsExamMode={setIsExamMode}
        setIsConfiguringExam={setIsConfiguringExam}
        setExamQuestions={setExamQuestions}
        handleExamSubmit={handleExamSubmit}
        startExamPractice={startExamPractice}
        startTensesReview={startTensesReview}
        handleOptionSelect={handleOptionSelect}
        handleNext={handleNext}
        solutionDetail={solutionDetail}
        routeSubject={routeSubject}
      />
    );
  }

  if ((questionTypeId === undefined && !isGrade10CustomReviewActive) || (questionTypeId === 'eng-qt6' && selectedSubTense === null)) {
    return (
      <TopicSelectionView
        routeSubject={routeSubject}
        questionTypes={currentQuestionTypes}
        grammarSection={grammarSection}
        setGrammarSection={setGrammarSection}
        setSelectedSubTense={setSelectedSubTense}
        setSelectedTensesForCombo={setSelectedTensesForCombo}
        setIsConfiguringAll={setIsConfiguringAll}
        setIsConfiguringExam={setIsConfiguringExam}
        setExamTenses={setExamTenses}
        globalProgressPercent={globalProgressPercent}
        tensesReviewAttemptsCount={tensesReviewAttemptsCount}
        tensesReviewBestScore={tensesReviewBestScore}
        startTensesReview={startTensesReview}
        getSubTenseProgress={getSubTenseProgress}
        isPremium={isPremium}
        questionTypeId={questionTypeId}
      />
    );
  }

  const requestedQuestionType = questionTypeId
    ? currentQuestionTypes.find(type => type.id === questionTypeId)
    : undefined;
  const requiresPhysics11Theory =
    effectiveGrade === 'grade11' &&
    routeSubject === 'physics' &&
    Boolean(requestedQuestionType?.theory?.length);
  const practiceUserId = user?.uid || 'guest';
  const requiredCheckpointIds = requestedQuestionType?.theoryCheckpoints?.map(item => item.id) ?? [];
  const passedCheckpointIds = new Set(
    storageService.getPassedTheoryCheckpoints(practiceUserId)
  );
  const hasPassedRequiredCheckpoints =
    requiredCheckpointIds.length === 0 ||
    requiredCheckpointIds.every(id => passedCheckpointIds.has(id));
  const hasCompletedTheory = questionTypeId
    ? storageService.getReadLessons(practiceUserId).includes(questionTypeId) &&
      hasPassedRequiredCheckpoints
    : true;

  const isDirectPracticePremiumLocked = questionTypeId
    ? isQuestionTypePremiumLocked(questionTypeId, 1, routeSubject, effectiveGrade) && !isPremium
    : false;

  if (isDirectPracticePremiumLocked) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-12 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Crown size={28} className="animate-pulse" />
        </div>
        <h3 className="text-lg font-black text-foreground">
          Dạng bài đặc quyền Premium 👑
        </h3>
        <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
          Dạng bài này là nội dung nâng cao & rèn luyện thực hành chuyên sâu dành riêng cho tài khoản Premium. Hãy nâng cấp để làm toàn bộ câu hỏi và xem giải thích chi tiết nhé!
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => navigate(buildCoursePath(effectiveGrade, routeSubject, 'practice'))}
            variant="outline"
            className="text-xs font-bold border border-border/50"
          >
            Quay lại danh sách
          </Button>
          <Button
            onClick={() => navigate('/premium')}
            className="bg-brand-action hover:bg-brand-action/90 text-xs font-bold text-white shadow-md"
          >
            <Crown size={14} /> Nâng cấp Premium
          </Button>
        </div>
      </div>
    );
  }

  if (requiresPhysics11Theory && !hasCompletedTheory && questionTypeId) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <BookOpenCheck size={28} />
        </div>
        <h3 className="text-lg font-black text-foreground">
          Hoàn thành bài học trước khi luyện tập
        </h3>
        <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
          Bài giảng đã có sẵn trên nền tảng, gồm định nghĩa, công thức, điều kiện áp dụng,
          ví dụ và câu tự kiểm tra. Bạn không cần mở thêm tài liệu ở trang khác.
        </p>
        <Button
          onClick={() => navigate(buildCoursePath(effectiveGrade, routeSubject, 'question-types', questionTypeId))}
          className="bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-700"
        >
          <BookOpenCheck size={16} /> Quay lại học lý thuyết
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <AlertTriangle size={40} className="mx-auto text-amber-500" />
        <h3 className="text-lg font-bold text-foreground">Chưa có câu hỏi luyện tập</h3>
        <p className="text-xs text-muted-foreground">Hiện tại hệ thống đang cập nhật ngân hàng đề cho dạng bài này. Vui lòng chọn dạng bài khác.</p>
        <Button onClick={() => navigate(buildCoursePath(effectiveGrade, routeSubject, 'practice'))} variant="outline" className="text-xs font-bold border border-border/50">
          Quay lại danh sách dạng bài
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isManualMath = isMath && currentQuestion?.validatorType === 'manual';

  const submitDisabled = currentQuestion?.answerSchema
    ? !isAnswerComplete(currentQuestion, structuredAnswer)
    : isManualMath
      ? proofImages.length === 0
      : !selectedOption;

  const practiceSubjectName = getSubjectName(routeSubject);
  const practiceGradeLabel = effectiveGrade === 'grade9' ? 'Lớp 9' : effectiveGrade === 'grade10' ? 'Lớp 10' : effectiveGrade === 'grade11' ? 'Lớp 11' : 'Phổ thông';
  const practiceTitle = requestedQuestionType
    ? `Luyện Tập: ${requestedQuestionType.name} - ${practiceSubjectName} ${practiceGradeLabel} | ezonthi`
    : `Luyện Tập Thực Chiến ${practiceSubjectName} ${practiceGradeLabel} | ezonthi`;
  const practiceDesc = requestedQuestionType
    ? `Luyện tập thực chiến dạng bài ${requestedQuestionType.name} môn ${practiceSubjectName} ${practiceGradeLabel} có đáp án và giải thích chi tiết.`
    : `Luyện tập trắc nghiệm & tự luận các môn Toán, Tiếng Anh, Hóa học, Vật lý bám sát chương trình GDPT 2018.`;

  const practiceCanonical = questionTypeId ? buildCoursePath(effectiveGrade, routeSubject, 'question-types', questionTypeId) : buildCoursePath(effectiveGrade, routeSubject, 'practice');

  const practiceBreadcrumbs = createBreadcrumbSchema([
    { name: 'Trang chủ', item: '/' },
    { name: practiceGradeLabel, item: buildCoursePath(effectiveGrade, routeSubject, 'roadmap') },
    { name: `Luyện tập ${practiceSubjectName}`, item: buildCoursePath(effectiveGrade, routeSubject, 'practice') },
    ...(requestedQuestionType ? [{ name: requestedQuestionType.name, item: buildCoursePath(effectiveGrade, routeSubject, 'practice', requestedQuestionType.id) }] : [])
  ]);

  return (
    <div className="w-full max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-4 px-3 sm:px-6 py-3 animate-fade-in pb-12">
      <SeoHead
        title={practiceTitle}
        description={practiceDesc}
        canonicalUrl={practiceCanonical}
        robots="noindex, follow"
        jsonLd={practiceBreadcrumbs}
      />

      {/* Khung thông báo Chế độ luyện tập xem thử dành cho khách */}
      {!user && (
        <div className="bg-primary/7 border border-primary/20 border-l-4 border-l-primary rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 w-full mx-auto">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-black text-foreground">Bạn đang luyện tập ở chế độ xem thử</h3>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Kết quả làm bài được lưu tạm trên máy. Đăng nhập tài khoản để đồng bộ điểm số lên đám mây, tích lũy XP và bảo toàn tiến trình học tập.
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
      {adaptivePracticeStatus && adaptivePracticeStatus.holdoutQuestionCount > 0 && (
        <AdaptivePracticeStatus
          status={adaptivePracticeStatus}
          variant={
            isMath
              ? 'math'
              : isChemistry
                ? 'chemistry'
                : isBiology
                  ? 'biology'
                  : 'physics'
          }
        />
      )}

      {/* Header trạng thái luyện tập phẳng & Lưới câu hỏi 100% rõ ràng */}
      <div className="space-y-2.5 border-b border-border pb-3">
        {/* Hàng 1: Nút Quay lại & Tiến độ câu hỏi */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (isGrade10CustomReviewActive) {
                setCustomQuestions(null);
                setSelectedSubTense(null);
                setCurrentIdx(0);
                resetQuestionState();
              } else if (questionTypeId === 'eng-qt6') {
                setSelectedSubTense(null);
              } else {
                navigate(buildCoursePath(effectiveGrade, routeSubject, 'practice'));
              }
            }}
            className="p-2 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer bg-secondary/50 hover:bg-secondary rounded-xl transition-all font-semibold"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-extrabold text-muted-foreground">
            Câu <span className="text-foreground font-black">{currentIdx + 1}</span> / {questions.length}
          </span>
        </div>

        {/* Hàng 2: Dải số câu hỏi: Cuộn ngang 1 hàng mượt mà trên mobile, flex-wrap trên tablet/desktop */}
        <div
          ref={bubbleContainerRef}
          className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth sm:flex-wrap"
        >
          {questions.map((q, idx) => {
            const isActive = idx === currentIdx;
            const isCompleted = completedQuestionIds.has(q.id);

            return (
              <button
                key={q.id}
                data-bubble-index={idx}
                onClick={() => {
                  clearUpload();
                  setCurrentIdx(idx);
                  resetQuestionState();
                }}
                className={cn(
                  "w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[10px] font-extrabold transition-all duration-150 cursor-pointer border active:scale-95 shrink-0",
                  isActive
                    ? cn(routeSubjectTheme.solid, "shadow-sm scale-105")
                    : isCompleted
                      ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
                title={isCompleted ? `Câu ${idx + 1} (Đã nộp bài)` : `Câu ${idx + 1} (Chưa làm)`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question/Result Card */}
      {!isSubmitted ? (
        <QuestionCard
          currentQuestion={currentQuestion}
          currentQuestionType={isMath ? null : currentQuestionType}
          structuredAnswer={structuredAnswer}
          setStructuredAnswer={setStructuredAnswer}
          questionTypeId={questionTypeId}
          selectedOption={selectedOption}
          handleOptionSelect={handleOptionSelect}
          setSelectedOption={setSelectedOption}
          hintLevel={hintLevel}
          triggerNextHint={triggerNextHint}
          solutionDetail={solutionDetail}
          isMath={isMath}
          proofImages={proofImages}
          setProofImages={setProofImages}
          isSubmitting={isSubmitting}
          submitError={submitError}
          user={user}
          totalUploadStats={totalUploadStats}
          handlePauseUpload={handlePauseUpload}
          handleResumeUpload={handleResumeUpload}
          handleCancelUpload={handleCancelUpload}
          submitDisabled={submitDisabled}
          handleSubmit={handleSubmit}
          currentIdx={currentIdx}
          questionsLength={questions.length}
          setCurrentIdx={setCurrentIdx}
          resetQuestionState={resetQuestionState}
          routeSubject={routeSubject}
          disableHints={Boolean(currentQuestion.isMasteryHoldout)}
        />
      ) : (
        <ResultCard
          currentQuestion={currentQuestion}
          currentQuestionType={isMath ? null : currentQuestionType}
          isCorrect={isCorrect}
          isMath={isMath}
          proofImages={proofImages}
          existingAttempt={existingAttempt}
          pastAttempts={pastAttempts}
          solutionDetail={solutionDetail}
          routeSubject={routeSubject}
          selectedOption={selectedOption}
          currentIdx={currentIdx}
          questionsLength={questions.length}
          setCurrentIdx={setCurrentIdx}
          resetQuestionState={resetQuestionState}
          handleRetry={handleRetry}
          handleNext={handleNext}
        />
      )}
    </div>
  );
};

export default PracticeEngine;
