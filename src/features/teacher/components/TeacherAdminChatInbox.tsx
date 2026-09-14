import React, { useState, useEffect, useRef } from 'react';
import { adminChatService } from '../../../services/adminChatService';
import { useAppStore } from '../../../services/store';
import { AdminChatRoom, AdminChatMessage } from '../../../types/adminChatTypes';
import { Card } from '../../../components/ui/card';
import {
  MessageSquare,
  Search,
  Send,
  Loader,
  User,
  Clock,
  Zap,
  UserPlus,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const QUICK_REPLIES = [
  '⚡ Chào em, thầy/cô ezonthi có thể giúp gì cho em?',
  '👑 Em có thể nâng cấp gói VIP Premium tại trang Cài Đặt Tài Khoản nhé!',
  '📚 Thầy/cô đã ghi nhận thắc mắc và đang hỗ trợ kiểm tra giúp em.',
  '🎉 Chúc em ôn luyện thật tốt và bứt phá điểm số trong kỳ thi tới!'
];

export const TeacherAdminChatInbox: React.FC = () => {
  const { user } = useAppStore();

  const [rooms, setRooms] = useState<AdminChatRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRoom, setSelectedRoom] = useState<AdminChatRoom | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Image Upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // 1. Real-time Listener danh sách tất cả các phòng chat của học sinh
  useEffect(() => {
    setLoadingRooms(true);
    const unsubscribe = adminChatService.subscribeToChatRooms((roomList) => {
      setRooms(roomList);
      setLoadingRooms(false);

      // Nếu chưa chọn phòng nào và có phòng chat, chọn phòng đầu tiên
      setSelectedRoom((prev) => prev || (roomList.length > 0 ? roomList[0] : null));
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Listener tin nhắn của phòng chat được chọn
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    // Đánh dấu Admin đã đọc tin nhắn của phòng này
    if (selectedRoom.unreadCountAdmin > 0) {
      adminChatService.markAsReadAdmin(selectedRoom.id);
    }

    const unsubscribe = adminChatService.subscribeToMessages(selectedRoom.id, (msgList) => {
      setMessages(msgList);
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 150);
    });

    return () => unsubscribe();
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      scrollToBottom();
    }
  }, [messages.length, selectedRoom]);

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = async (emailOrKey?: string) => {
    const key = emailOrKey || searchQuery;
    if (!key.trim()) return;

    setIsCreatingRoom(true);
    try {
      const room = await adminChatService.createOrFindRoomForStudent(key.trim());
      if (room) {
        setSelectedRoom(room);
        setSearchQuery('');
      } else {
        alert('Không thể khởi tạo cuộc chat cho học sinh này.');
      }
    } catch (err) {
      console.error('Lỗi khởi tạo phòng chat:', err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleSelectRoom = (room: AdminChatRoom) => {
    setSelectedRoom(room);
    if (room.unreadCountAdmin > 0) {
      adminChatService.markAsReadAdmin(room.id);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if ((!text.trim() && !selectedImage) || !selectedRoom || isSending || !user) return;

    setIsSending(true);
    if (!textToSend) setInputText('');

    try {
      let uploadedImageUrl: string | undefined = undefined;
      if (selectedImage) {
        const url = await adminChatService.uploadChatImage(selectedImage, selectedRoom.studentId);
        if (url) {
          uploadedImageUrl = url;
        }
        handleClearImage();
      }

      await adminChatService.sendMessage({
        studentId: selectedRoom.studentId,
        studentName: selectedRoom.studentName,
        studentEmail: selectedRoom.studentEmail,
        studentGrade: selectedRoom.studentGrade,
        senderRole: 'admin',
        senderName: 'ezonthi',
        senderId: user.uid,
        text,
        imageUrl: uploadedImageUrl
      });

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn Admin:', err);
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

  // Lọc phòng chat theo từ khóa tìm kiếm
  const filteredRooms = rooms.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.studentEmail && r.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between gap-4 bg-card p-5 rounded-3xl border border-border/40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black border border-indigo-500/20">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <span>Hộp Thư Trực Tiếp Với Học Sinh (Admin Live Chat)</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black border border-indigo-500/20 uppercase">
                Real-time
              </span>
            </h2>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Phản hồi giải đáp thắc mắc bài tập, hỗ trợ nâng cấp VIP và tư vấn cho học sinh theo thời gian thực.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const email = prompt('Nhập địa chỉ Email của học sinh bạn muốn nhắn trước:');
            if (email) handleCreateRoom(email);
          }}
          className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          <UserPlus size={15} />
          <span>Nhắn trước cho học sinh mới ➕</span>
        </button>
      </div>

      {/* Main 2-Column Master-Detail Layout */}
      <Card className="rounded-3xl border-border/40 bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] max-h-[750px]">
        {/* LEFT COLUMN: Student Rooms List (4 cols) */}
        <div className="lg:col-span-4 border-r border-border/40 flex flex-col bg-slate-50/40 dark:bg-slate-950/40">
          {/* Search Box */}
          <div className="p-3.5 border-b border-border/40 bg-card shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học sinh theo tên hoặc email..."
                className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border/40 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-foreground"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {loadingRooms ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Đang nạp danh sách cuộc trò chuyện...</span>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-10 text-center space-y-3 px-4">
                <p className="text-xs text-muted-foreground font-semibold">
                  {searchQuery ? `Chưa có cuộc trò chuyện cũ nào với "${searchQuery}"` : 'Chưa có cuộc trò chuyện nào.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleCreateRoom(searchQuery)}
                    disabled={isCreatingRoom}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                  >
                    {isCreatingRoom ? <Loader size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    <span>Mở chat mới với email này</span>
                  </button>
                )}
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const hasUnread = room.unreadCountAdmin > 0;

                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={cn(
                      'p-4 transition-all cursor-pointer space-y-1 relative text-left border-l-4',
                      isSelected
                        ? 'bg-card border-l-indigo-600 shadow-2xs'
                        : 'hover:bg-card/60 border-l-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                          {room.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className={cn('text-xs font-black block truncate', hasUnread ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground')}>
                            {room.studentName}
                          </span>
                          {room.studentEmail && (
                            <span className="text-[10px] text-muted-foreground font-medium block truncate">
                              {room.studentEmail}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread Badge */}
                      {hasUnread && (
                        <span className="px-2 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full leading-none shadow-xs animate-pulse">
                          {room.unreadCountAdmin} mới
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium line-clamp-1 pl-10 pt-0.5">
                      {room.lastSender === 'admin' ? ' Thầy/Cô: ' : ''}
                      {room.lastMessage}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-muted-foreground font-bold pl-10 pt-1">
                      <span>{room.studentGrade ? `Lớp ${room.studentGrade.replace('grade', '')}` : 'Học sinh'}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(room.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Stream Window (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-card">
          {selectedRoom ? (
            <>
              {/* Selected Student Top Bar */}
              <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {selectedRoom.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground flex items-center gap-2">
                      <span>{selectedRoom.studentName}</span>
                      {selectedRoom.studentGrade && (
                        <span className="px-2 py-0.2 rounded-md bg-secondary text-muted-foreground text-[9px] font-extrabold uppercase">
                          Khối {selectedRoom.studentGrade.replace('grade', '')}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {selectedRoom.studentEmail || 'Học sinh ezonthi'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/40 leading-relaxed text-xs">
                {loadingMessages ? (
                  <div className="py-12 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Đang tải tin nhắn...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground font-semibold">
                    Chưa có tin nhắn nào trong cuộc trò chuyện này.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={cn('flex items-end gap-2.5', isAdmin ? 'justify-end' : 'justify-start')}
                      >
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <User size={12} />
                          </div>
                        )}

                        <div
                          className={cn(
                            'max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs whitespace-pre-wrap break-words',
                            isAdmin
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-card text-foreground border border-border/60 rounded-bl-none font-medium'
                          )}
                        >
                          <span className={cn('text-[9px] font-extrabold block mb-0.5', isAdmin ? 'text-indigo-200' : 'text-emerald-600 dark:text-emerald-400')}>
                            {isAdmin ? 'ezonthi (Admin)' : selectedRoom.studentName}
                          </span>
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
                                className="max-h-60 max-w-full object-contain rounded-xl cursor-zoom-in"
                              />
                            </a>
                          )}
                          {msg.text && <p>{msg.text}</p>}
                          <span className={cn('text-[9px] font-bold block text-right mt-1 opacity-70', isAdmin ? 'text-white/80' : 'text-muted-foreground')}>
                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                            AD
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 bg-secondary/30 border-t border-border/20 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider self-center shrink-0 flex items-center gap-1">
                  <Zap size={11} className="text-amber-500" /> Trả lời nhanh:
                </span>
                {QUICK_REPLIES.map((reply, rIdx) => (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => handleSend(reply)}
                    className="px-3 py-1 rounded-full bg-card hover:bg-indigo-500/10 hover:text-indigo-600 text-foreground text-[10px] font-bold border border-border/40 whitespace-nowrap shrink-0 transition-colors cursor-pointer active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Reply Input Box Footer */}
              <div className="p-4 bg-card border-t border-border/40 shrink-0 space-y-2">
                {/* Preview ảnh đính kèm */}
                {imagePreviewUrl && (
                  <div className="relative inline-block border border-indigo-500/30 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 p-1">
                    <img src={imagePreviewUrl} alt="Preview" className="h-16 w-auto object-cover rounded-lg" />
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
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "bg-secondary/50 border-border/40 text-muted-foreground hover:text-foreground"
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
                    placeholder={`Phản hồi cho ${selectedRoom.studentName}... (dán Ctrl+V để gửi ảnh)`}
                    className="flex-1 px-4 py-2.5 bg-secondary/50 border border-border/40 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-foreground"
                    maxLength={500}
                  />

                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={isSending || (!inputText.trim() && !selectedImage)}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSending ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-sm font-black text-foreground">Chọn Một Học Sinh Để Trực Chat</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-sm">
                Bấm vào học sinh bất kỳ ở cột bên trái để bắt đầu cuộc hội thoại trực tiếp.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TeacherAdminChatInbox;
