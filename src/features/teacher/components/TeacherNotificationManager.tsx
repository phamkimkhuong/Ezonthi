import React, { useState, useEffect, useCallback } from 'react';
import { newsService } from '../../../services/newsService';
import { notificationService } from '../../../services/notificationService';
import { useAppStore } from '../../../services/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Bell, Send, Loader, CheckCircle2, Users, Eye, Trash2 } from 'lucide-react';
import { NotificationType, TargetGrade, AppNotification } from '../../../types/notificationTypes';
import { AnnouncementCategory } from '../../../types/newsTypes';
import { useNavigate } from 'react-router-dom';

const CATEGORY_OPTIONS: { value: AnnouncementCategory | NotificationType; label: string }[] = [
  { value: 'feature', label: '🚀 Tính năng mới' },
  { value: 'exam_update', label: '📚 Cập nhật bộ đề thi' },
  { value: 'guide', label: '💡 Hướng dẫn học tập' },
  { value: 'general', label: '📢 Thông báo chung' },
  { value: 'premium', label: '👑 Quyền lợi Premium VIP' },
];

const GRADE_OPTIONS: { value: TargetGrade; label: string }[] = [
  { value: 'all', label: '🌐 Tất cả học sinh (Toàn bộ ứng dụng)' },
  { value: 'grade9', label: '🎒 Học sinh Lớp 9' },
  { value: 'grade10', label: '🎯 Học sinh Lớp 10' },
  { value: 'grade11', label: '🔬 Học sinh Lớp 11' },
  { value: 'grade12', label: '🏆 Học sinh Lớp 12' },
];

export const TeacherNotificationManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory | NotificationType>('feature');
  const [targetGrade, setTargetGrade] = useState<TargetGrade>('all');

  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [recentSent, setRecentSent] = useState<AppNotification[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const loadSentList = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const list = await notificationService.fetchNotifications(user?.uid || 'admin', 'all');
      setRecentSent(list);
    } catch {
      // ignore
    } finally {
      setLoadingRecent(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSentList();
  }, [loadSentList]);

  const handleDeleteNotification = async (notifId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi hệ thống?')) {
      return;
    }
    try {
      const ok = await notificationService.deleteNotification(notifId);
      if (ok) {
        setRecentSent((prev) => prev.filter((item) => item.id !== notifId));
      } else {
        alert('Không thể xóa thông báo.');
      }
    } catch {
      alert('Đã xảy ra lỗi khi xóa thông báo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // newsService.createPost tự động đăng bài lên Bảng Tin (/news)
      // đồng thời đã phát hành ĐÚNG 1 thông báo hệ thống lên Chuông 🔔
      const postId = await newsService.createPost({
        title: title.trim(),
        content: content.trim(),
        category: (category as AnnouncementCategory) || 'general',
        targetGrade,
        authorName: 'ezonthi',
      });

      if (postId) {
        setSuccessMsg('🎉 Đã phát hành thông báo và bài viết Bảng tin thành công tới học sinh!');
        setTitle('');
        setContent('');
        loadSentList();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg('Không thể phát hành thông báo. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xảy ra khi phát hành thông báo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Form Soạn & Phát Hành Thông Báo */}
      <Card className="rounded-3xl border-border/40 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-extrabold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" />
              <span>Phát Hành Thông Báo & Bài Viết Bảng Tin (Broadcast Center)</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>Xem trang Bảng tin 📰</span>
            </button>
          </CardTitle>
          <CardDescription className="text-xs">
            Thông báo đăng tại đây sẽ xuất hiện trực tiếp ở trang Bảng Tin (`/news`) đồng thời kích hoạt điểm đỏ nhấp nháy trên thanh Chuông 🔔 của học sinh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-2xl">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phân loại thông báo / bài viết */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">
                  Chuyên mục / Phân loại
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-secondary/50 border border-border/40 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-foreground cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Khối lớp mục tiêu */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">
                  Đối tượng nhận thông báo
                </label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value as TargetGrade)}
                  className="w-full px-3.5 py-2.5 bg-secondary/50 border border-border/40 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 text-foreground cursor-pointer"
                >
                  {GRADE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tiêu đề */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">
                Tiêu đề thông báo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: ĐỌC TRUYỆN TỪ TỪ VỰNG ĐÃ HỌC!"
                className="w-full px-4 py-2.5 bg-secondary/50 border border-border/40 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-emerald-500 text-foreground"
                maxLength={100}
              />
            </div>

            {/* Nội dung chi tiết */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">
                Nội dung chi tiết thông báo (Hỗ trợ gạch đầu dòng `-`, emoji) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Bạn chán ngắt với việc học từ vựng theo danh sách khô khan?
Hãy để HeyWord biến những từ bạn đã học thành những câu chuyện đầy thú vị!

Vì sao bạn sẽ thích tính năng này?
- 🧠 Nhớ siêu lâu: Từ vựng được lồng ghép vào cốt truyện giúp não bộ ghi nhớ tự nhiên và bền vững.
- 🏃 Thân thiện với người mất gốc: Học nhẹ nhàng, không áp lực.`}
                className="w-full p-4 bg-secondary/50 border border-border/40 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-foreground resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !title.trim() || !content.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isSending ? 'Đang phát hành...' : 'Phát Hành Thông Báo 🚀'}</span>
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Lịch sử các thông báo đã gửi */}
      <Card className="rounded-3xl border-border/40 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Lịch Sử Thông Báo Đã Phát Hành
          </CardTitle>
          <CardDescription className="text-xs">Danh sách các thông báo mới nhất phát hành đến học sinh</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-primary" />
              <span>Đang nạp danh sách thông báo...</span>
            </div>
          ) : recentSent.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-semibold">
              Chưa có thông báo nào được phát hành.
            </div>
          ) : (
            <div className="divide-y divide-border/20 max-h-80 overflow-y-auto">
              {recentSent.map((item) => (
                <div key={item.id} className="py-3 space-y-1 first:pt-0 last:pb-0 text-left group">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-extrabold text-foreground">{item.title}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground uppercase">
                        {item.targetGrade === 'all' ? 'Toàn trường' : item.targetGrade}
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa thông báo này"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
