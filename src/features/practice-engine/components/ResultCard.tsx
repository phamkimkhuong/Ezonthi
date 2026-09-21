import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import { QuestionStimulusRenderer } from '@/components/common/QuestionStimulusRenderer';
import { Question, QuestionType, Solution, UserAttempt, SubjectCode } from '@/types';
import { LocalProofImage, revokeLocalProofImages } from '@/utils/proofImages';
import { cn } from '@/utils/cn';
import { getSubjectTheme } from '@/utils/theme';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, ArrowDown, Languages } from 'lucide-react';
import { logCustomEvent } from '@/services/firebase';
import { QuestionTypeGuidance } from './QuestionTypeGuidance';

interface ResultCardProps {
  currentQuestion: Question;
  currentQuestionType: QuestionType | null;
  isCorrect: boolean;
  isMath: boolean;
  proofImages: LocalProofImage[];
  existingAttempt: UserAttempt | null;
  pastAttempts: UserAttempt[];
  solutionDetail: Solution | null;
  routeSubject: SubjectCode;
  selectedOption: string | null;
  currentIdx: number;
  questionsLength: number;
  setCurrentIdx: (val: number) => void;
  resetQuestionState: () => void;
  handleRetry: () => void;
  handleNext: () => void;
  onNavigateQuestion?: (idx: number) => void;
}

const cleanRecognitionText = (text: string): string => {
  if (!text) return '';
  const cleaned = text
    .replace(/^(?:Dạng\s+bù\s+(?:coverage\s+)?[^:]+:\s*)/iu, '')
    .replace(/^[a-z0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*:\s*/iu, '')
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : text;
};

export const ResultCard: React.FC<ResultCardProps> = ({
  currentQuestion,
  currentQuestionType,
  isCorrect,
  isMath,
  proofImages,
  existingAttempt,
  pastAttempts,
  solutionDetail,
  routeSubject,
  selectedOption,
  currentIdx,
  questionsLength,
  setCurrentIdx,
  resetQuestionState,
  handleRetry,
  handleNext,
  onNavigateQuestion,
}) => {
  React.useEffect(() => {
    if (existingAttempt?.teacherFeedback) {
      logCustomEvent('view_teacher_feedback', {
        questionId: currentQuestion.id,
        attemptId: existingAttempt.id,
        feedback: existingAttempt.teacherFeedback
      });
    }
  }, [existingAttempt, currentQuestion.id]);

  // Cơ chế giãn cách 3 ngày (Spaced Repetition)
  const retryStatus = React.useMemo(() => {
    if (!existingAttempt) return { canRetry: true, daysRemaining: 0, unlockDateStr: '' };

    const attemptDate = new Date(existingAttempt.createdAt);
    const currentDate = new Date();

    // Loại bỏ giờ/phút/giây để so sánh ngày
    const d1 = new Date(attemptDate.getFullYear(), attemptDate.getMonth(), attemptDate.getDate());
    const d2 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

    const canRetry = diffDays >= 3;
    const daysRemaining = Math.max(0, 3 - diffDays);

    const unlockDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate() + 3);
    const unlockDateStr = unlockDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return { canRetry, daysRemaining, unlockDateStr };
  }, [existingAttempt]);

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

  const isMultipleChoice = Boolean(displayOptions && displayOptions.length > 0);

  const effectiveUserAnswer = (existingAttempt?.userAnswer || selectedOption || '').trim();
  const cleanUserAnswer = effectiveUserAnswer.replace(/^[A-D][.)]\s*/, '').trim();
  const userAnswerToShow = effectiveUserAnswer;
  const correctOptionIndex = ['A', 'B', 'C', 'D'].indexOf(currentQuestion.correctAnswer);
  const correctOptionText = correctOptionIndex >= 0
    ? displayOptions?.[correctOptionIndex]?.replace(/^[A-D][.)]\s*/, '').trim()
    : undefined;

  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 xl:col-span-6 space-y-5">
        {/* Đề bài (Xem lại câu hỏi) */}
        <div className="space-y-3 text-left">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <h4 className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              📖 Đề bài:
            </h4>

            {/* Nút "Dịch nghĩa" nếu câu hỏi có dữ liệu bản dịch */}
            {currentQuestion.translation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-xs font-extrabold gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 cursor-pointer h-8 px-2.5 rounded-lg border border-indigo-500/20"
              >
                <Languages className="w-3.5 h-3.5" />
                {showTranslation ? '🔤 xem Tiếng Anh gốc' : '🌐 Dịch nghĩa Tiếng Việt'}
              </Button>
            )}
          </div>
          <div className="space-y-4 p-5 text-sm font-bold leading-relaxed text-foreground bg-secondary/10 dark:bg-slate-950/10 font-sans">
            <QuestionStimulusRenderer question={currentQuestion} />
            <LatexRenderer text={cleanContent} />

            {/* Bản dịch Đề bài tiếng Việt */}
            {showTranslation && currentQuestion.translation?.content && (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-950 dark:text-indigo-200 text-xs font-medium space-y-1 animate-fade-in">
                <div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Bản dịch Tiếng Việt:
                </div>
                <div className="font-semibold text-xs leading-relaxed">
                  {currentQuestion.translation.content}
                </div>
              </div>
            )}
          </div>

          {/* Nếu có options (đối với trắc nghiệm) thì hiển thị các lựa chọn cho học sinh dễ đối chiếu */}
          {displayOptions && displayOptions.length > 0 && (
            <div className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-card">
              {displayOptions.map((opt, oIdx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const letter = letters[oIdx] || String.fromCharCode(65 + oIdx);
                // Lọc bỏ tiền tố dạng "A. " nếu có trong text
                const cleanOpt = opt.replace(/^[A-D]\.\s*/, '').trim();
                const translatedOpt = currentQuestion.translation?.options?.[oIdx]?.replace(/^[A-D]\.\s*/, '');

                const isSelected = Boolean(
                  effectiveUserAnswer && (
                    effectiveUserAnswer === letter ||
                    effectiveUserAnswer.startsWith(letter + '.') ||
                    effectiveUserAnswer.startsWith(letter + ')') ||
                    effectiveUserAnswer === opt ||
                    effectiveUserAnswer === cleanOpt ||
                    (cleanUserAnswer && cleanUserAnswer === cleanOpt)
                  )
                );

                const cleanCorrect = currentQuestion.correctAnswer?.replace(/^[A-D][.)]\s*/, '').trim();
                const isCorrectAnswer = Boolean(
                  currentQuestion.correctAnswer && (
                    currentQuestion.correctAnswer === letter ||
                    currentQuestion.correctAnswer.startsWith(letter + '.') ||
                    currentQuestion.correctAnswer.startsWith(letter + ')') ||
                    currentQuestion.correctAnswer === opt ||
                    currentQuestion.correctAnswer === cleanOpt ||
                    (cleanCorrect && cleanCorrect === cleanOpt)
                  )
                );

                const isUserWrongChoice = isSelected && !isCorrectAnswer;

                return (
                  <div
                    key={oIdx}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-2.5 transition-all",
                      isCorrectAnswer
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                        : isUserWrongChoice
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500/20"
                          : "bg-secondary/10 border-border/40 text-muted-foreground opacity-75"
                    )}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center font-extrabold shadow-sm text-[11px] shrink-0",
                        isCorrectAnswer
                          ? "bg-emerald-500 text-white"
                          : isUserWrongChoice
                            ? "bg-rose-500 text-white"
                            : "bg-secondary text-foreground"
                      )}>
                        {letter}
                      </span>
                      <div className="leading-relaxed flex-1">
                        <LatexRenderer text={cleanOpt} />
                        {showTranslation && translatedOpt && (
                          <div className="text-[11px] font-normal text-indigo-700 dark:text-indigo-300 mt-0.5 italic">
                            ({translatedOpt})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Khối đối chiếu kết quả dành cho câu nhập đáp án */}
        {!isMultipleChoice && (
          isCorrect ? (
            /* Học sinh làm ĐÚNG -> Khối 1 dòng xanh ngọc tinh gọn */
            <div className="p-3 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 text-left animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span>Chính xác! Đáp án của bạn:</span>
              </div>
              <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-xs">
                <LatexRenderer text={userAnswerToShow || ''} />
              </span>
            </div>
          ) : (
            /* Học sinh làm SAI -> Khối đối chiếu trực diện 2 cột */
            <div className="p-2.5 sm:p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 text-xs font-bold text-left animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Đáp án học sinh nhập */}
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <XCircle size={16} className="text-rose-500 shrink-0" />
                    <span className="font-bold text-[11px] text-muted-foreground">Bạn đã nhập:</span>
                  </div>
                  <span className="font-black text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                    <LatexRenderer text={userAnswerToShow || '(Trống)'} />
                  </span>
                </div>

                {/* Đáp án chính xác */}
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span className="font-bold text-[11px] text-muted-foreground">Đáp án đúng:</span>
                  </div>
                  <span className="font-black text-xs px-2 py-0.5 rounded bg-emerald-500 text-white shadow-xs">
                    <LatexRenderer text={currentQuestion.correctAnswer || ''} />
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Nút xem nhanh lời giải cho thiết bị di động (Mobile Quick Jump) */}
        {solutionDetail && (
          <button
            type="button"
            onClick={() => {
              document.getElementById('solution-detail-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="lg:hidden w-full py-3 px-4 bg-secondary/80 hover:bg-secondary active:scale-[0.99] rounded-2xl text-xs font-black text-foreground flex items-center justify-center gap-2 transition-all border border-border/60 shadow-sm cursor-pointer"
          >
            <span>📖 Xem ngay lời giải chi tiết bên dưới</span>
            <ArrowDown size={15} className="text-primary animate-bounce" />
          </button>
        )}

        {/* Báo cáo chấm điểm tự luận từ AI */}
        {isMath && existingAttempt?.aiEvaluation && (
          <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border/50 shadow-sm animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
              <h4 className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-1.5">
                📝 Nhận xét và chấm điểm chi tiết:
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground">Điểm số:</span>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-black shadow-sm border",
                  existingAttempt.aiEvaluation.score >= 8
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : existingAttempt.aiEvaluation.score >= 5
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                )}>
                  {existingAttempt.aiEvaluation.score} / 10 điểm
                </span>
              </div>
            </div>

            {/* Nhận xét tổng quan */}
            <div className="p-3 bg-secondary/30 rounded-xl border border-border/30 text-xs font-semibold text-muted-foreground leading-relaxed">
              <span className="font-extrabold text-foreground block mb-1">💬 Nhận xét tổng quan:</span>
              <LatexRenderer text={existingAttempt.aiEvaluation.summaryFeedback} />
            </div>

            {/* Đánh giá chi tiết từng bước */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-2">
                📋 Chi tiết đánh giá từng bước:
              </span>
              <div className="space-y-3">
                {(existingAttempt.aiEvaluation.stepsEvaluation || []).map((step) => {
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

        {/* Ảnh bài làm đã nộp */}
        {isMath && (proofImages.length > 0 || (existingAttempt?.proofImages && existingAttempt.proofImages.length > 0)) && (
          <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border/50 shadow-sm animate-fade-in">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              🖼️ Ảnh bài làm bạn đã gửi:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {proofImages.length > 0
                ? proofImages.map((img) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden border border-border bg-black/95 max-h-[320px] flex items-center justify-center shadow-md transition-all hover:border-indigo-500/30">
                    <img
                      src={img.previewUrl}
                      alt="Bài làm đã nộp"
                      className="max-h-[300px] object-contain rounded-lg p-1"
                    />
                  </div>
                ))
                : existingAttempt?.proofImages?.map((img) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden border border-border bg-black/95 max-h-[320px] flex items-center justify-center shadow-md transition-all hover:border-indigo-500/30">
                    <img
                      src={img.downloadUrl || img.storagePath}
                      alt="Bài làm đã nộp"
                      className="max-h-[300px] object-contain rounded-lg p-1"
                    />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Lịch sử so sánh các lần làm trước */}
        {pastAttempts.length > 0 && (
          <div className="space-y-3 p-5 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-border/50 shadow-sm animate-fade-in">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              ⏳ So sánh với các lần làm trước đó (Tối đa 2 lần gần nhất):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {pastAttempts.map((past, idx) => {
                const dateStr = new Date(past.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const isPastCorrect = past.isCorrect;

                return (
                  <div
                    key={past.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-150 relative flex flex-col justify-between gap-3 bg-card",
                      isPastCorrect
                        ? "border-emerald-500/20 hover:border-emerald-500/35"
                        : "border-rose-500/20 hover:border-rose-500/35"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          Lần làm {pastAttempts.length - idx}: {dateStr}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                          isPastCorrect
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}>
                          {isPastCorrect ? (
                            <>
                              <CheckCircle size={10} /> Đúng / Đạt
                            </>
                          ) : (
                            <>
                              <XCircle size={10} /> Sai / Cần sửa
                            </>
                          )}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-foreground">
                        {isMath ? (
                          <div className="space-y-2">
                            <span className="text-muted-foreground block text-[11px]">Bài giải tự luận:</span>
                            {past.proofImages && past.proofImages.length > 0 ? (
                              <div className="flex gap-1.5 overflow-x-auto py-1">
                                {past.proofImages.map((img) => (
                                  <div key={img.id} className="relative rounded-lg overflow-hidden border border-border bg-black w-14 h-14 shrink-0 flex items-center justify-center">
                                    <img
                                      src={img.downloadUrl || img.storagePath}
                                      alt="Minh chứng"
                                      className="w-full h-full object-cover cursor-pointer"
                                      onClick={() => window.open(img.downloadUrl || img.storagePath, '_blank')}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-[11px]">Không có ảnh bài làm</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="text-muted-foreground text-[11px]">Đáp án đã chọn: </span>
                            <span className="font-extrabold text-primary">{past.userAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {past.teacherFeedback && (
                      <div className={cn(
                        "text-[10px] font-bold p-2 rounded-lg border",
                        isPastCorrect
                          ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-300"
                      )}>
                        💬 Nhận xét: "{past.teacherFeedback}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tiếp tục / Làm lại / Đổi câu - Cấu trúc 2 hàng chuẩn không bị nhảy layout */}
        <div className="space-y-3 pt-4">
          {/* Hàng 1: Nút hành động chính (Full-width Primary Button) */}
          <Button
            onClick={handleNext}
            className="w-full font-black py-3.5 text-xs active:scale-[0.98] rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 h-11"
          >
            {currentIdx === questionsLength - 1 ? 'Hoàn thành bài tập 🎉' : 'Câu sau'} <ArrowRight size={16} />
          </Button>

          {/* Hàng 2: Các nút phụ 50% - 50% nằm ngang hàng định dạng cố định */}
          <div className="flex gap-2.5 w-full">
            <Button
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
              className="flex-1 font-bold py-2.5 text-xs active:scale-[0.98] flex items-center justify-center gap-1.5 border border-border/50 text-muted-foreground hover:bg-secondary/40 cursor-pointer h-10.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={14} /> Câu trước
            </Button>
            {existingAttempt && !retryStatus.canRetry ? (
              <div className="flex-1 flex flex-col items-center justify-center p-2 bg-slate-500/10 border border-slate-500/20 rounded-xl text-[10px] text-muted-foreground font-extrabold text-center leading-tight">
                <span>⏱️ Làm lại sau {retryStatus.daysRemaining} ngày</span>
              </div>
            ) : (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1 font-bold py-2.5 text-xs active:scale-[0.98] flex items-center justify-center gap-1.5 border border-border/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/5 cursor-pointer h-10.5 rounded-xl"
              >
                🔄 Làm lại
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lời giải chi tiết hiện lên ở cột bên phải */}
      {solutionDetail && (
        <div id="solution-detail-section" className="lg:col-span-5 xl:col-span-6 space-y-4 text-left scroll-mt-6">
          <h4 className="font-extrabold text-sm text-foreground">🔬 Lời giải chi tiết:</h4>

          {currentQuestionType && routeSubject !== 'history' && <QuestionTypeGuidance questionType={currentQuestionType} />}

          {solutionDetail.recognition && routeSubject !== 'history' && (
            <div className={cn(
              "text-xs font-semibold text-muted-foreground p-3.5 rounded-xl border",
              getSubjectTheme(routeSubject).bg,
              getSubjectTheme(routeSubject).border
            )}>
              <span className="font-extrabold text-foreground block mb-1">💡 Áp dụng vào câu hỏi này:</span>
              <LatexRenderer text={cleanRecognitionText(solutionDetail.recognition)} />
            </div>
          )}

          {solutionDetail.translation && (
            <div className="text-xs font-semibold text-muted-foreground p-3.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/10 border-border/30">
              <span className="font-extrabold text-foreground block mb-1">🇬🇧 Dịch nghĩa / yêu cầu câu hỏi:</span>
              <p className="italic">"{solutionDetail.translation}"</p>
            </div>
          )}

          <div className="space-y-5 pl-1.5">
            {solutionDetail.detailedSteps.map((step: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <h5 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                    {step.order}
                  </span>
                  {step.title}
                </h5>
                <div className="pl-6.5 text-xs font-semibold text-muted-foreground leading-relaxed whitespace-pre-line">
                  <LatexRenderer text={step.explanation} />
                  {step.formula && (
                    <div className="my-2 p-2 bg-secondary/50 rounded-lg text-foreground border border-border/5 overflow-x-auto">
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

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border/30 rounded-xl text-xs space-y-2.5">
            <div className="font-extrabold text-foreground flex items-baseline gap-1.5">
              <span className="shrink-0">Đáp án đúng:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                <LatexRenderer
                  text={`${currentQuestion.correctAnswer}${correctOptionText ? `. ${correctOptionText}` : ''}`}
                />
              </span>
            </div>
            {solutionDetail.commonMistakes.length > 0 && (
              <div className="pt-2 border-t border-border/20 text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
                <span className="font-extrabold block text-foreground mb-1.5">⚠️ Lỗi dễ mắc (Tránh bẫy):</span>
                <div className="space-y-1">
                  {solutionDetail.commonMistakes.map((m: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-black shrink-0 select-none text-rose-500">•</span>
                      <div className="flex-1"><LatexRenderer text={m} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {solutionDetail.reviewSuggestions.length > 0 && (
              <div className="pt-2 border-t border-border/20 text-indigo-600 dark:text-indigo-400 font-semibold leading-relaxed">
                <span className="font-extrabold block text-foreground mb-1.5">📚 Cần ôn lại:</span>
                <div className="space-y-1">
                  {solutionDetail.reviewSuggestions.map((suggestion: string, index: number) => {
                    let formattedSuggestion = suggestion;
                    if (currentQuestionType?.name) {
                      formattedSuggestion = formattedSuggestion.replace(/[a-z0-9]+-[a-z0-9]+/gi, `dạng bài "${currentQuestionType.name}"`);
                    } else {
                      formattedSuggestion = formattedSuggestion.replace(/[a-z0-9]+-[a-z0-9]+/gi, 'dạng bài tương ứng');
                    }
                    return (
                      <div key={index} className="flex items-start gap-1.5">
                        <span className="font-black shrink-0 select-none text-indigo-500">•</span>
                        <div className="flex-1"><LatexRenderer text={formattedSuggestion} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Nút điều hướng phụ cho Mobile khi cuộn xuống hết lời giải */}
          <div className="lg:hidden pt-4 border-t border-border flex gap-2.5 w-full">
            <Button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="outline"
              className="flex-1 text-xs font-bold py-2.5 h-10.5 rounded-xl border border-border/50"
            >
              ⬆ Lên đầu câu hỏi
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 text-xs font-black py-2.5 h-10.5 rounded-xl bg-primary text-white shadow-sm"
            >
              {currentIdx === questionsLength - 1 ? 'Hoàn thành 🎉' : 'Câu sau 👉'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
