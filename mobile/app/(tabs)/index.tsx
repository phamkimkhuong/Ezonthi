import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Sparkles, BookOpen, ArrowRight, Bell, Bot, Clock, Award, ChevronRight } from 'lucide-react-native';
import { StreakBanner } from '../../components/StreakBanner';
import { ReminderModal } from '../../components/ReminderModal';
import { CompetencyChart } from '../../components/CompetencyChart';
import { SUBJECTS } from '../../services/dataService';
import { MOCK_EXAMS } from '../../services/examService';
import { useUserStore } from '../../stores';

export default function HomeScreen() {
  const router = useRouter();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const { user } = useUserStore();

  const handleStartQuickPractice = () => {
    // Navigate straight to first math topic
    router.push('/practice/math10-t1');
  };

  const greetingName = user?.displayName
    ? user.displayName
    : user?.email
    ? user.email.split('@')[0]
    : 'bạn';

  return (
    <ScrollView className="flex-1 bg-slate-950 px-4 py-3" showsVerticalScrollIndicator={false}>
      {/* Header Greeting */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={() => !user && router.push('/auth')}
          activeOpacity={0.8}
          className="flex-1 mr-2"
        >
          <Text className="text-2xl font-black text-white" numberOfLines={1}>
            Chào {greetingName}! 👋
          </Text>
          <Text className="text-sm text-slate-400">
            {user ? 'Sẵn sàng bứt phá mục tiêu hôm nay?' : 'Nhấn để đăng nhập và đồng bộ tiến độ'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setReminderModalVisible(true)}
          activeOpacity={0.7}
          className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 relative"
        >
          <Bell size={20} color="#818cf8" />
          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full" />
        </TouchableOpacity>
      </View>

      {/* Streak & XP Banner */}
      <StreakBanner onPressReminder={() => setReminderModalVisible(true)} />

      {/* AI Tutor Quick Access Banner */}
      <TouchableOpacity
        onPress={() => router.push('/ai-chat')}
        activeOpacity={0.8}
        className="bg-indigo-950/70 border border-indigo-500/40 rounded-3xl p-4 my-2 flex-row items-center justify-between shadow-lg"
      >
        <View className="flex-row items-center space-x-3 gap-3 flex-1">
          <View className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center shadow-md shadow-indigo-600/40">
            <Bot size={26} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center space-x-1.5 gap-1.5">
              <Text className="text-sm font-bold text-white">Thầy EZ (AI Gia Sư)</Text>
              <View className="bg-emerald-500/20 px-1.5 py-0.2 rounded">
                <Text className="text-[10px] font-bold text-emerald-400">24/7</Text>
              </View>
            </View>
            <Text className="text-xs text-indigo-200 mt-0.5" numberOfLines={1}>
              Hỏi đáp phương pháp giải Socratic & lý thuyết
            </Text>
          </View>
        </View>
        <View className="bg-indigo-600/30 p-2 rounded-xl">
          <ChevronRight size={18} color="#A5B4FC" />
        </View>
      </TouchableOpacity>

      {/* Interactive English Vocabulary Banner */}
      <TouchableOpacity
        onPress={() => router.push('/vocabulary' as any)}
        activeOpacity={0.8}
        className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-4 my-2 flex-row items-center justify-between shadow-lg"
      >
        <View className="flex-row items-center space-x-3 gap-3 flex-1">
          <View className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 items-center justify-center">
            <Text className="text-2xl">🃏</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center space-x-1.5 gap-1.5">
              <Text className="text-sm font-bold text-white">Luyện Từ Vựng SGK 10</Text>
              <View className="bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                <Text className="text-[9px] font-black text-amber-300">FLASHCARD 3D</Text>
              </View>
            </View>
            <Text className="text-xs text-slate-300 mt-0.5" numberOfLines={1}>
              10 Units Tiếng Anh Global Success • Quiz phản xạ • Gõ từ
            </Text>
          </View>
        </View>
        <View className="bg-slate-800 p-2 rounded-xl">
          <ChevronRight size={18} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      {/* Quick Start Daily Quest Card */}
      <View className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-500/40 rounded-3xl p-5 my-2 shadow-xl">
        <View className="flex-row items-center space-x-2 gap-2 mb-2">
          <Sparkles size={18} color="#818cf8" />
          <Text className="text-xs uppercase tracking-wider font-bold text-indigo-300">
            Nhiệm Vụ Hàng Ngày (5 Phút)
          </Text>
        </View>

        <Text className="text-xl font-bold text-white mb-1">
          Luyện Đề Nhanh 5 Câu Trắc Nghiệm
        </Text>
        <Text className="text-xs text-slate-300 mb-4 leading-relaxed">
          Giải 5 câu ngẫu nhiên môn Toán 10 để tích lũy +50 XP và giữ ngọn lửa Streak không bao giờ tắt.
        </Text>

        <TouchableOpacity
          onPress={handleStartQuickPractice}
          activeOpacity={0.8}
          className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-2xl flex-row items-center justify-center space-x-2 gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Play size={20} color="#ffffff" fill="#ffffff" />
          <Text className="text-white font-bold text-base">Bắt đầu học ngay 🚀</Text>
        </TouchableOpacity>
      </View>

      {/* Mock Exam Section (Phòng Thi Thử Tuyển Sinh Vào 10) */}
      <View className="mt-4 mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2 gap-2">
          <Award size={18} color="#F59E0B" />
          <Text className="text-lg font-bold text-white">Phòng Thi Thử Vào 10</Text>
        </View>
        <Text className="text-xs text-slate-400">Bấm giờ chuẩn thi thật</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-1 mb-2">
        {MOCK_EXAMS.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            onPress={() => router.push(`/exam/${exam.id}` as any)}
            activeOpacity={0.75}
            className="w-64 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl mx-1.5 shadow-lg"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Text className="text-[10px] font-bold text-amber-300">{exam.subjectName}</Text>
              </View>
              <View className="flex-row items-center space-x-1 gap-1">
                <Clock size={12} color="#94A3B8" />
                <Text className="text-[11px] font-mono text-slate-400 font-medium">
                  {exam.durationMinutes} phút
                </Text>
              </View>
            </View>

            <Text className="text-sm font-bold text-white mb-1.5" numberOfLines={2}>
              {exam.title}
            </Text>

            <Text className="text-[11px] text-slate-400 mb-3" numberOfLines={2}>
              {exam.description}
            </Text>

            <View className="flex-row items-center justify-between pt-2 border-t border-slate-800">
              <Text className="text-[11px] text-slate-400">
                {exam.questions.length} câu hỏi trắc nghiệm
              </Text>
              <View className="bg-indigo-600 px-3 py-1 rounded-xl">
                <Text className="text-[11px] font-bold text-white">Vào thi →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Competency Chart (Đánh Giá Năng Lực Học Tập) */}
      <CompetencyChart />

      {/* Subjects Overview */}
      <View className="mt-4 mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">Môn Học Khối 10</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/subjects')}>
          <Text className="text-xs font-semibold text-indigo-400">Xem tất cả →</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-3 gap-3 mb-8">
        {SUBJECTS.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            onPress={() => router.push('/(tabs)/subjects')}
            activeOpacity={0.7}
            className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center space-x-3.5 gap-3.5">
              <View
                style={{ backgroundColor: `${subject.color}25`, borderColor: `${subject.color}50` }}
                className="w-12 h-12 rounded-2xl items-center justify-center border"
              >
                <BookOpen size={22} color={subject.color} />
              </View>

              <View>
                <View className="flex-row items-center space-x-2 gap-2">
                  <Text className="font-bold text-base text-white">{subject.name}</Text>
                  <Text
                    style={{ color: subject.color, backgroundColor: `${subject.color}15` }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    {subject.badge}
                  </Text>
                </View>
                <Text className="text-xs text-slate-400 mt-0.5">
                  {subject.totalQuestions} câu hỏi • {subject.topics.length} chuyên đề
                </Text>
              </View>
            </View>

            <ArrowRight size={18} color="#64748b" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminder Setting Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
      />
    </ScrollView>
  );
}
