import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, RefreshCw, Zap, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { leaderboardService, LeaderboardItem } from '../../services/leaderboardService';
import { useAppStore } from '../../services/store';
import { cn } from '../../utils/cn';

export const LeaderboardWidget: React.FC = () => {
  const { user, userData } = useAppStore();
  const [rankings, setRankings] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const data = await leaderboardService.getLeaderboard();
    setRankings(data.rankings || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Tính toán vị trí thứ hạng của học sinh hiện tại nếu chưa lọt Top 20
  const currentUserStats = useMemo(() => {
    if (!user) return null;

    const currentUserId = user.uid;
    const isUserInTop20 = rankings.some(r => r.userId === currentUserId);

    if (isUserInTop20) {
      return { isTop20: true };
    }

    const verified = userData?.stats?.source === 'server-checked-v1' ? userData.stats : {};
    const totalAttempts = verified.totalAttempts || 0;
    const totalMinutes = Math.round((verified.totalStudySeconds || 0) / 60);
    const masteredCount = verified.source ? (userData?.completedCount || 0) : 0;
    const xpScore = verified.xpScore || 0;

    // Tính khoảng cách XP tới vị trí #20
    const rank20 = rankings[rankings.length - 1];
    const targetXp = rank20 ? rank20.xpScore : 500;
    const xpNeeded = Math.max(0, targetXp - xpScore + 10);

    return {
      isTop20: false,
      userId: currentUserId,
      name: user.displayName || 'Bạn',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUserId}`,
      totalAttempts,
      totalMinutes,
      masteredCount,
      xpScore,
      xpNeeded
    };
  }, [user, userData, rankings]);

  return (
    <Card className="border border-border/50 bg-card rounded-3xl shadow-lg overflow-hidden">
      <CardHeader className="p-5 border-b border-border/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10">
        <CardTitle className="text-foreground text-sm font-black flex items-center gap-2 tracking-wide uppercase font-sans">
          <Trophy className="text-amber-500 shrink-0 animate-bounce" size={18} />
          Bảng Xếp Hạng Top 20
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-semibold text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span>Đang tải Bảng Xếp Hạng Top 20...</span>
          </div>
        ) : rankings.length === 0 ? (
          <div className="p-10 text-center text-xs text-muted-foreground italic">
            Chưa có dữ liệu bảng xếp hạng tuần này. Hãy là người đầu tiên làm bài để lên Top 1!
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/30 text-muted-foreground font-black uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4 text-center w-12">Hạng</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">Số câu</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">Thời gian</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">Master</th>
                <th className="py-3 px-4 text-right">Điểm XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-semibold">
              {rankings.map((item) => {
                const isCurrentUser = user && item.userId === user.uid;

                let rowBgClass = "hover:bg-secondary/30";
                let rankBadge = <span className="font-mono text-muted-foreground">#{item.rank}</span>;

                if (item.rank === 1) {
                  rowBgClass = "bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-amber-500";
                  rankBadge = <span className="text-base leading-none">🥇</span>;
                } else if (item.rank === 2) {
                  rowBgClass = "bg-slate-500/10 hover:bg-slate-500/15 border-l-4 border-slate-400";
                  rankBadge = <span className="text-base leading-none">🥈</span>;
                } else if (item.rank === 3) {
                  rowBgClass = "bg-amber-700/10 hover:bg-amber-700/15 border-l-4 border-amber-700";
                  rankBadge = <span className="text-base leading-none">🥉</span>;
                }

                if (isCurrentUser) {
                  rowBgClass = "bg-primary/15 hover:bg-primary/20 border-l-4 border-primary font-bold";
                }

                return (
                  <tr key={item.userId} className={cn("transition-colors", rowBgClass)}>
                    <td className="py-3 px-4 text-center font-black">{rankBadge}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-7 h-7 rounded-full bg-secondary object-cover border border-border/40 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black truncate text-foreground flex items-center gap-1.5 flex-wrap">
                            {item.name}
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 text-[8px] bg-primary text-primary-foreground rounded-full font-bold">
                                Bạn
                              </span>
                            )}
                            {item.province && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-secondary text-muted-foreground text-[8px] font-bold">
                                <MapPin size={8} className="text-muted-foreground shrink-0" />
                                {item.province}
                              </span>
                            )}
                          </span>
                          {/* Dòng thông số phụ chỉ hiện trên mobile */}
                          <span className="block sm:hidden text-[9px] text-muted-foreground font-medium mt-0.5">
                            {item.province ? `${item.province} • ` : ''}{item.totalAttempts} câu • {item.totalMinutes} phút • {item.masteredCount} dạng
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-foreground hidden sm:table-cell">
                      {item.totalAttempts}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-muted-foreground hidden sm:table-cell">
                      {item.totalMinutes} phút
                    </td>
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.masteredCount} dạng
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-500 font-mono text-xs">
                      {item.xpScore.toLocaleString()} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Dòng ghim vị trí của người dùng hiện tại nếu chưa lọt Top 20 */}
        {currentUserStats && !currentUserStats.isTop20 && (
          <div className="p-3.5 bg-gradient-to-r from-primary/15 via-indigo-500/10 to-purple-500/15 border-t-2 border-primary/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2 py-1 bg-primary text-primary-foreground rounded-lg font-black text-[10px]">
                📌 Vị trí của bạn
              </span>
              <span className="font-bold text-foreground">
                {currentUserStats.xpScore} XP
              </span>
              {userData?.province && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-secondary text-muted-foreground text-[8px] font-bold">
                  <MapPin size={8} className="text-muted-foreground shrink-0" />
                  {userData.province}
                </span>
              )}
            </div>
            <div className="text-[10px] font-black text-primary flex items-center gap-1">
              <Zap size={12} className="fill-amber-400 text-amber-400" />
              <span>Cần thêm {currentUserStats.xpNeeded} XP nữa để bứt phá vào Top 20!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
