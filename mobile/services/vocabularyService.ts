import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ENGLISH_10_UNITS,
  ENGLISH_10_VOCABULARY,
  IVocabItem,
} from '../../src/data/grade10/english/vocabulary/english10Vocabulary';
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
   * Đọc danh sách ID các từ đã thuộc từ AsyncStorage
   */
  async getMasteredWordIds(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.VOCAB_MASTERED_WORDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Bật/Tắt trạng thái đã thuộc của 1 từ
   */
  async toggleMasteredWord(wordId: string): Promise<boolean> {
    try {
      const ids = await this.getMasteredWordIds();
      const exists = ids.includes(wordId);
      const updated = exists ? ids.filter(id => id !== wordId) : [...ids, wordId];
      await AsyncStorage.setItem(STORAGE_KEYS.VOCAB_MASTERED_WORDS, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  },

  /**
   * Đọc danh sách ID các từ được đánh dấu sao (Starred/Bookmark)
   */
  async getStarredWordIds(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.VOCAB_STARRED_WORDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Bật/Tắt dấu sao cho 1 từ
   */
  async toggleStarredWord(wordId: string): Promise<boolean> {
    try {
      const ids = await this.getStarredWordIds();
      const exists = ids.includes(wordId);
      const updated = exists ? ids.filter(id => id !== wordId) : [...ids, wordId];
      await AsyncStorage.setItem(STORAGE_KEYS.VOCAB_STARRED_WORDS, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
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
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.VOCAB_QUIZ_SCORES);
      const scores: Record<string, number> = raw ? JSON.parse(raw) : {};
      if (!scores[unitKey] || score > scores[unitKey]) {
        scores[unitKey] = score;
        await AsyncStorage.setItem(STORAGE_KEYS.VOCAB_QUIZ_SCORES, JSON.stringify(scores));
      }
    } catch (e) {
      console.warn('Lỗi lưu điểm Quiz:', e);
    }
  },

  /**
   * Đọc điểm kỷ lục Quiz
   */
  async getQuizHighScores(): Promise<Record<string, number>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.VOCAB_QUIZ_SCORES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
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
