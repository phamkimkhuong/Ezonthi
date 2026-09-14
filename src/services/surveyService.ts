import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, functions } from './firebase';
import type { UnifiedSurveyResponse, UserSurveyState } from '../types/surveyTypes';
import { httpsCallable } from 'firebase/functions';
import { logger } from '../utils/logger';

const STORAGE_KEYS = {
  SURVEY_COMPLETED: 'otv10_survey_completed',
  SURVEY_DATA: 'otv10_survey_data',
  SKIPPED_UNTIL: 'otv10_survey_skipped_until',
};

function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) return null as unknown as T;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore) as unknown as T;

  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned as T;
}

class SurveyService {
  /**
   * Lấy trạng thái khảo sát hiện tại của user
   */
  public getSurveyState(): UserSurveyState {
    if (typeof localStorage === 'undefined') {
      return { completed: false };
    }

    const completed = localStorage.getItem(STORAGE_KEYS.SURVEY_COMPLETED) === 'true';
    let data: UnifiedSurveyResponse | undefined;

    const rawData = localStorage.getItem(STORAGE_KEYS.SURVEY_DATA);
    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('Lỗi đọc dữ liệu khảo sát từ LocalStorage:', e);
      }
    }

    return { completed, data };
  }

  /**
   * Kiểm tra xem có nên hiển thị Khảo sát tự động không
   */
  public shouldShowSurvey(): boolean {
    if (typeof localStorage === 'undefined') return false;

    const state = this.getSurveyState();
    if (state.completed) return false;

    const skippedUntil = localStorage.getItem(STORAGE_KEYS.SKIPPED_UNTIL);
    if (skippedUntil) {
      const skipTime = parseInt(skippedUntil, 10);
      if (Date.now() < skipTime) return false;
    }

    return true;
  }

  /**
   * Lưu kết quả Khảo sát (Local + Sync Firestore)
   * Server tổng hợp từ bản ghi cá nhân; client không sửa số đếm chung.
   */
  public async saveSurvey(data: Omit<UnifiedSurveyResponse, 'completedAt'>): Promise<void> {
    const fullData: UnifiedSurveyResponse = {
      ...data,
      completedAt: new Date().toISOString(),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, 'true');
      localStorage.setItem(STORAGE_KEYS.SURVEY_DATA, JSON.stringify(fullData));
    }

    // Sync Firestore
    const user = auth.currentUser;
    if (user) {
      const sanitizedSurvey = sanitizeForFirestore(fullData);

      // 1. Lưu bản ghi cá nhân của học sinh
      try {
        const surveyRef = doc(db, 'survey_responses', user.uid);
        await setDoc(
          surveyRef,
          {
            userId: user.uid,
            userEmail: user.email ?? null,
            survey: sanitizedSurvey,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (userDocError) {
        logger.error('Không thể đồng bộ survey_responses lên Firestore', userDocError);
      }

    }
  }

  /**
   * Báo cáo khảo sát được server tính lại, chỉ giáo viên có quyền gọi.
   */
  public async getAdminSurveySummary(): Promise<any> {
    try {
      return (await httpsCallable(functions, 'getSurveySummary')({})).data;
    } catch (e) {
      console.error('Lỗi khi đọc survey summary O(1) read:', e);
      return null;
    }
  }

  /**
   * Tạm hoãn khảo sát (Skip) trong X giờ (Mặc định: 24 giờ)
   */
  public skipSurvey(hoursDelay = 24): void {
    if (typeof localStorage === 'undefined') return;
    const until = Date.now() + hoursDelay * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.SKIPPED_UNTIL, until.toString());
  }
}

export const surveyService = new SurveyService();
