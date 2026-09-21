import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import { QuestionStimulusRenderer } from '@/components/common/QuestionStimulusRenderer';
import { ProofImageUploader } from '@/components/common/ProofImageUploader';
import { MathKeyboard } from '@/components/common/MathKeyboard';
import { Question, QuestionType, Solution, StructuredAnswer, SubjectCode } from '@/types';
import { AnswerFormRenderer } from '@/components/common/AnswerFormRenderer';
import { LocalProofImage, revokeLocalProofImages } from '@/utils/proofImages';
import { cn } from '@/utils/cn';
import { getSubjectTheme } from '@/utils/theme';
import { BookOpen, Lightbulb, ArrowLeft, ArrowRight, ChevronUp, ShieldCheck, Lock } from 'lucide-react';
import { QuestionTypeGuidance } from './QuestionTypeGuidance';

interface QuestionCardProps {
  currentQuestion: Question;
  currentQuestionType: QuestionType | null;
  questionTypeId: string | undefined;
  selectedOption: string | null;
  handleOptionSelect: (letter: string) => void;
  setSelectedOption: (val: string | null) => void;
  hintLevel: number;
  triggerNextHint: () => void;
  solutionDetail: Solution | null;
  isMath: boolean;
  proofImages: LocalProofImage[];
  setProofImages: React.Dispatch<React.SetStateAction<LocalProofImage[]>>;
  isSubmitting: boolean;
  submitError: string | null;
  user: any;
  totalUploadStats: any;
  handlePauseUpload: () => void;
  handleResumeUpload: () => void;
  handleCancelUpload: () => void;
  submitDisabled: boolean;
  handleSubmit: () => void;
  currentIdx: number;
  questionsLength: number;
  setCurrentIdx: (val: number) => void;
  resetQuestionState: () => void;
  routeSubject: SubjectCode;
  structuredAnswer: StructuredAnswer;
  setStructuredAnswer: (val: StructuredAnswer) => void;
  disableHints?: boolean;
  onNavigateQuestion?: (idx: number) => void;
}

/**
 * Tự động lọc bỏ các cụm từ chốt đáp án lộ liễu như "Chọn A", "Do đó chọn B", "Đáp án C", "Nên chọn D" trong nội dung gợi ý trước khi nộp bài.
 */
const sanitizeHintText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/(,?\s*(do đó|vậy|thế nên|nên|suy ra)?\s*(chọn|đáp án|đáp số)\s+[A-D]\b\.?)/gi, '.')
    .replace(/\s+\./g, '.')
    .trim();
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  currentQuestionType,
  questionTypeId,
  selectedOption,
  handleOptionSelect,
  setSelectedOption,
  hintLevel,
  triggerNextHint,
  solutionDetail,
  isMath,
  proofImages,
  setProofImages,
  isSubmitting,
  submitError,
  user,
  totalUploadStats,
  handlePauseUpload,
  handleResumeUpload,
  handleCancelUpload,
  submitDisabled,
  handleSubmit,
  currentIdx,
  questionsLength,
  setCurrentIdx,
  resetQuestionState,
  routeSubject,
  structuredAnswer,
  setStructuredAnswer,
  disableHints = false,
  onNavigateQuestion,
}) => {
  const theme = getSubjectTheme(routeSubject);
  const mathInputRef = useRef<HTMLInputElement>(null);

  // Phân tách options từ content nếu validatorType === 'choice' và không có options riêng biệt
  let displayOptions = currentQuestion.options;
  let cleanContent = currentQuestion.content;

  if (
    (!displayOptions || displayOptions.length === 0) &&
    currentQuestion.validatorType === 'choice' &&
    currentQuestion.content.includes('\nA.')
  ) {
    const parts = currentQuestion.content.split(/\n(?=[A-D]\.\s)/);
    if (parts.length >= 2) {
      cleanContent = parts[0];
      displayOptions = parts.slice(1).map(opt => opt.trim());
    }
  }

  const hasOptions = Boolean(displayOptions && displayOptions.length > 0);
  const isChoiceQuestion = currentQuestion.validatorType === 'choice' || hasOptions;
  const isAutoCheckMath = isMath && !isChoiceQuestion && Boolean(currentQuestion.validatorType) && currentQuestion.validatorType !== 'manual';

  const keyboardLayout = currentQuestion.topicId === 'math10-t3'
    ? 'algebra'
    : currentQuestion.topicId === 'math10-t2'
      ? 'inequality'
      : currentQuestion.topicId === 'math10-t4'
        ? 'geometry'
        : currentQuestion.questionTypeId === 'math10-qt7'
          ? 'dot-product'
          : currentQuestion.topicId === 'math10-t5'
            ? 'vector'
            : 'set';

  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-3 flex flex-wrap items-center gap-2 font-sans">
        <BookOpen size={16} className={cn("shrink-0", theme.iconColor)} />
        <span className="text-foreground text-xs sm:text-sm font-black">Luyện tập: {currentQuestionType?.name ?? 'Câu hỏi'}</span>
        {disableHints && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-700 dark:text-cyan-300">
            <ShieldCheck size={11} aria-hidden="true" /> Kiểm tra làm chủ
          </span>
        )}
      </div>
      <div className="space-y-5">
        <QuestionStimulusRenderer question={currentQuestion} />

        {/* Đề bài */}
        <div className="text-sm font-bold leading-relaxed text-foreground bg-secondary/30 dark:bg-slate-950/20 p-5 rounded-2xl border border-border/20 shadow-inner font-sans">
          <LatexRenderer text={cleanContent} />
        </div>

        {/* Vùng chọn đáp án */}
        <div className="space-y-4">
          {isAutoCheckMath ? (
            currentQuestion.answerSchema ? (
              <AnswerFormRenderer
                question={currentQuestion}
                value={structuredAnswer}
                onChange={setStructuredAnswer}
                disabled={isSubmitting}
              />
            ) : (
              // Ô nhập liệu kèm bàn phím ảo toán học
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-wider block">
                    Nhập đáp án cuối cùng của em:
                  </label>
                  <input
                    ref={mathInputRef}
                    type="text"
                    value={selectedOption || ''}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    placeholder="Ví dụ: (1; 3] hoặc [0; 2)..."
                    disabled={isSubmitting}
                    className="w-full p-4.5 rounded-2xl text-xs font-black border border-border/60 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && selectedOption && !isSubmitting) {
                        handleSubmit();
                      }
                    }}
                  />
                </div>

                <MathKeyboard
                  inputRef={mathInputRef}
                  value={selectedOption || ''}
                  onChange={setSelectedOption}
                  layout={keyboardLayout}
                />
              </div>
            )
          ) : currentQuestion.questionTypeId === 'eng-qt8' ? (
            // Custom selector for Gap Filling
            <div className="space-y-4">
              <span className="text-xs font-black text-muted-foreground block mb-2 uppercase tracking-wider">Chọn đáp án cho từng chỗ trống:</span>
              <div className="space-y-4">
                {currentQuestion.answerSchema?.fields.map((field, idx) => {
                  const rawOptions = currentQuestion.options?.[idx] || '';
                  const choices = rawOptions.split(',').map(c => c.trim());
                  const letters = ['A', 'B', 'C', 'D'];
                  const currentValue = structuredAnswer[field.key] ?? '';

                  return (
                    <div key={field.key} className="p-4.5 bg-secondary/20 dark:bg-slate-900/40 rounded-2xl border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all">
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Vòng tròn số thứ tự chỗ trống đổi màu theo môn học */}
                        <span className={cn(
                          "w-6.5 h-6.5 rounded-xl text-white flex items-center justify-center text-xs font-black shadow-md",
                          routeSubject === 'math' ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-indigo-500/10' :
                            routeSubject === 'chemistry' ? 'bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-emerald-500/10' :
                              'bg-gradient-to-tr from-purple-500 to-purple-600 shadow-purple-500/10'
                        )}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-extrabold text-foreground">{field.label}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-xl">
                        {choices.map((choice, cIdx) => {
                          const letter = letters[cIdx];
                          const isSelected = currentValue === letter || currentValue.toLowerCase() === choice.toLowerCase();

                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => {
                                setStructuredAnswer({
                                  ...structuredAnswer,
                                  [field.key]: letter
                                });
                              }}
                              disabled={isSubmitting}
                              className={cn(
                                "px-3.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all duration-200 active:scale-95 cursor-pointer text-left flex items-center gap-1.5",
                                isSelected
                                  ? (routeSubject === 'math' ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm font-black" :
                                    routeSubject === 'chemistry' ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm font-black" :
                                      "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 shadow-sm font-black")
                                  : "bg-card border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground"
                              )}
                            >
                              <span className={cn(
                                "text-[9px] w-4.5 h-4.5 rounded-md flex items-center justify-center font-black shrink-0",
                                isSelected
                                  ? (routeSubject === 'math' ? "bg-indigo-600 text-white" :
                                    routeSubject === 'chemistry' ? "bg-emerald-600 text-white" :
                                      "bg-purple-600 text-white")
                                  : "bg-secondary text-muted-foreground"
                              )}>{letter}</span>
                              <span className="truncate">{choice}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentQuestion.questionTypeId === 'eng-qt13' && currentQuestion.answerSchema ? (
            // Custom selector for Reading Comprehension (Đọc hiểu trắc nghiệm)
            <div className="space-y-6 animate-fade-in">
              <span className="text-xs font-black text-muted-foreground block uppercase tracking-wider">Chọn câu trả lời đúng cho từng câu hỏi bên dưới:</span>
              <div className="space-y-6">
                {currentQuestion.answerSchema.fields.map((field, idx) => {
                  const rawOptions = currentQuestion.options?.[idx] || '';
                  const choices = rawOptions.split('|').map(c => c.trim());
                  const letters = ['A', 'B', 'C', 'D'];
                  const currentValue = structuredAnswer[field.key] ?? '';

                  return (
                    <div key={field.key} className="p-5 bg-secondary/15 dark:bg-slate-900/30 rounded-2xl border border-border/40 space-y-4 transition-all hover:border-primary/20">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-md shadow-primary/15 mt-0.5 animate-float">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-black text-foreground leading-relaxed font-sans">
                          {field.label}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {choices.map((choice, cIdx) => {
                          const letter = letters[cIdx];
                          const isSelected = currentValue === letter || currentValue.toLowerCase() === choice.toLowerCase();
                          const cleanChoice = choice.replace(/^[A-D]\.\s*/i, '');

                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => {
                                setStructuredAnswer({
                                  ...structuredAnswer,
                                  [field.key]: letter
                                });
                              }}
                              disabled={isSubmitting}
                              className={cn(
                                "w-full px-4.5 py-3.5 rounded-2xl text-xs font-extrabold border transition-all duration-200 active:scale-[0.99] cursor-pointer text-left flex items-start gap-3",
                                isSelected
                                  ? "bg-primary/10 border-primary text-primary shadow-sm font-black"
                                  : "bg-card border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground hover:translate-x-1"
                              )}
                            >
                              <span className={cn(
                                "text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-black shrink-0 mt-0.5",
                                isSelected ? "bg-primary text-white animate-pulse" : "bg-secondary text-muted-foreground"
                              )}>{letter}</span>
                              <span className="leading-relaxed">{cleanChoice}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentQuestion.questionTypeId === 'eng-qt14' && currentQuestion.answerSchema ? (
            // Custom selector for Reading True/False (Đọc hiểu Đúng / Sai)
            <div className="space-y-6 animate-fade-in">
              <span className="text-xs font-black text-muted-foreground block uppercase tracking-wider">Đọc các nhận định dưới đây và chọn Đúng (T - True) hoặc Sai (F - False):</span>
              <div className="space-y-4">
                {currentQuestion.answerSchema.fields.map((field, idx) => {
                  const currentValue = structuredAnswer[field.key] ?? '';
                  const choices = ['T', 'F'];

                  return (
                    <div key={field.key} className="p-4.5 bg-secondary/15 dark:bg-slate-900/30 rounded-2xl border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/20">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-md shadow-primary/10 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-extrabold text-foreground leading-relaxed font-sans">
                          {field.label}
                        </p>
                      </div>

                      <div className="flex gap-2.5 shrink-0 self-end sm:self-center">
                        {choices.map((choice) => {
                          const isSelected = currentValue === choice;
                          const isTrue = choice === 'T';

                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => {
                                setStructuredAnswer({
                                  ...structuredAnswer,
                                  [field.key]: choice
                                });
                              }}
                              disabled={isSubmitting}
                              className={cn(
                                "px-4.5 py-2.5 rounded-xl text-xs font-black border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 w-26 h-10",
                                isSelected
                                  ? isTrue
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black shadow-sm shadow-emerald-500/5 animate-pulse-glow"
                                    : "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-black shadow-sm shadow-rose-500/5 animate-pulse-glow"
                                  : "bg-card border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground"
                              )}
                            >
                              {choice === 'T' ? 'True (T)' : 'False (F)'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentQuestion.answerSchema ? (
            <AnswerFormRenderer
              question={currentQuestion}
              value={structuredAnswer}
              onChange={setStructuredAnswer}
              disabled={isSubmitting}
            />
          ) : (
            // Trắc nghiệm hoặc tự điền từ (fill-in-the-blank) cho môn Anh
            <div className={cn(
              "grid gap-3.5",
              displayOptions && displayOptions.length > 0 && displayOptions.every(opt => opt.length < 80)
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            )}>
              {displayOptions && displayOptions.length > 0 ? (
                displayOptions.map((opt: string, i: number) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const hasPrefix = /^[A-D]\.\s*/i.test(opt);
                  const optLetter = hasPrefix ? opt.charAt(0).toUpperCase() : (letters[i] || String.fromCharCode(65 + i));
                  const isSelected = selectedOption === optLetter;
                  const cleanOpt = hasPrefix ? opt.replace(/^[A-D]\.\s*/i, '') : opt;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleOptionSelect(optLetter)}
                      className={cn(
                        "w-full text-left p-4.5 rounded-2xl text-xs font-extrabold border transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-3",
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5 font-black'
                          : 'bg-card border-border/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/5 text-foreground hover:translate-x-1'
                      )}
                    >
                      <span className={cn(
                        "text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-black shrink-0",
                        isSelected ? "bg-primary text-white animate-pulse" : "bg-secondary text-muted-foreground"
                      )}>{optLetter}</span>
                      <LatexRenderer text={cleanOpt} />
                    </button>
                  );
                })
              ) : (
                // Điền từ tự do hoặc nhập số
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                      {currentQuestion.questionTypeId === 'eng-qt11'
                        ? 'Sửa lại từ sai:'
                        : ['physics', 'chemistry', 'biology', 'math'].includes(routeSubject || '')
                          ? 'Đáp án của bạn (Nhập giá trị số):'
                          : 'Đáp án của bạn:'}
                    </label>
                    {['physics', 'chemistry', 'biology', 'math'].includes(routeSubject || '') && (
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        Chấp nhận cả dấu phẩy (,) và dấu chấm (.)
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={selectedOption || ''}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    placeholder={
                      currentQuestion.questionTypeId === 'eng-qt11'
                        ? "Nhập từ sửa lại (ví dụ: tired hoặc tiring -> tired)..."
                        : currentQuestion.questionTypeId === 'eng-qt15'
                          ? "Nhập phần viết lại (ví dụ: he knew the way)..."
                          : routeSubject === 'english'
                            ? "Nhập từ cần điền (ví dụ: inventions)..."
                            : "Nhập giá trị số (ví dụ: 10 hoặc 5,2)..."
                    }
                    className="w-full p-4.5 rounded-2xl text-xs font-extrabold border border-border/60 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && selectedOption && !isSubmitting) {
                        handleSubmit();
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Nút gợi ý thông minh (ẩn đối với môn Lịch sử) */}
          {solutionDetail && questionTypeId !== 'eng-qt6' && routeSubject !== 'history' && !disableHints && (() => {
            const hasTypeGuidance = Boolean(currentQuestionType);
            const maxAllowedSteps = Math.max(0, solutionDetail.detailedSteps.length - 1);
            const maxHintLevelBeforeSubmit = (hasTypeGuidance ? 1 : 0) + maxAllowedSteps;
            const currentDisplayedSteps = Math.min(maxAllowedSteps, Math.max(0, hintLevel - (hasTypeGuidance ? 1 : 0)));
            const isMaxHintReached = hintLevel >= maxHintLevelBeforeSubmit && maxHintLevelBeforeSubmit > 0;

            return (
              <div className="flex flex-col gap-2 pt-3">
                <button
                  type="button"
                  onClick={triggerNextHint}
                  className={cn(
                    "self-start text-[11px] font-black flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-xl border transition-all duration-300 shadow-sm active:scale-95",
                    routeSubject === 'math' ? "text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/5" : "text-violet-500 hover:text-violet-600 hover:bg-violet-500/5",
                    getSubjectTheme(routeSubject).bg,
                    getSubjectTheme(routeSubject).border
                  )}
                >
                  {isMaxHintReached ? (
                    <>
                      <ChevronUp size={14} className="text-amber-500 animate-bounce" />
                      <span>Thu gọn gợi ý</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb size={14} className="text-amber-500 animate-pulse" />
                      <span>
                        {hintLevel === 0
                          ? 'Nhận dạng dạng bài'
                          : `Gợi ý tiếp theo (Bước ${currentDisplayedSteps + 1})`}
                      </span>
                    </>
                  )}
                </button>

                {hintLevel > 0 && (
                  <div className="p-4.5 bg-amber-500/5 border border-amber-500/15 rounded-2xl space-y-3.5 animate-fade-in">
                    {currentQuestionType && <QuestionTypeGuidance questionType={currentQuestionType} compact />}

                    {/* Hiển thị các bước suy luận trung gian (các bước từ 1 đến N - 1) */}
                    {solutionDetail.detailedSteps
                      .slice(0, currentDisplayedSteps)
                      .map((step: any, sIdx: number) => {
                        const cleanExplanation = sanitizeHintText(step.explanation);
                        return (
                          <div key={sIdx} className="text-xs font-semibold text-muted-foreground leading-relaxed space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                              <span className="w-4.5 h-4.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] shrink-0 font-black">
                                {step.order}
                              </span>
                              <span>{step.title ? `Bước ${step.order}: ${step.title}` : `Bước ${step.order}`}</span>
                            </div>
                            <div className="pl-6 font-semibold text-muted-foreground">
                              <LatexRenderer text={cleanExplanation} />
                              {step.formula && (
                                <div className="mt-1.5 bg-secondary/40 p-2.5 rounded-xl text-foreground overflow-x-auto border border-border/10 font-mono text-[11px]">
                                  <LatexRenderer text={step.formula} block={true} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {/* Khi học sinh đã mở hết các bước trung gian, hiển thị Tiêu đề Bước cuối cùng kèm Khung khóa nội dung bên dưới */}
                    {isMaxHintReached && solutionDetail.detailedSteps.length > 1 && (() => {
                      const finalStep = solutionDetail.detailedSteps[solutionDetail.detailedSteps.length - 1];
                      return (
                        <div className="text-xs font-semibold text-muted-foreground leading-relaxed space-y-1.5 animate-fade-in pt-1">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                            <span className="w-4.5 h-4.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] shrink-0 font-black">
                              {finalStep.order}
                            </span>
                            <span>{finalStep.title ? `Bước ${finalStep.order}: ${finalStep.title}` : `Bước ${finalStep.order}`}</span>
                          </div>
                          <div className="pl-6">
                            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] font-bold font-sans shadow-sm">
                              <Lock size={15} className="text-amber-500 shrink-0" />
                              <span>Bạn chưa nộp bài, không thể xem đáp án</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })()}

          {isMath && currentQuestion.validatorType === 'manual' && (
            <ProofImageUploader
              images={proofImages}
              onChange={setProofImages}
              disabled={isSubmitting}
              required={true}
              cloudEnabled={Boolean(user)}
            />
          )}

          {/* Vùng hiển thị tiến độ tải lên (Upload Progress UI) */}
          {isSubmitting && totalUploadStats && (
            <div className="bg-indigo-500/5 border border-indigo-500/15 p-4.5 rounded-2xl space-y-3.5 animate-fade-in my-3">
              <div className="flex items-center justify-between text-xs font-black text-foreground">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {totalUploadStats.isPaused ? (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    ) : (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </>
                    )}
                  </span>
                  {totalUploadStats.isPaused ? 'Đã tạm dừng tải ảnh' : 'Đang tải lên bài giải...'}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{totalUploadStats.percent}%</span>
              </div>

              {/* Thanh tiến độ */}
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    totalUploadStats.isPaused ? "bg-amber-400" : "bg-indigo-500"
                  )}
                  style={{ width: `${totalUploadStats.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                <span>
                  Đã gửi {((totalUploadStats.bytesTransferred) / (1024 * 1024)).toFixed(2)} MB / {((totalUploadStats.totalBytes) / (1024 * 1024)).toFixed(2)} MB
                </span>
                <div className="flex items-center gap-3">
                  {totalUploadStats.isPaused ? (
                    <button
                      type="button"
                      onClick={handleResumeUpload}
                      className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      ▶️ Tiếp tục
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseUpload}
                      className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      ⏸️ Tạm dừng
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="text-[10px] font-black text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    ⏹️ Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-xs font-black text-rose-600 dark:text-rose-400 my-2.5">
              {submitError}
            </p>
          )}

          {/* Bấm nộp bài & Điều hướng chuyển câu - Cấu trúc 2 hàng chuẩn không bị nhảy layout */}
          <div className="space-y-3 mt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitDisabled || isSubmitting}
              className="w-full font-black py-3.5 text-xs active:scale-[0.98] rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 h-11"
            >
              {isSubmitting ? (proofImages && proofImages.length > 0 ? 'Giáo viên đang chấm bài...' : 'Đang gửi bài làm...') : 'Nộp bài tập'}
            </Button>

            <div className="flex gap-2.5 w-full">
              <Button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => {
                  if (onNavigateQuestion) {
                    onNavigateQuestion(currentIdx - 1);
                  } else {
                    revokeLocalProofImages(proofImages);
                    setCurrentIdx(currentIdx - 1);
                    resetQuestionState();
                  }
                }}
                variant="outline"
                className="flex-1 font-bold py-2.5 text-xs border border-border/50 text-muted-foreground hover:text-foreground active:scale-[0.98] flex items-center justify-center gap-1.5 h-10.5 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft size={14} /> Câu trước
              </Button>
              <Button
                type="button"
                disabled={currentIdx === questionsLength - 1}
                onClick={() => {
                  if (onNavigateQuestion) {
                    onNavigateQuestion(currentIdx + 1);
                  } else {
                    revokeLocalProofImages(proofImages);
                    setCurrentIdx(currentIdx + 1);
                    resetQuestionState();
                  }
                }}
                variant="outline"
                className="flex-1 font-bold py-2.5 text-xs border border-border/50 text-muted-foreground hover:text-foreground active:scale-[0.98] flex items-center justify-center gap-1.5 h-10.5 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Câu sau <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
