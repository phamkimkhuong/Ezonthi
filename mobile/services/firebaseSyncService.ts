import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';

export interface LeaderboardItem {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  totalAttempts: number;
  totalMinutes: number;
  masteredCount: number;
  xpScore: number;
  province?: string | null;
}

export interface LeaderboardData {
  lastUpdated: string;
  period: string;
  rankings: LeaderboardItem[];
}

export interface LeaderboardFetchResult {
  rankings: LeaderboardItem[];
  lastUpdated?: string;
  fromCache: boolean;
  error?: string | null;
}

const CACHE_KEY = '@ezonthi_leaderboard_cache';

export const FirebaseSyncService = {
  /**
   * Lấy dữ liệu Bảng Vàng Trực Tuyến với cơ chế SWR (Stale-While-Revalidate):
   * 1. Thử lấy dữ liệu thật mới nhất từ Firestore.
   * 2. Nếu thành công: Cập nhật cache AsyncStorage cục bộ.
   * 3. Nếu mất mạng: Tận dụng snapshot thật đã lưu từ phiên trước (nêu rõ thời gian lưu).
   * 4. Tuyệt đối KHÔNG trả về dữ liệu ảo/mock nhằm đảm bảo tính minh bạch & công bằng.
   */
  async getLiveLeaderboard(): Promise<LeaderboardFetchResult> {
    try {
      const summaryRef = doc(db, 'system_stats', 'leaderboard_public');
      const docSnap = await getDoc(summaryRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as LeaderboardData;
        const rankings = data.rankings || [];
        const lastUpdated = data.lastUpdated || new Date().toISOString();

        // Lưu bản snapshot thực tế vào bộ nhớ máy để dùng ngoại tuyến
        try {
          await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ rankings, lastUpdated, cachedAt: new Date().toISOString() })
          );
        } catch (storageErr) {
          console.warn('[FirebaseSync] Lỗi lưu cache cục bộ:', storageErr);
        }

        return {
          rankings,
          lastUpdated,
          fromCache: false,
          error: null,
        };
      }
    } catch (networkError: any) {
      console.warn('[FirebaseSync] Không kết nối được Firestore, kích hoạt cơ chế đọc Cache cũ:', networkError?.message);
    }

    // Khi không kết nối được server, kiểm tra xem máy đã lưu bản snapshot thật nào trước đó chưa
    try {
      const rawCached = await AsyncStorage.getItem(CACHE_KEY);
      if (rawCached) {
        const cached = JSON.parse(rawCached);
        if (cached && Array.isArray(cached.rankings) && cached.rankings.length > 0) {
          return {
            rankings: cached.rankings,
            lastUpdated: cached.cachedAt || cached.lastUpdated,
            fromCache: true,
            error: null,
          };
        }
      }
    } catch (cacheReadErr) {
      console.warn('[FirebaseSync] Lỗi đọc cache cục bộ:', cacheReadErr);
    }

    // Không có kết nối và chưa từng có cache -> Trả về mảng rỗng để UI hiển thị trạng thái Offline rõ ràng
    return {
      rankings: [],
      fromCache: false,
      error: 'NO_CONNECTION',
    };
  }
};
