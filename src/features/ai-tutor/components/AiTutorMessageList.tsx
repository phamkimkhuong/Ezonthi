import React from 'react';
import { Bot, User, Loader, Award } from 'lucide-react';
import { LatexRenderer } from '../../../components/common/LatexRenderer';
import { cn } from '../../../utils/cn';

export interface Message {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

interface AiTutorMessageListProps {
  messages: Message[];
  isLoading: boolean;
  isUploadingImage: boolean;
  suggestions: string[];
  errorMsg: string | null;
  onSendSuggestion: (text: string) => void;
  onImageClick: (url: string) => void;
  onUpgradeClick: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  subjectName?: string;
  hasOlderMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
}

export const AiTutorMessageList: React.FC<AiTutorMessageListProps> = ({
  messages,
  isLoading,
  isUploadingImage,
  suggestions,
  errorMsg,
  onSendSuggestion,
  onImageClick,
  onUpgradeClick,
  messagesEndRef,
  isLoggedIn = true,
  onRequireLogin,
  subjectName = 'môn học',
  hasOlderMessages = false,
  isLoadingOlderMessages = false,
  onLoadOlderMessages,
}) => {
  return (
    <>
      {/* Chat Messages Container */}
      <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-slate-50/20 dark:bg-slate-900/5">
        {hasOlderMessages && onLoadOlderMessages && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLoadOlderMessages}
              disabled={isLoadingOlderMessages}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {isLoadingOlderMessages ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </button>
          </div>
        )}
        {messages.length === 0 && !isLoading && (
          <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 text-center space-y-6 animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-amber-500/5 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-4 ring-amber-500/10">
              <Bot size={32} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                ✨ Trợ Lý Học Tập 24/7 · Phương Pháp Socratic
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Gia Sư Socratic AI — {subjectName}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Khác với các công cụ giải bài thông thường, Thầy Socratic sẽ <strong>đặt câu hỏi gợi mở và dẫn dắt từng bước</strong> giúp bạn tự tìm ra lời giải, hiểu sâu bản chất và không lo học vẹt.
              </p>
            </div>

            {/* 3 Thẻ Tính Năng Nổi Bật */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 bg-card border border-border/70 rounded-2xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
                <div className="text-base mb-1">⚡</div>
                <h4 className="text-[11px] font-black text-foreground">Gợi mở từng bước</h4>
                <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed">
                  Hướng dẫn bạn từng bước tư duy, chỉ can thiệp khi bạn gặp bế tắc.
                </p>
              </div>

              <div className="p-3.5 bg-card border border-border/70 rounded-2xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
                <div className="text-base mb-1">📐</div>
                <h4 className="text-[11px] font-black text-foreground">Công thức KaTeX</h4>
                <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed">
                  Trình bày công thức Toán, Lý, Hóa chuẩn xác, rõ ràng và trực quan.
                </p>
              </div>

              <div className="p-3.5 bg-card border border-border/70 rounded-2xl shadow-xs space-y-1 hover:border-amber-500/40 transition-all">
                <div className="text-base mb-1">📸</div>
                <h4 className="text-[11px] font-black text-foreground">Hỏi bài qua hình ảnh</h4>
                <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed">
                  Chụp ảnh bài tập trên vở hoặc sách giáo khoa để AI phân tích trực tiếp.
                </p>
              </div>
            </div>

            {/* Nút Kêu Gọi Đăng Nhập Nếu Chưa Đăng Nhập */}
            {!isLoggedIn && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div>
                  <h4 className="text-xs font-black text-foreground">Bắt đầu trò chuyện cùng Gia sư AI ngay</h4>
                  <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Đăng nhập miễn phí bằng Google để gửi câu hỏi và lưu lại toàn bộ lịch sử học tập.
                  </p>
                </div>
                <button
                  onClick={onRequireLogin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 hover:opacity-95 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all cursor-pointer shrink-0"
                >
                  Đăng nhập với Google
                </button>
              </div>
            )}

            <p className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">
              👇 Chọn một câu hỏi mẫu bên dưới hoặc gõ câu hỏi để bắt đầu:
            </p>
          </div>
        )}

        {messages.map((m, idx) => {
          const isBot = m.role === 'model';
          return (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 max-w-[85%] animate-fade-in",
                isBot ? "self-start" : "ml-auto flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                isBot
                  ? "bg-gradient-to-tr from-amber-500/10 to-orange-500/10 text-amber-600 border border-amber-500/20"
                  : "bg-primary text-primary-foreground"
              )}>
                {isBot ? <Bot size={15} /> : <User size={15} />}
              </div>
              <div className={cn(
                "p-3.5 rounded-2xl text-[12px] font-semibold leading-relaxed shadow-sm overflow-x-auto flex flex-col gap-2",
                isBot
                  ? "bg-card text-foreground rounded-tl-none border border-border/60"
                  : "bg-primary text-primary-foreground rounded-tr-none"
              )}>
                {m.imageUrl && (
                  <div className="relative max-w-full overflow-hidden rounded-lg border border-border/30 bg-background/50">
                    <img
                      src={m.imageUrl}
                      alt="Hình ảnh đính kèm"
                      className="max-h-60 w-auto object-contain cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                      onClick={() => onImageClick(m.imageUrl!)}
                    />
                  </div>
                )}
                {m.text && <LatexRenderer text={m.text} />}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-[80%] animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-sm">
              <Loader size={15} className="animate-spin text-amber-600" />
            </div>
            <div className="p-3.5 bg-card text-muted-foreground border border-border/60 rounded-2xl rounded-tl-none text-[12px] font-bold">
              {isUploadingImage ? "Đang tải ảnh lên..." : "Gia sư đang suy nghĩ..."}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Gợi ý câu hỏi nhanh (nếu không loading) */}
      {!isLoading && (
        <div className="px-3 py-2.5 bg-slate-50/40 dark:bg-slate-900/5 border-t border-border flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSendSuggestion(s)}
              className="px-3.5 py-1.5 bg-card hover:bg-amber-500/5 dark:hover:bg-amber-500/10 border border-border/80 hover:border-amber-500/30 rounded-full text-[10px] font-bold text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Hạn mức Premium Gate Banner */}
      {errorMsg === "LIMIT_EXHAUSTED" && (
        <div className="mx-4 mt-2 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500 shrink-0" size={24} />
            <div className="text-left">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400">Nâng cấp Premium - Không giới hạn AI</h4>
              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Mở khóa chặng 9-10 điểm và trò chuyện không giới hạn với Gia sư AI</p>
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black text-[10px] rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            Nâng Cấp Ngay
          </button>
        </div>
      )}
    </>
  );
};
