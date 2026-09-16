import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trophy, RotateCcw, Lock } from 'lucide-react-native';
import { QuestionCard } from '../../components/QuestionCard';
import { DataService } from '../../services/dataService';
import { useUserStore } from '../../stores';
import { HapticService } from '../../services/hapticService';
import { CloudSyncService } from '../../services/cloudSyncService';

export default function PracticeScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { user, streak } = useUserStore();

  const topic = DataService.getTopic(topicId || 'math10-t1');
  const questions = DataService.getQuestionsForTopic(topicId || 'math10-t1');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);

  if (!user) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <View className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 items-center justify-center mb-4 shadow-lg">
          <Lock size={32} color="#818cf8" />
        </View>
        <Text className="text-xl font-black text-white text-center">Yêu Cầu Đăng Nhập Luyện Tập</Text>
        <Text className="text-xs text-slate-400 text-center mt-2 mb-6 leading-relaxed max-w-xs">
          Bạn cần đăng nhập bằng tài khoản Google để thực hiện các bài tập giải đề, lưu lịch sử tiến trình học tập và nhận đánh giá chuyên đề.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth')}
          activeOpacity={0.8}
          className="bg-indigo-600 active:bg-indigo-500 px-6 py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-indigo-600/30 w-full max-w-xs mb-3"
        >
          <Text className="text-white font-bold text-sm">Đăng Nhập Bằng Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="py-2.5 px-4"
        >
          <Text className="text-xs text-slate-400 font-medium">Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      HapticService.heavy();
      setIsCompleted(true);
      CloudSyncService.syncToCloud();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsCompleted(false);
  };

  if (!currentQuestion) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <Text className="text-white font-bold text-base mb-4">Không tìm thấy câu hỏi cho chuyên đề này.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-indigo-600 px-5 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const earnedXp = correctCount * 10 + (questions.length - correctCount) * 2;

  return (
    <View className="flex-1 bg-slate-950">
      {/* Progress & Topic Info Top Bar */}
      <View className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-bold text-sm text-white flex-1 mr-2" numberOfLines={1}>
            {topic?.title ?? 'Luyện tập chuyên đề'}
          </Text>
          <Text className="text-xs font-bold text-indigo-400">
            Câu {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <View
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </View>
      </View>

      {/* Quiz Body */}
      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
        {!isCompleted ? (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            onNext={handleNext}
            onAnswer={handleAnswer}
            isLast={isLastQuestion}
          />
        ) : (
          /* Completion Celebration Card */
          <View className="bg-gradient-to-b from-indigo-900/60 to-purple-900/60 border border-indigo-500/50 rounded-3xl p-6 my-6 items-center shadow-2xl">
            <View className="w-20 h-20 bg-amber-500/20 rounded-3xl items-center justify-center border border-amber-500/40 mb-4">
              <Trophy size={40} color="#f59e0b" />
            </View>

            <Text className="text-2xl font-black text-white text-center mb-1">
              Xuất Sắc! Hoàn Thành Bài Luyện Tập!
            </Text>
            <Text className="text-xs text-slate-300 text-center mb-6 leading-relaxed">
              Bạn vừa hoàn thành toàn bộ câu hỏi của chuyên đề "{topic?.title}". Kiến thức đã được ghi nhớ sâu hơn!
            </Text>

            <View className="flex-row space-x-2 gap-2 w-full mb-6">
              <View className="flex-1 bg-slate-900/80 p-3 rounded-2xl border border-slate-700 items-center">
                <Text className="text-[11px] text-slate-400 font-medium">Chính xác</Text>
                <Text className="text-base font-black text-emerald-400">{correctCount}/{questions.length}</Text>
              </View>

              <View className="flex-1 bg-slate-900/80 p-3 rounded-2xl border border-slate-700 items-center">
                <Text className="text-[11px] text-slate-400 font-medium">Tích lũy</Text>
                <Text className="text-base font-black text-indigo-300">+{earnedXp} XP</Text>
              </View>

              <View className="flex-1 bg-slate-900/80 p-3 rounded-2xl border border-slate-700 items-center">
                <Text className="text-[11px] text-slate-400 font-medium">Chuỗi ngày</Text>
                <Text className="text-base font-black text-amber-300">🔥 {streak}</Text>
              </View>
            </View>

            <View className="w-full space-y-3 gap-3">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/subjects')}
                activeOpacity={0.8}
                className="w-full p-4 bg-indigo-600 rounded-2xl items-center shadow-lg shadow-indigo-500/30"
              >
                <Text className="text-white font-bold text-base">Học chuyên đề tiếp theo →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRestart}
                activeOpacity={0.7}
                className="w-full p-3.5 bg-slate-800 rounded-2xl items-center flex-row justify-center space-x-2 gap-2 border border-slate-700"
              >
                <RotateCcw size={18} color="#94a3b8" />
                <Text className="text-slate-300 font-semibold text-sm">Làm lại bài này</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
