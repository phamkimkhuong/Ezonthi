import React, { useState, useEffect } from 'react';
import { IGrammarLesson } from '../../../data/english/grammar/englishGrammarData';
import {
  getGrammarSentencesForLesson,
  IGrammarSentence
} from '../../../data/english/grammar/englishGrammarSentenceData';
import { Button } from '../../../components/ui/button';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  Award,
  Volume2,
  Lightbulb,
  ChevronRight,
  Puzzle,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import confetti from 'canvas-confetti';

interface GrammarSentenceBuildingViewProps {
  lesson: IGrammarLesson;
  onBackToTheory: () => void;
  onNextLesson?: () => void;
}

export const GrammarSentenceBuildingView: React.FC<GrammarSentenceBuildingViewProps> = ({
  lesson,
  onBackToTheory,
  onNextLesson
}) => {
  const [sentences, setSentences] = useState<IGrammarSentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selected chips: list of objects with index in original scrambledWords & text
  const [selectedChips, setSelectedChips] = useState<{ id: number; text: string }[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Lưu lịch sử làm bài để xem lại ở màn hình tổng kết
  const [history, setHistory] = useState<
    { sentence: IGrammarSentence; isCorrect: boolean }[]
  >([]);

  useEffect(() => {
    const list = getGrammarSentencesForLesson(lesson);
    setSentences(list);
    setCurrentIndex(0);
    setSelectedChips([]);
    setIsChecked(false);
    setIsCorrect(null);
    setScore(0);
    setIsCompleted(false);
    setShowAnswer(false);
    setHistory([]);
  }, [lesson]);

  const currentSentence = sentences[currentIndex];
  const totalSentences = sentences.length;
  const progressPercent =
    totalSentences > 0 ? Math.round(((currentIndex + 1) / totalSentences) * 100) : 0;

  // Phát âm tiếng Anh câu hoàn chỉnh
  const handlePlayAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Bấm vào từ trong kho từ để đưa lên vùng ghép câu
  const handleSelectWord = (idx: number, text: string) => {
    if (isChecked) return;
    if (selectedChips.some(c => c.id === idx)) return;
    setSelectedChips(prev => [...prev, { id: idx, text }]);
  };

  // Bấm vào từ trên vùng ghép câu để gỡ bỏ trả về kho
  const handleRemoveChip = (chipId: number) => {
    if (isChecked) return;
    setSelectedChips(prev => prev.filter(c => c.id !== chipId));
  };

  // Đặt lại vùng ghép câu
  const handleResetChips = () => {
    if (isChecked) return;
    setSelectedChips([]);
  };

  // Kiểm tra đáp án
  const handleCheck = () => {
    if (!currentSentence || isChecked || selectedChips.length === 0) return;

    const userBuilt = selectedChips
      .map(c => c.text)
      .join(' ')
      .replace(/\s+([.,?!])/g, '$1')
      .trim()
      .toLowerCase();

    const target = currentSentence.targetSentence
      .replace(/\s+([.,?!])/g, '$1')
      .trim()
      .toLowerCase();

    const correct = userBuilt === target;
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      handlePlayAudio(currentSentence.targetSentence);
    }

    setHistory(prev => [
      ...prev,
      {
        sentence: currentSentence,
        isCorrect: correct
      }
    ]);
  };

  // Chuyển sang câu tiếp theo
  const handleNext = () => {
    if (currentIndex < totalSentences - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedChips([]);
      setIsChecked(false);
      setIsCorrect(null);
      setShowAnswer(false);
    } else {
      setIsCompleted(true);
      const finalScore = score + (isCorrect ? 0 : 0);
      const percent = Math.round((finalScore / totalSentences) * 100);
      if (percent >= 80) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  };

  // Làm lại từ đầu
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChips([]);
    setIsChecked(false);
    setIsCorrect(null);
    setScore(0);
    setIsCompleted(false);
    setShowAnswer(false);
    setHistory([]);
  };

  if (!currentSentence && !isCompleted) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-8 text-center space-y-3">
        <Puzzle className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
        <h3 className="text-sm font-bold text-foreground">Đang tải bài tập ghép câu...</h3>
      </div>
    );
  }

  // MÀN HÌNH TỔNG KẾT KHI HOÀN THÀNH
  if (isCompleted) {
    const percent = Math.round((score / totalSentences) * 100);
    const isMastered = percent >= 80;

    return (
      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-xs animate-in fade-in duration-300">
        <div className="relative inline-block mx-auto">
          <div
            className={cn(
              "w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg transition-transform hover:scale-105",
              isMastered
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
            )}
          >
            {isMastered ? <Award size={40} /> : <Sparkles size={40} />}
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            {isMastered ? '🎉 Xuất sắc! Phản xạ ghép câu tuyệt vời!' : '👍 Hoàn thành bài luyện ghép câu!'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isMastered
              ? `Bạn đã hoàn thành chính xác ${score}/${totalSentences} câu (${percent}%), phản xạ trật tự từ tiếng Anh rất tự nhiên và chính xác!`
              : `Bạn đạt ${score}/${totalSentences} câu (${percent}%). Hãy ôn lại các câu chưa đúng bên dưới để củng cố kỹ năng sắp xếp từ nhé!`}
          </p>
        </div>

        {/* Điểm số thống kê */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
          <div className="bg-secondary/40 border border-border/60 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tổng câu đúng
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">
              {score} / {totalSentences}
            </span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Cơ bản
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {history.filter(h => (h.sentence.difficulty || 'easy') === 'easy' && h.isCorrect).length} / {history.filter(h => (h.sentence.difficulty || 'easy') === 'easy').length}
            </span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Thông hiểu
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {history.filter(h => h.sentence.difficulty === 'medium' && h.isCorrect).length} / {history.filter(h => h.sentence.difficulty === 'medium').length}
            </span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
              Nâng cao
            </span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {history.filter(h => h.sentence.difficulty === 'hard' && h.isCorrect).length} / {history.filter(h => h.sentence.difficulty === 'hard').length}
            </span>
          </div>
        </div>

        {/* Danh sách các câu đã ghép */}
        <div className="max-w-xl mx-auto text-left space-y-3 pt-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Chi tiết các câu đã luyện:
          </h4>
          <div className="space-y-3">
            {history.map((h, idx) => (
              <div
                key={h.sentence.id || idx}
                className={cn(
                  "p-3.5 rounded-xl border text-xs space-y-1.5 transition-all",
                  h.isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/25"
                    : "bg-rose-500/5 border-rose-500/25"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {h.isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-extrabold text-foreground">
                        {h.sentence.targetSentence}
                      </p>
                      <p className="text-[11px] text-muted-foreground italic font-medium">
                        👉 {h.sentence.vietnameseMeaning}
                      </p>
                      {h.sentence.grammarTip && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-0.5">
                          💡 {h.sentence.grammarTip}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayAudio(h.sentence.targetSentence)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-secondary cursor-pointer shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={handleRestart}
            className="font-bold text-xs py-2.5 px-4 rounded-xl border-border cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Luyện lại bài này
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
              className="font-bold text-xs py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              Sang bài tiếp theo <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // MÀN HÌNH LUYỆN GHÉP CÂU CHÍNH
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header bar: Progress & Score */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3 text-xs font-bold flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-extrabold uppercase tracking-wider border border-purple-500/20 flex items-center gap-1">
              <Puzzle size={12} /> Câu {currentIndex + 1} / {totalSentences}
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              Luyện ghép câu phản xạ · {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-purple-600 dark:text-purple-400 font-extrabold flex items-center gap-1">
              <CheckCircle2 size={14} /> {score} đúng
            </span>
            <button
              onClick={handleRestart}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
              title="Luyện lại từ đầu"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Thin Animated Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs">
        {/* Câu gợi ý tiếng Việt */}
        <div className="space-y-2 pb-2 border-b border-border/40">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                Ý nghĩa câu cần ghép:
              </span>
              {/* Badge độ khó */}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border",
                  currentSentence.difficulty === 'hard'
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    : currentSentence.difficulty === 'medium'
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                )}
              >
                {currentSentence.difficulty === 'hard'
                  ? '🔴 Nâng cao'
                  : currentSentence.difficulty === 'medium'
                  ? '🟡 Thông hiểu'
                  : '🟢 Cơ bản'}
              </span>
              {/* Badge độ dài câu */}
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-muted-foreground border border-border/60">
                📏 {currentSentence.scrambledWords.length} khối từ
              </span>
            </div>
            {currentSentence.grammarTip && (
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Lightbulb size={11} /> Mẹo: {currentSentence.grammarTip}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black text-foreground">
            "{currentSentence.vietnameseMeaning}"
          </h3>
        </div>

        {/* VÙNG GHÉP CÂU (Target Drop Zone) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            <span>Vùng ghép câu của bạn:</span>
            {selectedChips.length > 0 && !isChecked && (
              <button
                type="button"
                onClick={handleResetChips}
                className="text-muted-foreground hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Undo2 size={12} /> Xóa xếp lại
              </button>
            )}
          </div>

          <div
            className={cn(
              "min-h-[72px] p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-wrap items-center gap-2 select-none",
              isChecked && isCorrect
                ? "bg-emerald-500/10 border-emerald-500"
                : isChecked && !isCorrect
                ? "bg-rose-500/10 border-rose-500"
                : selectedChips.length > 0
                ? "bg-secondary/30 border-purple-500/50"
                : "bg-secondary/15 border-dashed border-border/80 justify-center"
            )}
          >
            {selectedChips.length === 0 ? (
              <span className="text-xs text-muted-foreground font-medium italic">
                Chạm vào các khối từ bên dưới để ghép câu theo đúng trật tự ngữ pháp...
              </span>
            ) : (
              selectedChips.map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  disabled={isChecked}
                  onClick={() => handleRemoveChip(chip.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs font-mono flex items-center gap-1 cursor-pointer active:scale-95",
                    isChecked && isCorrect
                      ? "bg-emerald-600 text-white"
                      : isChecked && !isCorrect
                      ? "bg-rose-600 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                  title="Bấm để gỡ từ này"
                >
                  <span>{chip.text}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* KHO TỪ XÁO TRỘN (Word Bank) */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Kho từ có sẵn:
          </span>

          <div className="flex flex-wrap gap-2.5">
            {currentSentence.scrambledWords.map((word, idx) => {
              const isUsed = selectedChips.some(c => c.id === idx);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isUsed || isChecked}
                  onClick={() => handleSelectWord(idx, word)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all border shadow-2xs cursor-pointer select-none",
                    isUsed
                      ? "opacity-20 bg-secondary/30 border-border cursor-not-allowed"
                      : "bg-card border-border/80 hover:border-purple-500 hover:bg-purple-500/5 hover:-translate-y-0.5 active:translate-y-0 text-foreground"
                  )}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* NÚT THAO TÁC & PHẢN HỒI */}
        {!isChecked ? (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle size={13} /> {showAnswer ? 'Ẩn gợi ý' : 'Xem gợi ý câu'}
            </button>

            <Button
              onClick={handleCheck}
              disabled={selectedChips.length === 0}
              className="font-bold text-xs py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white cursor-pointer shadow-xs"
            >
              Kiểm tra câu ghép
            </Button>
          </div>
        ) : (
          /* HỘP PHẢN HỒI KẾT QUẢ KHI ĐÃ KIỂM TRA */
          <div className="space-y-3 pt-3 border-t border-border/40 animate-in fade-in duration-300">
            <div
              className={cn(
                "p-4 rounded-xl border text-xs space-y-2",
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-rose-500/10 border-rose-500/25"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">Chính xác hoàn hảo!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-rose-600 dark:text-rose-400" />
                      <span className="text-rose-700 dark:text-rose-300">Chưa đúng trật tự từ</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayAudio(currentSentence.targetSentence)}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border/60 hover:bg-secondary text-foreground text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Volume2 size={13} /> Nghe phát âm
                </button>
              </div>

              {/* Câu chuẩn */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Câu hoàn chỉnh chuẩn:
                </span>
                <p className="text-sm font-extrabold text-foreground font-mono pt-0.5">
                  {currentSentence.targetSentence}
                </p>
              </div>

              {currentSentence.grammarTip && (
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 italic">
                  💡 {currentSentence.grammarTip}
                </p>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-1">
              <Button
                onClick={handleNext}
                className="font-bold text-xs py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {currentIndex < totalSentences - 1 ? (
                  <>
                    Câu tiếp theo ({currentIndex + 2}/{totalSentences}) <ArrowRight size={14} />
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

        {/* Gợi ý nếu người dùng bấm xem */}
        {showAnswer && !isChecked && (
          <div className="p-3 bg-secondary/60 border border-border/80 rounded-xl text-xs space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Gợi ý trật tự từ:
            </span>
            <p className="font-mono font-bold text-foreground">
              {currentSentence.targetSentence}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
