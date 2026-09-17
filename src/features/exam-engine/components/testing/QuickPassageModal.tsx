import React, { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import { QuestionStimulus } from '@/types';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import { Button } from '@/components/ui/button';

export interface ReadingModalStimulusData {
  stimulus: QuestionStimulus;
  startNum: number;
  endNum: number;
}

interface QuickPassageModalProps {
  modalData: ReadingModalStimulusData | null;
  onClose: () => void;
  fontSize?: number;
}

export const QuickPassageModal: React.FC<QuickPassageModalProps> = ({
  modalData,
  onClose,
  fontSize = 15
}) => {
  useEffect(() => {
    if (!modalData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalData, onClose]);

  if (!modalData) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cửa sổ đọc bài"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border/80 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-secondary/20">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            <span className="text-xs font-black uppercase text-foreground">
              Ngữ liệu bài đọc · Câu {modalData.startNum} – Câu {modalData.endNum}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {modalData.stimulus.title && (
            <div className="text-center pb-2">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-foreground">
                {modalData.stimulus.title}
              </h3>
              <div className="w-12 h-0.5 bg-primary/40 mx-auto mt-2 rounded-full" />
            </div>
          )}
          <div
            style={{ fontSize: `${fontSize}px` }}
            className="leading-relaxed sm:leading-7 text-foreground/90 space-y-3.5 select-text"
          >
            {modalData.stimulus.content?.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className="indent-4 sm:indent-6 text-justify">
                <LatexRenderer text={p.trim()} />
              </p>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border/60 bg-secondary/10 flex justify-between items-center text-xs text-muted-foreground">
          <span>Gợi ý: Nhấn ESC hoặc nút Đóng để quay lại câu hỏi</span>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="font-bold text-xs rounded-xl cursor-pointer"
          >
            Đóng và làm bài
          </Button>
        </div>
      </div>
    </div>
  );
};
