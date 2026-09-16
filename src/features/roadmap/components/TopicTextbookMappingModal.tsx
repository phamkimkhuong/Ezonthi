import React from 'react';
import { X, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import type { LearningOutcome, QuestionType } from '../../../types';
import type { RoadmapQuestionType } from '@/types/roadmapContract';

interface TopicTextbookMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  outcomes: LearningOutcome[];
  questionTypes: Array<QuestionType | RoadmapQuestionType>;
  onOpenTextbookPage?: (bookName: string, pages: number[]) => void;
}

export const TopicTextbookMappingModal: React.FC<TopicTextbookMappingModalProps> = ({
  isOpen,
  onClose,
  topicName,
  outcomes,
  questionTypes,
  onOpenTextbookPage
}) => {
  if (!isOpen) return null;

  // Filter outcomes that have textbook mappings
  const outcomesWithBook = outcomes.filter(o => o.textbook && o.textbook.pages.length > 0);

  // Fallback book name if available
  const sampleBookName = outcomesWithBook[0]?.textbook?.bookName || 'SGK Chuẩn';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Ma trận ánh xạ SGK
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {sampleBookName}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-foreground mt-0.5 font-sans">
                  {topicName}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
              title="Đóng bảng ánh xạ"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Note banner */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-muted-foreground flex items-start gap-2.5">
              <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-extrabold text-foreground text-[11px]">
                  💡 Tại sao số lượng Dạng bài trên hệ thống nhiều hơn Bài học trong SGK?
                </p>
                <p className="text-[11px] leading-relaxed">
                  SGK gom lượng kiến thức lớn vào mỗi Bài học (từ 5 - 15 trang). Hệ thống đã chủ động <strong>chẻ nhỏ thành từng Dạng bài thi cốt lõi</strong> để giúp bạn tiếp thu từng phần dễ dàng, chốt kiến thức trọng tâm và rèn luyện chống bỏ sót bẫy thi!
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-extrabold text-foreground border-b border-border uppercase tracking-wider">
                      <th className="py-3 px-3.5 w-16 text-center">STT</th>
                      <th className="py-3 px-4 min-w-[200px]">Tên Dạng Bài Cốt Lõi</th>
                      <th className="py-3 px-4 min-w-[260px]">Bài Học & Mục Tương Ứng Trong SGK</th>
                      <th className="py-3 px-4 w-44 text-center">Trang SGK Chuẩn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {outcomesWithBook.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          Chưa có dữ liệu đối chiếu SGK cho chuyên đề này.
                        </td>
                      </tr>
                    ) : (
                      outcomesWithBook.map((outcome, idx) => {
                        // Find matching question type
                        const qTypeId = outcome.questionTypeIds?.[0];
                        const qType = questionTypes.find(q => q.id === qTypeId);
                        const displayTitle = qType ? qType.name : outcome.title;
                        const pages = outcome.textbook?.pages || [];
                        const pagesStr = pages.length > 0 ? `Trang ${pages.join(', ')}` : 'N/A';
                        const lessonName = outcome.textbook?.lessonName;
                        const sections = outcome.textbook?.sections || [];

                        return (
                          <tr 
                            key={outcome.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                          >
                            <td className="py-3.5 px-3.5 text-center font-black text-muted-foreground text-[11px]">
                              Dạng {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-foreground">
                              <div>{displayTitle}</div>
                              {qTypeId && (
                                <span className="text-[9px] font-mono text-muted-foreground/70 font-normal">
                                  ({qTypeId})
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-muted-foreground space-y-1">
                              {lessonName ? (
                                <div className="space-y-1">
                                  <div className="font-extrabold text-foreground">
                                    {lessonName}
                                  </div>
                                  {sections.length > 0 && (
                                    <ul className="text-[11px] text-muted-foreground list-disc pl-3.5 space-y-0.5 font-medium">
                                      {sections.map((sec, sIdx) => (
                                        <li key={sIdx}>{sec}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="font-extrabold text-foreground">
                                    {outcome.title}
                                  </div>
                                  <div className="text-[11px] leading-relaxed line-clamp-2">
                                    {outcome.description}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {pages.length > 0 ? (
                                <button
                                  onClick={() => {
                                    if (onOpenTextbookPage && outcome.textbook) {
                                      onOpenTextbookPage(outcome.textbook.bookName, pages);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
                                  title="Click để mở đọc trực tiếp trang sách này"
                                >
                                  <span>{pagesStr}</span>
                                  <ExternalLink size={12} />
                                </button>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-border bg-slate-50 dark:bg-slate-900/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
