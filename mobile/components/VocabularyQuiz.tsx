import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  Flame,
  ArrowRight,
} from 'lucide-react-native';
import { IVocabItem, VocabularyService } from '../services/vocabularyService';

interface VocabularyQuizProps {
  words: IVocabItem[];
  unitKey: string;
  onFinish?: () => void;
  onSwitchToFlashcard?: () => void;
}

interface Question {
  target: IVocabItem;
  options: string[];
  correctAnswer: string;
}

export const VocabularyQuiz: React.FC<VocabularyQuizProps> = ({
  words,
  unitKey,
  onSwitchToFlashcard,
}) => {
  const [direction, setDirection] = useState<'en-vi' | 'vi-en'>('en-vi');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wrongWords, setWrongWords] = useState<IVocabItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [highScore, setHighScore] = useState<number>(0);

  // Đọc điểm cao nhất từ trước
  useEffect(() => {
    (async () => {
      const scores = await VocabularyService.getQuizHighScores();
      if (scores[unitKey]) {
        setHighScore(scores[unitKey]);
      }
    })();
  }, [unitKey]);

  // Tạo danh sách câu hỏi trắc nghiệm (Tối đa 10 câu mỗi vòng)
  const questions: Question[] = useMemo(() => {
    if (!words || words.length === 0) return [];
    const pool = [...words].sort(() => Math.random() - 0.5);
    const roundWords = pool.slice(0, Math.min(10, pool.length));

    return roundWords.map(target => {
      const isEnVi = direction === 'en-vi';
      const correctAnswer = isEnVi ? target.meaning : target.word;

      // Lấy 3 distractors ngẫu nhiên khác với target
      const otherWords = words.filter(w => w.id !== target.id);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongOptions = shuffledOthers
        .slice(0, 3)
        .map(w => (isEnVi ? w.meaning : w.word));

      const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

      return {
        target,
        options,
        correctAnswer,
      };
    });
  }, [words, direction]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || !currentQ) return; // Đã chọn rồi thì không cho bấm lại

    setSelectedOption(option);
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      VocabularyService.triggerHaptic('success');
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      // Điểm cơ bản + bonus điểm streak
      setScore(prev => prev + 10 + nextStreak * 2);
    } else {
      VocabularyService.triggerHaptic('warning');
      setStreak(0);
      setWrongWords(prev => [...prev, currentQ.target]);
    }
  };

  const handleNext = async () => {
    VocabularyService.triggerHaptic('light');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Hoàn thành vòng thi
      setIsCompleted(true);
      await VocabularyService.saveQuizHighScore(unitKey, score);
      if (score > highScore) {
        setHighScore(score);
      }
    }
  };

  const restartQuiz = () => {
    VocabularyService.triggerHaptic('selection');
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setWrongWords([]);
    setIsCompleted(false);
  };

  const handleSpeak = (text: string) => {
    VocabularyService.triggerHaptic('light');
    VocabularyService.speakWord(text);
  };

  if (!currentQ && !isCompleted) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-slate-400">Không có câu hỏi nào để hiển thị.</Text>
      </View>
    );
  }

  // MÀN HÌNH KẾT QUẢ TỔNG KẾT
  if (isCompleted) {
    const totalQ = questions.length;
    const correctCount = totalQ - wrongWords.length;
    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    return (
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center shadow-xl mb-4">
          <View className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 items-center justify-center mb-3">
            <Award size={36} color="#f59e0b" />
          </View>

          <Text className="text-xl font-black text-white text-center mb-1">
            {accuracy >= 80 ? 'Xuất Sắc! 🎉' : accuracy >= 50 ? 'Rất Tốt! 👏' : 'Cần Ôn Luyện Thêm! 💪'}
          </Text>
          <Text className="text-xs text-slate-400 text-center mb-4">
            Bạn đã hoàn thành vòng trắc nghiệm phản xạ từ vựng
          </Text>

          {/* Hộp điểm số */}
          <View className="w-full flex-row space-x-3 gap-3 mb-4">
            <View className="flex-1 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl items-center">
              <Text className="text-xs text-slate-400 font-semibold mb-0.5">Điểm Vòng Này</Text>
              <Text className="text-2xl font-black text-indigo-400">{score}</Text>
            </View>
            <View className="flex-1 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl items-center">
              <Text className="text-xs text-slate-400 font-semibold mb-0.5">Độ Chính Xác</Text>
              <Text className="text-2xl font-black text-emerald-400">{accuracy}%</Text>
            </View>
          </View>

          {/* Kỷ lục & Streak */}
          <View className="w-full flex-row items-center justify-between px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/60 mb-2">
            <View className="flex-row items-center space-x-1.5 gap-1.5">
              <Flame size={16} color="#f97316" />
              <Text className="text-xs font-bold text-slate-300">Chuỗi đúng dài nhất:</Text>
            </View>
            <Text className="text-xs font-black text-orange-400">{maxStreak} câu</Text>
          </View>
        </View>

        {/* Danh sách các từ cần ôn lại nếu có câu trả lời sai */}
        {wrongWords.length > 0 && (
          <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6">
            <Text className="text-sm font-black text-rose-400 mb-3 flex-row items-center">
              ⚠️ Các Từ Cần Ôn Tập Lại ({wrongWords.length} từ):
            </Text>
            <View className="space-y-2 gap-2">
              {wrongWords.map(word => (
                <View
                  key={word.id}
                  className="flex-row items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <View className="flex-1 mr-2">
                    <Text className="font-bold text-sm text-white">{word.word}</Text>
                    <Text className="text-xs text-slate-400">{word.meaning}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleSpeak(word.word)}
                    className="p-2 rounded-full bg-indigo-500/20"
                  >
                    <Volume2 size={16} color="#818cf8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Nút hành động */}
        <View className="space-y-2.5 gap-2.5 mb-10">
          <TouchableOpacity
            onPress={restartQuiz}
            activeOpacity={0.7}
            className="w-full py-3.5 bg-indigo-600 rounded-2xl items-center justify-center flex-row space-x-2 gap-2 shadow-lg"
          >
            <RotateCcw size={18} color="#ffffff" />
            <Text className="font-black text-sm text-white">Chơi Lại Vòng Mới</Text>
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
      </ScrollView>
    );
  }

  // MÀN HÌNH CHƠI QUIZ
  return (
    <View className="flex-1 flex-col justify-between py-2 px-4">
      {/* Header trạng thái Quiz */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center space-x-2 gap-2">
          {/* Nút đổi chiều Quiz */}
          <TouchableOpacity
            onPress={() => {
              VocabularyService.triggerHaptic('selection');
              setDirection(prev => (prev === 'en-vi' ? 'vi-en' : 'en-vi'));
              restartQuiz();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            <Text className="text-xs font-bold text-indigo-300">
              {direction === 'en-vi' ? 'Anh ➔ Việt' : 'Việt ➔ Anh'} 🔁
            </Text>
          </TouchableOpacity>

          {streak > 1 && (
            <View className="flex-row items-center px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
              <Flame size={13} color="#f97316" />
              <Text className="text-[11px] font-black text-orange-400 ml-1">
                Combo x{streak}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center space-x-2 gap-2">
          <Text className="text-xs font-bold text-amber-400">
            Điểm: {score}
          </Text>
          <View className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
            <Text className="text-xs font-semibold text-slate-300">
              {currentIndex + 1} / {questions.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Khung Câu Hỏi */}
      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-4 items-center justify-center">
        <Text className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">
          {direction === 'en-vi' ? 'Từ vựng tiếng Anh:' : 'Nghĩa tiếng Việt:'}
        </Text>

        <View className="flex-row items-center justify-center space-x-2 gap-2 my-2">
          <Text className="text-2xl font-black text-white text-center">
            {direction === 'en-vi' ? currentQ.target.word : currentQ.target.meaning}
          </Text>

          {direction === 'en-vi' && (
            <TouchableOpacity
              onPress={() => handleSpeak(currentQ.target.word)}
              className="p-2 rounded-full bg-indigo-500/20 border border-indigo-500/30"
            >
              <Volume2 size={20} color="#818cf8" />
            </TouchableOpacity>
          )}
        </View>

        {direction === 'en-vi' && currentQ.target.phonetic && (
          <Text className="text-xs font-medium text-slate-400 mt-1">
            {currentQ.target.phonetic}
          </Text>
        )}
      </View>

      {/* Danh sách 4 lựa chọn đáp án */}
      <View className="space-y-2.5 gap-2.5 flex-1 justify-center">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQ.correctAnswer;
          const showAnswer = selectedOption !== null;

          let btnBg = 'bg-slate-900 border-slate-800';
          let textColor = 'text-slate-200';
          let icon = null;

          if (showAnswer) {
            if (isCorrect) {
              btnBg = 'bg-emerald-950/80 border-emerald-500';
              textColor = 'text-emerald-300 font-bold';
              icon = <CheckCircle2 size={18} color="#10b981" />;
            } else if (isSelected) {
              btnBg = 'bg-rose-950/80 border-rose-500';
              textColor = 'text-rose-300 font-bold';
              icon = <XCircle size={18} color="#f43f5e" />;
            }
          }

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelectOption(option)}
              disabled={showAnswer}
              activeOpacity={0.7}
              className={`p-4 rounded-2xl border flex-row items-center justify-between ${btnBg}`}
            >
              <Text className={`text-sm flex-1 leading-snug ${textColor}`} numberOfLines={2}>
                {option}
              </Text>
              {icon}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Nút Tiếp tục (chỉ hiện khi đã chọn đáp án) */}
      <View className="pt-3">
        {selectedOption !== null ? (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            className="w-full py-3.5 bg-indigo-600 rounded-2xl items-center justify-center flex-row space-x-2 gap-2 shadow-lg"
          >
            <Text className="font-black text-sm text-white">
              {currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}
            </Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <View className="h-12 items-center justify-center">
            <Text className="text-xs text-slate-500 italic">
              Chọn 1 trong 4 đáp án trên để trả lời
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
