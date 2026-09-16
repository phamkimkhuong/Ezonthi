import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Sparkles, BookOpen, ArrowRight, Bell, Bot, Clock, Award, ChevronRight } from 'lucide-react-native';
import { StreakBanner } from '../../components/StreakBanner';
import { ReminderModal } from '../../components/ReminderModal';
import { CompetencyChart } from '../../components/CompetencyChart';
import { GradeSelector } from '../../components/GradeSelector';
import { getSubjectsByGrade } from '../../services/dataService';
import { getExamsByGrade } from '../../services/examService';
import { useUserStore, GRADE_OPTIONS } from '../../stores';

export default function HomeScreen() {
  const router = useRouter();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const { user, selectedGrade } = useUserStore();

  const currentGradeSubjects = getSubjectsByGrade(selectedGrade);
  const currentGradeExams = getExamsByGrade(selectedGrade);
  const activeExams = currentGradeExams;
  const quickSubject = currentGradeSubjects.find(subject => subject.totalQuestions > 0);
  const quickTopic = quickSubject?.topics.find(topic => topic.questionCount > 0);

  const activeGradeOption =
    GRADE_OPTIONS.find((g) => g.id === selectedGrade) || GRADE_OPTIONS[0];

  const handleStartQuickPractice = () => {
    if (quickTopic) router.push(`/practice/${quickTopic.id}` as any);
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

      {/* Grade Selector Switcher */}
      <View className="my-1.5">
        <GradeSelector />
      </View>

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

      {/* Interactive English Vocabulary Banner: only the grade 10 bank is available. */}
      {selectedGrade === 'grade10' && <TouchableOpacity
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
              <Text className="text-sm font-bold text-white">
                Luyện Từ Vựng SGK 10
              </Text>
              <View className="bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                <Text className="text-[9px] font-black text-amber-300">FLASHCARD 3D</Text>
              </View>
            </View>
            <Text className="text-xs text-slate-300 mt-0.5" numberOfLines={1}>
              10 Units Tiếng Anh 10 Global Success • Quiz phản xạ • Gõ từ
            </Text>
          </View>
        </View>
        <View className="bg-slate-800 p-2 rounded-xl">
          <ChevronRight size={18} color="#94A3B8" />
        </View>
      </TouchableOpacity>}

      {/* Quick Start Daily Quest Card */}
      <View className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-500/40 rounded-3xl p-5 my-2 shadow-xl">
        <View className="flex-row items-center space-x-2 gap-2 mb-2">
          <Sparkles size={18} color="#818cf8" />
          <Text className="text-xs uppercase tracking-wider font-bold text-indigo-300">
            {quickTopic ? 'Luyện tập chuyên đề' : 'Nội dung đang được bổ sung'}
          </Text>
        </View>

        <Text className="text-xl font-bold text-white mb-1">
          {quickTopic ? `Luyện ${quickTopic.questionCount} câu trắc nghiệm` : 'Chưa mở luyện tập lớp này'}
        </Text>
        <Text className="text-xs text-slate-300 mb-4 leading-relaxed">
          {quickTopic
            ? `${quickSubject?.name} (${activeGradeOption.shortLabel}) • ${quickTopic.title}. Điểm XP được tính theo kết quả từng câu.`
            : `Các chuyên đề ${activeGradeOption.shortLabel} sẽ được mở khi có câu hỏi phù hợp. Bạn có thể chọn lớp khác để học.`}
        </Text>

        <TouchableOpacity
          onPress={handleStartQuickPractice}
          disabled={!quickTopic}
          accessibilityState={{ disabled: !quickTopic }}
          activeOpacity={0.8}
          className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-2xl flex-row items-center justify-center space-x-2 gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Play size={20} color="#ffffff" fill="#ffffff" />
          <Text className="text-white font-bold text-base">{quickTopic ? 'Bắt đầu học ngay 🚀' : 'Đang bổ sung câu hỏi'}</Text>
        </TouchableOpacity>
      </View>

      {/* Mock Exam Section */}
      <View className="mt-4 mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2 gap-2">
          <Award size={18} color="#F59E0B" />
          <Text className="text-lg font-bold text-white">
            {selectedGrade === 'grade9'
              ? 'Phòng Thi Thử Tuyển Sinh Vào 10'
              : selectedGrade === 'grade11'
              ? 'Phòng Khảo Sát Năng Lực 11'
              : 'Phòng Thi Khảo Sát 10'}
          </Text>
        </View>
        <Text className="text-xs text-slate-400">{activeExams.length > 0 ? 'Có đồng hồ làm bài' : 'Đang bổ sung'}</Text>
      </View>

      {activeExams.length === 0 && (
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-2">
          <Text className="text-sm text-slate-300">Chưa có đề thi phù hợp cho {activeGradeOption.shortLabel}. Đề sẽ được mở sau khi bổ sung nội dung.</Text>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-1 mb-2">
        {activeExams.map((exam) => (
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
        <Text className="text-lg font-bold text-white">Môn Học {activeGradeOption.label}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/subjects')}>
          <Text className="text-xs font-semibold text-indigo-400">Xem tất cả →</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-3 gap-3 mb-8">
        {currentGradeSubjects.map((subject) => (
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
                  {subject.totalQuestions} câu hỏi hiện có • {subject.totalQuestions > 0 ? `${subject.topics.length} chuyên đề` : 'Đang bổ sung'}
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
