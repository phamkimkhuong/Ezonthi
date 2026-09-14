import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import { ROUTES } from '../../constants/routes';
import {
  ENGLISH_10_VOCABULARY,
  ENGLISH_10_UNITS,
  IVocabItem
} from '../../data/grade10/english/vocabulary/english10Vocabulary';
import { dictionaryService } from '../../services/dictionaryService';
import { useDictionaryStore } from '../../stores/useDictionaryStore';
import {
  Volume2,
  BookOpen,
  RotateCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award,
  ArrowLeft,
  Pencil,
  Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../utils/cn';

type Mode = 'flashcard' | 'quiz' | 'spelling';

export const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedGrade, selectedSubject } = useAppStore();

  useEffect(() => {
    if (selectedGrade !== 'grade10' || selectedSubject !== 'english') {
      navigate(ROUTES.ROADMAP, { replace: true });
    }
  }, [selectedGrade, selectedSubject, navigate]);

  // Selected Unit ID: null = Unit Grid view, number = Specific Unit view, 'all' = All Units view
  const [selectedUnit, setSelectedUnit] = useState<number | 'all' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<Mode>('flashcard');

  // Flashcard state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state & settings
  const [quizScore, setQuizScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const quizOptionCount = 6;
  const [quizDirection, setQuizDirection] = useState<'en-vi' | 'vi-en'>('en-vi');
  const [quizRoundLength] = useState<number>(10);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Spelling state
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState('');
  const [showSpellingAnswer, setShowSpellingAnswer] = useState(false);
  const [spellingFeedback, setSpellingFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [spellingScore, setSpellingScore] = useState(0);
  const [spellingCompleted, setSpellingCompleted] = useState(false);

  const spellingInputRef = useRef<HTMLInputElement>(null);

  const { searchAndOpenModal } = useDictionaryStore();

  // Filtered vocabulary list based on selected unit and search query
  const filteredVocab = useMemo(() => {
    if (selectedUnit === null) return [];
    return ENGLISH_10_VOCABULARY.filter(item => {
      const matchUnit = selectedUnit === 'all' || item.unit === selectedUnit;
      const matchQuery =
        !searchQuery ||
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchUnit && matchQuery;
    });
  }, [selectedUnit, searchQuery]);

  // Current active unit spec
  const currentUnitSpec = useMemo(() => {
    if (typeof selectedUnit === 'number') {
      return ENGLISH_10_UNITS.find(u => u.unit === selectedUnit);
    }
    return null;
  }, [selectedUnit]);

  // Current flashcard item
  const currentCard: IVocabItem | undefined = filteredVocab[currentIndex % (filteredVocab.length || 1)];

  // Current quiz item
  const totalQuizInRound = Math.min(quizRoundLength, filteredVocab.length || 1);
  const currentQuizItem: IVocabItem | undefined = filteredVocab[quizIndex % (filteredVocab.length || 1)];

  // Current spelling item
  const totalSpellingInRound = Math.min(10, filteredVocab.length || 1);
  const currentSpellingItem: IVocabItem | undefined = filteredVocab[spellingIndex % (filteredVocab.length || 1)];

  const quizOptions = useMemo(() => {
    if (!currentQuizItem || filteredVocab.length === 0) return [];
    const isEnVi = quizDirection === 'en-vi';
    const correct = isEnVi ? currentQuizItem.meaning : currentQuizItem.word;
    const distractorCount = quizOptionCount - 1; // 5 for 6 options, 3 for 4 options

    // Pull distractors from overall dataset
    const distractorPool = ENGLISH_10_VOCABULARY
      .filter(v => v.id !== currentQuizItem.id)
      .map(v => isEnVi ? v.meaning : v.word)
      .filter((val, idx, self) => self.indexOf(val) === idx && val !== correct);

    const distractors = distractorPool
      .sort(() => 0.5 - Math.random())
      .slice(0, distractorCount);

    return [correct, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentQuizItem, quizDirection, quizOptionCount, filteredVocab.length]);

  const handlePlayAudio = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dictionaryService.playAudio(word);
  };

  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % (filteredVocab.length || 1));
  }, [filteredVocab.length]);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredVocab.length) % (filteredVocab.length || 1));
  }, [filteredVocab.length]);

  // Keyboard navigation for Flashcards (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    if (selectedUnit === null || mode !== 'flashcard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        handlePrevCard();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUnit, mode, handleNextCard, handlePrevCard]);

  const handleQuizAnswer = (option: string) => {
    if (selectedQuizOption !== null || !currentQuizItem) return;
    setSelectedQuizOption(option);
    const correctValue = quizDirection === 'en-vi' ? currentQuizItem.meaning : currentQuizItem.word;
    if (option === correctValue) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    const nextIdx = quizIndex + 1;
    if (nextIdx >= totalQuizInRound) {
      setQuizCompleted(true);
    } else {
      setQuizIndex(nextIdx);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedQuizOption(null);
    setQuizCompleted(false);
  };

  // Spelling Handlers
  const handleCheckSpelling = () => {
    if (!currentSpellingItem || !spellingInput.trim()) return;
    const isCorrect = spellingInput.trim().toLowerCase() === currentSpellingItem.word.toLowerCase();
    if (isCorrect) {
      setSpellingFeedback('correct');
      setSpellingScore(prev => prev + 1);
      handlePlayAudio(currentSpellingItem.word);
    } else {
      setSpellingFeedback('wrong');
    }
  };

  const handleNextSpelling = () => {
    setSpellingInput('');
    setSpellingFeedback(null);
    setShowSpellingAnswer(false);
    const nextIdx = spellingIndex + 1;
    if (nextIdx >= totalSpellingInRound) {
      setSpellingCompleted(true);
    } else {
      setSpellingIndex(nextIdx);
    }
  };

  const handleRestartSpelling = () => {
    setSpellingIndex(0);
    setSpellingScore(0);
    setSpellingInput('');
    setSpellingFeedback(null);
    setShowSpellingAnswer(false);
    setSpellingCompleted(false);
  };

  const handleSelectUnit = (unitId: number | 'all') => {
    setSelectedUnit(unitId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedQuizOption(null);
    setQuizCompleted(false);
    handleRestartSpelling();
    setSearchQuery('');
  };

  // Unit count map
  const unitVocabCountMap = useMemo(() => {
    const map: Record<number, number> = {};
    ENGLISH_10_VOCABULARY.forEach(item => {
      map[item.unit] = (map[item.unit] || 0) + 1;
    });
    return map;
  }, []);

  const progressPercent = useMemo(() => {
    if (filteredVocab.length === 0) return 0;
    return Math.round(((currentIndex + 1) / filteredVocab.length) * 100);
  }, [currentIndex, filteredVocab.length]);

  return (
    <div className="min-h-screen bg-background text-foreground w-full max-w-4xl mx-auto space-y-4 pb-12">
      {/* LEVEL 1: UNIT SELECTION GRID VIEW */}
      {selectedUnit === null ? (
        <div className="space-y-4 px-3 sm:px-6 py-3 animate-fade-in">
          {/* Header Banner */}
          <div className="border-b border-border pb-3 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tiếng Anh Lớp 10 — Global Success</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Kho Từ Vựng Tiếng Anh 10 📚
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Chọn bài học (Unit) để bắt đầu luyện tập qua Flashcards, Trắc nghiệm Quiz và Luyện viết từ vựng.
            </p>
          </div>

          {/* Unit Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Danh sách các bài học (Unit 1 - 10)</span>
              </h2>
              <span className="text-xs font-bold text-muted-foreground">
                Tổng {ENGLISH_10_VOCABULARY.length} từ vựng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* 10 Unit Items */}
              {ENGLISH_10_UNITS.map(u => {
                const count = unitVocabCountMap[u.unit] || 0;
                return (
                  <div
                    key={u.unit}
                    onClick={() => handleSelectUnit(u.unit)}
                    className="group cursor-pointer border border-border hover:border-indigo-500 bg-card p-4 rounded-xl transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                          Unit {u.unit}
                        </span>
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {count} từ
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {u.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        📌 Chủ đề: <span className="font-semibold text-foreground">{u.theme}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs font-bold text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <span>Vào học</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}

              {/* All Units Summary Item */}
              <div
                onClick={() => handleSelectUnit('all')}
                className="group cursor-pointer border border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/20 p-4 rounded-xl transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-600 text-white uppercase">
                      🌟 Tất cả Unit
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {ENGLISH_10_VOCABULARY.length} từ
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Tổng ôn toàn bộ 10 Unit
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Luyện tất cả từ vựng môn Tiếng Anh 10 cùng lúc.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-indigo-500/20 pt-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Bắt đầu ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LEVEL 2: VOCABULARY LEARNING VIEW (FLAT MODERN ARCHITECTURE) */
        <div className="space-y-4 px-3 sm:px-6 py-3 animate-fade-in">
          {/* Top Control Header Bar */}
          <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-3">
            {/* Back Button & Unit Title */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUnit(null)}
                className="rounded-lg font-bold text-xs cursor-pointer border-border px-2.5 py-1.5 h-8"
                title="Quay lại"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                    {selectedUnit === 'all' ? 'Tất cả' : `Unit ${currentUnitSpec?.unit}`}
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-foreground">
                    {selectedUnit === 'all'
                      ? 'Tổng ôn từ vựng (Unit 1 - 10)'
                      : currentUnitSpec?.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Segmented Mode Selector Tabs (Flat Modern Stepper) */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => { setMode('flashcard'); setIsFlipped(false); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                  mode === 'flashcard'
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-mono">1</span>
                <span>Flashcard</span>
              </button>

              <button
                onClick={() => { setMode('quiz'); handleRestartQuiz(); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                  mode === 'quiz'
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-mono">2</span>
                <span>Trắc nghiệm</span>
              </button>

              <button
                onClick={() => { setMode('spelling'); handleRestartSpelling(); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                  mode === 'spelling'
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-mono">3</span>
                <span>Luyện viết</span>
              </button>
            </div>
          </div>

          {/* LEARNING MODES CONTENT (FLAT & EDGE-TO-EDGE) */}
          {filteredVocab.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-border rounded-xl">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-sm font-bold text-foreground">Không tìm thấy từ vựng</h3>
              <p className="text-xs text-muted-foreground">Vui lòng chọn bài học khác.</p>
            </div>
          ) : mode === 'flashcard' ? (
            /* FLAT FLASHCARD MODE */
            <div className="space-y-4">
              {/* Progress & Counter Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Từ {currentIndex + 1} / {filteredVocab.length} ({progressPercent}%)</span>
                <span className="text-[11px] font-normal hidden sm:inline">
                  💡 Mẹo: Dùng phím <kbd className="px-1 bg-secondary rounded border">Space</kbd> lật thẻ, <kbd className="px-1 bg-secondary rounded">←</kbd> <kbd className="px-1 bg-secondary rounded">→</kbd> chuyển từ
                </span>
              </div>

              <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* FLAT FLASHCARD CONTAINER */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[340px] p-6 sm:p-8 cursor-pointer select-none border border-border rounded-xl bg-card hover:border-indigo-500/50 transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {!isFlipped ? (
                  /* FRONT CONTENT */
                  <div className="flex flex-col justify-between h-full space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-md uppercase tracking-wider border border-indigo-500/20">
                        {currentCard?.pos}
                      </span>
                      <button
                        onClick={(e) => currentCard && handlePlayAudio(currentCard.word, e)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                        title="Phát âm tiếng Anh"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Phát âm</span>
                      </button>
                    </div>

                    <div className="text-center space-y-2 my-auto py-4">
                      <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
                        {currentCard?.word}
                      </h2>
                      <p className="text-base sm:text-xl font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {currentCard?.phonetic}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground pt-3 border-t border-border/40">
                      <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Bấm vào để xem nghĩa Tiếng Việt & Ví dụ</span>
                    </div>
                  </div>
                ) : (
                  /* BACK CONTENT */
                  <div className="flex flex-col justify-between h-full space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-extrabold rounded-md uppercase border border-amber-500/20 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Nghĩa & Ví dụ</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentCard) searchAndOpenModal(currentCard.word);
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20"
                      >
                        <span>Từ điển chi tiết</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3 my-auto text-center py-2">
                      <h3 className="text-3xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                        {currentCard?.meaning}
                      </h3>
                      <div className="p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/30 border border-indigo-500/15 text-xs sm:text-sm text-foreground text-left space-y-1.5">
                        <p className="italic font-bold">"{currentCard?.example}"</p>
                        <p className="text-indigo-600 dark:text-indigo-300 font-semibold flex items-start gap-1">👉 {currentCard?.exampleTranslation}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground pt-3 border-t border-border/40">
                      <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Bấm vào để quay lại mặt trước</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons Bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevCard}
                  className="rounded-lg gap-1 font-bold text-xs cursor-pointer border-border h-9 px-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Từ trước</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="rounded-lg gap-1 font-bold text-xs cursor-pointer border-border h-9 px-4"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Lật thẻ</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextCard}
                  className="rounded-lg gap-1 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 cursor-pointer"
                >
                  <span>Từ tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : mode === 'quiz' ? (
            /* FLAT MULTIPLE CHOICE QUIZ MODE */
            <div className="space-y-4">
              {/* Quiz Settings Bar */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-muted-foreground">Chế độ:</span>
                  <div className="flex items-center bg-secondary/60 p-0.5 rounded-md border border-border">
                    <button
                      onClick={() => { setQuizDirection('en-vi'); handleRestartQuiz(); }}
                      className={cn(
                        "px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer",
                        quizDirection === 'en-vi'
                          ? "bg-indigo-600 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Anh ➔ Việt
                    </button>
                    <button
                      onClick={() => { setQuizDirection('vi-en'); handleRestartQuiz(); }}
                      className={cn(
                        "px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer",
                        quizDirection === 'vi-en'
                          ? "bg-indigo-600 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Việt ➔ Anh
                    </button>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Điểm: {quizScore}/{totalQuizInRound}
                </span>
              </div>

              {quizCompleted ? (
                /* QUIZ COMPLETED SUMMARY */
                <div className="p-8 text-center space-y-4 border border-border rounded-xl bg-card">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-foreground">Hoàn thành bài Trắc Nghiệm! 🎉</h2>
                    <p className="text-xs text-muted-foreground">
                      Bạn đã hoàn thành lượt trắc nghiệm từ vựng.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 max-w-xs mx-auto text-center space-y-1">
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {quizScore} / {totalQuizInRound}
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">
                      Chính xác: <span className="text-emerald-600 font-extrabold">{Math.round((quizScore / totalQuizInRound) * 100)}%</span>
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleRestartQuiz}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Làm bài trắc nghiệm mới 🔄
                  </Button>
                </div>
              ) : currentQuizItem ? (
                /* FLAT QUIZ CONTENT */
                <div className="space-y-5 border border-border rounded-xl p-5 sm:p-6 bg-card">
                  {/* Progress Line */}
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${((quizIndex + (selectedQuizOption !== null ? 1 : 0)) / totalQuizInRound) * 100}%`
                      }}
                    />
                  </div>

                  {/* Question Prompt */}
                  <div className="text-center space-y-2 py-2">
                    <p className="text-xs font-bold text-muted-foreground">
                      {quizDirection === 'en-vi' ? 'Nghĩa của từ này là gì?' : 'Từ tiếng Anh của nghĩa này là gì?'}
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-2xl sm:text-4xl font-black text-foreground">
                        {quizDirection === 'en-vi' ? currentQuizItem.word : currentQuizItem.meaning}
                      </h2>
                      {quizDirection === 'en-vi' && (
                        <button
                          onClick={() => handlePlayAudio(currentQuizItem.word)}
                          className="p-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 6 Choice Buttons Grid (2 columns x 3 rows) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizOptions.map((opt, idx) => {
                      const isSelected = selectedQuizOption === opt;
                      const correctValue = quizDirection === 'en-vi' ? currentQuizItem.meaning : currentQuizItem.word;
                      const isCorrect = opt === correctValue;

                      let btnStyle = "bg-card border-border hover:border-indigo-500 hover:bg-secondary/40 text-foreground";

                      if (selectedQuizOption !== null) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                        } else {
                          btnStyle = "opacity-40 border-border/30 bg-card text-muted-foreground";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(opt)}
                          disabled={selectedQuizOption !== null}
                          className={cn(
                            "w-full p-3.5 rounded-lg border text-center text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition-all cursor-pointer min-h-[52px]",
                            btnStyle
                          )}
                        >
                          <span className="leading-snug text-left">{opt}</span>
                          {selectedQuizOption !== null && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          {selectedQuizOption !== null && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Question Action Button */}
                  {selectedQuizOption !== null && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        onClick={handleNextQuiz}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>
                          {quizIndex + 1 < totalQuizInRound ? 'Câu tiếp theo →' : 'Xem kết quả trắc nghiệm 🎉'}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            /* FLAT LUYỆN VIẾT TỪ VỰNG MODE */
            <div className="space-y-4">
              {spellingCompleted ? (
                /* SPELLING COMPLETED SUMMARY */
                <div className="p-8 text-center space-y-4 border border-border rounded-xl bg-card">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-foreground">Hoàn thành Luyện Viết Từ Vựng! 🎉</h2>
                    <p className="text-xs text-muted-foreground">
                      Bạn đã hoàn thành lượt luyện viết từ vựng.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 max-w-xs mx-auto text-center space-y-1">
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {spellingScore} / {totalSpellingInRound}
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">
                      Chính xác: <span className="text-emerald-600 font-extrabold">{Math.round((spellingScore / totalSpellingInRound) * 100)}%</span>
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleRestartSpelling}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Luyện viết lượt mới 🔄
                  </Button>
                </div>
              ) : currentSpellingItem ? (
                <div className="space-y-5 border border-border rounded-xl p-5 sm:p-6 bg-card">
                  {/* Top Banner inside Section */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Pencil className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-black text-foreground">
                          Luyện Viết Từ Vựng
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Đọc hiểu nghĩa và viết chính xác từng ký tự
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {spellingIndex + 1}/{totalSpellingInRound}
                    </span>
                  </div>

                  {/* Main Practice Inner Area */}
                  <div
                    onClick={() => spellingInputRef.current?.focus()}
                    className="bg-secondary/30 border border-border rounded-xl p-5 text-center space-y-5 cursor-text relative"
                  >
                    {/* Hidden Input for Keyboard Typing */}
                    <input
                      ref={spellingInputRef}
                      type="text"
                      value={spellingInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= currentSpellingItem.word.length) {
                          setSpellingInput(val);
                          setSpellingFeedback(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (spellingFeedback === 'correct') {
                            handleNextSpelling();
                          } else {
                            handleCheckSpelling();
                          }
                        }
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-text"
                      autoFocus
                    />

                    {/* Target Meaning Header */}
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 bg-secondary text-muted-foreground text-[10px] font-bold uppercase rounded border border-border">
                        Nghĩa của từ
                      </span>
                      <h3 className="text-xl sm:text-3xl font-black text-foreground">
                        {currentSpellingItem.meaning}
                      </h3>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Từ loại: <span className="uppercase font-extrabold">{currentSpellingItem.pos}</span>
                      </p>
                    </div>

                    {/* Character Letter Boxes Grid */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
                      {currentSpellingItem.word.split('').map((char, idx) => {
                        const isSpace = char === ' ' || char === '-';
                        if (isSpace) {
                          return <div key={idx} className="w-3" />;
                        }

                        const userChar = spellingInput[idx] || '';
                        const displayChar = showSpellingAnswer ? char : userChar;

                        let borderStyle = "border-border bg-card text-foreground";
                        if (spellingFeedback === 'correct') {
                          borderStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-black";
                        } else if (spellingFeedback === 'wrong') {
                          borderStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-300 font-black";
                        } else if (userChar || showSpellingAnswer) {
                          borderStyle = "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black";
                        }

                        return (
                          <div
                            key={idx}
                            className={cn(
                              "w-9 h-11 sm:w-11 sm:h-13 rounded-lg border text-center text-base sm:text-xl font-bold flex items-center justify-center uppercase select-none",
                              borderStyle
                            )}
                          >
                            {displayChar}
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback message */}
                    {spellingFeedback === 'correct' && (
                      <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Chính xác! Bấm "Enter" hoặc "Chuyển từ" để tiếp tục 🎉</span>
                      </div>
                    )}
                    {spellingFeedback === 'wrong' && (
                      <div className="text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Chưa chính xác, hãy thử lại hoặc bấm "Xem KQ"!</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSpellingAnswer(!showSpellingAnswer)}
                      className="rounded-lg gap-1 text-xs font-bold cursor-pointer border-border px-3.5 h-9"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{showSpellingAnswer ? 'Ẩn KQ' : 'Xem KQ'}</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCheckSpelling}
                        className={cn(
                          "rounded-lg gap-1 text-xs font-bold cursor-pointer px-4 h-9 transition-all",
                          spellingFeedback === 'correct'
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-border"
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Kiểm tra</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextSpelling}
                        className="rounded-lg gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 cursor-pointer"
                      >
                        <span>Chuyển từ →</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
