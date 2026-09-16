import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Trophy, Flame, Zap, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import { useUserStore } from '../../services/storageService';
import { FirebaseSyncService, LeaderboardItem, LeaderboardFetchResult } from '../../services/firebaseSyncService';
import { HapticService } from '../../services/hapticService';
import { useNetInfo } from '@react-native-community/netinfo';

export default function RankScreen() {
  const { xp, streak, user } = useUserStore();
  const netInfo = useNetInfo();
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fetchResult, setFetchResult] = useState<LeaderboardFetchResult | null>(null);

  const fetchRankings = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await FirebaseSyncService.getLiveLeaderboard();
      setFetchResult(res);
      setLeaderboard(res.rankings);
      if (res.rankings.length > 0 && !res.fromCache) {
        HapticService.selection();
      }
    } catch {
      setFetchResult({
        rankings: [],
        fromCache: false,
        error: 'FETCH_FAILED',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Tự động tải lại Bảng vàng thời gian thực ngay khi có mạng trở lại mà không cần bấm nút
  useEffect(() => {
    if (netInfo.isConnected === true && (leaderboard.length === 0 || fetchResult?.fromCache)) {
      fetchRankings(false);
    }
  }, [netInfo.isConnected, leaderboard.length, fetchResult?.fromCache, fetchRankings]);

  const handleRetry = () => {
    HapticService.selection();
    fetchRankings(false);
  };

  const isOfflineEmpty = !loading && leaderboard.length === 0;
  const isFromCache = fetchResult?.fromCache === true;

  // Tính toán vị trí thực tế trên Bảng xếp hạng
  const userRankIndex = leaderboard.findIndex(item =>
    (user?.uid && item.userId === user.uid) ||
    (user?.displayName && item.name?.toLowerCase() === user.displayName.toLowerCase())
  );
  const rankDisplay = userRankIndex !== -1
    ? `Hạng #${userRankIndex + 1} Toàn Quốc`
    : (xp > 0 ? `Đạt ${xp} XP` : `Chưa vào bảng xếp hạng`);

  return (
    <ScrollView
      className="flex-1 bg-slate-950 px-4 py-3"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            HapticService.selection();
            fetchRankings(true);
          }}
          tintColor="#6366f1"
        />
      }
    >
      {/* Your Personal Rank Card */}
      <View className="bg-gradient-to-r from-indigo-900/60 to-purple-900/50 border border-indigo-500/40 rounded-3xl p-5 my-2 shadow-xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3 gap-3">
            <View className="w-12 h-12 bg-indigo-500/30 rounded-2xl items-center justify-center border border-indigo-400/40">
              <Trophy size={24} color="#818cf8" />
            </View>
            <View>
              <Text className="text-sm text-indigo-300 font-semibold">
                {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Vị Trí Của Bạn')}
              </Text>
              <Text className="text-xl font-black text-white">{rankDisplay}</Text>
            </View>
          </View>

          <View className="items-end">
            <View className="flex-row items-center space-x-1 gap-1">
              <Zap size={16} color="#fbbf24" fill="#fbbf24" />
              <Text className="text-base font-black text-amber-300">{xp} XP</Text>
            </View>
            <View className="flex-row items-center space-x-1 gap-1 mt-0.5">
              <Flame size={14} color="#f97316" fill="#f97316" />
              <Text className="text-xs text-orange-400 font-bold">{streak} ngày liên tục</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Offline Notice Banner (Nếu đang dùng dữ liệu cache cũ) */}
      {isFromCache && (
        <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 my-2 flex-row items-center space-x-2.5 gap-2.5">
          <WifiOff size={16} color="#f59e0b" />
          <View className="flex-1">
            <Text className="text-xs font-bold text-amber-300">Đang hiển thị bản lưu ngoại tuyến</Text>
            <Text className="text-[11px] text-slate-400 mt-0.5">
              Kéo xuống để cập nhật lại khi có kết nối Internet
            </Text>
          </View>
        </View>
      )}

      {/* Leaderboard Header with Live Badge */}
      <View className="flex-row items-center justify-between mt-4 mb-2">
        <Text className="text-base font-bold text-white">Bảng Vàng Thi Đua 🏆</Text>
        {isFromCache ? (
          <View className="flex-row items-center space-x-1 gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            <WifiOff size={12} color="#f59e0b" />
            <Text className="text-[11px] font-bold text-amber-400">Offline Cache</Text>
          </View>
        ) : (
          <View className="flex-row items-center space-x-1 gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <Wifi size={12} color="#10b981" />
            <Text className="text-[11px] font-bold text-emerald-400">Firebase Live</Text>
          </View>
        )}
      </View>

      {/* Loading Skeleton State */}
      {loading && !refreshing && (
        <View className="space-y-3 gap-3 my-4">
          {[1, 2, 3, 4, 5].map(item => (
            <View
              key={item}
              className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between opacity-70"
            >
              <View className="flex-row items-center space-x-3 gap-3 flex-1">
                <View className="w-8 h-8 rounded-xl bg-slate-800 animate-pulse" />
                <View className="flex-1 space-y-1.5 gap-1.5">
                  <View className="w-32 h-3.5 bg-slate-800 rounded-md animate-pulse" />
                  <View className="w-20 h-2.5 bg-slate-800/80 rounded-md animate-pulse" />
                </View>
              </View>
              <View className="w-14 h-4 bg-slate-800 rounded-md animate-pulse" />
            </View>
          ))}
        </View>
      )}

      {/* Clean Offline Empty State (Không có dữ liệu ảo) */}
      {isOfflineEmpty && (
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 my-6 items-center text-center">
          <View className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 items-center justify-center mb-3.5">
            <WifiOff size={28} color="#f43f5e" />
          </View>

          <Text className="text-base font-black text-white text-center">Chưa Có Kết Nối Internet</Text>
          <Text className="text-xs text-slate-400 text-center mt-1.5 mb-5 leading-relaxed px-2">
            Bảng vàng toàn quốc cần kết nối mạng để tải thứ hạng thi đua thời gian thực. Vui lòng kiểm tra Wi-Fi / 4G của bạn.
          </Text>

          <TouchableOpacity
            onPress={handleRetry}
            activeOpacity={0.8}
            className="bg-indigo-600 active:bg-indigo-700 px-5 py-2.5 rounded-xl flex-row items-center space-x-2 gap-2 shadow-lg"
          >
            <RefreshCw size={16} color="#ffffff" />
            <Text className="text-xs font-bold text-white">Thử Lại Kết Nối</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Leaderboard List (Thực tế từ Firebase) */}
      {!loading && leaderboard.length > 0 && (
        <View className="space-y-2.5 gap-2.5 mb-10">
          {leaderboard.map(student => {
            let rankColor = '#64748b';
            let badgeBg = 'bg-slate-800 border-slate-700';
            if (student.rank === 1) {
              rankColor = '#eab308';
              badgeBg = 'bg-amber-500/20 border-amber-500/50';
            }
            if (student.rank === 2) {
              rankColor = '#94a3b8';
              badgeBg = 'bg-slate-400/20 border-slate-400/50';
            }
            if (student.rank === 3) {
              rankColor = '#b45309';
              badgeBg = 'bg-amber-700/20 border-amber-700/50';
            }

            return (
              <View
                key={student.userId || `rank-${student.rank}`}
                className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex-row items-center justify-between"
              >
                <View className="flex-row items-center space-x-3 gap-3 flex-1">
                  {/* Rank Number */}
                  <View className={`w-8 h-8 rounded-xl items-center justify-center border ${badgeBg}`}>
                    <Text style={{ color: rankColor }} className="font-black text-sm">
                      {student.rank}
                    </Text>
                  </View>

                  {/* Name & Province */}
                  <View className="flex-1">
                    <Text className="font-bold text-sm text-white" numberOfLines={1}>
                      {student.name}
                    </Text>
                    <Text className="text-[11px] text-slate-400" numberOfLines={1}>
                      {student.province || 'Thí sinh tự do'} • {student.masteredCount || 0} câu đã thành thạo
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View className="items-end ml-2">
                  <Text className="font-black text-xs text-indigo-300">{student.xpScore || 0} XP</Text>
                  <View className="flex-row items-center space-x-1 gap-1">
                    <Flame size={12} color="#f97316" fill="#f97316" />
                    <Text className="text-[10px] text-orange-400 font-semibold">
                      {student.totalAttempts || 0} lượt thi
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
