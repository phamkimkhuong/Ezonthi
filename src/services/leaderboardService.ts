import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '../utils/logger';

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

export const leaderboardService = {
  /**
   * Lấy Bảng Xếp Hạng Top 20 từ cache system_stats/leaderboard (1 Read duy nhất)
   * Cache được Cloud Function updateLeaderboardDaily cập nhật mỗi đêm lúc 00:00
   */
  async getLeaderboard(): Promise<LeaderboardData> {
    try {
      const summaryRef = doc(db, 'system_stats', 'leaderboard_public');
      const docSnap = await getDoc(summaryRef);
      if (docSnap.exists()) {
        return docSnap.data() as LeaderboardData;
      }

      return { lastUpdated: '', period: 'daily', rankings: [] };
    } catch (e: any) {
      if (e?.code !== 'permission-denied') {
        logger.error('Lỗi khi lấy Bảng Xếp Hạng', e);
      }
      return { lastUpdated: '', period: 'daily', rankings: [] };
    }
  }
};
