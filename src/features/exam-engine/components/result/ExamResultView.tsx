import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import { QuestionStimulusRenderer } from '@/components/common/QuestionStimulusRenderer';
import { ExamResult, GradeCode, MockExam, Question, QuestionType, SubjectCode, Topic } from '@/types';
import type { User } from 'firebase/auth';
import { getSolutions } from '@/data';
import { aiService } from '@/services/aiService';
import { authService } from '@/services/authService';
import { calculateExamAnalysis, calculateTopicAnalysis } from '../../utils/examAnalysis';
import { formatAnswerForDisplay } from '@/utils/answerValidator';
import { formatTime } from '../../utils/examFormatters';
import { cn } from '@/utils/cn';
import { QuickPassageModal, ReadingModalStimulusData } from '../testing/QuickPassageModal';
import {
  Award,
  Target,
  Clock,
  Zap,
  BarChart3,
  FileText,
  TrendingUp,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Maximize2
} from 'lucide-react';

export interface ExamResultViewProps {
  examResult: ExamResult;
  examQuestions: Question[];
  currentExam?: MockExam;
  subjectLabel: string;
  selectedSubject: SubjectCode;
  selectedGrade: GradeCode;
  subjectQuestionTypes: QuestionType[];
  subjectTopics: Topic[];
  user: User | null;
  durationMinutes: number;
  onStartExam: () => void;
  onBackToIntro: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  examResult,
  examQuestions,
  currentExam,
  subjectLabel,
  selectedSubject,
  selectedGrade,
  subjectQuestionTypes,
  subjectTopics,
  user,
  durationMinutes,
  onStartExam,
  onBackToIntro
}) => {
  const navigate = useNavigate();
  const [resultActiveTab, setResultActiveTab] = useState<'overview' | 'review'>('overview');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [activeReadingModalStimulus, setActiveReadingModalStimulus] = useState<ReadingModalStimulusData | null>(null);
  const passageFontSize = 15;
  const [expandedSolutionId, setExpandedSolutionId] = useState<Record<string, boolean>>({});
  const [aiFeedback, setAiFeedback] = useState<Record<string, { isCorrect: boolean; score: number; feedback: string }>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  const toggleSolution = (questionId: string) => {
    setExpandedSolutionId(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getSolutionForQuestion = (questionId: string) => {
    return getSolutions(selectedGrade, selectedSubject).find(s => s.questionId === questionId);
  };

  const fetchImageAsBase64 = async (url: string): Promise<{ data: string; mimeType: string }> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({
          data: base64Data,
          mimeType: blob.type
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleRequestAiGrading = async (q: Question, attempt: any) => {
    setAiLoading(prev => ({ ...prev, [q.id]: true }));
    try {
      const solution = getSolutionForQuestion(q.id);
      let imageObj = undefined;
      if (attempt.proofImages && attempt.proofImages.length > 0) {
        const url = attempt.proofImages[0].downloadUrl;
        if (url) {
          imageObj = await fetchImageAsBase64(url);
        }
      }

      const result = await aiService.gradeProofAttempt(
        q,
        solution,
        attempt.userAnswer || '',
        imageObj
      );

      setAiFeedback(prev => ({
        ...prev,
        [q.id]: {
          isCorrect: result.isCorrect,
          score: result.score,
          feedback: result.summaryFeedback
        }
      }));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Không thể lấy đánh giá từ AI lúc này. Vui lòng thử lại sau.');
    } finally {
      setAiLoading(prev => ({ ...prev, [q.id]: false }));
    }
  };

  const analysis = calculateExamAnalysis(examQuestions, examResult, subjectQuestionTypes);
  const topicAnalysis = calculateTopicAnalysis(examQuestions, examResult, subjectTopics);

  // Điểm số và số liệu thống kê chuẩn xác, an toàn
  const finalScore = Number(examResult.score).toFixed(1);
  const hasPending = (examResult.pendingPoints ?? 0) > 0;
  const earnedClean = Math.round((examResult.earnedPoints ?? 0) * 10) / 10;
  const gradedMaxClean = Math.round((examResult.gradedMaxPoints ?? 0) * 10) / 10;
  const gradedTotal = examResult.gradedCount ?? examResult.totalCount;
  const accuracyPercent = gradedTotal > 0
    ? Math.round((examResult.correctCount / gradedTotal) * 100)
    : 0;
  const incorrectCount = Math.max(0, gradedTotal - examResult.correctCount);
  const avgPaceSeconds = examResult.totalCount > 0
    ? Math.round(examResult.timeSpent / examResult.totalCount)
    : 0;

  // Lọc danh sách câu hỏi cho Tab 2
  const filteredQuestions = examQuestions.filter(q => {
    if (reviewFilter === 'all') return true;
    const attempt = examResult.attempts[q.id];
    const isCorrect = attempt?.isCorrect;
    if (reviewFilter === 'correct') return isCorrect;
    if (reviewFilter === 'incorrect') return !isCorrect;
    return true;
  });

  const getPerformanceTier = (score: number, pending: boolean) => {
    if (pending) {
      return {
        label: 'Chờ chấm tự luận',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        desc: 'Bài thi có phần tự luận / thực nghiệm đang chờ giáo viên hoặc AI đánh giá theo rubric nên chưa kết luận mức độ làm chủ toàn bài.'
      };
    }
    if (score >= 9.0) {
      return {
        label: 'Xuất sắc 🏆',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        desc: 'Phong độ đỉnh cao! Năng lực kiến thức của bạn đã rất vững chắc và sẵn sàng cho kỳ thi thực tế.'
      };
    }
    if (score >= 8.0) {
      return {
        label: 'Giỏi ⭐',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        desc: 'Rất tốt! Bạn nắm chắc hầu hết các chuyên đề trọng tâm. Hãy tiếp tục giải thêm các đề khó để đạt điểm 9-10.'
      };
    }
    if (score >= 6.5) {
      return {
        label: 'Khá 📈',
        badgeClass: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        dotColor: 'bg-sky-500',
        desc: 'Mức điểm khá ổn định. Cần tập trung khắc phục những bẫy câu hỏi và các phần còn làm sai.'
      };
    }
    if (score >= 5.0) {
      return {
        label: 'Trung bình ⚡',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        desc: 'Bạn đã đạt ngưỡng điểm chuẩn cơ bản, nhưng còn nhiều lỗ hổng kiến thức cần ôn luyện ngay.'
      };
    }
    return {
      label: 'Cần củng cố 🎯',
      badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      dotColor: 'bg-rose-500',
      desc: 'Điểm số báo hiệu bạn bị hổng nhiều dạng bài cốt lõi. Hãy xem lại lời giải chi tiết và ôn lại các chuẩn kiến thức bên dưới.'
    };
  };

  const performance = getPerformanceTier(examResult.score, hasPending);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 space-y-6 pb-20 animate-in fade-in duration-300 font-sans">
      {/* Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToIntro}
            className="w-10 h-10 rounded-xl border border-border/80 bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer shrink-0"
            title="Quay lại danh sách đề thi"
            aria-label="Quay lại danh sách đề thi"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <span className="uppercase tracking-wider">{subjectLabel}</span>
              <span>•</span>
              <span className="text-foreground truncate">{currentExam?.title || 'Đề thi thử'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-primary shrink-0" />
              Báo cáo kết quả bài thi
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartExam}
            className="text-xs font-bold gap-1.5 h-9 rounded-xl border-border/80 hover:bg-secondary cursor-pointer shadow-2xs"
          >
            <RotateCcw size={14} /> Làm lại đề này
          </Button>
        </div>
      </div>

      {/* Guest Mode Slim Banner */}
      {!user && (
        <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-background border border-border/60 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-foreground">Bạn đang xem kết quả ở chế độ Khách</h4>
              <p className="text-[11px] text-muted-foreground font-normal">
                Đăng nhập Google để lưu điểm số này vào học bạ số, cập nhật biểu đồ năng lực và theo dõi lộ trình lâu dài.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await authService.signInWithGoogle();
              } catch (err: any) {
                alert(err.message || 'Lỗi đăng nhập bằng Google.');
              }
            }}
            className="h-8 text-xs font-bold px-4 rounded-xl shrink-0 cursor-pointer shadow-sm"
          >
            Đăng nhập lưu điểm
          </Button>
        </div>
      )}

      {/* Executive Scorecard Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Score Hero Card (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                {currentExam?.focus === 'theory' ? 'Báo cáo Lý thuyết' : 'Thi thử Chuẩn định dạng'}
              </span>
              <span className={cn("text-[11px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5", performance.badgeClass)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", performance.dotColor)} />
                {performance.label}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Điểm tổng kết
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
                  {hasPending ? earnedClean : finalScore}
                </span>
                <span className="text-base sm:text-lg font-bold text-muted-foreground">
                  / {hasPending ? `${gradedMaxClean} điểm đã chấm` : '10 điểm'}
                </span>
              </div>
              {hasPending && (
                <p className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Còn {examResult.pendingPoints} điểm tự luận đang chờ rubric
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              {performance.desc}
            </p>
          </div>

          <div className="pt-4 mt-5 border-t border-border/50 text-[11px] text-muted-foreground font-semibold flex items-center justify-between relative z-10">
            <span>Nộp bài: {new Date(examResult.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date(examResult.completedAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* 4 Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Accuracy Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Độ chính xác</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Target size={16} />
              </div>
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">{accuracyPercent}%</span>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    accuracyPercent >= 80 ? "bg-emerald-500" : accuracyPercent >= 60 ? "bg-sky-500" : accuracyPercent >= 40 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${accuracyPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Đúng {examResult.correctCount} / {gradedTotal} câu đã chấm
            </span>
          </div>

          {/* 2. Answers Breakdown Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Kết quả câu hỏi</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{examResult.correctCount}</span>
                <span className="text-xs font-bold text-muted-foreground">Đúng</span>
                <span className="text-lg font-bold text-muted-foreground/40">/</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-500">{incorrectCount}</span>
                <span className="text-xs font-bold text-muted-foreground">Sai</span>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Tổng {examResult.totalCount} câu toàn đề thi
            </span>
          </div>

          {/* 3. Time Spent Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Thời gian làm bài</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {formatTime(examResult.timeSpent)}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Thời lượng quy định: {durationMinutes} phút
            </span>
          </div>

          {/* 4. Pace Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tốc độ trung bình</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Zap size={16} />
              </div>
            </div>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {avgPaceSeconds}s
              </span>
              <span className="text-xs font-bold text-muted-foreground ml-1">/ câu</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              {avgPaceSeconds < 60 ? '⚡ Tốc độ phản xạ rất nhanh' : avgPaceSeconds < 120 ? 'Tốc độ làm bài chuẩn mực' : 'Cần tối ưu phân bổ thời gian'}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Mode Tab Navigation */}
      <div className="flex items-center border-b border-border/80 gap-4 sm:gap-6 pt-2">
        <button
          type="button"
          onClick={() => setResultActiveTab('overview')}
          className={cn(
            "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
            resultActiveTab === 'overview'
              ? "border-primary text-primary font-black"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 size={17} />
          <span>Tổng quan & Năng lực</span>
        </button>
        <button
          type="button"
          onClick={() => setResultActiveTab('review')}
          className={cn(
            "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer",
            resultActiveTab === 'review'
              ? "border-primary text-primary font-black"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText size={17} />
          <span>Chi tiết bài làm & Lời giải</span>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-bold">
            {examQuestions.length} câu
          </span>
        </button>
      </div>

      {/* TAB 1: TỔNG QUAN & PHÂN TÍCH NĂNG LỰC */}
      {resultActiveTab === 'overview' && (
        <div className="space-y-6">
          {/* Nhận xét năng lực */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="font-extrabold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Zap size={14} className="text-amber-500" /> Nhận xét năng lực chuyên sâu
            </span>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
              {performance.desc}
            </p>
          </div>

          {/* Phân tích chi tiết theo dạng bài */}
          {analysis.length > 0 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-primary" /> Phân tích chi tiết theo dạng bài:
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground font-normal">
                  Đánh giá mức độ làm chủ từng dạng bài cốt lõi trong đề thi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {analysis.map((item) => {
                  const isWeak = item.percent < 60;
                  const earned = Math.round(item.earned * 10) / 10;
                  const maximum = Math.round(item.maximum * 10) / 10;
                  return (
                    <div
                      key={item.typeId}
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between gap-3 transition-all",
                        isWeak
                          ? "border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10"
                          : "border-border/80 bg-card hover:border-border"
                      )}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-foreground truncate">{item.name}</h4>
                          {isWeak && (
                            <span className="text-[8px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Yếu
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Đạt {earned} / {maximum} điểm ({item.percent}%)
                        </p>
                      </div>

                      {isWeak ? (
                        <Button
                          onClick={() => navigate(`/question-types/${item.typeId}`)}
                          variant="outline"
                          size="sm"
                          className="font-bold text-[10px] h-7 shrink-0 cursor-pointer"
                        >
                          Ôn luyện <ArrowRight size={11} className="ml-1" />
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-500 font-extrabold flex items-center gap-1 shrink-0">
                          <CheckCircle size={14} /> Đã làm chủ
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bản đồ lý thuyết theo chuyên đề */}
          {currentExam?.focus === 'theory' && topicAnalysis.length > 1 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <BookOpen size={16} className="text-primary" /> Bản đồ ghi nhớ theo chuyên đề:
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground font-normal">
                  Ưu tiên ôn lại các chuyên đề dưới 60%, sau đó làm bài lý thuyết riêng của chuyên đề đó.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {topicAnalysis.map(item => {
                  const isWeak = item.percent < 60;
                  return (
                    <div key={item.topicId} className={`rounded-xl border p-4 ${isWeak ? 'border-rose-500/20 bg-rose-500/5' : 'border-border/80 bg-card'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-foreground">{item.title}</p>
                          <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                            Đạt {Math.round(item.earned * 10) / 10} / {Math.round(item.maximum * 10) / 10} điểm
                          </p>
                        </div>
                        <span className={`text-xs font-black ${isWeak ? 'text-rose-500' : 'text-emerald-500'}`}>{item.percent}%</span>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className={`h-full rounded-full ${isWeak ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHI TIẾT BÀI LÀM & LỜI GIẢI */}
      {resultActiveTab === 'review' && (
        <div className="space-y-6">
          {/* Question Jump Palette */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Target size={15} className="text-primary" />
                  Bảng điều hướng câu hỏi ({examQuestions.length} câu)
                </h3>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  (Nhấp số câu để cuộn nhanh)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đúng ({examResult.correctCount})
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Sai ({incorrectCount})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {examQuestions.map((q, idx) => {
                const attempt = examResult.attempts[q.id];
                const isCorrect = attempt?.isCorrect;
                const isManual = q.answerSchema?.autoCheckMode === 'manual' || q.validatorType === 'manual';
                const isPartiallyCorrect = !isManual && !isCorrect && (attempt?.earnedPoints ?? 0) > 0;

                let statusClass = "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900";
                if (isManual || isPartiallyCorrect) {
                  statusClass = "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900";
                } else if (isCorrect) {
                  statusClass = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`review-question-${q.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-black border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95",
                      statusClass
                    )}
                    title={`Câu ${idx + 1}: ${isCorrect ? 'Đúng' : 'Sai'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                reviewFilter === 'all'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Tất cả ({examQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                reviewFilter === 'incorrect'
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-secondary text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40"
              )}
            >
              <XCircle size={14} />
              Câu làm sai ({incorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('correct')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                reviewFilter === 'correct'
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-secondary text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
              )}
            >
              <CheckCircle2 size={14} />
              Câu làm đúng ({examResult.correctCount})
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, qIdx) => {
              const globalIdx = examQuestions.findIndex(item => item.id === q.id);
              const attempt = examResult.attempts[q.id];
              const isCorrect = attempt?.isCorrect;
              const isManual = q.answerSchema?.autoCheckMode === 'manual' || q.validatorType === 'manual';
              const isPartiallyCorrect = !isManual && !isCorrect && (attempt?.earnedPoints ?? 0) > 0;
              const solution = getSolutionForQuestion(q.id);
              const isExpanded = expandedSolutionId[q.id];
              const hasSubmitted = !!(attempt && (attempt.userAnswer?.trim() !== '' || (attempt.proofImages && attempt.proofImages.length > 0)));

              const studentAnsText = attempt?.userAnswer || '(Không có câu trả lời)';
              const correctAnsText = formatAnswerForDisplay(q, q.answerSchema ? (q.correctFinalAnswer ?? {}) : q.correctAnswer);

              const isSharedStimulus = Boolean(
                q.stimulus &&
                examQuestions.filter(item => item.stimulus?.id && item.stimulus.id === q.stimulus?.id).length > 1
              );
              const sharedQuestionsInExam = isSharedStimulus
                ? examQuestions.filter(item => item.stimulus?.id === q.stimulus?.id)
                : [];
              const isFirstInShared = isSharedStimulus && (
                qIdx === 0 || filteredQuestions[qIdx - 1]?.stimulus?.id !== q.stimulus?.id
              );
              const firstNum = sharedQuestionsInExam.length > 0
                ? examQuestions.findIndex(item => item.id === sharedQuestionsInExam[0].id) + 1
                : globalIdx + 1;
              const lastNum = sharedQuestionsInExam.length > 0
                ? examQuestions.findIndex(item => item.id === sharedQuestionsInExam[sharedQuestionsInExam.length - 1].id) + 1
                : globalIdx + 1;

              return (
                <React.Fragment key={q.id}>
                  {isFirstInShared && q.stimulus && (
                    <div
                      id={`review-passage-${q.stimulus.id}`}
                      className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-5 sm:p-6 shadow-2xs space-y-3.5"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                          <BookOpen size={13} />
                          Ngữ liệu bài đọc · Câu {firstNum} – Câu {lastNum}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveReadingModalStimulus({
                            stimulus: q.stimulus!,
                            startNum: firstNum,
                            endNum: lastNum
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                        >
                          <Maximize2 size={12} /> Cửa sổ đọc nổi
                        </button>
                      </div>
                      {q.stimulus.title && (
                        <h4 className="text-center font-black text-sm sm:text-base uppercase tracking-wide text-foreground">
                          {q.stimulus.title}
                        </h4>
                      )}
                      {q.stimulus.content && (
                        <div className="text-xs sm:text-sm leading-relaxed sm:leading-6 text-foreground/90 space-y-2.5 select-text">
                          {q.stimulus.content.split(/\n\s*\n/).map((para, pIdx) => (
                            <p key={pIdx} className="indent-4 text-justify">
                              <LatexRenderer text={para.trim()} />
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    id={`review-question-${q.id}`}
                    className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">
                          Câu {globalIdx + 1}
                        </span>
                        {q.questionTypeId && (
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            • {analysis.find(a => a.typeId === q.questionTypeId)?.name || ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isSharedStimulus && (
                          <button
                            type="button"
                            onClick={() => setActiveReadingModalStimulus({
                              stimulus: q.stimulus!,
                              startNum: firstNum,
                              endNum: lastNum
                            })}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg border border-primary/25"
                            title="Mở bài đọc để đối chiếu lời giải"
                          >
                            <BookOpen size={12} /> Xem bài đọc
                          </button>
                        )}
                        {isManual ? (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={11} /> Chờ chấm tự luận
                          </span>
                        ) : isCorrect ? (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle size={11} /> Đúng
                          </span>
                        ) : isPartiallyCorrect ? (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={11} /> Đúng một phần · {Math.round((attempt?.earnedPoints ?? 0) * 10) / 10}/{attempt?.maxPoints ?? q.points ?? 1} điểm
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <X size={11} /> Sai
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm font-semibold leading-relaxed text-foreground bg-secondary/30 p-3.5 rounded-xl border border-border/40">
                      <LatexRenderer text={q.content} />
                    </div>

                    {!isSharedStimulus && <QuestionStimulusRenderer question={q} />}

                    {/* Multiple Choice Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                        {q.options.map((opt: string, i: number) => {
                          const optLetter = opt.charAt(0);
                          const isCorrectOpt = optLetter === q.correctAnswer;
                          const isUserSelected = attempt?.userAnswer === optLetter;

                          let optStyle = "border-border/60 bg-secondary/20 text-muted-foreground";
                          if (isCorrectOpt) {
                            optStyle = "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs";
                          } else if (isUserSelected) {
                            optStyle = "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold shadow-xs";
                          }

                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${optStyle}`}
                            >
                              <span className="flex-1"><LatexRenderer text={opt} /></span>
                              {isCorrectOpt && (
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ml-2">
                                  Đáp án đúng
                                </span>
                              )}
                              {isUserSelected && !isCorrectOpt && (
                                <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ml-2">
                                  Bạn chọn
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Non-options format */}
                    {(!q.options || q.options.length === 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-bold mt-2">
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                          <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Bài làm của bạn:</span>
                          <span className={isCorrect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isPartiallyCorrect
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'}>
                            <LatexRenderer text={studentAnsText} />
                          </span>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                          <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Đáp án đúng:</span>
                          <span className="text-primary font-bold">
                            <LatexRenderer text={correctAnsText} />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Proof Images if any */}
                    {attempt?.proofImages && attempt.proofImages.length > 0 && (
                      <div className="mt-3.5 space-y-2">
                        <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Ảnh bài làm đã nộp:</span>
                        <div className="flex flex-wrap gap-3">
                          {attempt.proofImages.map((img: any, i: number) => (
                            <a
                              key={img.id || i}
                              href={img.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative group overflow-hidden rounded-xl border border-border/60 bg-secondary hover:border-primary/50 transition-all shadow-xs"
                            >
                              <img src={img.downloadUrl} alt="Ảnh bài làm" className="h-24 w-auto object-cover transition-transform duration-300 group-hover:scale-105" />
                              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-[10px] text-white font-extrabold">Xem ảnh lớn</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Grading assistant */}
                    {(selectedSubject === 'math' || (attempt?.proofImages && attempt.proofImages.length > 0)) && (
                      <div className="mt-4 p-4 rounded-xl border border-purple-500/15 bg-purple-500/5 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-400">
                            <Sparkles size={16} className="animate-pulse" />
                            <span>Trợ lý AI chấm bài tự động (Gemini)</span>
                          </div>

                          {!aiFeedback[q.id] && (
                            <Button
                              onClick={() => handleRequestAiGrading(q, attempt)}
                              disabled={aiLoading[q.id] || !hasSubmitted}
                              className="h-7 text-[10px] font-black bg-purple-600 hover:bg-purple-700 text-white gap-1 px-3.5 rounded-lg active:scale-[0.98] transition-all shadow-xs border-none shrink-0 cursor-pointer"
                            >
                              {aiLoading[q.id] ? (
                                <>
                                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                  <span>Đang chấm...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={12} />
                                  <span>Xem AI chấm bài</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {aiFeedback[q.id] ? (
                          <div className="space-y-2 text-xs animate-fade-in font-semibold text-muted-foreground">
                            <div className={`p-2.5 rounded-lg font-extrabold flex items-center gap-1.5 ${aiFeedback[q.id].isCorrect
                              ? 'bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-100/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                              }`}>
                              {aiFeedback[q.id].isCorrect ? '✅ Đạt yêu cầu' : '⚠️ Chưa đạt yêu cầu'}
                              <span className="text-[10px] opacity-75 font-normal">| Điểm số đề xuất:</span>
                              <span className="underline font-black text-foreground">{aiFeedback[q.id].score} / 10 điểm</span>
                            </div>
                            <div className="p-3 bg-white/50 dark:bg-slate-900/60 rounded-lg border border-purple-500/5 text-[11px] leading-relaxed text-foreground/90 font-medium">
                              <LatexRenderer text={aiFeedback[q.id].feedback} />
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] font-semibold">
                            {!hasSubmitted ? (
                              <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle size={12} className="shrink-0" />
                                Chưa nộp bài giải cho câu hỏi này.
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Bạn có thể yêu cầu AI chấm điểm lời giải viết tay hoặc lời giải bằng chữ để nhận phản hồi phân tích chi tiết tức thì.
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Step-by-step Solution */}
                    {solution && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => toggleSolution(q.id)}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          {isExpanded ? 'Ẩn lời giải chi tiết ▲' : 'Xem lời giải chi tiết & dịch nghĩa ▼'}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4 text-xs leading-relaxed animate-fade-in text-muted-foreground font-semibold">
                            {solution.translation && (
                              <div className="space-y-1">
                                <h5 className="font-extrabold text-foreground">Dịch nghĩa / yêu cầu câu hỏi:</h5>
                                <p className="text-[11px] text-muted-foreground">{solution.translation}</p>
                              </div>
                            )}

                            <div className="space-y-3">
                              <h5 className="font-extrabold text-foreground">Các bước giải chi tiết:</h5>
                              {solution.detailedSteps.map(step => (
                                <div key={step.order} className="pl-3 border-l-2 border-primary/40 space-y-1">
                                  <div className="font-extrabold text-foreground">
                                    Bước {step.order}: {step.title}
                                  </div>
                                  <div className="text-[11px] whitespace-pre-line">
                                    <LatexRenderer text={step.explanation} />
                                  </div>
                                  {step.formula && (
                                    <div className="my-1.5 p-2 bg-secondary/50 rounded border border-border/20 text-foreground">
                                      <LatexRenderer text={step.formula} />
                                    </div>
                                  )}
                                  {step.result && (
                                    <div className="text-[11px] font-bold text-primary">
                                      Kết quả: <LatexRenderer text={step.result} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {solution.commonMistakes && solution.commonMistakes.length > 0 && (
                              <div className="space-y-1 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-700 dark:text-rose-400">
                                <h5 className="font-extrabold flex items-center gap-1"><AlertTriangle size={12} /> Lỗi sai thường gặp:</h5>
                                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                                  {solution.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                              </div>
                            )}
                            {solution.reviewSuggestions && solution.reviewSuggestions.length > 0 && (
                              <div className="space-y-1 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg text-indigo-700 dark:text-indigo-400">
                                <h5 className="font-extrabold">Cần ôn lại:</h5>
                                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                                  {solution.reviewSuggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBackToIntro}
          className="w-full sm:w-auto font-bold px-6 py-2.5 text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={14} /> Quay lại danh sách đề thi
        </Button>

        <Button
          onClick={onStartExam}
          className="w-full sm:w-auto font-bold px-6 py-2.5 text-xs rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={14} /> Làm lại đề thi này
        </Button>
      </div>
      <QuickPassageModal
        modalData={activeReadingModalStimulus}
        onClose={() => setActiveReadingModalStimulus(null)}
        fontSize={passageFontSize}
      />
    </div>
  );
};
