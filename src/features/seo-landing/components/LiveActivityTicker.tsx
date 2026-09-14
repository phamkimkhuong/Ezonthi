import React, { useState, useEffect } from 'react';
import { Activity, Flame, Trophy, CheckCircle2, Zap } from 'lucide-react';

interface ActivityItem {
  id: number;
  user: string;
  location: string;
  action: string;
  target: string;
  timeAgo: string;
  icon: 'flame' | 'trophy' | 'check' | 'zap';
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    user: 'Nguyễn Bảo Nam',
    location: 'Hà Nội',
    action: 'vừa làm chủ dạng bài',
    target: 'Hệ thức Vi-ét và các ứng dụng',
    timeAgo: '1 phút trước',
    icon: 'check'
  },
  {
    id: 2,
    user: 'Trần Mai Chi',
    location: 'TP.HCM',
    action: 'đạt chuỗi học tập liên tiếp',
    target: 'Chuỗi 7 ngày giữ vững phong độ',
    timeAgo: '3 phút trước',
    icon: 'flame'
  },
  {
    id: 3,
    user: 'Lê Đức Anh',
    location: 'Đà Nẵng',
    action: 'vừa hoàn thành đề thi thử',
    target: 'Điểm 9.5 — Mã đề Toán 101',
    timeAgo: '5 phút trước',
    icon: 'trophy'
  },
  {
    id: 4,
    user: 'Vũ Thùy Dung',
    location: 'Hải Phòng',
    action: 'đã khắc phục thành công',
    target: '4 lỗi sai trong Sổ tay câu sai',
    timeAgo: '7 phút trước',
    icon: 'zap'
  },
  {
    id: 5,
    user: 'Phạm Hoàng Khang',
    location: 'Cần Thơ',
    action: 'vừa mở khóa chuyên đề',
    target: 'Bất đẳng thức Min/Max nâng cao 9+',
    timeAgo: '9 phút trước',
    icon: 'trophy'
  }
];

export const LiveActivityTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ACTIVITIES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = ACTIVITIES[currentIndex];

  const getIcon = (type: ActivityItem['icon']) => {
    switch (type) {
      case 'flame':
        return <Flame size={14} className="text-amber-500 shrink-0" />;
      case 'trophy':
        return <Trophy size={14} className="text-emerald-500 shrink-0" />;
      case 'zap':
        return <Zap size={14} className="text-purple-500 shrink-0" />;
      case 'check':
      default:
        return <CheckCircle2 size={14} className="text-primary shrink-0" />;
    }
  };

  return (
    <div
      className="w-full flex justify-center pt-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Hoạt động học tập thời gian thực"
    >
      <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full island-nav text-xs font-semibold text-muted-foreground shadow-sm hover:shadow-md transition-all max-w-full overflow-hidden">
        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1.5 border-r border-border/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Activity size={11} />
            Live Pulse
          </span>
        </div>

        {/* Dynamic Activity Content */}
        <div className="flex items-center gap-2 truncate min-w-0 animate-in fade-in duration-300 key={current.id}">
          {getIcon(current.icon)}
          <span className="font-extrabold text-foreground shrink-0">{current.user}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">({current.location})</span>
          <span className="text-muted-foreground hidden sm:inline">{current.action}</span>
          <span className="font-black text-primary truncate max-w-[180px] sm:max-w-none">{current.target}</span>
          <span className="text-[10px] font-bold text-muted-foreground shrink-0 ml-1">✦ {current.timeAgo}</span>
        </div>
      </div>
    </div>
  );
};
