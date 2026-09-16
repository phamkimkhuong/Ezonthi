import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Volume2, Lightbulb, CheckCircle2, XCircle, ArrowRight, RotateCcw, Eye } from 'lucide-react-native';
import { IVocabItem, VocabularyService } from '../services/vocabularyService';

interface VocabularySpellingProps {
  words: IVocabItem[];
  onFinish?: () => void;
  onSwitchToFlashcard?: () => void;
}

export const VocabularySpelling: React.FC<VocabularySpellingProps> = ({
  words,
  onSwitchToFlashcard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [revealedHintIndex, setRevealedHintIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const currentWord = words[currentIndex] || words[0];

  const handleSpeak = () => {
    if (!currentWord) return;
    VocabularyService.triggerHaptic('light');
    VocabularyService.speakWord(currentWord.word);
  };

  const handleCheck = () => {
    if (!currentWord || feedback !== null) return;

    const normalizedInput = inputVal.trim().toLowerCase();
    const targetWord = currentWord.word.trim().toLowerCase();

    if (normalizedInput === targetWord) {
      VocabularyService.triggerHaptic('success');
      setFeedback('correct');
      setScore(prev => prev + 10);
    } else {
      VocabularyService.triggerHaptic('warning');
      setFeedback('wrong');
    }
  };

  const handleHint = () => {
    if (!currentWord) return;
    VocabularyService.triggerHaptic('selection');
    // Mở thêm 1 chữ cái
    setRevealedHintIndex(prev => Math.min(prev + 1, currentWord.word.length));
  };

  const handleShowAnswer = () => {
    VocabularyService.triggerHaptic('selection');
    setShowAnswer(true);
    setFeedback('wrong');
  };

  const handleNext = () => {
    VocabularyService.triggerHaptic('light');
    if (currentIndex < Math.min(10, words.length) - 1) {
      setCurrentIndex(prev => prev + 1);
      setInputVal('');
      setRevealedHintIndex(0);
      setShowAnswer(false);
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setIsCompleted(true);
    }
  };

  const restartSpelling = () => {
    VocabularyService.triggerHaptic('selection');
    setCurrentIndex(0);
    setInputVal('');
    setRevealedHintIndex(0);
    setShowAnswer(false);
    setFeedback(null);
    setScore(0);
    setIsCompleted(false);
  };

  if (!currentWord && !isCompleted) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-slate-400">Không có từ vựng để luyện chính tả.</Text>
      </View>
    );
  }

  // MÀN HÌNH HOÀN THÀNH
  if (isCompleted) {
    return (
      <View className="flex-1 px-4 py-8 items-center justify-center">
        <View className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center shadow-xl mb-6">
          <View className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 items-center justify-center mb-3">
            <CheckCircle2 size={36} color="#818cf8" />
          </View>
          <Text className="text-xl font-black text-white text-center mb-1">
            Hoàn Thành Luyện Chính Tả! 🏆
          </Text>
          <Text className="text-xs text-slate-400 text-center mb-4">
            Bạn đã hoàn thành lượt luyện gõ từ vựng
          </Text>
          <View className="bg-slate-950/80 border border-slate-800 px-6 py-3 rounded-2xl items-center mb-4">
            <Text className="text-xs text-slate-400 font-semibold">Tổng Điểm Đạt Được</Text>
            <Text className="text-3xl font-black text-emerald-400">{score}</Text>
          </View>
        </View>

        <View className="w-full space-y-3 gap-3">
          <TouchableOpacity
            onPress={restartSpelling}
            activeOpacity={0.7}
            className="w-full py-3.5 bg-indigo-600 rounded-2xl items-center justify-center flex-row space-x-2 gap-2 shadow-lg"
          >
            <RotateCcw size={18} color="#ffffff" />
            <Text className="font-black text-sm text-white">Luyện Lại Vòng Mới</Text>
          </TouchableOpacity>

          {onSwitchToFlashcard && (
            <TouchableOpacity
              onPress={onSwitchToFlashcard}
              activeOpacity={0.7}
              className="w-full py-3 bg-slate-900 border border-slate-800 rounded-2xl items-center justify-center"
            >
              <Text className="font-bold text-xs text-slate-300">Quay Về Bộ Thẻ Flashcard</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Tạo hiển thị gợi ý ký tự _ _ _ _
  const targetChars = currentWord.word.split('');
  const hintDisplay = targetChars
    .map((ch, idx) => {
      if (ch === ' ' || ch === '-') return ch;
      if (idx < revealedHintIndex || showAnswer) return ch;
      return '_';
    })
    .join(' ');

  return (
    <ScrollView className="flex-1 px-4 py-2" keyboardShouldPersistTaps="handled">
      {/* Header trạng thái */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xs font-semibold text-slate-400">
          Chính Tả: {currentIndex + 1} / {Math.min(10, words.length)}
        </Text>
        <Text className="text-xs font-bold text-amber-400">Điểm: {score}</Text>
      </View>

      {/* Card Từ Vựng & Phát Âm */}
      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center shadow-xl mb-4">
        <TouchableOpacity
          onPress={handleSpeak}
          activeOpacity={0.7}
          className="w-14 h-14 rounded-full bg-indigo-600/30 border border-indigo-500/50 items-center justify-center mb-3"
        >
          <Volume2 size={26} color="#818cf8" />
        </TouchableOpacity>

        <Text className="text-xs text-indigo-400 font-semibold mb-1">Bấm để nghe phát âm</Text>
        <Text className="text-lg font-black text-white text-center mb-2">
          {currentWord.meaning}
        </Text>

        {currentWord.phonetic && (
          <Text className="text-xs font-medium text-slate-400 mb-3">
            {currentWord.phonetic}
          </Text>
        )}

        {/* Khung gợi ý ký tự gạch chân */}
        <View className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
          <Text className="font-mono text-base font-bold text-indigo-300 tracking-widest">
            {hintDisplay}
          </Text>
        </View>
      </View>

      {/* Ô Nhập Chính Tả */}
      <View className="mb-4">
        <TextInput
          ref={inputRef}
          value={inputVal}
          onChangeText={setInputVal}
          onSubmitEditing={handleCheck}
          placeholder="Nhập từ tiếng Anh chính xác..."
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          editable={feedback === null}
          className={`w-full bg-slate-900 border px-4 py-3.5 rounded-2xl text-white font-bold text-base ${
            feedback === 'correct'
              ? 'border-emerald-500 bg-emerald-950/30'
              : feedback === 'wrong'
              ? 'border-rose-500 bg-rose-950/30'
              : 'border-slate-800'
          }`}
        />

        {/* Phản hồi kết quả */}
        {feedback && (
          <View className="mt-3 p-3.5 rounded-2xl border flex-row items-center space-x-2.5 gap-2.5 bg-slate-900">
            {feedback === 'correct' ? (
              <>
                <CheckCircle2 size={20} color="#10b981" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-emerald-300">Chính xác! 🎉</Text>
                  <Text className="text-xs text-slate-400">"{currentWord.word}"</Text>
                </View>
              </>
            ) : (
              <>
                <XCircle size={20} color="#f43f5e" />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-rose-400">Chưa đúng!</Text>
                  <Text className="text-xs text-slate-300">Đáp án: <Text className="font-black text-emerald-400">{currentWord.word}</Text></Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Bảng Nút Gợi Ý & Kiểm Tra */}
      <View className="space-y-2.5 gap-2.5 mb-10">
        {feedback === null ? (
          <>
            <TouchableOpacity
              onPress={handleCheck}
              disabled={!inputVal.trim()}
              activeOpacity={0.7}
              className={`w-full py-3.5 rounded-2xl items-center justify-center ${
                inputVal.trim() ? 'bg-indigo-600' : 'bg-slate-800 opacity-60'
              }`}
            >
              <Text className="font-black text-sm text-white">Kiểm Tra Đáp Án</Text>
            </TouchableOpacity>

            <View className="flex-row space-x-2 gap-2">
              <TouchableOpacity
                onPress={handleHint}
                activeOpacity={0.7}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 rounded-xl items-center justify-center flex-row space-x-1.5 gap-1.5"
              >
                <Lightbulb size={15} color="#f59e0b" />
                <Text className="font-bold text-xs text-amber-400">Mở Thêm Chữ Cái</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShowAnswer}
                activeOpacity={0.7}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 rounded-xl items-center justify-center flex-row space-x-1.5 gap-1.5"
              >
                <Eye size={15} color="#94a3b8" />
                <Text className="font-bold text-xs text-slate-300">Xem Đáp Án</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            className="w-full py-3.5 bg-indigo-600 rounded-2xl items-center justify-center flex-row space-x-2 gap-2 shadow-lg"
          >
            <Text className="font-black text-sm text-white">Từ Tiếp Theo</Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
