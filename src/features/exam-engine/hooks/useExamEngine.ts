import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/services/store';
import { storageService } from '@/services/storage';
import { progressService } from '@/services/progressService';
import { logCustomEvent } from '@/services/firebase';
import { getQuestionTypes, getMockExams, getAssessmentBlueprints, getTopics, getQuestions } from '@/data';
import { Question, ExamResult, StructuredAnswer, UserAttempt, ActiveExamSession, ExamSummaryMap } from '@/types';
import { formatAnswerForDisplay, scoreAnswer } from '@/utils/answerValidator';
import { LocalProofImage, revokeLocalProofImages } from '@/utils/proofImages';
import { proofImageService } from '@/services/proofImageService';
import { buildExamSections, buildQuestionPointMap } from '../utils/examMatrix';
import { useExamTimer } from './useExamTimer';

export const useExamEngine = () => {
  const { selectedSubject, selectedGrade, user } = useAppStore();

  const subjectQuestionTypes = getQuestionTypes(selectedGrade, selectedSubject);
  const subjectTopics = getTopics(selectedGrade, selectedSubject);
  const mockExamsList = getMockExams(selectedGrade, selectedSubject);
  const subjectAssessmentBlueprints = getAssessmentBlueprints(selectedGrade, selectedSubject);

  const subjectLabels: Record<string, string> = {
    math: 'Toán học',
    english: 'Tiếng Anh',
    chemistry: 'Hóa học',
    physics: 'Vật lí',
    biology: 'Sinh học'
  };
  const subjectLabel = subjectLabels[selectedSubject] ?? 'Môn học';

  // Đo lường phiên học thi thử
  useEffect(() => {
    const start = Date.now();
    return () => {
      const durationSeconds = Math.round((Date.now() - start) / 1000);
      const durationMinutes = Math.round((durationSeconds / 60) * 100) / 100;
      if (durationSeconds > 2) {
        logCustomEvent('study_session_end', {
          subject: subjectLabel,
          duration_minutes: durationMinutes,
          duration_seconds: durationSeconds,
          mode: 'exam'
        });
      }
    };
  }, [selectedSubject, subjectLabel]);

  // State cốt lõi của phòng thi
  const [examState, setExamState] = useState<'intro' | 'testing' | 'result'>('intro');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswers, setFinalAnswers] = useState<Record<string, StructuredAnswer>>({});
  const [proofImagesByQuestion, setProofImagesByQuestion] = useState<Record<string, LocalProofImage[]>>({});
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [activeSessions, setActiveSessions] = useState<ActiveExamSession[]>([]);
  const [examSummaryMap, setExamSummaryMap] = useState<ExamSummaryMap>({});
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [examSubmitError, setExamSubmitError] = useState<string | null>(null);

  // Cuộn về đỉnh khi bắt đầu bài thi
  useEffect(() => {
    if (examState === 'testing') {
      window.scrollTo(0, 0);
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.scrollTop = 0;
    }
  }, [examState]);

  // Hook quản lý đồng hồ đếm ngược phòng thi
  const handleSubmitExamRef = useRef<() => Promise<void>>(async () => {});
  const { timeLeft, setTimeLeft, timeSpent, setTimeSpent } = useExamTimer({
    examState,
    onTimeUp: () => {
      void handleSubmitExamRef.current();
    }
  });

  const lastSyncedActiveUserRef = useRef<string | null>(null);
  const lastSyncedSummaryUserRef = useRef<string | null>(null);

  // Đồng bộ bài thi dở dang (1 Read duy nhất từ Firestore)
  useEffect(() => {
    const currentUserId = user?.uid || 'guest';
    const localSavedList = storageService.getActiveExamSessions(currentUserId);
    const subjectSessions = localSavedList.filter(s => s.subjectId === selectedSubject && s.grade === selectedGrade);
    setActiveSessions(subjectSessions);

    if (user && user.uid !== 'guest' && examState === 'intro') {
      if (lastSyncedActiveUserRef.current === user.uid) return;
      lastSyncedActiveUserRef.current = user.uid;

      let isMounted = true;
      progressService.getActiveExamSessionsFromFirestore(user.uid).then(remoteSessionsMap => {
        if (!isMounted) return;
        let hasChanges = false;
        Object.values(remoteSessionsMap).forEach(remoteSession => {
          if (remoteSession && remoteSession.sourceExamId) {
            const local = storageService.getActiveExamSession(user.uid, remoteSession.sourceExamId);
            if (!local || new Date(remoteSession.lastSavedAt).getTime() > new Date(local.lastSavedAt).getTime()) {
              storageService.saveActiveExamSession(user.uid, remoteSession);
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          const updatedList = storageService.getActiveExamSessions(user.uid);
          const updatedSubjectSessions = updatedList.filter(s => s.subjectId === selectedSubject && s.grade === selectedGrade);
          setActiveSessions(updatedSubjectSessions);
        }
      }).catch(err => console.error('Lỗi khi đồng bộ active exam từ Firestore:', err));

      return () => {
        isMounted = false;
      };
    }
  }, [user, selectedSubject, selectedGrade, examState]);

  // Tải bản tóm tắt thi thử (1 Read duy nhất từ Firestore hoặc LocalStorage)
  useEffect(() => {
    const currentUserId = user?.uid || 'guest';
    const localSummary = storageService.getExamSummaryMap(currentUserId);
    setExamSummaryMap(localSummary);

    if (user && user.uid !== 'guest' && examState === 'intro') {
      if (lastSyncedSummaryUserRef.current === user.uid) return;
      lastSyncedSummaryUserRef.current = user.uid;

      let isMounted = true;
      progressService.getExamSummary(user.uid).then(remoteSummary => {
        if (!isMounted) return;
        setExamSummaryMap(remoteSummary);
      }).catch(err => console.error('Lỗi khi tải tóm tắt thi thử từ Firestore:', err));

      return () => {
        isMounted = false;
      };
    }
  }, [user, examState]);

  useEffect(() => {
    const exams = getMockExams(selectedGrade, selectedSubject);
    if (exams.length > 0) {
      setSelectedExamId(exams[0].id);
    } else {
      setSelectedExamId('');
    }
  }, [selectedSubject, selectedGrade]);

  // Quản lý Blob URLs để tránh rò rỉ bộ nhớ
  const proofImagesByQuestionRef = useRef(proofImagesByQuestion);
  useEffect(() => {
    proofImagesByQuestionRef.current = proofImagesByQuestion;
  }, [proofImagesByQuestion]);

  useEffect(() => {
    return () => {
      Object.values(proofImagesByQuestionRef.current).forEach(images => {
        revokeLocalProofImages(images);
      });
    };
  }, []);

  const clearAllProofImages = () => {
    setProofImagesByQuestion(prev => {
      Object.values(prev).forEach(images => {
        revokeLocalProofImages(images);
      });
      return {};
    });
  };

  const currentExam = useMemo(() => {
    return mockExamsList.find(exam => exam.id === selectedExamId) || mockExamsList[0];
  }, [mockExamsList, selectedExamId]);

  const currentBlueprint = currentExam?.blueprintId
    ? subjectAssessmentBlueprints.find(blueprint => blueprint.id === currentExam.blueprintId)
    : undefined;

  const examSections = useMemo(
    () => buildExamSections(examQuestions, currentBlueprint),
    [examQuestions, currentBlueprint]
  );

  const questionPointsById = useMemo(
    () => buildQuestionPointMap(examSections),
    [examSections]
  );

  const durationMinutes = currentExam
    ? currentExam.duration
    : (selectedSubject === 'chemistry' ? 45 : selectedSubject === 'math' ? 120 : 60);

  // Thuật toán nộp bài và chấm điểm
  const handleSubmitExam = useCallback(async () => {
    if (isSubmittingExam) return;

    setIsSubmittingExam(true);
    setExamSubmitError(null);

    let correctCount = 0;
    let earnedPoints = 0;
    let pendingPoints = 0;
    let gradedMaxPoints = 0;
    let gradedCount = 0;
    const totalCount = examQuestions.length;
    const maxPoints = Math.round(examQuestions.reduce(
      (sum, question) => sum + (questionPointsById.get(question.id) ?? question.points ?? 1),
      0
    ) * 1000) / 1000;
    const attemptResults: ExamResult['attempts'] = {};
    const currentUserId = user?.uid || 'guest';
    const completedAt = new Date().toISOString();
    const examId = `exam-${selectedSubject}-${Date.now()}`;
    const examAttempts: UserAttempt[] = [];

    for (const q of examQuestions) {
      const answerInput = q.answerSchema ? (finalAnswers[q.id] ?? {}) : answers[q.id] || '';
      const userAns = formatAnswerForDisplay(q, answerInput);
      const isManual = q.answerSchema?.autoCheckMode === 'manual' || q.validatorType === 'manual';
      const questionPoints = questionPointsById.get(q.id) ?? q.points ?? 1;
      const answerScore = isManual
        ? null
        : scoreAnswer(q, answerInput, questionPoints);
      const isCorrect = answerScore?.isCorrect ?? false;
      const awardedPoints = answerScore?.earnedPoints ?? 0;
      const attemptId = `attempt-${examId}-${q.id}`;
      const localProofImages = proofImagesByQuestion[q.id] ?? [];
      let uploadedProofImages: UserAttempt['proofImages'] = [];

      try {
        if (user && localProofImages.length > 0) {
          uploadedProofImages = await proofImageService.uploadProofImages(
            user.uid,
            attemptId,
            localProofImages.map(image => ({ id: image.id, file: image.file }))
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể upload ảnh bài làm. Vui lòng thử lại.';
        setExamSubmitError(message);
        setIsSubmittingExam(false);
        return;
      }

      if (isManual) pendingPoints += questionPoints;
      else {
        gradedCount++;
        gradedMaxPoints += questionPoints;
      }
      if (!isManual && isCorrect) correctCount++;
      earnedPoints += awardedPoints;
      attemptResults[q.id] = {
        userAnswer: userAns,
        ...(q.answerSchema ? { finalAnswer: finalAnswers[q.id] ?? {} } : {}),
        ...(uploadedProofImages.length > 0 ? { proofImages: uploadedProofImages } : {}),
        isCorrect,
        gradingStatus: isManual ? 'pending' : 'graded',
        earnedPoints: awardedPoints,
        maxPoints: questionPoints,
        ...(answerScore?.partResults ? { partResults: answerScore.partResults } : {})
      };

      const attemptData: UserAttempt = {
        id: attemptId,
        userId: currentUserId,
        questionId: q.id,
        questionTypeId: q.questionTypeId,
        userAnswer: userAns,
        ...(q.answerSchema ? { finalAnswer: finalAnswers[q.id] ?? {} } : {}),
        ...(uploadedProofImages.length > 0 ? { proofImages: uploadedProofImages } : {}),
        gradingMode: q.answerSchema?.autoCheckMode === 'manual' ? 'manual' : 'auto',
        isCorrect,
        timeSpent: Math.round(timeSpent / totalCount),
        createdAt: completedAt
      };

      examAttempts.push(attemptData);
      storageService.saveAttempt(currentUserId, attemptData);

      logCustomEvent('request_teacher_grading', {
        subjectId: selectedSubject,
        examId,
        questionTypeId: q.questionTypeId,
        questionId: q.id,
        hasProofImages: localProofImages.length > 0
      });
    }

    const score = maxPoints > 0
      ? Math.round((earnedPoints / maxPoints) * 10 * 10) / 10
      : 0;

    const result: ExamResult = {
      examId,
      sourceExamId: currentExam?.id,
      score,
      earnedPoints,
      maxPoints,
      gradedMaxPoints,
      pendingPoints,
      gradedCount,
      correctCount,
      totalCount,
      timeSpent,
      completedAt,
      attempts: attemptResults
    };

    setExamResult(result);
    setExamState('result');
    setIsSubmittingExam(false);
    storageService.saveExamResult(currentUserId, result);

    if (currentExam) {
      const examKey = currentExam.id;
      setExamSummaryMap(prev => {
        const existing = prev[examKey];
        const attemptsCount = (existing?.attemptsCount ?? 0) + 1;
        const bestScore = existing ? Math.max(existing.bestScore, score) : score;
        return {
          ...prev,
          [examKey]: {
            bestScore,
            lastScore: score,
            attemptsCount,
            lastCompletedAt: completedAt,
            lastExamId: examId,
            lastTimeSpent: timeSpent
          }
        };
      });
      storageService.clearActiveExamSession(currentUserId, currentExam.id);
      setActiveSessions(prev => prev.filter(s => s.sourceExamId !== currentExam.id));
      if (user && user.uid !== 'guest') {
        void progressService.deleteActiveExamSessionFromFirestore(user.uid, currentExam.id);
      }
    }

    if (user) {
      const examQuestionIds = new Set(examQuestions.map(q => q.id));
      const examMistakes = storageService
        .getMistakes(user.uid)
        .filter(mistake => examQuestionIds.has(mistake.questionId));

      progressService.saveExamSubmission(user.uid, result, examAttempts, examMistakes);
    }

    if (pendingPoints === 0 && score >= 8.0) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [examQuestions, answers, finalAnswers, proofImagesByQuestion, selectedSubject, timeSpent, user, isSubmittingExam, currentExam, questionPointsById]);

  useEffect(() => {
    handleSubmitExamRef.current = handleSubmitExam;
  }, [handleSubmitExam]);

  // Tự động lưu nháp tiến trình bài thi và thời gian còn lại
  useEffect(() => {
    if (examState !== 'testing' || !currentExam || examQuestions.length === 0) return;
    const currentUserId = user?.uid || 'guest';
    const session: ActiveExamSession = {
      examId: `exam-${selectedSubject}-${Date.now()}`,
      sourceExamId: currentExam.id,
      examTitle: currentExam.title,
      subjectId: selectedSubject,
      grade: selectedGrade,
      questionIds: examQuestions.map(q => q.id),
      answers,
      finalAnswers,
      timeLeft,
      timeSpent,
      lastSavedAt: new Date().toISOString()
    };
    storageService.saveActiveExamSession(currentUserId, session);
  }, [examState, currentExam, examQuestions, answers, finalAnswers, timeLeft, timeSpent, user, selectedSubject, selectedGrade]);

  const handleStartExam = () => {
    const currentUserId = user?.uid || 'guest';
    if (currentExam) {
      storageService.clearActiveExamSession(currentUserId, currentExam.id);
      setActiveSessions(prev => prev.filter(s => s.sourceExamId !== currentExam.id));
      if (user && user.uid !== 'guest') {
        void progressService.deleteActiveExamSessionFromFirestore(user.uid, currentExam.id);
      }
    }
    clearAllProofImages();
    if (currentExam) {
      const questionsForExam = currentExam.questionIds
        .map(id => getQuestions(selectedGrade, selectedSubject).find(q => q.id === id))
        .filter((q): q is Question => q !== undefined);
      setExamQuestions(questionsForExam);
      setTimeLeft(currentExam.duration * 60);
    } else {
      setExamQuestions([]);
      setTimeLeft(durationMinutes * 60);
    }
    setAnswers({});
    setFinalAnswers({});
    setIsSubmittingExam(false);
    setExamSubmitError(null);
    setTimeSpent(0);
    setExamState('testing');
  };

  const handleResumeExam = (sessionToResume?: ActiveExamSession) => {
    const targetSession = sessionToResume || activeSessions.find(s => s.sourceExamId === selectedExamId);
    if (!targetSession) return;

    const allQuestions = getQuestions(targetSession.grade, targetSession.subjectId);
    const questionsForExam = targetSession.questionIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);

    clearAllProofImages();
    setSelectedExamId(targetSession.sourceExamId);
    setExamQuestions(questionsForExam);
    setAnswers(targetSession.answers || {});
    setFinalAnswers(targetSession.finalAnswers || {});
    setTimeLeft(targetSession.timeLeft);
    setTimeSpent(targetSession.timeSpent);
    setIsSubmittingExam(false);
    setExamSubmitError(null);
    setExamState('testing');
  };

  const handleDiscardActiveSession = (sourceExamId?: string) => {
    const targetExamId = sourceExamId || selectedExamId;
    if (!targetExamId) return;
    const currentUserId = user?.uid || 'guest';
    storageService.clearActiveExamSession(currentUserId, targetExamId);
    setActiveSessions(prev => prev.filter(s => s.sourceExamId !== targetExamId));
    if (user && user.uid !== 'guest') {
      void progressService.deleteActiveExamSessionFromFirestore(user.uid, targetExamId);
    }
  };

  const handlePauseAndSave = () => {
    if (examState === 'testing' && currentExam && examQuestions.length > 0) {
      const currentUserId = user?.uid || 'guest';
      const session: ActiveExamSession = {
        examId: `exam-${selectedSubject}-${Date.now()}`,
        sourceExamId: currentExam.id,
        examTitle: currentExam.title,
        subjectId: selectedSubject,
        grade: selectedGrade,
        questionIds: examQuestions.map(q => q.id),
        answers,
        finalAnswers,
        timeLeft,
        timeSpent,
        lastSavedAt: new Date().toISOString()
      };
      storageService.saveActiveExamSession(currentUserId, session);
      setActiveSessions(prev => [...prev.filter(s => s.sourceExamId !== currentExam.id), session]);
      if (user && user.uid !== 'guest') {
        void progressService.saveActiveExamSessionToFirestore(user.uid, session);
      }
    }
    setExamState('intro');
  };

  const handleReviewPastResult = async (examId: string, resultExamId?: string) => {
    try {
      setIsLoadingReview(true);
      const currentUserId = user?.uid || 'guest';
      const detail = await progressService.getExamResultDetail(currentUserId, resultExamId || examId);
      if (!detail) {
        alert('Không tìm thấy dữ liệu chi tiết của bài thi này.');
        return;
      }

      const targetExam = mockExamsList.find(e => e.id === examId) || mockExamsList.find(e => e.id === detail.sourceExamId);
      const allSubjectQuestions = getQuestions(selectedGrade, selectedSubject);

      if (targetExam) {
        setSelectedExamId(targetExam.id);
        const questionsForExam = targetExam.questionIds
          .map(id => allSubjectQuestions.find(q => q.id === id))
          .filter((q): q is Question => q !== undefined);
        setExamQuestions(questionsForExam);
      } else {
        const questionIds = Object.keys(detail.attempts || {});
        const questionsForExam = questionIds
          .map(id => allSubjectQuestions.find(q => q.id === id))
          .filter((q): q is Question => q !== undefined);
        setExamQuestions(questionsForExam);
      }

      const reconstructedAnswers: Record<string, string> = {};
      const reconstructedFinal: Record<string, StructuredAnswer> = {};
      Object.entries(detail.attempts || {}).forEach(([qId, att]) => {
        if (att.userAnswer) reconstructedAnswers[qId] = att.userAnswer;
        if (att.finalAnswer) reconstructedFinal[qId] = att.finalAnswer;
      });

      setAnswers(reconstructedAnswers);
      setFinalAnswers(reconstructedFinal);
      setExamResult(detail);
      setExamState('result');
    } catch (err) {
      console.error('Lỗi khi tải lại bài thi cũ:', err);
      alert('Đã có lỗi xảy ra khi tải bài thi.');
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleOptionSelect = (questionId: string, optLetter: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optLetter }));
  };

  const handleInputChange = (questionId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  const handleFinalAnswerChange = (questionId: string, value: StructuredAnswer) => {
    setFinalAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleProofImagesChange = (questionId: string, images: LocalProofImage[]) => {
    setProofImagesByQuestion(prev => ({ ...prev, [questionId]: images }));
  };

  const handleBackToIntro = () => {
    clearAllProofImages();
    setAnswers({});
    setFinalAnswers({});
    setExamState('intro');
  };

  const handleDiscardAndExit = () => {
    handleDiscardActiveSession();
    handleBackToIntro();
  };

  return {
    selectedSubject,
    selectedGrade,
    user,
    subjectLabel,
    subjectQuestionTypes,
    subjectTopics,
    mockExamsList,
    subjectAssessmentBlueprints,
    examState,
    examQuestions,
    answers,
    finalAnswers,
    proofImagesByQuestion,
    selectedExamId,
    setSelectedExamId,
    activeSessions,
    examSummaryMap,
    isLoadingReview,
    examResult,
    isSubmittingExam,
    examSubmitError,
    currentExam,
    examSections,
    durationMinutes,
    timeLeft,
    handleStartExam,
    handleResumeExam,
    handleDiscardActiveSession,
    handlePauseAndSave,
    handleReviewPastResult,
    handleOptionSelect,
    handleInputChange,
    handleFinalAnswerChange,
    handleProofImagesChange,
    handleBackToIntro,
    handleDiscardAndExit,
    handleSubmitExam
  };
};
