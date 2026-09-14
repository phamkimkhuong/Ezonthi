import React from 'react';
import { Loader, Trash2, X, Lock } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface ChatSession {
  id: string;
  title: string;
  subjectId: string;
  messages?: any[];
  messageCount?: number;
  storageVersion?: number;
  createdAt: string;
  updatedAt: string;
}

interface AiTutorSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  isLoadingSessions: boolean;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export const AiTutorSidebar: React.FC<AiTutorSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  sessions,
  activeSessionId,
  setActiveSessionId,
  isLoadingSessions,
  onNewSession,
  onDeleteSession,
  isLoggedIn = true,
  onRequireLogin,
}) => {
  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Backdrop cho di động */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className="lg:hidden fixed inset-0 bg-black/45 backdrop-blur-xs z-35"
      />
      <div className="absolute lg:relative inset-y-0 left-0 w-64 border-r border-border bg-card dark:bg-slate-900 flex flex-col shrink-0 z-40 lg:z-auto shadow-xl lg:shadow-none animate-in slide-in-from-left duration-200">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground">Lịch sử chat</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewSession}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              title="Tạo cuộc hội thoại mới"
            >
              + Mới
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center"
              title="Đóng lịch sử"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground gap-2 text-[10px] font-semibold animate-pulse">
              <Loader size={12} className="animate-spin text-amber-500" />
              Đang tải...
            </div>
          ) : !isLoggedIn ? (
            <div className="text-center p-4 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Lock size={14} />
              </div>
              <p className="text-muted-foreground text-[10px] font-semibold leading-relaxed">
                Đăng nhập để lưu và xem lại các phiên trò chuyện cùng Gia sư.
              </p>
              {onRequireLogin && (
                <button
                  onClick={onRequireLogin}
                  className="w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              )}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-[10px] italic">
              Chưa có cuộc trò chuyện nào. Hãy gửi câu hỏi để bắt đầu!
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "group p-2 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-2 border text-[11px] font-bold",
                    isActive
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-black"
                      : "border-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                  )}
                >
                  <span className="truncate flex-1 pr-1">{s.title || "Cuộc trò chuyện mới"}</span>
                  <button
                    onClick={(e) => onDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-all cursor-pointer shrink-0"
                    title="Xóa cuộc trò chuyện"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
