import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../services/store';
import { storageService } from '../../services/storage';
import { progressService } from '../../services/progressService';
import { aiService } from '../../services/aiService';
import { getQuestionTypes, getQuestions, getSolutions } from '../../data';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LatexRenderer } from '../../components/common/LatexRenderer';
import { AnswerFormRenderer } from '../../components/common/AnswerFormRenderer';

import { ProofImageUploader } from '../../components/common/ProofImageUploader';
import {
  Bookmark,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Layers,
  Brain,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserMistake, Question, Solution, SolutionStep, UserAttempt, StructuredAnswer, AiEvaluation } from '../../types';
import { cn } from '../../utils/cn';
import { getSubjectTheme } from '../../utils/theme';
import { getSubjectName } from '../../utils/subject';
import { formatAnswerForDisplay, isAnswerComplete, validateAnswer } from '../../utils/answerValidator';
import { LocalProofImage, revokeLocalProofImages } from '../../utils/proofImages';
import { proofImageService } from '../../services/proofImageService';
import { MathLoginRequired } from '../common/MathLoginRequired';

const convertFileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

interface EnrichedMistake extends UserMistake {
  question: Question;
  typeName: string;
}

const createDemoMistakes = (
  questionsList: Question[],
  typesList: { id: string; name: string }[]
): EnrichedMistake[] => {
  const now = new Date();
  const pastDay = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const futureDay = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

  let selectedQuestions: Question[] = [];
  if (questionsList && questionsList.length > 0) {
    const seenTypes = new Set<string>();
    for (const q of questionsList) {
      if (!seenTypes.has(q.questionTypeId)) {
        seenTypes.add(q.questionTypeId);
        selectedQuestions.push(q);
      }
      if (selectedQuestions.length >= 3) break;
    }
    if (selectedQuestions.length < 2) {
      selectedQuestions = questionsList.slice(0, 3);
    }
  }

  if (selectedQuestions.length === 0) {
    selectedQuestions = [
      {
        id: 'demo-fallback-1',
        subjectId: 'math',
        topicId: 'algebra',
        questionTypeId: 'demo-type-1',
        content: 'Cho phương trình bậc hai $x^2 - 2(m-1)x + m^2 - 3 = 0$. Tìm tất cả các giá trị của $m$ để phương trình có hai nghiệm phân biệt $x_1, x_2$ thỏa mãn $x_1^2 + x_2^2 = 10$.',
        correctAnswer: 'm = 2',
        options: ['m = 2', 'm = -2', 'm = 1', 'm = 3'],
        difficulty: 'medium',
        sourceType: 'manual'
      },
      {
        id: 'demo-fallback-2',
        subjectId: 'math',
        topicId: 'algebra',
        questionTypeId: 'demo-type-2',
        content: 'Rút gọn biểu thức $P = \\left(\\frac{\\sqrt{x}}{\\sqrt{x}-1} - \\frac{1}{x-\\sqrt{x}}\\right) : \\frac{\\sqrt{x}+1}{\\sqrt{x}-1}$ với $x > 0, x \\ne 1$.',
        correctAnswer: 'P = 1',
        options: ['P = 1', 'P = \\sqrt{x}', 'P = \\frac{1}{\\sqrt{x}}', 'P = x'],
        difficulty: 'easy',
        sourceType: 'manual'
      }
    ];
  }

  return selectedQuestions.map((q, idx) => {
    const type = typesList.find(t => t.id === q.questionTypeId);
    let wrongAnswerText = 'Chưa điền đáp án';
    if (q.options && q.options.length > 1) {
      const wrongOpt = q.options.find(opt => opt !== q.correctAnswer);
      if (wrongOpt) wrongAnswerText = wrongOpt;
    } else if (q.correctAnswer) {
      wrongAnswerText = `Sai dấu hoặc thiếu điều kiện xác định`;
    }

    return {
      id: `demo-mistake-${idx + 1}`,
      userId: 'guest-demo',
      questionId: q.id,
      questionTypeId: q.questionTypeId || 'demo-type',
      typeName: type?.name || (idx === 0 ? 'Phương trình & Hệ thức Vi-ét' : 'Rút gọn biểu thức chứa căn'),
      wrongAnswer: wrongAnswerText,
      reviewStatus: 'reviewing',
      reviewCount: idx === 0 ? 2 : 1,
      nextReviewAt: idx === 0 ? now.toISOString() : futureDay,
      lastAttemptedAt: pastDay,
      teacherFeedback: idx === 0 ? 'Chú ý điều kiện có 2 nghiệm phân biệt (Delta > 0) trước khi áp dụng Vi-ét!' : undefined,
      question: q
    };
  });
};

export const MistakeNotebook: React.FC = () => {
  const { selectedSubject, selectedGrade, user, progressVersion, refreshProgress } = useAppStore();

  const [mistakes, setMistakes] = useState<EnrichedMistake[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  // Trạng thái cho việc luyện lại câu sai cụ thể
  const [activeMistake, setActiveMistake] = useState<EnrichedMistake | null>(null);
  const [reAnswer, setReAnswer] = useState('');
  const [reStructuredAnswer, setReStructuredAnswer] = useState<StructuredAnswer>({});
  const [reProofImages, setReProofImages] = useState<LocalProofImage[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reSubmitted, setReSubmitted] = useState(false);
  const [reCorrect, setReCorrect] = useState(false);
  const [reSolution, setReSolution] = useState<Solution | null>(null);
  const [isReSubmitting, setIsReSubmitting] = useState(false);
  const [reSubmitError, setReSubmitError] = useState<string | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<UserAttempt | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const questionTypes = getQuestionTypes(selectedGrade, selectedSubject);
  const questions = getQuestions(selectedGrade, selectedSubject);
  const solutions = getSolutions(selectedGrade, selectedSubject);

  const loadMistakes = useCallback(async () => {
    if (!user) {
      const demoList = createDemoMistakes(questions, questionTypes);
      setMistakes(demoList);
      return;
    }
    const currentUserId = user.uid;
    let list = storageService.getMistakes(currentUserId);

    if (list.length === 0) {
      const remoteMistakes = await progressService.getMistakes(currentUserId);
      if (remoteMistakes.length > 0) {
        storageService.saveMistakesLocal(currentUserId, remoteMistakes);
        list = remoteMistakes;
      }
    }

    // Lọc lỗi sai theo môn đang chọn và trạng thái chưa fixed
    const filtered = list
      .filter(m => m.reviewStatus !== 'fixed')
      .map(m => {
        // Tìm thông tin câu hỏi
        const q = questions.find(item => item.id === m.questionId);

        // Tìm tên dạng bài
        const type = questionTypes.find(t => t.id === m.questionTypeId);

        return {
          ...m,
          question: q,
          typeName: type?.name || 'Chưa phân loại'
        };
      })
      .filter((m): m is EnrichedMistake => m.question !== undefined); // Loại bỏ các câu không tìm thấy câu hỏi gốc

    setMistakes(filtered);
  }, [user, questions, questionTypes]);

  useEffect(() => {
    loadMistakes();
    setSelectedTypeId(null);
    setActiveMistake(null);
  }, [selectedSubject, loadMistakes, progressVersion]);

  const startReview = (mistake: EnrichedMistake) => {
    revokeLocalProofImages(reProofImages);
    setActiveMistake(mistake);
    setReAnswer('');
    setReStructuredAnswer({});
    setReProofImages([]);
    setSelectedOption(null);
    setReSubmitted(false);
    setIsReSubmitting(false);
    setReSubmitError(null);
    setLatestAttempt(null);

    // Tìm giải pháp
    const sol = solutions.find(s => s.questionId === mistake.questionId);
    if (!sol && mistake.id.startsWith('demo-')) {
      setReSolution({
        questionId: mistake.questionId,
        detailedSteps: [
          {
            stepOrder: 1,
            title: 'Phân tích yêu cầu & thiết lập công thức',
            description: 'Xác định các điều kiện xác định và hướng giải tối ưu cho bài toán.'
          },
          {
            stepOrder: 2,
            title: 'Thực hiện biến đổi đại số',
            description: 'Biến đổi cẩn thận, tránh nhầm lẫn dấu và kiểm tra lại điều kiện nghiệm.'
          }
        ],
        finalAnswer: mistake.question.correctAnswer || 'Xem lại lý thuyết và phương pháp giải'
      } as any);
    } else {
      setReSolution(sol || null);
    }
  };

  const handleReSubmit = async () => {
    if (!activeMistake || reSubmitted || isReSubmitting) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsReSubmitting(true);
    setReSubmitError(null);

    const answerInput = activeMistake.question.answerSchema
      ? reStructuredAnswer
      : activeMistake.question.options
        ? selectedOption || ''
        : reAnswer;
    const finalAns = formatAnswerForDisplay(activeMistake.question, answerInput);
    const currentUserId = user!.uid;
    const submittedAt = new Date().toISOString();
    const attemptId = `attempt-review-${activeMistake.questionId}-${Date.now()}`;
    let uploadedProofImages: UserAttempt['proofImages'] = [];

    try {
      if (user && reProofImages.length > 0) {
        uploadedProofImages = await proofImageService.uploadProofImages(
          user.uid,
          attemptId,
          reProofImages.map(image => ({ id: image.id, file: image.file }))
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể upload ảnh bài làm. Vui lòng thử lại.';
      setReSubmitError(message);
      setIsReSubmitting(false);
      return;
    }

    let aiEvaluation: AiEvaluation | undefined = undefined;
    let correct = validateAnswer(activeMistake.question, answerInput);
    let gradingMode: 'auto' | 'manual' = activeMistake.question.answerSchema?.autoCheckMode === 'manual' ? 'manual' : 'auto';

    if ((selectedSubject === 'math' || selectedSubject === 'chemistry') && reProofImages.length > 0) {
      try {
        const base64Image = await convertFileToBase64(reProofImages[0].file);
        const evaluation = await aiService.gradeProofAttempt(
          activeMistake.question,
          reSolution || undefined,
          finalAns,
          base64Image
        );
        aiEvaluation = evaluation;
        correct = evaluation.isCorrect;
        gradingMode = 'auto';
      } catch (err) {
        console.error("Lỗi khi gọi AI chấm bài trong sổ lỗi:", err);
        gradingMode = 'manual';
        correct = true;
      }
    }

    const attemptData: UserAttempt = {
      id: attemptId,
      userId: currentUserId,
      questionId: activeMistake.questionId,
      questionTypeId: activeMistake.questionTypeId,
      userAnswer: finalAns,
      ...(activeMistake.question.answerSchema ? { finalAnswer: reStructuredAnswer } : {}),
      ...(uploadedProofImages && uploadedProofImages.length > 0 ? { proofImages: uploadedProofImages } : {}),
      gradingMode,
      isCorrect: correct,
      timeSpent: 30, // Mock time
      createdAt: submittedAt,
      ...(aiEvaluation ? { aiEvaluation } : {}),
      ...(aiEvaluation ? { teacherFeedback: aiEvaluation.summaryFeedback } : {})
    };

    setReCorrect(correct);
    setLatestAttempt(attemptData);
    setReSubmitted(true);
    setIsReSubmitting(false);

    storageService.saveAttempt(currentUserId, attemptData);
    refreshProgress();

    if (correct) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    // Đồng bộ Firestore sau khi LocalStorage đã tự cập nhật progress/mistake qua saveAttempt.
    if (user) {
      progressService.saveAttempt(user.uid, attemptData);
      const localMistakes = storageService.getMistakes(user.uid);
      const updated = localMistakes.find(m => m.questionId === activeMistake.questionId);
      if (updated) {
        progressService.saveMistake(user.uid, updated);
      }
    }
  };

  const closeReview = () => {
    revokeLocalProofImages(reProofImages);
    setReProofImages([]);
    setActiveMistake(null);
    setLatestAttempt(null);
    loadMistakes(); // Load lại danh sách
  };

  const reviewProofImageRequired = activeMistake?.question.answerSchema?.proofImageRequired ?? false;
  const reviewSubmitDisabled = activeMistake
    ? activeMistake.question.answerSchema
      ? !isAnswerComplete(activeMistake.question, reStructuredAnswer) || (reviewProofImageRequired && reProofImages.length === 0)
      : activeMistake.question.options
        ? !selectedOption
        : !reAnswer.trim()
    : true;

  const formatReviewTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();

    if (date <= now) {
      return <span className="text-red-500 font-bold flex items-center gap-1 animate-pulse"><Calendar size={12} /> Cần luyện lại ngay</span>;
    }

    return (
      <span className="text-muted-foreground font-semibold flex items-center gap-1">
        <Calendar size={12} /> Luyện lại sau: {date.toLocaleDateString('vi-VN')}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">

      {/* Giới thiệu Sổ lỗi */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-foreground flex items-center justify-center gap-2">
          <Bookmark className="text-primary fill-primary" size={24} />
          Sổ lỗi sai cá nhân (Mistake Notebook)
        </h2>
      </div>

      {/* Banner Giới thiệu Chế độ Xem trước khi chưa đăng nhập */}
      {!user && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wide">
                  ✨ Chế độ xem trước tính năng
                </div>
                <h3 className="text-sm font-black text-foreground">
                  Khám phá Sổ tay sửa lỗi sai thông minh — {getSubjectName(selectedSubject)}
                </h3>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  Dưới đây là các câu sai mẫu minh họa. Khi đăng nhập, hệ thống sẽ <strong>tự động lưu lại mọi câu làm sai</strong> từ các bài luyện tập và đề thi để bạn ôn luyện lại đúng thời điểm vàng!
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="font-black text-xs px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md shrink-0 cursor-pointer"
            >
              Đăng nhập để sử dụng
            </Button>
          </div>

          {/* 3 Thẻ Tính Năng Nổi Bật */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-500/15">
            <div className="p-2.5 rounded-xl bg-card/80 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                <RotateCcw size={13} />
                <span>Lặp lại ngắt quãng</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Tự động lên lịch ôn lại vào các mốc 1 ngày, 3 ngày, 7 ngày giúp nhớ lâu.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                <Layers size={13} />
                <span>Gom nhóm dạng bài</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Thống kê số lần sai theo từng chuyên đề để bạn tập trung khắc phục lỗ hổng.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <Brain size={13} />
                <span>AI Socratic hướng dẫn</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Chấm bài tự luận qua ảnh chụp và chỉ ra từng bước giải chưa chính xác.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Giao diện chính */}
      {!activeMistake ? (
        // HIỂN THỊ DANH SÁCH LỖI SAI
        mistakes.length === 0 ? (
          <Card className="border-emerald-500/10 shadow-sm">
            <CardContent className="p-8 text-center flex flex-col items-center gap-3">
              <CheckCircle className="text-emerald-500" size={48} />
              <h3 className="text-base font-bold text-foreground">Sổ lỗi sai trống trơn!</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Thật xuất sắc! Bạn chưa có câu làm sai nào hoặc đã khắc phục thành công toàn bộ các lỗi sai cũ môn {getSubjectName(selectedSubject)}.
              </p>
            </CardContent>
          </Card>
        ) : selectedTypeId ? (
          // NHÁNH 1: HIỂN THỊ CHI TIẾT CÁC CÂU SAI CỦA DẠNG BÀI ĐÃ CHỌN
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedTypeId(null)}
                className="p-2 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer bg-secondary/50 hover:bg-secondary rounded-xl transition-all"
                title="Quay lại"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border/10">
                Dạng bài: {mistakes.find(m => m.questionTypeId === selectedTypeId)?.typeName || ''}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {mistakes
                .filter(m => m.questionTypeId === selectedTypeId)
                .map((mistake) => (
                  <Card
                    key={mistake.id}
                    className="hover:border-primary/30 border transition-all duration-200"
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center gap-0.5">
                            <AlertTriangle size={10} /> Đã sai: {mistake.reviewCount} lần
                          </span>
                          <span className="text-[9px] font-semibold">
                            {formatReviewTime(mistake.nextReviewAt)}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed bg-slate-50/50 dark:bg-slate-900/5 p-3 rounded-xl border border-border/10">
                          <LatexRenderer text={mistake.question.content} />
                        </div>

                        <div className="text-[10px] text-muted-foreground font-semibold">
                          Đáp án bạn đã điền: <span className="text-red-500 font-extrabold">{mistake.wrongAnswer || 'Trống'}</span>
                        </div>
                        {mistake.proofImages?.[0]?.downloadUrl && (
                          <a
                            href={mistake.proofImages[0].downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-primary hover:underline"
                          >
                            <img
                              src={mistake.proofImages[0].downloadUrl}
                              alt="Ảnh bài làm đã lưu"
                              className="h-10 w-14 rounded-lg object-cover border border-border"
                            />
                            Xem ảnh bài làm cũ
                          </a>
                        )}
                      </div>

                      <Button
                        onClick={() => startReview(mistake)}
                        className="self-start md:self-center font-bold text-xs py-2 px-4 shadow-sm shrink-0 cursor-pointer"
                      >
                        Luyện lại câu này
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          // NHÁNH 2: HIỂN THỊ GOM NHÓM THEO DẠNG BÀI
          <div className="space-y-4">
            <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              Chọn dạng bài để khắc phục lỗi sai:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(
                mistakes.reduce((acc, mistake) => {
                  const typeId = mistake.questionTypeId;
                  if (!acc[typeId]) {
                    acc[typeId] = {
                      typeId,
                      typeName: mistake.typeName,
                      mistakes: []
                    };
                  }
                  acc[typeId].mistakes.push(mistake);
                  return acc;
                }, {} as Record<string, { typeId: string; typeName: string; mistakes: EnrichedMistake[] }>)
              ).map((group) => {
                const count = group.mistakes.length;
                const totalWrongAttempts = group.mistakes.reduce((sum: number, m) => sum + (m.reviewCount || 1), 0);
                const isMath = group.typeId.startsWith('math');

                return (
                  <Card
                    key={group.typeId}
                    className="hover:border-primary/50 cursor-pointer transition-all duration-200 hover:translate-x-[2px] border bg-card"
                    onClick={() => setSelectedTypeId(group.typeId)}
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            'text-[9px] font-bold px-2 py-0.5 rounded-full',
                            getSubjectTheme(isMath ? 'math' : 'english').badge
                          )}>
                            {isMath ? '📐 Toán' : '🗣️ Anh'}
                          </span>
                          <span className="text-[10px] font-extrabold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                            {count} câu sai
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-foreground leading-tight">
                          {group.typeName}
                        </h4>

                        <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                          Tổng số lần làm sai: <span className="font-bold text-red-500">{totalWrongAttempts} lần</span>
                        </p>
                      </div>

                      <div className="border-t border-border/20 pt-3 flex items-center justify-between text-[10px] font-bold text-primary">
                        <span>Lịch sử lỗi sai chi tiết</span>
                        <span className="flex items-center gap-0.5 hover:underline">
                          Khắc phục ngay →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      ) : (
        // GIẢI LẠI CÂU SAI (REVIEW MODE)
        <Card className="border-indigo-500/10 shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b border-border/30 flex flex-row items-center justify-between py-4 flex-wrap gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Luyện lại câu sai</span>
              <CardTitle className="text-foreground text-sm font-bold mt-1">Dạng bài: {activeMistake.typeName}</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={closeReview}
                className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Đóng lại [X]
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!user && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
                <span>💡 Bạn đang trải nghiệm giải lại câu sai minh họa. Đăng nhập để AI chấm bài và lưu kết quả vào tiến trình của bạn!</span>
                <Button 
                  size="sm" 
                  onClick={() => setShowAuthModal(true)} 
                  className="text-[10px] h-7 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0 cursor-pointer"
                >
                  Đăng nhập
                </Button>
              </div>
            )}

            {/* Đề bài */}
            <div className="text-sm font-semibold leading-relaxed text-foreground bg-slate-50/20 dark:bg-slate-900/5 p-4 rounded-xl border border-border/10">
              <LatexRenderer text={activeMistake.question.content} />
            </div>

            {!reSubmitted ? (
              <div className="space-y-4">
                {activeMistake.question.options ? (
                  // Chọn đáp án cho câu trắc nghiệm (Tiếng Anh hoặc trắc nghiệm Toán/Hóa)
                  <div className="grid grid-cols-1 gap-3">
                    {activeMistake.question.options?.map((opt: string, i: number) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const hasPrefix = /^[A-D]\.\s*/i.test(opt);
                      const optLetter = hasPrefix ? opt.charAt(0).toUpperCase() : (letters[i] || String.fromCharCode(65 + i));
                      const isSelected = selectedOption === optLetter;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedOption(optLetter)}
                          className={`w-full text-left p-4 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-[0.99] cursor-pointer ${isSelected
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-card border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-foreground'
                            }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : activeMistake.question.answerSchema ? (
                  // Nhập đáp án có cấu trúc
                  <AnswerFormRenderer
                    question={activeMistake.question}
                    value={reStructuredAnswer}
                    onChange={setReStructuredAnswer}
                  />
                ) : (
                  // Nhập tự do
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Giải lại và nhập đáp số mới của bạn:</label>
                    <input
                      type="text"
                      value={reAnswer}
                      onChange={(e) => setReAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời tại đây..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold placeholder:text-muted-foreground/50"
                    />
                  </div>
                )}

                {(selectedSubject === 'math' || selectedSubject === 'chemistry') && (
                  <ProofImageUploader
                    images={reProofImages}
                    onChange={setReProofImages}
                    disabled={isReSubmitting}
                    required={reviewProofImageRequired}
                    cloudEnabled={Boolean(user)}
                  />
                )}

                {reSubmitError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {reSubmitError}
                  </p>
                )}

                <Button
                  onClick={handleReSubmit}
                  disabled={reviewSubmitDisabled || isReSubmitting}
                  className="w-full font-bold py-3 mt-4 text-xs active:scale-[0.98]"
                >
                  {isReSubmitting ? (reProofImages && reProofImages.length > 0 ? 'Giáo viên đang chấm lại bài...' : 'Đang gửi bài làm...') : 'Nộp bài giải lại'}
                </Button>
              </div>
            ) : (
              // BÁO CÁO KẾT QUẢ GIẢI LẠI
              <div className="space-y-6 animate-fade-in">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${reCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                  }`}>
                  {reCorrect ? (
                    <>
                      <CheckCircle size={24} className="text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-sm">Tuyệt vời! Bạn đã sửa sai thành công câu hỏi này.</h4>
                        <p className="text-xs font-semibold opacity-90">Câu hỏi đã được loại khỏi Sổ lỗi và tăng điểm master dạng bài.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-rose-500 shrink-0" size={24} />
                      <div>
                        <h4 className="font-extrabold text-sm">Vẫn chưa đúng rồi. Đừng nản lòng nhé!</h4>
                        <p className="text-xs font-semibold opacity-90">Hãy xem kỹ quy trình giải chi tiết dưới đây để hiểu bản chất.</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Báo cáo chấm điểm tự luận từ AI */}
                {(selectedSubject === 'math' || selectedSubject === 'chemistry') && latestAttempt?.aiEvaluation && (
                  <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border/50 shadow-sm text-left">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
                      <h4 className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-1.5">
                        📝 Nhận xét và chấm điểm chi tiết:
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground">Điểm số:</span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-black shadow-sm border",
                          latestAttempt.aiEvaluation.score >= 8
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : latestAttempt.aiEvaluation.score >= 5
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        )}>
                          {latestAttempt.aiEvaluation.score} / 10 điểm
                        </span>
                      </div>
                    </div>

                    {/* Nhận xét tổng quan */}
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border/30 text-xs font-semibold text-muted-foreground leading-relaxed">
                      <span className="font-extrabold text-foreground block mb-1">💬 Nhận xét tổng quan:</span>
                      <LatexRenderer text={latestAttempt.aiEvaluation.summaryFeedback} />
                    </div>

                    {/* Đánh giá chi tiết từng bước */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-2">
                        📋 Chi tiết đánh giá từng bước:
                      </span>
                      <div className="space-y-3">
                        {(latestAttempt.aiEvaluation.stepsEvaluation || []).map((step) => {
                          const isCorrect = step.status === 'correct';
                          const isMissing = step.status === 'missing';

                          return (
                            <div
                              key={step.stepOrder}
                              className={cn(
                                "p-3 rounded-xl border transition-all duration-150 relative flex flex-col gap-2 bg-card",
                                isCorrect
                                  ? "border-emerald-500/20 hover:border-emerald-500/35"
                                  : isMissing
                                    ? "border-amber-500/20 hover:border-amber-500/35"
                                    : "border-rose-500/20 hover:border-rose-500/35"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <h5 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-foreground flex items-center justify-center text-[10px] shrink-0 font-bold">
                                    {step.stepOrder}
                                  </span>
                                  {step.title}
                                </h5>
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                  isCorrect
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : isMissing
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                )}>
                                  {isCorrect ? '✓ Đạt' : isMissing ? '⚠️ Thiếu' : '✗ Lỗi'}
                                </span>
                              </div>

                              {step.studentContent && (
                                <div className="text-[11px] bg-slate-100/50 dark:bg-slate-900/30 p-2 rounded-lg text-muted-foreground font-semibold leading-relaxed border border-border/5 mt-1">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase block mb-1">Nội dung bạn viết:</span>
                                  <LatexRenderer text={step.studentContent} />
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground font-semibold leading-relaxed pl-6.5 mt-0.5">
                                <LatexRenderer text={step.feedback} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lời giải mẫu của câu sai */}
                {reSolution && (
                  <div className="space-y-4 border-t border-border/30 pt-6">
                    <h4 className="font-extrabold text-sm text-foreground">🔬 Quy trình giải chi tiết:</h4>
                    <div className="space-y-4 pl-1">
                      {reSolution.detailedSteps.map((step: SolutionStep, sIdx: number) => (
                        <div key={sIdx} className="space-y-1">
                          <h5 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                              {step.order}
                            </span>
                            {step.title}
                          </h5>
                          <div className="pl-6.5 text-xs font-semibold text-muted-foreground leading-relaxed">
                            <LatexRenderer text={step.explanation} />
                            {step.formula && (
                              <div className="my-1.5 p-2 bg-secondary/30 rounded text-foreground overflow-x-auto">
                                <LatexRenderer text={step.formula} block={true} />
                              </div>
                            )}
                            {step.result && (
                              <p className="text-primary font-bold mt-1">
                                👉 Kết quả bước: <LatexRenderer text={step.result} />
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border/30 rounded-xl text-xs">
                      <div className="font-extrabold text-foreground">
                        Đáp án chính xác: <span className="text-emerald-500 font-black"><LatexRenderer text={activeMistake.question.correctAnswer} /></span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={closeReview}
                  className="w-full font-bold py-3 text-xs active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  Quay lại Sổ lỗi sai <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Popup Yêu Cầu Đăng Nhập */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="relative w-full max-w-lg animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-10 right-2 sm:right-4 z-20 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={18} />
            </button>
            <MathLoginRequired
              title="Kích hoạt Sổ lỗi sai thông minh"
              description="Đăng nhập miễn phí bằng Google để tự động lưu câu làm sai, theo dõi chu kỳ nhắc nhở ôn tập (Spaced Repetition) và đồng hành cải thiện điểm số cùng AI!"
              onBack={() => setShowAuthModal(false)}
              backText="Tiếp tục xem trước"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default MistakeNotebook;
