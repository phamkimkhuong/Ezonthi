import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Award, TrendingUp } from 'lucide-react-native';
import { useUserStore } from '../stores';
import { getSubjectsByGrade } from '../services/dataService';

export const CompetencyChart: React.FC = () => {
  const { topicMastery, selectedGrade } = useUserStore();
  const currentSubjects = getSubjectsByGrade(selectedGrade);

  // Tính toán % năng lực cho từng môn học dựa trên topicMastery của khối lớp hiện tại
  const subjectStats = currentSubjects.map((subject) => {
    let totalScore = 0;
    const topicCount = subject.topics.length;

    subject.topics.forEach((topic) => {
      const mastery = topicMastery[topic.id];
      if (mastery) {
        totalScore += mastery.score;
      }
    });

    const averageScore = topicCount > 0 ? Math.round(totalScore / topicCount) : 0;
    return {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      score: Math.min(100, averageScore),
    };
  });

  // Điểm năng lực tổng thể trung bình
  const overallCompetency =
    subjectStats.length > 0
      ? Math.round(subjectStats.reduce((acc, curr) => acc + curr.score, 0) / subjectStats.length)
      : 0;

  // Tính toán vòng tròn SVG Circular Progress
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * overallCompetency) / 100;

  const gradeBadgeText =
    selectedGrade === 'grade9'
      ? 'Tuyển sinh Vào 10'
      : selectedGrade === 'grade11'
      ? 'Khối 11 Phân Hóa'
      : 'Chuẩn GDPT 2018';

  const gradeSubText =
    selectedGrade === 'grade9'
      ? 'Độ sẵn sàng thi tuyển sinh vào 10'
      : selectedGrade === 'grade11'
      ? 'Mức độ nắm vững kiến thức lớp 11'
      : 'Độ vững vàng kiến thức lớp 10';

  return (
    <View className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl my-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-2 gap-2">
          <View className="w-8 h-8 rounded-xl bg-indigo-500/20 items-center justify-center border border-indigo-500/30">
            <TrendingUp size={16} color="#818CF8" />
          </View>
          <View>
            <Text className="text-white font-bold text-base">Đánh Giá Năng Lực</Text>
            <Text className="text-xs text-slate-400">{gradeSubText}</Text>
          </View>
        </View>

        <View className="bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
          <Text className="text-[11px] font-bold text-indigo-300">{gradeBadgeText}</Text>
        </View>
      </View>

      {/* Main Readiness Gauge Row */}
      <View className="flex-row items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 mb-5">
        <View className="flex-1 pr-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Chỉ số sẵn sàng thi
          </Text>
          <View className="flex-row items-baseline mt-1 mb-1">
            <Text className="text-3xl font-black text-white">{overallCompetency}%</Text>
            <Text className="text-xs text-slate-400 font-medium ml-1.5">
              {overallCompetency >= 80 ? '🔥 Rất vững vàng' : overallCompetency >= 50 ? '📈 Đang bứt phá' : '🌱 Cần rèn luyện'}
            </Text>
          </View>
          <Text className="text-[11px] text-slate-400 leading-relaxed">
            Dựa trên điểm tích lũy chuyên đề và độ chính xác các câu hỏi đã luyện tập.
          </Text>
        </View>

        {/* Circular SVG Chart */}
        <View className="w-24 h-24 items-center justify-center">
          <Svg width="90" height="90" viewBox="0 0 90 90">
            {/* Background circle */}
            <Circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#334155"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Foreground progress circle */}
            <Circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#6366F1"
              strokeWidth="7"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              rotation="-90"
              origin="45, 45"
            />
          </Svg>
          <View className="absolute items-center justify-center">
            <Award size={20} color="#818CF8" />
          </View>
        </View>
      </View>

      {/* Subject Breakdown Bars */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Phân bố năng lực {subjectStats.length} môn học
      </Text>

      <View className="space-y-3 gap-2.5">
        {subjectStats.map((sub) => (
          <View key={sub.id}>
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center space-x-1.5 gap-1.5">
                <View
                  style={{ backgroundColor: sub.color }}
                  className="w-2 h-2 rounded-full"
                />
                <Text className="text-xs font-semibold text-slate-200">{sub.name}</Text>
              </View>
              <Text className="text-xs font-mono font-bold text-slate-300">{sub.score}%</Text>
            </View>

            {/* Progress Track */}
            <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <View
                style={{
                  width: `${Math.max(5, sub.score)}%`,
                  backgroundColor: sub.color
                }}
                className="h-full rounded-full"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
