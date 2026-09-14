import React, { useState, useEffect } from 'react';
import { IGrammarLesson } from '../../../data/english/grammar/englishGrammarData';
import {
  getGrammarQuizForLesson,
  IGrammarQuizQuestion,
  QuizDifficulty,
  QuizQuestionType
} from '../../../data/english/grammar/englishGrammarQuizData';
import { Button } from '../../../components/ui/button';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import confetti from 'canvas-confetti';

interface GrammarQuizViewProps {
  lesson: IGrammarLesson;
  onBackToTheory: () => void;
  onNextLesson?: () => void;
}

const getDifficultyBadge = (diff?: QuizDifficulty) => {
  switch (diff) {
    case 'easy':
      return {
        label: 'Cơ bản',
        dot: 'bg-emerald-500',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
      };
    case 'hard':
      return {
        label: 'Nâng cao · Bẫy thi',
        dot: 'bg-rose-500',
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25'
      };
    case 'medium':
    default:
      return {
        label: 'Thông hiểu',
        dot: 'bg-amber-500',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
      };
  }
};

const getTypeLabel = (t?: QuizQuestionType) => {
  switch (t) {
    case 'error_find':
      return 'Tìm lỗi sai';
    case 'transformation':
      return 'Biến đổi câu';
    case 'rule_check':
      return 'Quy tắc ngữ pháp';
    case 'fill_blank':
    default:
      return 'Điền vào chỗ trống';
  }
};

export const GrammarQuizView: React.FC<GrammarQuizViewProps> = ({
  lesson,
  onBackToTheory,
  onNextLesson
}) => {
  const [questions, setQuestions] = useState<IGrammarQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  >([]);

  // Tải câu hỏi trắc nghiệm khi bài học thay đổi (đảm bảo đủ 10 câu)
  useEffect(() => {
    const list = getGrammarQuizForLesson(lesson);
    setQuestions(list);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setUserAnswers([]);
  }, [lesson]);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const progressPercent = totalQ > 0 ? Math.round(((currentIndex + 1) / totalQ) * 100) : 0;

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedIndex: index,
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      const finalScore = score + (selectedOption === currentQ?.correctIndex ? 0 : 0);
      const percent = Math.round((finalScore / totalQ) * 100);
      if (percent >= 80) {
        try {
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setUserAnswers([]);
  };

  if (!currentQ && !isCompleted) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-8 text-center space-y-3">
        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
        <h3 className="text-sm font-bold text-foreground">Đang tải bộ 10 câu hỏi trắc nghiệm...</h3>
      </div>
    );
  }

  // MÀN HÌNH TỔNG KẾT KẾT QUẢ KHI HOÀN THÀNH 10 CÂU
  if (isCompleted) {
    const percent = Math.round((score / totalQ) * 100);
    const isMastered = percent >= 80;

    const easyCorrect = userAnswers.filter(
      a => a.isCorrect && questions.find(q => q.id === a.questionId)?.difficulty === 'easy'
    ).length;
    const mediumCorrect = userAnswers.filter(
      a => a.isCorrect && questions.find(q => q.id === a.questionId)?.difficulty === 'medium'
    ).length;
    const hardCorrect = userAnswers.filter(
      a => a.isCorrect && questions.find(q => q.id === a.questionId)?.difficulty === 'hard'
    ).length;

    return (
      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-xs animate-in fade-in duration-300">
        <div className="relative inline-block mx-auto">
          <div
            className={cn(
              "w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg transition-transform hover:scale-105",
              isMastered
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
            )}
          >
            {isMastered ? <Award size={40} /> : <Sparkles size={40} />}
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            {isMastered ? '🎉 Xuất sắc! Bạn đã làm chủ 10 dạng câu hỏi!' : '👍 Hoàn thành bộ 10 câu luyện tập!'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isMastered
              ? `Tuyệt vời! Bạn đã trả lời đúng ${score}/${totalQ} câu (${percent}%), sẵn sàng ăn trọn điểm các câu hỏi liên quan trong đề thi tuyển sinh!`
              : `Bạn đạt ${score}/${totalQ} câu (${percent}%). Hãy rà soát lại các câu bẫy bên dưới hoặc mở tab Lý thuyết để củng cố thêm nhé!`}
          </p>
        </div>

        {/* Điểm số & Phân bổ cấp độ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
          <div className="bg-secondary/40 border border-border/60 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tổng điểm
            </span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {score} / {totalQ}
            </span>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Cơ bản
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {easyCorrect} đúng
            </span>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Thông hiểu
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {mediumCorrect} đúng
            </span>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
              Nâng cao / Bẫy
            </span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {hardCorrect} đúng
            </span>
          </div>
        </div>

        {/* Bảng xem lại chi tiết 10 câu hỏi đã làm */}
        <div className="max-w-xl mx-auto text-left space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Chi tiết 10 câu hỏi:
            </h4>
            <span className="text-[11px] text-muted-foreground font-semibold">
              {score}/{totalQ} câu chính xác
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const ans = userAnswers.find(a => a.questionId === q.id);
              const isCorrect = ans?.isCorrect;
              const diffBadge = getDifficultyBadge(q.difficulty);

              return (
                <div
                  key={q.id}
                  className={cn(
                    "p-3.5 rounded-xl border text-xs space-y-1.5 transition-all",
                    isCorrect
                      ? "bg-emerald-500/5 border-emerald-500/25"
                      : "bg-rose-500/5 border-rose-500/25"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-foreground">
                          Câu {idx + 1}:
                        </span>
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded text-[9px] font-bold border",
                            diffBadge.className
                          )}
                        >
                          {diffBadge.label}
                        </span>
                      </div>

                      <p className="font-semibold text-foreground">{q.question}</p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] pt-0.5">
                        <span className="font-semibold text-muted-foreground">
                          Đáp án đúng:{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            {q.options[q.correctIndex]}
                          </strong>
                        </span>
                        {!isCorrect && ans?.selectedIndex !== undefined && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            (Bạn chọn: {q.options[ans.selectedIndex]})
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5 italic">
                        💡 {q.explanation}
                      </p>

                      {q.trapNote && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                          <AlertTriangle size={11} />
                          <span>{q.trapNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={handleRestart}
            className="font-bold text-xs py-2.5 px-4 rounded-xl border-border cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Làm lại bài
          </Button>

          <Button
            variant="outline"
            onClick={onBackToTheory}
            className="font-bold text-xs py-2.5 px-4 rounded-xl border-border cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen size={14} /> Ôn lại lý thuyết
          </Button>

          {onNextLesson && (
            <Button
              onClick={onNextLesson}
              className="font-bold text-xs py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              Sang bài tiếp theo <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const diffBadge = getDifficultyBadge(currentQ.difficulty);
  const typeLabel = getTypeLabel(currentQ.type);

  // MÀN HÌNH LÀM BÀI TRẮC NGHIỆM
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header bar: Progress & Score */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3 text-xs font-bold flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold uppercase tracking-wider border border-indigo-500/20 flex items-center gap-1">
              <Target size={12} /> Câu {currentIndex + 1} / {totalQ}
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              Trắc nghiệm phản xạ · {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              <CheckCircle2 size={14} /> {score} đúng
            </span>
            <button
              onClick={handleRestart}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
              title="Làm lại từ đầu"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Thin Animated Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs">
        {/* Header badges: Độ khó & Thể loại */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5",
                diffBadge.className
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", diffBadge.dot)} />
              {diffBadge.label}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-secondary-foreground border border-border/60">
              {typeLabel}
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
            <Zap size={11} className="text-amber-500" /> Thử thách 10 câu
          </span>
        </div>

        {/* Question sentence */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Chọn đáp án chính xác nhất:
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-relaxed tracking-tight">
            {currentQ.question}
          </h3>
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {currentQ.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === currentQ.correctIndex;

            let optionStyle =
              "bg-secondary/40 border-border/80 text-foreground hover:bg-secondary hover:border-indigo-500/50";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-xs";
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  "bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 font-bold shadow-xs";
              } else {
                optionStyle = "bg-secondary/20 border-border/40 text-muted-foreground opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={cn(
                  "p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer group select-none",
                  optionStyle,
                  isAnswered ? "cursor-default" : "hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors",
                      isAnswered && isCorrectOption
                        ? "bg-emerald-600 text-white"
                        : isAnswered && isSelected && !isCorrectOption
                        ? "bg-rose-600 text-white"
                        : "bg-secondary border border-border text-foreground group-hover:border-indigo-500/50"
                    )}
                  >
                    {letter}
                  </span>
                  <span className="font-mono">{option}</span>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Explanation Box (when answered) */}
        {isAnswered && (
          <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div
              className={cn(
                "p-4 rounded-xl border text-xs space-y-2",
                selectedOption === currentQ.correctIndex
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-amber-500/10 border-amber-500/25"
              )}
            >
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Lightbulb size={16} className="text-amber-500 shrink-0" />
                <span>Giải thích ngữ pháp:</span>
              </div>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {currentQ.explanation}
              </p>

              {currentQ.trapNote && (
                <div className="flex items-start gap-1.5 pt-1.5 border-t border-border/40 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{currentQ.trapNote}</span>
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-1">
              <Button
                onClick={handleNext}
                className="font-bold text-xs py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {currentIndex < totalQ - 1 ? (
                  <>
                    Câu tiếp theo ({currentIndex + 2}/{totalQ}) <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    Xem kết quả tổng kết <Award size={14} />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
