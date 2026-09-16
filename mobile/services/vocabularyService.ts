import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ENGLISH_10_UNITS,
  ENGLISH_10_VOCABULARY,
  IVocabItem,
} from '../../src/data/grade10/english/vocabulary/english10Vocabulary';
import { useUserStore, flushLearningStorage } from '../stores/useUserStore';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { triggerHaptic, HapticType } from '../utils/haptics';
import { speakWord } from '../utils/speech';

export interface UnitProgress {
  unit: number;
  title: string;
  theme: string;
  totalWords: number;
  masteredCount: number;
  percentage: number;
}

export const VocabularyService = {
  /**
   * Lấy danh sách 10 Unit chuẩn SGK Tiếng Anh 10
   */
  getUnits() {
    return ENGLISH_10_UNITS;
  },

  /**
   * Lấy danh sách từ vựng theo Unit (hoặc toàn bộ nếu 'all')
   */
  getWordsByUnit(unit: number | 'all'): IVocabItem[] {
    if (unit === 'all') {
      return ENGLISH_10_VOCABULARY;
    }
    return ENGLISH_10_VOCABULARY.filter(item => item.unit === unit);
  },

  /**
   * Tìm kiếm từ vựng theo từ tiếng Anh hoặc nghĩa tiếng Việt
   */
  searchWords(query: string, unit?: number | 'all'): IVocabItem[] {
    const list = unit ? this.getWordsByUnit(unit) : ENGLISH_10_VOCABULARY;
    if (!query.trim()) return list;

    const lower = query.toLowerCase().trim();
    return list.filter(
      item =>
        item.word.toLowerCase().includes(lower) ||
        item.meaning.toLowerCase().includes(lower)
    );
  },

  /**
   * Đọc danh sách ID các từ đã thuộc từ Store hoặc AsyncStorage
   */
  async getMasteredWordIds(): Promise<string[]> {
    const state = useUserStore.getState();
    const value = state.accounts[state.activeScope]?.vocabulary?.mastered || [];
    return [...value];
  },

  /**
   * Bật/Tắt trạng thái đã thuộc của 1 từ
   */
  async toggleMasteredWord(wordId: string): Promise<boolean> {
    const state = useUserStore.getState();
    const scope = state.activeScope;
    const ids = state.accounts[scope]?.vocabulary?.mastered || [];
    const exists = ids.includes(wordId);
    state.updateAccount(scope, account => ({ ...account, vocabulary: { ...account.vocabulary,
      mastered: exists ? ids.filter(id => id !== wordId) : [...ids, wordId] } }));
    await flushLearningStorage();
    return !exists;
  },

  /**
   * Đọc danh sách ID các từ được đánh dấu sao (Starred/Bookmark)
   */
  async getStarredWordIds(): Promise<string[]> {
    const state = useUserStore.getState();
    const value = state.accounts[state.activeScope]?.vocabulary?.starred || [];
    return [...value];
  },

  /**
   * Bật/Tắt dấu sao cho 1 từ
   */
  async toggleStarredWord(wordId: string): Promise<boolean> {
    const state = useUserStore.getState();
    const scope = state.activeScope;
    const ids = state.accounts[scope]?.vocabulary?.starred || [];
    const exists = ids.includes(wordId);
    state.updateAccount(scope, account => ({ ...account, vocabulary: { ...account.vocabulary,
      starred: exists ? ids.filter(id => id !== wordId) : [...ids, wordId] } }));
    await flushLearningStorage();
    return !exists;
  },

  /**
   * Lấy tiến độ học tổng hợp của tất cả các Unit
   */
  async getAllUnitsProgress(): Promise<UnitProgress[]> {
    const masteredIds = new Set(await this.getMasteredWordIds());

    return ENGLISH_10_UNITS.map(u => {
      const unitWords = ENGLISH_10_VOCABULARY.filter(w => w.unit === u.unit);
      const masteredCount = unitWords.filter(w => masteredIds.has(w.id)).length;
      const totalWords = unitWords.length;
      const percentage = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

      return {
        unit: u.unit,
        title: u.title,
        theme: u.theme,
        totalWords,
        masteredCount,
        percentage,
      };
    });
  },

  /**
   * Lưu điểm kỷ lục Quiz của Unit
   */
  async saveQuizHighScore(unitKey: string, score: number): Promise<void> {
    if (!Number.isFinite(score) || score < 0) throw new Error('Điểm quiz không hợp lệ.');
    const state = useUserStore.getState();
    state.updateAccount(state.activeScope, account => ({ ...account, vocabulary: { ...account.vocabulary,
      quizScores: { ...account.vocabulary.quizScores, [unitKey]: Math.max(account.vocabulary.quizScores[unitKey] || 0, score) } } }));
    await flushLearningStorage();
  },

  /**
   * Đọc điểm kỷ lục Quiz
   */
  async getQuizHighScores(): Promise<Record<string, number>> {
    const state = useUserStore.getState();
    const value = state.accounts[state.activeScope]?.vocabulary?.quizScores || {};
    return { ...value };
  },

  /**
   * Chuyển đổi dữ liệu tiến độ từ vựng cũ sang cấu trúc scoped account mới
   */
  async migrateLegacyProgress(): Promise<void> {
    try {
      const { legacyScope, legacyVocabularyMigrated } = useUserStore.getState();
      if (!legacyScope || legacyVocabularyMigrated) return;
      const [masteredRaw, starredRaw, scoresRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VOCAB_MASTERED_WORDS),
        AsyncStorage.getItem(STORAGE_KEYS.VOCAB_STARRED_WORDS),
        AsyncStorage.getItem(STORAGE_KEYS.VOCAB_QUIZ_SCORES),
      ]);
      const mastered = masteredRaw ? JSON.parse(masteredRaw) : [];
      const starred = starredRaw ? JSON.parse(starredRaw) : [];
      const quizScores = scoresRaw ? JSON.parse(scoresRaw) : {};
      if (useUserStore.getState().legacyVocabularyMigrated) return;
      if (!Array.isArray(mastered) || !Array.isArray(starred) || typeof quizScores !== 'object' || !quizScores) {
        return;
      }
      useUserStore.getState().updateAccount(legacyScope, account => {
        const vocab = account?.vocabulary || { mastered: [], starred: [], quizScores: {} };
        return {
          ...account,
          vocabulary: {
            mastered: [...new Set([...(vocab.mastered || []), ...mastered.filter((id: unknown) => typeof id === 'string')])],
            starred: [...new Set([...(vocab.starred || []), ...starred.filter((id: unknown) => typeof id === 'string')])],
            quizScores: { ...quizScores, ...(vocab.quizScores || {}) },
            migrated: true,
          },
        };
      });
      useUserStore.setState({ legacyVocabularyMigrated: true });
      await flushLearningStorage();
    } catch (e) {
      console.warn('Chưa chuyển được dữ liệu từ vựng cũ:', e);
    }
  },

  /**
   * Phát âm từ vựng chuẩn bản xứ qua tiện ích speech
   */
  speakWord(text: string): void {
    speakWord(text, 'en-US', 0.9);
  },

  /**
   * Rung phản hồi xúc giác qua tiện ích haptics
   */
  triggerHaptic(type: HapticType = 'light'): void {
    triggerHaptic(type);
  },
};

export type { IVocabItem };
