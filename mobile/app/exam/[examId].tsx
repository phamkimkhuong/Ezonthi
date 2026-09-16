import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Home,
  Bot,
  Grid
} from 'lucide-react-native';
import { getExamById, evaluateExam, Exam, ExamResult } from '../../services/examService';
import { DataService } from '../../services/dataService';
import { MathRenderer } from '../../components/MathRenderer';
import { useUserStore } from '../../stores';
import { formatSecondsToTimer } from '../../utils';
import { HapticService } from '../../services/hapticService';

export default function ExamDetailScreen() {
  const router = useRouter();
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { recordAttempt, hapticEnabled } = useUserStore();

  const [exam, setExam] = useState<Exam | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (examId) {
      const foundExam = getExamById(examId);
      if (foundExam) {
        setExam(foundExam);
        setTimeLeft(foundExam.durationMinutes * 60);
      }
    }
  }, [examId]);

  // Bộ đếm ngược thời gian
  useEffect(() => {
    if (!exam || isSubmitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, isSubmitted, timeLeft]);

  const formatTime = formatSecondsToTimer;

  const handleSelectAnswer = (letter: string) => {
    if (isSubmitted || !exam) return;
    const q = exam.questions[currentIndex];
    if (!q) return;

    if (hapticEnabled) HapticService.selection();

    setAnswers((prev) => ({
      ...prev,
      [q.id]: letter
    }));
  };

  const handleSubmitExam = (force = false) => {
    if (!exam || isSubmitted) return;

    const unansweredCount = exam.questions.filter((q) => !answers[q.id]).length;

    if (!force && unansweredCount > 0) {
      Alert.alert(
        'Xác nhận nộp bài',
        `Em vẫn còn ${unansweredCount} câu chưa chọn đáp án. Em có chắc chắn muốn nộp bài không?`,
        [
          { text: 'Làm tiếp', style: 'cancel' },
          { text: 'Nộp bài ngay', style: 'destructive', onPress: () => processSubmission() }
        ]
      );
      return;
    }

    processSubmission();
  };

  const processSubmission = () => {
    if (!exam) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = exam.durationMinutes * 60 - timeLeft;
    const examResult = evaluateExam(exam, answers, timeSpent);
    setResult(examResult);
    setIsSubmitted(true);

    if (hapticEnabled) HapticService.success();

    // Ghi nhận lịch sử cho từng câu hỏi vào Zustand & Sổ lỗi sai
    exam.questions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      const xpEarned = isCorrect ? (examResult.score10 >= 8.0 ? 15 : 10) : 0;
      recordAttempt(q.id, q.topicId, q.subjectId, isCorrect, selected || '', xpEarned);
    });
  };

  const handleExit = () => {
    if (!isSubmitted) {
      Alert.alert(
        'Thoát khỏi phòng thi?',
        'Bài thi đang diễn ra sẽ không được lưu nếu em thoát ra giữa chừng.',
        [
          { text: 'Ở lại thi', style: 'cancel' },
          { text: 'Rời phòng', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleRestart = () => {
    if (!exam) return;
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(exam.durationMinutes * 60);
    setIsSubmitted(false);
    setResult(null);
  };

  if (!exam) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white text-base">Không tìm thấy đề thi tuyển sinh yêu cầu.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-indigo-600 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQ = exam.questions[currentIndex];
  const isTimeCritical = timeLeft < 300; // Còn dưới 5 phút

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handleExit}
          className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
        >
          <ChevronLeft size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <View className="items-center flex-1 mx-2">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>
            {exam.title}
          </Text>
          <Text className="text-slate-400 text-xs">
            {isSubmitted ? 'Đã hoàn thành' : `Câu ${currentIndex + 1} / ${exam.questions.length}`}
          </Text>
        </View>

        {!isSubmitted ? (
          <View className="flex-row items-center space-x-2 gap-2">
            {/* Timer Badge */}
            <View
              className={`px-3 py-1.5 rounded-xl flex-row items-center space-x-1 gap-1 border ${isTimeCritical
                  ? 'bg-rose-950/80 border-rose-500/80'
                  : 'bg-amber-950/40 border-amber-500/40'
                }`}
            >
              <Clock size={14} color={isTimeCritical ? '#F43F5E' : '#F59E0B'} />
              <Text
                className={`font-mono text-xs font-bold ${isTimeCritical ? 'text-rose-300' : 'text-amber-300'
                  }`}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>

            {/* Question Palette Trigger */}
            <TouchableOpacity
              onPress={() => setShowPalette(true)}
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
            >
              <Grid size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
          >
            <Home size={18} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      {/* RESULT SCREEN VIEW */}
      {isSubmitted && result ? (
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          {/* Score Hero Card */}
          <View className="bg-gradient-to-b from-indigo-900/60 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 items-center shadow-xl mb-6">
            <View className="w-20 h-20 rounded-full bg-indigo-500/20 items-center justify-center mb-3 border border-indigo-400/30">
              <Award size={40} color="#818CF8" />
            </View>
            <Text className="text-slate-300 text-xs uppercase tracking-wider font-semibold">
              KẾT QUẢ THI THỬ VÀO 10
            </Text>
            <View className="flex-row items-baseline my-2">
              <Text className="text-5xl font-black text-white">{result.score10.toFixed(1)}</Text>
              <Text className="text-xl font-bold text-slate-400"> / 10</Text>
            </View>
            <View className="bg-indigo-500/30 px-3.5 py-1 rounded-full border border-indigo-400/40 mb-3">
              <Text className="text-xs font-bold text-indigo-200">Xếp loại: {result.classification}</Text>
            </View>
            <Text className="text-center text-xs text-slate-300 leading-relaxed px-2">
              {result.feedback}
            </Text>
          </View>

          {/* Detailed Statistics Grid */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 items-center">
              <Text className="text-emerald-400 text-lg font-bold">{result.correctCount}</Text>
              <Text className="text-[11px] text-slate-400">Câu đúng</Text>
            </View>
            <View className="flex-1 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 items-center">
              <Text className="text-rose-400 text-lg font-bold">{result.wrongCount}</Text>
              <Text className="text-[11px] text-slate-400">Câu sai</Text>
            </View>
            <View className="flex-1 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 items-center">
              <Text className="text-amber-400 text-lg font-bold">{result.unansweredCount}</Text>
              <Text className="text-[11px] text-slate-400">Bỏ qua</Text>
            </View>
            <View className="flex-1 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 items-center">
              <Text className="text-indigo-400 text-lg font-bold font-mono">
                {formatTime(result.timeSpentSeconds)}
              </Text>
              <Text className="text-[11px] text-slate-400">Thời gian</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={handleRestart}
              activeOpacity={0.8}
              className="flex-1 bg-slate-800 border border-slate-700 p-3.5 rounded-2xl flex-row items-center justify-center space-x-2 gap-2"
            >
              <RotateCcw size={16} color="#CBD5E1" />
              <Text className="text-slate-200 font-bold text-xs">Làm lại đề này</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="flex-1 bg-indigo-600 p-3.5 rounded-2xl flex-row items-center justify-center space-x-2 gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Home size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs">Về Trang chủ</Text>
            </TouchableOpacity>
          </View>

          {/* Detailed Question Review List */}
          <Text className="text-sm font-bold text-white mb-3">CHI TIẾT BÀI THI & ĐÁP ÁN</Text>
          {exam.questions.map((q, idx) => {
            const userChoice = answers[q.id];
            const isRight = userChoice === q.correctAnswer;
            const topicTitle = DataService.getTopic(q.topicId)?.title || exam.subjectName;
            const subjectTitle = DataService.getSubject(q.subjectId)?.name || exam.subjectName;

            return (
              <View
                key={q.id}
                className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 mb-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center space-x-2 gap-2">
                    <View className="w-6 h-6 rounded-full bg-slate-800 items-center justify-center">
                      <Text className="text-xs font-bold text-slate-300">{idx + 1}</Text>
                    </View>
                    <Text className="text-xs font-bold text-slate-400">
                      {topicTitle}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-1 gap-1">
                    {isRight ? (
                      <View className="flex-row items-center bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 size={12} color="#10B981" />
                        <Text className="text-[10px] text-emerald-300 font-bold ml-1">Đúng</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                        <XCircle size={12} color="#F43F5E" />
                        <Text className="text-[10px] text-rose-300 font-bold ml-1">
                          {userChoice ? `Chọn ${userChoice}` : 'Chưa làm'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <MathRenderer content={q.content} className="text-sm text-slate-200 mb-3" />

                {/* Option indicators */}
                <View className="space-y-1.5 gap-1.5 mb-3">
                  {q.options.map((opt) => {
                    const letter = opt.charAt(0).toUpperCase();
                    const isTargetCorrect = letter === q.correctAnswer;
                    const isUserChosen = letter === userChoice;

                    let rowStyle = 'bg-slate-800/40 border-slate-800';
                    let textClass = 'text-slate-400';

                    if (isTargetCorrect) {
                      rowStyle = 'bg-emerald-950/50 border-emerald-500/40';
                      textClass = 'text-emerald-200 font-bold';
                    } else if (isUserChosen && !isTargetCorrect) {
                      rowStyle = 'bg-rose-950/50 border-rose-500/40';
                      textClass = 'text-rose-200';
                    }

                    return (
                      <View
                        key={letter}
                        className={`p-2 rounded-xl border flex-row items-center ${rowStyle}`}
                      >
                        <Text className={`text-xs mr-2 font-bold ${textClass}`}>{letter}.</Text>
                        <View className="flex-1">
                          <MathRenderer
                            content={opt.replace(/^[A-D]\.\s*/, '')}
                            className={`text-xs ${textClass}`}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                <View className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <Text className="text-[11px] font-bold text-slate-400 mb-1">Lời giải:</Text>
                  <MathRenderer content={q.explanation} className="text-xs text-slate-300 leading-relaxed" />
                </View>

                {/* AI Assistant helper */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/ai-chat',
                      params: {
                        questionId: q.id,
                        questionText: q.content,
                        options: JSON.stringify(q.options),
                        explanation: q.explanation,
                        subjectId: q.subjectId,
                        subjectName: subjectTitle,
                        topicName: topicTitle,
                      }
                    })
                  }
                  className="mt-2.5 flex-row items-center justify-center p-2 rounded-xl bg-indigo-950/50 border border-indigo-500/30"
                >
                  <Bot size={14} color="#818CF8" />
                  <Text className="text-xs font-bold text-indigo-300 ml-1.5">
                    Hỏi Thầy EZ phương pháp câu này
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        /* LIVE EXAM VIEW */
        <View className="flex-1">
          {/* Question Number Tabs */}
          <View className="py-2.5 px-3 bg-slate-900/60 border-b border-slate-800">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {exam.questions.map((q, idx) => {
                const isSelected = currentIndex === idx;
                const hasAnswer = !!answers[q.id];

                let tabBg = 'bg-slate-800 border-slate-700';
                let textColor = 'text-slate-400';

                if (isSelected) {
                  tabBg = 'bg-indigo-600 border-indigo-400';
                  textColor = 'text-white font-bold';
                } else if (hasAnswer) {
                  tabBg = 'bg-emerald-950/80 border-emerald-500/50';
                  textColor = 'text-emerald-300 font-bold';
                }

                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => setCurrentIndex(idx)}
                    className={`w-9 h-9 rounded-xl items-center justify-center mr-2 border ${tabBg}`}
                  >
                    <Text className={`text-xs ${textColor}`}>{idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Main Question Card Area */}
          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
            {currentQ && (
              <View className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl mb-4">
                {/* Topic & Tag */}
                <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <View className="bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    <Text className="text-[11px] font-bold text-indigo-300">
                      Câu {currentIndex + 1}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-400">
                    {DataService.getTopic(currentQ.topicId)?.title || exam.subjectName}
                  </Text>
                </View>

                {/* Question Body */}
                <View className="mb-5">
                  <MathRenderer
                    content={currentQ.content}
                    className="text-base text-slate-100 font-medium leading-relaxed"
                  />
                </View>

                {/* Option Choices */}
                <View className="space-y-3 gap-3">
                  {currentQ.options.map((option) => {
                    const letter = option.charAt(0).toUpperCase();
                    const isChosen = answers[currentQ.id] === letter;

                    const cardBorder = isChosen
                      ? 'border-indigo-500 bg-indigo-950/50'
                      : 'border-slate-800 bg-slate-900/50';
                    const badgeBg = isChosen
                      ? 'bg-indigo-600 border-indigo-400'
                      : 'bg-slate-800 border-slate-700';

                    return (
                      <TouchableOpacity
                        key={letter}
                        onPress={() => handleSelectAnswer(letter)}
                        activeOpacity={0.7}
                        className={`flex-row items-center p-3.5 rounded-2xl border ${cardBorder}`}
                      >
                        <View
                          className={`w-8 h-8 rounded-xl items-center justify-center border font-bold text-sm mr-3 ${badgeBg}`}
                        >
                          <Text
                            className={`font-bold text-sm ${isChosen ? 'text-white' : 'text-slate-300'
                              }`}
                          >
                            {letter}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <MathRenderer
                            content={option.replace(/^[A-D]\.\s*/, '')}
                            className={`text-sm ${isChosen ? 'text-indigo-200 font-semibold' : 'text-slate-200'}`}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Bar: Prev / Next / Submit */}
          <View className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`p-3 rounded-xl flex-row items-center ${currentIndex === 0 ? 'opacity-30' : 'bg-slate-800'
                }`}
            >
              <ChevronLeft size={18} color="#CBD5E1" />
              <Text className="text-slate-200 text-xs font-bold ml-1">Câu trước</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSubmitExam()}
              className="bg-emerald-600 active:bg-emerald-500 px-5 py-3 rounded-xl flex-row items-center shadow-md shadow-emerald-600/30"
            >
              <Send size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold ml-1.5">Nộp bài thi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
              disabled={currentIndex === exam.questions.length - 1}
              className={`p-3 rounded-xl flex-row items-center ${currentIndex === exam.questions.length - 1 ? 'opacity-30' : 'bg-slate-800'
                }`}
            >
              <Text className="text-slate-200 text-xs font-bold mr-1">Câu sau</Text>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* QUESTION PALETTE MODAL */}
      <Modal visible={showPalette} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-slate-900 rounded-t-3xl p-5 max-h-[70%] border-t border-slate-800">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-white">Danh sách câu hỏi</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Text className="text-sm font-bold text-indigo-400">Đóng</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2.5 mb-6">
              {exam.questions.map((q, idx) => {
                const isSelected = currentIndex === idx;
                const hasAnswer = !!answers[q.id];

                let itemBg = 'bg-slate-800 border-slate-700';
                let textColor = 'text-slate-400';

                if (isSelected) {
                  itemBg = 'bg-indigo-600 border-indigo-400';
                  textColor = 'text-white font-bold';
                } else if (hasAnswer) {
                  itemBg = 'bg-emerald-950/80 border-emerald-500/50';
                  textColor = 'text-emerald-300 font-bold';
                }

                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => {
                      setCurrentIndex(idx);
                      setShowPalette(false);
                    }}
                    className={`w-11 h-11 rounded-2xl items-center justify-center border ${itemBg}`}
                  >
                    <Text className={`text-sm ${textColor}`}>{idx + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row justify-around py-3 border-t border-slate-800">
              <View className="flex-row items-center">
                <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-xs text-slate-300">Đã làm ({Object.keys(answers).length})</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3.5 h-3.5 rounded-full bg-slate-700 mr-2" />
                <Text className="text-xs text-slate-300">
                  Chưa làm ({exam.questions.length - Object.keys(answers).length})
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
