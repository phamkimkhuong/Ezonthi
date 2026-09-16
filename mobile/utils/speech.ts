import * as Speech from 'expo-speech';

/**
 * Tiện ích phát âm từ vựng bản xứ bằng công nghệ TTS native của thiết bị
 */
export function speakWord(text: string, language: string = 'en-US', rate: number = 0.9): void {
  try {
    Speech.stop();
    Speech.speak(text, {
      language,
      pitch: 1.0,
      rate,
    });
  } catch (e) {
    console.warn('Lỗi khi phát âm Speech:', e);
  }
}
