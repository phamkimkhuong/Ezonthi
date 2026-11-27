import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../services/store';
import { adminChatService } from '../../services/adminChatService';
import { AdminChatMessage } from '../../types/adminChatTypes';
import {
  MessageSquare,
  X,
  Send,
  Loader,
  Sparkles,
  User,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { MONETIZATION_ENABLED } from '../../utils/premium';

const QUICK_SUGGESTIONS = [
  '👋 Xin chào Admin ezonthi!',
  ...(MONETIZATION_ENABLED ? ['👑 Tư vấn kích hoạt VIP Premium'] : []),
  '📚 Em cần hỗ trợ thắc mắc bài tập',
  '🐛 Báo lỗi giao diện ứng dụng'
];

export const AdminChatWidget: React.FC = () => {
  const { user, selectedGrade } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Image Upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time listener tin nhắn khi đăng nhập
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const unsubscribe = adminChatService.subscribeToMessages(user.uid, (list) => {
      setMessages(list);

      // Đếm số tin nhắn chưa đọc từ phía Admin
      const unreadFromAdmin = list.filter((m) => m.senderRole === 'admin' && !m.read).length;
      setUnreadCount(unreadFromAdmin);
    });

    return () => unsubscribe();
  }, [user]);

  // Đánh dấu đã đọc khi người dùng mở khung chat
  useEffect(() => {
    if (isOpen && user && unreadCount > 0) {
      adminChatService.markAsReadStudent(user.uid);
      setUnreadCount(0);
    }
    if (isOpen) {
      setTimeout(scrollToBottom, 150);
    }
  }, [isOpen, user, unreadCount]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages.length, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Dung lượng hình ảnh quá lớn (tối đa 10MB).');
        return;
      }
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          if (file.size > 10 * 1024 * 1024) {
            alert('Dung lượng hình ảnh quá lớn (tối đa 10MB).');
            return;
          }
          setSelectedImage(file);
          setImagePreviewUrl(URL.createObjectURL(file));
          break;
        }
      }
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if ((!text.trim() && !selectedImage) || !user || isSending) return;

    setIsSending(true);
    if (!textToSend) setInputText('');

    try {
      let uploadedImageUrl: string | undefined = undefined;
      if (selectedImage) {
        const url = await adminChatService.uploadChatImage(selectedImage, user.uid);
        if (url) {
          uploadedImageUrl = url;
        }
        handleClearImage();
      }

      await adminChatService.sendMessage({
        studentId: user.uid,
        studentName: user.displayName || user.email?.split('@')[0] || 'Học sinh',
        studentEmail: user.email || undefined,
        studentGrade: selectedGrade,
        senderRole: 'student',
        senderName: user.displayName || 'Học sinh',
        senderId: user.uid,
        text,
        imageUrl: uploadedImageUrl
      });

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* 1. FLOATING CHAT BUTTON (Bong bóng Chat nổi) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center gap-2.5 group"
          title="Nhắn tin trò chuyện với Admin ezonthi"
        >
          <div className="relative">
            <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline tracking-wide font-black">Hỗ Trợ Admin 💬</span>

          {/* Online green indicator dot */}
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-pulse" />
        </button>
      )}

      {/* 2. CHAT POPOVER WINDOW (Cửa sổ chat thời gian thực) */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[440px] md:w-[460px] h-[560px] sm:h-[620px] max-h-[90vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header Window */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-700 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-yellow-300 font-black shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  <span>ezonthi Admin Support</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-900 text-[8px] font-black uppercase">
                    Official
                  </span>
                </h3>
                <p className="text-[10px] text-white/80 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Sẵn sàng hỗ trợ trực tiếp 24/7</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Đóng cửa sổ chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Stream Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/60 leading-relaxed text-xs">
            {/* System Welcome Card */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-2xs space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-black">
                <Sparkles size={16} />
              </div>
              <p className="text-[11px] font-bold text-foreground">
                Chào mừng em đến với Hỗ trợ trực tiếp ezonthi!
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Hãy để lại thắc mắc của em, Admin/Giáo viên sẽ phản hồi sớm nhất nhé.
              </p>
            </div>

            {/* Render Real-Time Messages */}
            {messages.map((msg) => {
              const isMe = msg.senderRole === 'student';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isMe ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 border border-indigo-400/30">
                      AD
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs whitespace-pre-wrap break-words',
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-card text-foreground border border-border/60 rounded-bl-none font-medium'
                    )}
                  >
                    {!isMe && (
                      <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        ezonthi (Admin)
                      </span>
                    )}
                    {msg.imageUrl && (
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block my-1.5 overflow-hidden rounded-xl border border-white/20 hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={msg.imageUrl}
                          alt="Chat Attachment"
                          className="max-h-52 max-w-full object-contain rounded-xl cursor-zoom-in"
                        />
                      </a>
                    )}
                    {msg.text && <p>{msg.text}</p>}
                    <span
                      className={cn(
                        'text-[9px] font-bold block text-right mt-1 opacity-70',
                        isMe ? 'text-white/80' : 'text-muted-foreground'
                      )}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <User size={12} />
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          {messages.length === 0 && (
            <div className="px-3 py-2 bg-secondary/30 border-t border-border/20 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(sug)}
                  className="px-2.5 py-1 rounded-full bg-card hover:bg-secondary text-foreground text-[10px] font-bold border border-border/40 whitespace-nowrap shrink-0 transition-colors cursor-pointer active:scale-95"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Footer */}
          <div className="p-3 bg-card border-t border-border/40 shrink-0 space-y-2">
            {/* Preview ảnh đính kèm */}
            {imagePreviewUrl && (
              <div className="relative inline-block border border-emerald-500/30 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 p-1">
                <img src={imagePreviewUrl} alt="Preview" className="h-14 w-auto object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className={cn(
                  "p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0",
                  selectedImage
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "bg-secondary/60 border-border/40 text-muted-foreground hover:text-foreground"
                )}
                title="Đính kèm hình ảnh"
              >
                <ImageIcon size={16} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Nhập nội dung... (dán Ctrl+V để gửi ảnh)"
                className="flex-1 px-3.5 py-2.5 bg-secondary/60 border border-border/40 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-foreground"
                maxLength={500}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isSending || (!inputText.trim() && !selectedImage)}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                title="Gửi tin nhắn"
              >
                {isSending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminChatWidget;
