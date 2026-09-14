import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";

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

/**
 * Cloud Function chạy tự động mỗi đêm lúc 00:00 (Asia/Ho_Chi_Minh)
 * Đọc Top 20 học sinh theo stats.xpScore (20 Reads) → Ghi cache vào system_stats/leaderboard (1 Write)
 */
export const updateLeaderboardDaily = onSchedule({
  schedule: "every day 00:00",
  timeZone: "Asia/Ho_Chi_Minh"
}, async () => {
  const db = getFirestore();
  console.log("⏰ 00:00: Bắt đầu tính toán lại Bảng Xếp Hạng Top 20...");

  try {
    // Lấy Top 20 bằng Firestore Index O(1) sắp xếp theo stats.xpScore (Tốn đúng 20 Reads)
    const usersSnap = await db.collection("users")
      .orderBy("stats.xpScore", "desc")
      .limit(20)
      .get();

    const rawList: Omit<LeaderboardItem, "rank">[] = [];

    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const stats = data.stats || {};
      const totalAttempts = stats.totalAttempts || 0;
      const totalStudySeconds = stats.totalStudySeconds || 0;
      const totalMinutes = Math.round(totalStudySeconds / 60);
      const completedLessons = Array.isArray(data.completedLessons) ? data.completedLessons : [];
      const masteredCount = typeof data.completedCount === "number" ? data.completedCount : completedLessons.length;
      const xpScore = stats.xpScore || 0;

      if (totalAttempts > 0 || totalMinutes > 0 || masteredCount > 0 || xpScore > 0) {
        rawList.push({
          userId: docSnap.id,
          name: data.name || data.displayName || "Học sinh",
          avatar: data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${docSnap.id}`,
          totalAttempts,
          totalMinutes,
          masteredCount,
          xpScore,
          province: data.province || null
        });
      }
    });

    rawList.sort((a, b) => b.xpScore - a.xpScore);

    const top20: LeaderboardItem[] = rawList.slice(0, 20).map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    await db.collection("system_stats").doc("leaderboard_public").set({
      lastUpdated: new Date().toISOString(),
      period: "daily",
      rankings: top20
    });
  } catch (e) {
    console.error("❌ Lỗi khi cập nhật Bảng Xếp Hạng:", e);
    throw e;
  }
});
