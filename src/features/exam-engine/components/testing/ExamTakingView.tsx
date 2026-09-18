import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { AnswerFormRenderer } from '@/components/common/AnswerFormRenderer';
import { QuestionStimulusRenderer } from '@/components/common/QuestionStimulusRenderer';
import { ProofImageUploader } from '@/components/common/ProofImageUploader';
import { MockExam, Question, StructuredAnswer } from '@/types';
import type { User } from 'firebase/auth';
import { formatTime } from '../../utils/examFormatters';
import { ExamSectionView } from '../../utils/examMatrix';
import { LocalProofImage } from '@/utils/proofImages';
import { isAnswerComplete } from '@/utils/answerValidator';
import { cn } from '@/utils/cn';
import { authService } from '@/services/authService';
import { QuickPassageModal, ReadingModalStimulusData } from './QuickPassageModal';
import {
  Timer,
  Pause,
  X,
  CheckSquare,
  BookOpen,
  Maximize2,
  Check,
  ShieldCheck
} from 'lucide-react';

export interface ExamTakingViewProps {
  currentExam?: MockExam;
  subjectLabel: string;
  selectedSubject: string;
  user: User | null;
  examQuestions: Question[];
  examSections: ExamSectionView[];
  answers: Record<string, string>;
  finalAnswers: Record<string, StructuredAnswer>;
  proofImagesByQuestion: Record<string, LocalProofImage[]>;
  timeLeft: number;
  isSubmittingExam: boolean;
  examSubmitError: string | null;
  onOptionSelect: (questionId: string, optLetter: string) => void;
  onInputChange: (questionId: string, val: string) => void;
  onFinalAnswerChange: (questionId: string, value: StructuredAnswer) => void;
  onProofImagesChange: (questionId: string, images: LocalProofImage[]) => void;
  onPauseAndSave: () => void;
  onSubmitExam: () => Promise<void>;
  onDiscardAndExit: () => void;
}

export const ExamTakingView: React.FC<ExamTakingViewProps> = ({
  currentExam,
  subjectLabel,
  selectedSubject,
  user,
  examQuestions,
  examSections,
  answers,
  finalAnswers,
  proofImagesByQuestion,
  timeLeft,
  isSubmittingExam,
  examSubmitError,
  onOptionSelect,
  onInputChange,
  onFinalAnswerChange,
  onProofImagesChange,
  onPauseAndSave,
  onSubmitExam,
  onDiscardAndExit
}) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeReadingModalStimulus, setActiveReadingModalStimulus] = useState<ReadingModalStimulusData | null>(null);
  const [passageFontSize, setPassageFontSize] = useState<number>(15);

  const answeredQuestionIds = new Set(
    examQuestions
      .filter(question => {
        if (question.answerSchema) {
          return isAnswerComplete(question, finalAnswers[question.id] ?? {});
        }
        return Boolean(answers[question.id]?.trim());
      })
      .map(question => question.id)
  );
  const unansweredCount = examQuestions.length - answeredQuestionIds.size;
  const completionPercent = examQuestions.length > 0
    ? Math.round((answeredQuestionIds.size / examQuestions.length) * 100)
    : 0;
  const timerIsUrgent = timeLeft <= 5 * 60;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header phòng thi nổi (Sticky Topbar) */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/60 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Bên trái: Phân loại & Tên đề thi */}
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {currentExam?.focus === 'theory' ? 'Kiểm tra lý thuyết' : 'Thi thử trực tuyến'}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
                  Mã {currentExam?.formCode || 'A'}
                </span>
              </div>
              <h3 className="truncate text-sm sm:text-base font-black text-foreground mt-0.5">
                {currentExam?.title ?? `Bài kiểm tra ${subjectLabel}`}
              </h3>
            </div>

            {/* Bên phải: Nút thao tác nhanh & Mini Timer trên Mobile */}
            <div className="flex shrink-0 items-center gap-2">
              <div role="timer" aria-label={`Thời gian còn lại ${formatTime(timeLeft)}`} className={cn(
                'flex lg:hidden min-h-10 items-center gap-1.5 bg-card border px-2.5 py-1.5 rounded-xl shadow-2xs text-xs font-black tabular-nums',
                timerIsUrgent ? 'border-red-500/40 text-red-600 dark:text-red-400 animate-pulse' : 'border-border text-foreground'
              )}>
                <Timer size={14} className={timerIsUrgent ? 'animate-pulse' : 'text-muted-foreground'} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={onPauseAndSave}
                className="min-h-10 px-3 text-xs font-bold text-foreground border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer rounded-xl"
                title="Tạm dừng bài thi và đóng băng đồng hồ đếm ngược"
              >
                <Pause size={14} /> <span className="hidden sm:inline">Tạm dừng</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExitConfirm(true)}
                className="min-h-10 min-w-10 px-2.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                aria-label="Thoát khỏi bài thi"
                title="Thoát bài thi"
              >
                <X size={15} /> <span className="hidden sm:inline">Thoát</span>
              </Button>
              <Button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmittingExam}
                className="lg:hidden min-h-10 px-3 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckSquare size={14} /> Nộp bài
              </Button>
            </div>
          </div>
        </div>
        {/* Thanh % tiến độ */}
        <div
          role="progressbar"
          aria-label="Tiến độ trả lời"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionPercent}
          className="h-1 overflow-hidden bg-secondary w-full"
        >
          <div className="h-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${completionPercent}%` }} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Guest Mode Indicator */}
        {!user && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Chế độ thi tự do: Bài làm đang được lưu tạm trên máy.
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await authService.signInWithGoogle();
                } catch (err: any) {
                  alert(err.message || 'Lỗi đăng nhập bằng Google.');
                }
              }}
              className="font-bold text-primary hover:underline cursor-pointer shrink-0"
            >
              Đăng nhập để lưu trữ tiến trình
            </button>
          </div>
        )}

        {/* Quick Nav Drawer trên Mobile (< lg) */}
        <nav aria-label="Điều hướng câu hỏi di động" className="block lg:hidden rounded-2xl border border-border/60 bg-card p-3 shadow-2xs">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Điều hướng nhanh</span>
            <span className={`text-[10px] font-bold ${unansweredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {unansweredCount > 0 ? `Còn ${unansweredCount} câu` : 'Đã làm hết'}
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {examQuestions.map((q, idx) => {
              const answered = answeredQuestionIds.has(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    const target = document.getElementById(`exam-question-${idx + 1}`);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={cn(
                    'h-9 min-w-9 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center',
                    answered
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-border bg-secondary/50 text-muted-foreground'
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái: Luồng câu hỏi làm bài */}
          <main className="lg:col-span-8 space-y-8 min-w-0">
            {examSections.map(section => (
              <section key={section.id} aria-labelledby={section.title ? `exam-section-${section.id}` : undefined} className="space-y-5">
                {section.title && (
                  <div id={`exam-section-${section.id}`} className="rounded-2xl border border-primary/15 bg-primary/[0.035] px-5 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-foreground">{section.title}</h4>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {section.entries.length} câu
                        {section.points !== undefined ? ` · ${section.points} điểm` : ''}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {section.entries.map(({ question: q, index: idx }, entryIdx) => {
                    const isChoice = q.options && q.options.length > 0;
                    const isAnswered = answeredQuestionIds.has(q.id);

                    const isSharedStimulus = Boolean(
                      q.stimulus &&
                      section.entries.filter(e => e.question.stimulus?.id && e.question.stimulus.id === q.stimulus?.id).length > 1
                    );
                    const sharedGroupEntries = isSharedStimulus
                      ? section.entries.filter(e => e.question.stimulus?.id === q.stimulus?.id)
                      : [];
                    const isFirstInSharedStimulus = isSharedStimulus && (
                      entryIdx === 0 || section.entries[entryIdx - 1]?.question.stimulus?.id !== q.stimulus?.id
                    );
                    const firstNum = sharedGroupEntries.length > 0 ? sharedGroupEntries[0].index + 1 : idx + 1;
                    const lastNum = sharedGroupEntries.length > 0 ? sharedGroupEntries[sharedGroupEntries.length - 1].index + 1 : idx + 1;

                    return (
                      <React.Fragment key={q.id}>
                        {isFirstInSharedStimulus && q.stimulus && (
                          <div
                            id={`exam-passage-${q.stimulus.id}`}
                            className="scroll-mt-28 rounded-2xl border-2 border-primary/25 bg-gradient-to-b from-card via-card to-primary/[0.02] p-5 sm:p-7 shadow-xs space-y-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-wider border border-primary/20">
                                  <BookOpen size={14} className="text-primary" />
                                  Đoạn văn đọc hiểu · Câu {firstNum} – Câu {lastNum}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-border/70 rounded-lg bg-secondary/40 p-0.5 text-xs font-bold text-muted-foreground">
                                  <button
                                    type="button"
                                    onClick={() => setPassageFontSize(prev => Math.max(prev - 1, 13))}
                                    className="px-2 py-0.5 hover:bg-card hover:text-foreground rounded transition-colors cursor-pointer"
                                    title="Thu nhỏ cỡ chữ"
                                  >
                                    A-
                                  </button>
                                  <span className="px-1.5 text-[11px] font-semibold select-none">Cỡ chữ</span>
                                  <button
                                    type="button"
                                    onClick={() => setPassageFontSize(prev => Math.min(prev + 1, 19))}
                                    className="px-2 py-0.5 hover:bg-card hover:text-foreground rounded transition-colors cursor-pointer"
                                    title="Phóng to cỡ chữ"
                                  >
                                    A+
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveReadingModalStimulus({
                                    stimulus: q.stimulus!,
                                    startNum: firstNum,
                                    endNum: lastNum
                                  })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 rounded-lg transition-colors cursor-pointer"
                                  title="Mở bài đọc trong cửa sổ riêng để dễ đối chiếu"
                                >
                                  <Maximize2 size={13} />
                                  <span className="hidden sm:inline">Cửa sổ đọc nổi</span>
                                </button>
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm font-medium italic text-muted-foreground leading-relaxed">
                              Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the correct answer to each of the questions from {firstNum} to {lastNum}.
                            </p>

                            {q.stimulus.title && (
                              <div className="py-2 text-center">
                                <h3 className="text-base sm:text-lg font-black tracking-wide uppercase text-foreground leading-snug">
                                  {q.stimulus.title}
                                </h3>
                                <div className="w-16 h-0.5 bg-primary/40 mx-auto mt-2 rounded-full" />
                              </div>
                            )}

                            {q.stimulus.content && (
                              <div
                                style={{ fontSize: `${passageFontSize}px` }}
                                className="leading-relaxed sm:leading-7 text-foreground/90 font-normal space-y-3.5 pt-1 select-text"
                              >
                                {q.stimulus.content.split(/\n\s*\n/).map((para, pIdx) => (
                                  <p key={pIdx} className="indent-4 sm:indent-6 text-justify">
                                    <LatexRenderer text={para.trim()} />
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <Card
                          id={`exam-question-${idx + 1}`}
                          key={q.id}
                          aria-labelledby={`exam-question-title-${idx + 1}`}
                          className={cn(
                            "scroll-mt-28 border transition-all duration-200 rounded-2xl bg-card overflow-hidden",
                            isAnswered
                              ? "border-border/90 shadow-2xs"
                              : "border-border/70"
                          )}
                        >
                          <div className="flex items-center justify-between p-4 sm:px-6 py-3 border-b border-border/40 bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-black text-xs border border-primary/20">
                                Câu {idx + 1}
                              </span>
                              {q.cognitiveLevel && (
                                <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                  {q.cognitiveLevel === 'recognition' ? 'Nhận biết' : q.cognitiveLevel === 'understanding' ? 'Thông hiểu' : q.cognitiveLevel === 'application' ? 'Vận dụng' : 'Vận dụng cao'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {isSharedStimulus && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReadingModalStimulus({
                                      stimulus: q.stimulus!,
                                      startNum: firstNum,
                                      endNum: lastNum
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg border border-primary/25"
                                  title="Mở bài đọc để đối chiếu khi làm câu hỏi này"
                                >
                                  <BookOpen size={12} />
                                  <span>Xem bài đọc</span>
                                </button>
                              )}

                              {isAnswered ? (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                  <Check size={11} strokeWidth={3} /> Đã trả lời
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  Chưa trả lời
                                </span>
                              )}
                            </div>
                          </div>

                          <CardContent className="p-5 sm:p-6 space-y-5">
                            {!isSharedStimulus && <QuestionStimulusRenderer question={q} />}

                            <div className="text-sm sm:text-base font-semibold leading-relaxed text-foreground">
                              <LatexRenderer text={q.content} />
                            </div>

                            {isChoice && q.options ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {q.options.map((opt: string, i: number) => {
                                  const optLetter = opt.charAt(0);
                                  const isSelected = answers[q.id] === optLetter;
                                  const optText = opt.replace(/^[A-D]\.\s*/, '');
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      aria-pressed={isSelected}
                                      onClick={() => onOptionSelect(q.id, optLetter)}
                                      className={cn(
                                        "flex items-start gap-3 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 active:scale-[0.99] cursor-pointer text-left group",
                                        isSelected
                                          ? "bg-primary/10 border-primary text-primary shadow-2xs ring-1 ring-primary/30"
                                          : "bg-card border-border/70 hover:border-border hover:bg-secondary/40 text-foreground"
                                      )}
                                    >
                                      <span className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors border",
                                        isSelected
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "bg-secondary text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-foreground"
                                      )}>
                                        {optLetter}
                                      </span>
                                      <span className="flex-1 pt-0.5 leading-relaxed font-semibold">
                                        <LatexRenderer text={optText || opt} />
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : q.answerSchema ? (
                              <AnswerFormRenderer
                                question={q}
                                value={finalAnswers[q.id] ?? {}}
                                onChange={(value) => onFinalAnswerChange(q.id, value)}
                              />
                            ) : (
                              <div className="space-y-2 pt-1">
                                <label htmlFor={`exam-answer-${q.id}`} className="text-xs font-bold text-muted-foreground block">
                                  {selectedSubject === 'math' ? 'Đáp số của bạn:' : 'Đáp án của bạn:'}
                                </label>
                                <input
                                  id={`exam-answer-${q.id}`}
                                  type="text"
                                  inputMode={q.validatorType === 'number' ? 'decimal' : 'text'}
                                  value={answers[q.id] || ''}
                                  onChange={(e) => onInputChange(q.id, e.target.value)}
                                  placeholder={selectedSubject === 'math' ? 'Nhập đáp số...' : 'Nhập câu trả lời...'}
                                  className="w-full sm:max-w-md bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold"
                                />
                              </div>
                            )}

                            {selectedSubject === 'math' && q.answerSchema?.proofImageRequired && (
                              <ProofImageUploader
                                images={proofImagesByQuestion[q.id] ?? []}
                                onChange={(images) => onProofImagesChange(q.id, images)}
                                disabled={isSubmittingExam}
                                required={q.answerSchema?.proofImageRequired ?? false}
                                cloudEnabled={Boolean(user)}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </React.Fragment>
                    );
                  })}
                </div>
              </section>
            ))}

            {examSubmitError && (
              <p role="alert" className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {examSubmitError}
              </p>
            )}

            {/* Nộp bài thi cuối trang */}
            <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                Đã trả lời <strong className="text-foreground font-bold">{answeredQuestionIds.size}/{examQuestions.length}</strong> câu ({completionPercent}%)
                {unansweredCount > 0 && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold">• Còn {unansweredCount} câu chưa làm</span>
                )}
              </div>
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmittingExam}
                className="w-full sm:w-auto px-8 h-12 font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex items-center justify-center gap-2 rounded-xl cursor-pointer"
              >
                <CheckSquare size={16} /> {isSubmittingExam ? 'Đang nộp bài...' : 'Nộp bài thi thử & Xem kết quả'}
              </Button>
            </div>
          </main>

          {/* Cột phải: Sticky HUD Cockpit */}
          <aside aria-label="Bảng điều khiển phòng thi" className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            {/* Thẻ 1: Đồng hồ số đếm ngược */}
            <Card className="border-border shadow-sm rounded-2xl bg-card overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Timer size={14} className={timerIsUrgent ? "text-red-500 animate-pulse" : "text-primary"} />
                    Thời gian còn lại
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md",
                    timerIsUrgent ? "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse" : "bg-secondary text-muted-foreground"
                  )}>
                    {timerIsUrgent ? 'Sắp hết giờ' : 'Đang tính giờ'}
                  </span>
                </div>
                <div className={cn(
                  "text-3xl font-black tabular-nums tracking-tight pt-1.5 flex items-center justify-center py-2",
                  timerIsUrgent ? "text-red-600 dark:text-red-400" : "text-foreground"
                )}>
                  {formatTime(timeLeft)}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Tiến độ bài làm</span>
                  <span className="text-foreground">{answeredQuestionIds.size}/{examQuestions.length} câu ({completionPercent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thẻ 2: Ma trận câu hỏi 1 chạm */}
            <Card className="border-border shadow-sm rounded-2xl bg-card overflow-hidden">
              <CardHeader className="p-4 pb-2.5 border-b border-border/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Bảng câu hỏi ({examQuestions.length})
                  </CardTitle>
                  <span className={`text-[11px] font-bold ${unansweredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {unansweredCount > 0 ? `Còn ${unansweredCount} câu` : 'Đã làm hết'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 border-t border-border/30">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Đã làm ({answeredQuestionIds.size})
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Chưa làm ({unansweredCount})
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5 max-h-[340px] overflow-y-auto no-scrollbar">
                {examSections.map(section => (
                  <div key={section.id} className="space-y-1.5">
                    {section.title && (
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>{section.title.replace(/^Phần\s+[IVX]+\.\s*/i, '')}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-6 gap-1.5">
                      {section.entries.map(({ question, index }) => {
                        const answered = answeredQuestionIds.has(question.id);
                        return (
                          <button
                            key={question.id}
                            type="button"
                            onClick={() => {
                              const target = document.getElementById(`exam-question-${index + 1}`);
                              if (target) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={cn(
                              "h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border",
                              answered
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                : "bg-secondary/40 border-border/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                            title={`Câu ${index + 1}${answered ? ' (Đã làm)' : ' (Chưa làm)'}`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="p-4 pt-3 border-t border-border/40 flex flex-col gap-2.5 bg-secondary/10">
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={isSubmittingExam}
                  className="w-full h-11 font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
                >
                  <CheckSquare size={15} /> {isSubmittingExam ? 'Đang lưu bài...' : 'Nộp bài thi & Xem điểm'}
                </Button>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onPauseAndSave}
                    className="h-9 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-lg border-border"
                  >
                    <Pause size={13} /> Tạm dừng
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExitConfirm(true)}
                    className="h-9 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 rounded-lg border-border"
                  >
                    <X size={13} /> Thoát ra
                  </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground font-normal flex items-center justify-center gap-1 pt-0.5">
                  <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                  Tự động lưu bài khi chọn đáp án
                </p>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>

      {/* Modal xác nhận nộp bài & thoát bài */}
      <ConfirmationModal
        isOpen={showSubmitConfirm}
        title="Xác nhận nộp bài"
        description={unansweredCount > 0
          ? `Bạn còn ${unansweredCount} câu chưa trả lời. Các câu này sẽ được tính là sai nếu bạn nộp bài ngay.`
          : 'Bạn đã trả lời tất cả câu hỏi. Hãy xác nhận để nộp bài và xem kết quả.'}
        confirmLabel={unansweredCount > 0 ? 'Vẫn nộp bài' : 'Nộp bài'}
        cancelLabel="Kiểm tra lại"
        onConfirm={() => {
          setShowSubmitConfirm(false);
          void onSubmitExam();
        }}
        onCancel={() => setShowSubmitConfirm(false)}
      />
      <ConfirmationModal
        isOpen={showExitConfirm}
        title="Tạm dừng hoặc Thoát bài thi?"
        description="Tiến trình làm bài và thời gian còn lại của bạn đã được tự động lưu. Bạn có thể chọn tạm dừng để tiếp tục làm sau hoặc hủy bỏ lượt thi này."
        confirmLabel="Tạm dừng & Lưu làm sau"
        cancelLabel="Hủy và xóa lượt thi"
        variant="primary"
        onConfirm={onPauseAndSave}
        onCancel={() => {
          setShowExitConfirm(false);
          onDiscardAndExit();
        }}
      />
      <QuickPassageModal
        modalData={activeReadingModalStimulus}
        onClose={() => setActiveReadingModalStimulus(null)}
        fontSize={passageFontSize}
      />
    </div>
  );
};
