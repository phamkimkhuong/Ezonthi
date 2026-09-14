import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, RotateCcw, Award, Trophy, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuizSample {
  id: string;
  subject: string;
  gradeBadge: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  tip: string;
}

const QUIZ_SAMPLES: QuizSample[] = [
  {
    id: 'math',
    subject: 'Toán vào 10',
    gradeBadge: 'Hàm số bậc nhất',
    question: 'Cho hàm số bậc nhất y = (m - 2)x + 5. Giá trị của tham số m để hàm số luôn đồng biến trên ℝ là:',
    options: [
      { id: 'A', text: 'm > 2' },
      { id: 'B', text: 'm < 2' },
      { id: 'C', text: 'm ≥ 2' },
      { id: 'D', text: 'm ≠ 2' }
    ],
    correctId: 'A',
    explanation: 'Hàm số bậc nhất y = ax + b luôn đồng biến trên ℝ khi và chỉ khi hệ số a > 0. Ở đây a = m - 2 > 0 ⇔ m > 2.',
    tip: 'Lỗi thường gặp: Học sinh hay nhầm lẫn giữa đồng biến (a > 0) và xác định (a ≠ 0).'
  },
  {
    id: 'english',
    subject: 'Tiếng Anh vào 10',
    gradeBadge: 'Câu điều kiện loại 1',
    question: 'Complete the sentence: "If we _______ polluting the water, many marine creatures will survive."',
    options: [
      { id: 'A', text: 'stopped' },
      { id: 'B', text: 'stop' },
      { id: 'C', text: 'will stop' },
      { id: 'D', text: 'have stopped' }
    ],
    correctId: 'B',
    explanation: 'Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra ở hiện tại/tương lai: If + S + V(hiện tại đơn), S + will + V(nguyên mẫu). Mệnh đề If dùng "stop".',
    tip: 'Dấu hiệu nhận biết: Mệnh đề chính có "will survive", chỉ ra cấu trúc First Conditional.'
  }
];

export const InteractiveQuizHero: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const activeQuiz = QUIZ_SAMPLES[activeIdx];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === activeQuiz.correctId;

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);

    if (optionId === activeQuiz.correctId) {
      void import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.7 }
        });
      });
    }
  };

  const handleSwitchTab = (index: number) => {
    setActiveIdx(index);
    setSelectedOption(null);
  };

  const handleReset = () => {
    setSelectedOption(null);
  };

  return (
    <div className="w-full relative py-6 sm:py-8">
      
      {/* FLOATING SATELLITE 1 (TOP-RIGHT): Đặt cân đối trên mép trên, không bị nhô ra ngoài lề */}
      <aside aria-label="Thành tích học sinh nổi bật" className="absolute top-1 sm:top-2 right-4 sm:right-8 z-20 satellite-pill bg-card/95 border border-emerald-500/30 px-3.5 sm:px-4 py-2 rounded-2xl flex items-center gap-2.5 animate-float shadow-xl -translate-y-1/2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Trophy size={16} />
        </span>
        <div className="text-left whitespace-nowrap">
          <p className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">Đỗ NV1 Tuyển Sinh</p>
          <p className="text-xs font-black text-foreground">98.4% Học sinh đỗ NV1</p>
        </div>
      </aside>

      {/* FLOATING SATELLITE 2 (BOTTOM-LEFT): Đặt cân đối trên mép dưới, không bị nhô ra ngoài lề */}
      <aside aria-label="Trợ lý AI gợi ý" className="absolute bottom-1 sm:bottom-2 left-4 sm:left-8 z-20 satellite-pill bg-card/95 border border-blue-500/30 px-3.5 sm:px-4 py-2 rounded-2xl flex items-center gap-2.5 animate-float [animation-delay:2s] shadow-xl translate-y-1/2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-primary shrink-0">
          <Bot size={16} />
        </span>
        <div className="text-left whitespace-nowrap">
          <p className="text-[10px] uppercase font-black tracking-wider text-primary">Gia sư AI Socratic</p>
          <p className="text-xs font-black text-foreground">Gợi ý phương pháp 1-1</p>
        </div>
      </aside>

      {/* BACKGROUND AMBIENT GLOW */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-amber-500/15 rounded-3xl blur-2xl opacity-75 -z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* STUDIO STAGE WINDOW */}
      <div className="studio-stage transition-all relative z-10">
        
        {/* macOS Style Window Title Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-border/80 bg-secondary/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground ml-1.5 hidden md:inline truncate">
              ezonthi Studio • Luyện Đề
            </span>
          </div>

          <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-lg border border-border/60 shrink-0">
            {QUIZ_SAMPLES.map((sample, idx) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSwitchTab(idx)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeIdx === idx
                    ? 'bg-card text-foreground shadow-2xs font-extrabold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {sample.subject}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Content Area */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Question Topic Pill */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              <Award size={12} className="text-primary" />
              {activeQuiz.gradeBadge}
            </span>
            {isAnswered && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> Làm lại
              </button>
            )}
          </div>

          {/* Question Content */}
          <p className="text-sm sm:text-base font-black text-foreground leading-relaxed">
            {activeQuiz.question}
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {activeQuiz.options.map(opt => {
              const isThisSelected = selectedOption === opt.id;
              const isThisCorrect = opt.id === activeQuiz.correctId;

              let btnStyle = 'border-border/80 bg-card hover:border-primary/60 hover:bg-secondary/50 text-foreground cursor-pointer hover:scale-[1.01] active:scale-[0.99]';

              if (isAnswered) {
                if (isThisCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-sm';
                } else if (isThisSelected) {
                  btnStyle = 'border-destructive bg-destructive/10 text-destructive font-bold';
                } else {
                  btnStyle = 'border-border/40 opacity-40 bg-card text-muted-foreground';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  disabled={isAnswered}
                  className={`relative flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      isAnswered && isThisCorrect
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : isAnswered && isThisSelected
                        ? 'bg-destructive text-white shadow-2xs'
                        : 'bg-secondary text-foreground'
                    }`}>
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>

                  {isAnswered && isThisCorrect && (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-1" />
                  )}
                  {isAnswered && isThisSelected && !isThisCorrect && (
                    <XCircle size={16} className="text-destructive shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Feedback Card */}
          {isAnswered && (
            <div className="p-3.5 rounded-xl bg-secondary/90 border border-border/80 text-xs leading-relaxed animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isCorrect ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-extrabold">
                    <CheckCircle2 size={14} /> Tuyệt vời! Bạn nắm rất vững kiến thức.
                  </span>
                ) : (
                  <span className="text-destructive flex items-center gap-1 font-extrabold">
                    <XCircle size={14} /> Chưa chính xác, hãy xem phân tích nhé:
                  </span>
                )}
              </div>
              <p className="text-foreground font-medium mt-1">{activeQuiz.explanation}</p>
              <p className="text-muted-foreground mt-1.5 italic">💡 {activeQuiz.tip}</p>
            </div>
          )}

          {/* Footer Bar Inside Studio */}
          <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Sparkles size={13} className="text-amber-500" />
              Hơn 13,000+ câu hỏi kèm phân tích tương tự
            </p>
            <Link
              to="/dashboard/"
              className="btn-shimmer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-sm shrink-0"
            >
              Luyện tiếp câu khác <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

