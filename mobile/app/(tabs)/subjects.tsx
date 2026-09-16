import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, HelpCircle, Sparkles, Star } from 'lucide-react-native';
import { getSubjectsByGrade } from '../../services/dataService';
import { useUserStore } from '../../stores';
import { GradeSelector } from '../../components/GradeSelector';

export default function SubjectsScreen() {
  const router = useRouter();
  const { topicMastery, selectedGrade } = useUserStore();
  const currentGradeSubjects = getSubjectsByGrade(selectedGrade);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    () => currentGradeSubjects[0]?.id || 'math'
  );

  const currentSubject =
    currentGradeSubjects.find((s) => s.id === selectedSubjectId) ||
    currentGradeSubjects[0] || {
      id: 'math',
      name: 'Toán học',
      badge: 'Trọng tâm',
      color: '#6366f1',
      totalQuestions: 0,
      topics: [],
    };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Grade Selector Header */}
      <View className="px-4 pt-3 pb-2 bg-slate-950">
        <GradeSelector
          onGradeChange={(newGrade) => {
            const newSubjects = getSubjectsByGrade(newGrade);
            if (!newSubjects.some((s) => s.id === selectedSubjectId)) {
              setSelectedSubjectId(newSubjects[0]?.id || 'math');
            }
          }}
        />
      </View>

      {/* Subject Filter Tabs */}
      <View className="bg-slate-900 border-b border-slate-800 py-3 px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {currentGradeSubjects.map((subject) => {
            const isSelected = subject.id === currentSubject.id;
            return (
              <TouchableOpacity
                key={subject.id}
                onPress={() => setSelectedSubjectId(subject.id)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: isSelected ? subject.color : '#1e293b',
                  borderColor: isSelected ? subject.color : '#334155',
                }}
                className="px-4 py-2 rounded-xl border flex-row items-center gap-1.5"
              >
                <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {subject.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Topics List */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Subject Header Banner */}
        <View
          style={{ backgroundColor: `${currentSubject.color}15`, borderColor: `${currentSubject.color}35` }}
          className="p-4 rounded-2xl border mb-4 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-lg font-black text-white">{currentSubject.name}</Text>
            <Text className="text-xs text-slate-300 mt-0.5">
              {currentSubject.totalQuestions > 0
                ? `${currentSubject.totalQuestions} câu hỏi hiện có trên ứng dụng`
                : 'Đang bổ sung nội dung. Chưa mở luyện tập.'}
            </Text>
          </View>
          <View
            style={{ backgroundColor: currentSubject.color }}
            className="w-10 h-10 rounded-xl items-center justify-center shadow-md"
          >
            <Sparkles size={20} color="#ffffff" />
          </View>
        </View>

        {/* Banner Luyện Từ Vựng Tương Tác (Khi chọn môn Tiếng Anh) */}
        {selectedGrade === 'grade10' && currentSubject.id === 'english' && (
          <TouchableOpacity
            onPress={() => router.push('/vocabulary' as any)}
            activeOpacity={0.8}
            className="mb-4 p-4 rounded-3xl bg-indigo-950/70 border-2 border-indigo-500/50 shadow-xl"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center space-x-2 gap-2">
                <View className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40">
                  <Text className="text-[10px] font-black text-indigo-300">TƯƠNG TÁC 3D</Text>
                </View>
                <Text className="text-xs font-bold text-amber-400">10 Units SGK</Text>
              </View>
              <Sparkles size={16} color="#818cf8" />
            </View>

            <Text className="text-base font-black text-white mb-1">
              🃏 Luyện Từ Vựng Flashcard & Quiz
            </Text>
            <Text className="text-xs text-slate-300 leading-relaxed mb-3">
              Lật thẻ 3D 60fps, nghe phát âm giọng bản xứ, phản xạ 4 đáp án và luyện gõ chính tả.
            </Text>

            <View className="flex-row items-center justify-between pt-2.5 border-t border-slate-800">
              <Text className="text-xs font-bold text-indigo-300">Vào học từ vựng ngay</Text>
              <Text className="text-xs font-black text-white">Khám Phá ➔</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* List of topics */}
        <View className="space-y-3 gap-3 mb-10">
          {currentSubject.topics.map((topic, index) => {
            const isAvailable = topic.questionCount > 0;
            const mastery = isAvailable ? topicMastery[topic.id] : undefined;
            const score = mastery?.score ?? 0;
            const stars = mastery?.stars ?? 0;
            const isMastered = !!mastery?.hasEnoughEvidence && score >= 80;

            return (
              <TouchableOpacity
                key={topic.id}
                disabled={!isAvailable}
                accessibilityState={{ disabled: !isAvailable }}
                onPress={() => router.push(`/practice/${topic.id}` as any)}
                activeOpacity={0.7}
                className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl ${isAvailable ? '' : 'opacity-60'}`}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center space-x-2 gap-2 flex-1 mr-2">
                    <View className="w-6 h-6 rounded-lg bg-indigo-500/20 items-center justify-center">
                      <Text className="text-xs font-bold text-indigo-300">{index + 1}</Text>
                    </View>
                    <Text className="font-bold text-sm text-white flex-1" numberOfLines={1}>
                      {topic.title}
                    </Text>
                  </View>

                  {/* Star Rating */}
                  <View className="flex-row items-center space-x-1 gap-1">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        size={13}
                        color={s <= stars ? '#f59e0b' : '#334155'}
                        fill={s <= stars ? '#f59e0b' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>

                <Text className="text-xs text-slate-400 mb-2 leading-relaxed" numberOfLines={2}>
                  {topic.description}
                </Text>

                {/* Mini Mastery Progress Bar */}
                <View className="w-full h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
                  <View
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    className={`h-full rounded-full ${
                      isMastered ? 'bg-amber-400' : score > 0 ? 'bg-indigo-500' : 'bg-transparent'
                    }`}
                  />
                </View>

                <View className="flex-row items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <View className="flex-row items-center space-x-3 gap-3">
                    <View className="flex-row items-center space-x-1 gap-1">
                      <HelpCircle size={14} color="#818cf8" />
                      <Text className="text-xs text-slate-300 font-medium">{topic.questionCount} câu</Text>
                    </View>
                    {isAvailable && <View className="flex-row items-center space-x-1 gap-1">
                      <Clock size={14} color="#f59e0b" />
                      <Text className="text-xs text-slate-300 font-medium">~{topic.estimatedMinutes} phút</Text>
                    </View>}
                  </View>

                  <View className="flex-row items-center space-x-1.5 gap-1.5">
                    {score > 0 && (
                      <Text className="text-[11px] font-bold text-indigo-300">
                        {score}%
                      </Text>
                    )}
                    <Text className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isMastered ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      score > 0 ? 'bg-indigo-500/15 text-indigo-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {!isAvailable ? 'Đang bổ sung' : isMastered ? '🏆 Đã làm chủ' : score > 0 ? 'Đang học' : 'Chưa học'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
