import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookMarked,
  CheckCircle2,
  RotateCcw,
  Lightbulb,
  Check,
  X
} from 'lucide-react-native';
import { useUserStore } from '../../services/storageService';
import { DataService } from '../../services/dataService';
import { MathRenderer } from '../../components/MathRenderer';
import { HapticService } from '../../services/hapticService';

export default function MistakesScreen() {
  const router = useRouter();
  const { mistakes, resolveMistake } = useUserStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'fixed'>('pending');
  const [retestQuestionId, setRetestQuestionId] = useState<string | null>(null);

  const allQuestions = DataService.getAllQuestions();
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));

  // Lọc danh sách câu sai
  const filteredMistakes = mistakes.filter(m => {
    if (filter === 'pending') return m.reviewStatus !== 'fixed';
    if (filter === 'fixed') return m.reviewStatus === 'fixed';
    return true;
  });

  const pendingCount = mistakes.filter(m => m.reviewStatus !== 'fixed').length;
  const fixedCount = mistakes.filter(m => m.reviewStatus === 'fixed').length;

  const handleRetestAnswer = (questionId: string, selectedLetter: string, correctAnswer: string) => {
    const isCorrect = selectedLetter === correctAnswer;
    if (isCorrect) {
      HapticService.success();
      resolveMistake(questionId, true);
      Alert.alert('Chính xác! 🎉', 'Bạn đã khắc phục thành công lỗi sai này.');
      setRetestQuestionId(null);
    } else {
      HapticService.warning();
      resolveMistake(questionId, false);
      Alert.alert('Chưa đúng! 💡', `Đáp án đúng là ${correctAnswer}. Hãy đọc kỹ lại lời giải bên dưới nhé.`);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Top Stats Overview */}
      <View className="bg-slate-900 border-b border-slate-800 p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-black text-white">Sổ Lỗi Sai Của Bạn</Text>
            <Text className="text-xs text-slate-400">Ôn tập ngắt quãng (Spaced Retrieval) để nhớ sâu</Text>
          </View>
          <View className="w-10 h-10 rounded-2xl bg-rose-500/20 items-center justify-center border border-rose-500/30">
            <BookMarked size={20} color="#f43f5e" />
          </View>
        </View>

        {/* 3 Metric cards */}
        <View className="flex-row space-x-2.5 gap-2.5">
          <View className="flex-1 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 items-center">
            <Text className="text-[11px] text-slate-400 font-medium">Tổng số lỗi</Text>
            <Text className="text-base font-black text-white">{mistakes.length}</Text>
          </View>

          <View className="flex-1 bg-rose-500/15 p-3 rounded-2xl border border-rose-500/30 items-center">
            <Text className="text-[11px] text-rose-300 font-medium">Cần ôn lại</Text>
            <Text className="text-base font-black text-rose-400">{pendingCount}</Text>
          </View>

          <View className="flex-1 bg-emerald-500/15 p-3 rounded-2xl border border-emerald-500/30 items-center">
            <Text className="text-[11px] text-emerald-300 font-medium">Đã làm chủ</Text>
            <Text className="text-base font-black text-emerald-400">{fixedCount}</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View className="flex-row space-x-2 gap-2 mt-4">
          <TouchableOpacity
            onPress={() => setFilter('pending')}
            activeOpacity={0.7}
            className={`px-3.5 py-1.5 rounded-xl border ${
              filter === 'pending'
                ? 'bg-rose-600 border-rose-500'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <Text className={`text-xs font-bold ${filter === 'pending' ? 'text-white' : 'text-slate-300'}`}>
              Cần ôn ngay ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('fixed')}
            activeOpacity={0.7}
            className={`px-3.5 py-1.5 rounded-xl border ${
              filter === 'fixed'
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <Text className={`text-xs font-bold ${filter === 'fixed' ? 'text-white' : 'text-slate-300'}`}>
              Đã khắc phục ({fixedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
            className={`px-3.5 py-1.5 rounded-xl border ${
              filter === 'all'
                ? 'bg-indigo-600 border-indigo-500'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <Text className={`text-xs font-bold ${filter === 'all' ? 'text-white' : 'text-slate-300'}`}>
              Tất cả ({mistakes.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mistake Items List */}
      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        {filteredMistakes.length === 0 ? (
          <View className="bg-slate-900 border border-slate-800 rounded-3xl p-8 my-8 items-center">
            <View className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mb-4">
              <CheckCircle2 size={32} color="#10b981" />
            </View>
            <Text className="text-lg font-bold text-white text-center mb-1">
              {filter === 'pending' ? 'Không có câu nào cần ôn tập!' : 'Chưa có câu hỏi nào trong danh sách'}
            </Text>
            <Text className="text-xs text-slate-400 text-center leading-relaxed mb-4">
              {filter === 'pending'
                ? 'Bạn đang nắm rất chắc kiến thức! Khi làm sai câu hỏi ở các bài luyện tập, hệ thống sẽ tự động lưu lại ở đây.'
                : 'Hãy bắt đầu luyện tập chuyên đề để hệ thống theo dõi tiến độ của bạn.'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/subjects')}
              activeOpacity={0.8}
              className="bg-indigo-600 px-5 py-3 rounded-2xl shadow-md shadow-indigo-600/30"
            >
              <Text className="text-xs font-bold text-white">Luyện tập chuyên đề ngay →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4 gap-4 mb-8">
            {filteredMistakes.map(mistake => {
              const question = questionMap.get(mistake.questionId);
              if (!question) return null;

              const isRetesting = retestQuestionId === mistake.questionId;
              const isFixed = mistake.reviewStatus === 'fixed';

              return (
                <View
                  key={mistake.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg"
                >
                  {/* Item Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center space-x-2 gap-2">
                      <Text className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFixed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isFixed ? '✓ Đã làm chủ' : `Ôn tập lần ${mistake.reviewCount + 1}`}
                      </Text>
                      <Text className="text-xs text-slate-400 uppercase font-mono">
                        {question.subjectId}
                      </Text>
                    </View>

                    <Text className="text-[11px] text-slate-500">
                      ID: {question.id}
                    </Text>
                  </View>

                  {/* Question Content */}
                  <View className="mb-4">
                    <MathRenderer
                      content={question.content}
                      className="text-sm text-white font-medium leading-relaxed"
                    />
                  </View>

                  {/* Retest Interactive Mode */}
                  {isRetesting ? (
                    <View className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/40 mb-3 space-y-2.5 gap-2.5">
                      <Text className="text-xs font-bold text-indigo-300 mb-1">
                        Chọn đáp án để làm lại ngay:
                      </Text>
                      {question.options.map((opt, i) => {
                        const letter = ['A', 'B', 'C', 'D'][i] || opt.charAt(0);
                        return (
                          <TouchableOpacity
                            key={letter}
                            onPress={() => handleRetestAnswer(question.id, letter, question.correctAnswer)}
                            activeOpacity={0.7}
                            className="flex-row items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800"
                          >
                            <View className="w-6 h-6 rounded-lg bg-indigo-600/30 items-center justify-center mr-2.5 border border-indigo-500/40">
                              <Text className="text-xs font-bold text-indigo-200">{letter}</Text>
                            </View>
                            <View className="flex-1">
                              <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} className="text-xs text-slate-200" />
                            </View>
                          </TouchableOpacity>
                        );
                      })}

                      <TouchableOpacity
                        onPress={() => setRetestQuestionId(null)}
                        className="py-1.5 items-center mt-1"
                      >
                        <Text className="text-xs text-slate-500 font-semibold">Hủy làm lại</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Previous Answer Info */
                    <View className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mb-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center space-x-1.5 gap-1.5">
                          <X size={14} color="#f43f5e" />
                          <Text className="text-xs text-rose-300 font-semibold">
                            Lựa chọn trước đây: {mistake.wrongAnswer}
                          </Text>
                        </View>
                        <View className="flex-row items-center space-x-1.5 gap-1.5">
                          <Check size={14} color="#10b981" />
                          <Text className="text-xs text-emerald-300 font-bold">
                            Đáp án đúng: {question.correctAnswer}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Recognition Hint */}
                  {question.recognition && (
                    <View className="bg-indigo-950/30 p-3 rounded-2xl border border-indigo-500/20 mb-3">
                      <View className="flex-row items-center space-x-1.5 gap-1.5 mb-1">
                        <Lightbulb size={14} color="#818cf8" />
                        <Text className="text-xs font-bold text-indigo-300">Dấu hiệu nhận biết</Text>
                      </View>
                      <MathRenderer content={question.recognition} className="text-xs text-slate-300" />
                    </View>
                  )}

                  {/* Explanation */}
                  <View className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-3">
                    <Text className="text-[11px] font-bold text-slate-400 mb-1">Lời giải chi tiết:</Text>
                    <MathRenderer content={question.explanation} className="text-xs text-slate-300 leading-relaxed" />
                  </View>

                  {/* Retest Button */}
                  {!isRetesting && (
                    <TouchableOpacity
                      onPress={() => {
                        HapticService.selection();
                        setRetestQuestionId(mistake.questionId);
                      }}
                      activeOpacity={0.7}
                      className="w-full py-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl items-center flex-row justify-center space-x-1.5 gap-1.5"
                    >
                      <RotateCcw size={14} color="#818cf8" />
                      <Text className="text-xs font-bold text-indigo-300">Làm lại câu hỏi này ✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
