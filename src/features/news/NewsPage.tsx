import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { newsService } from '../../services/newsService';
import { notificationService } from '../../services/notificationService';
import { useAppStore } from '../../services/store';
import { AnnouncementPost } from '../../types/newsTypes';
import {
  ChevronDown,
  ChevronUp,
  Loader,
  Clock,
  Share2,
  Check,
  Megaphone
} from 'lucide-react';
import { cn } from '../../utils/cn';

const CATEGORY_BADGES: Record<string, { label: string; bg: string; icon: string }> = {
  feature: { label: 'TÍNH NĂNG MỚI', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: '🚀' },
  exam_update: { label: 'CẬP NHẬT ĐỀ THI', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: '📚' },
  guide: { label: 'HƯỚNG DẪN HỌC', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: '💡' },
  general: { label: 'THÔNG BÁO CHUNG', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', icon: '📢' },
};

export const NewsPage: React.FC = () => {
  const { user, selectedGrade } = useAppStore();
  const [searchParams] = useSearchParams();

  const [posts, setPosts] = useState<AnnouncementPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tải danh sách bài viết
  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const list = await newsService.fetchPosts(user?.uid, selectedGrade);
      setPosts(list);

      // Tự động đánh dấu tất cả thông báo bài viết là ĐÃ ĐỌC để xóa điểm đỏ trên Chuông 🔔
      if (user) {
        const notifList = useAppStore.getState().notifications;
        if (notifList.length > 0) {
          notificationService.markAllAsRead(user.uid, notifList.map((n) => n.id));
          useAppStore.getState().markAllNotificationsAsRead();
        }
      }

      // Nếu URL chứa query id, chọn và mở rộng bài viết đó
      const targetId = searchParams.get('id');
      if (targetId && list.length > 0) {
        const found = list.find((p) => p.id === targetId);
        if (found) {
          setExpandedPostIds(new Set([found.id]));
        } else if (list[0]) {
          setExpandedPostIds(new Set([list[0].id]));
        }
      } else if (list[0]) {
        setExpandedPostIds(new Set([list[0].id]));
      }
    } catch (err) {
      console.error('Lỗi nạp bài viết:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [user, selectedGrade, searchParams]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const toggleExpand = (postId: string) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Chia sẻ bài viết
  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/news?id=${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const timeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 30) return `${diffDays} ngày trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 bg-card/60 p-5 rounded-3xl border border-border/40 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/20 shadow-xs shrink-0">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <span>Bảng Tin Thông Báo</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                Official
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Cập nhật thông tin tính năng mới, lộ trình học & lịch thi mới nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Posts List */}
      <div className="space-y-4">
        {loadingPosts ? (
          <div className="py-16 text-center text-xs text-muted-foreground font-bold bg-card rounded-3xl border border-border/40 flex flex-col items-center justify-center gap-3">
            <Loader className="w-7 h-7 animate-spin text-emerald-500" />
            <span>Đang nạp bài viết Bảng tin...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground font-bold bg-card rounded-3xl border border-border/40">
            Chưa có bài viết thông báo nào.
          </div>
        ) : (
          posts.map((post) => {
            const isExpanded = expandedPostIds.has(post.id);
            const catBadge = CATEGORY_BADGES[post.category] || CATEGORY_BADGES.general;

            return (
              <div
                key={post.id}
                onClick={() => toggleExpand(post.id)}
                className={cn(
                  'bg-card border rounded-3xl transition-all duration-300 overflow-hidden cursor-pointer shadow-xs group',
                  isExpanded
                    ? 'border-emerald-500/50 ring-2 ring-emerald-500/10 shadow-md'
                    : 'border-border/40 hover:border-border/80'
                )}
              >
                {/* Card Header (Click to Toggle Accordion) */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        <img
                          src="/favicon.png"
                          alt="ezonthi logo"
                          className="w-full h-full object-contain rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerText = 'EZ';
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-foreground block tracking-tight">
                            ezonthi
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black border border-emerald-500/20">
                            Official
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          <span>{timeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider', catBadge.bg)}>
                        {catBadge.icon} {catBadge.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(post.id);
                        }}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-base font-black text-foreground uppercase tracking-wide group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pt-1">
                    {post.title}
                  </h2>

                  {/* Preview snippet when collapsed */}
                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                      {post.content.replace(/[#*`_]/g, '')}
                    </p>
                  )}
                </div>

                {/* Body Content (Rendered when Expanded) */}
                {isExpanded && (
                  <div className="px-5 pb-5 text-xs text-foreground/90 font-medium space-y-3 border-t border-border/20 pt-4 leading-relaxed animate-fadeIn">
                    {post.content.split('\n').map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return <div key={pIdx} className="h-1" />;

                      // Format headers and bullet points nicely
                      if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
                        return (
                          <h3 key={pIdx} className="text-xs font-black text-foreground uppercase tracking-wide text-emerald-600 dark:text-emerald-400 pt-2">
                            {trimmed.replace(/^#+\s*/, '')}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                        return (
                          <div key={pIdx} className="flex items-start gap-2 pl-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
                          </div>
                        );
                      }
                      return <p key={pIdx}>{trimmed}</p>;
                    })}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-secondary/30 border-t border-border/20 flex items-center justify-end text-xs font-extrabold text-muted-foreground">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(post.id);
                    }}
                    className="flex items-center gap-1.5 text-[11px] hover:text-foreground transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-secondary"
                    title="Sao chép đường dẫn bài viết"
                  >
                    {copiedId === post.id ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                    <span>{copiedId === post.id ? 'Đã chép link' : 'Chia sẻ bài viết'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NewsPage;
