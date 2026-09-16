import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, XCircle, Lightbulb, Bot, Sparkles } from 'lucide-react-native';
import { MathRenderer } from './MathRenderer';
import { MobileQuestion, DataService } from '../services/dataService';
import { HapticService } from '../services/hapticService';
import { useUserStore } from '../stores';
import { flushLearningStorage } from '../stores/useUserStore';
import { newLocalId } from '../services/accountLearningState';

interface QuestionCardProps {
  question: MobileQuestion;
  onNext?: () => void;
  isLast?: boolean;
  onAnswer?: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onNext, isLast, onAnswer }) => {
  const router = useRouter();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const { recordAttempt, hapticEnabled, activeScope, storageError } = useUserStore();
  const attemptId = useRef(`att_${newLocalId()}`);
  const answerLock = useRef(false);
  const [isSaved, setIsSaved] = useState(false);

  const scope = DataService.getTopicScope(question.topicId);
  useEffect(() => {
    if (!selectedLetter || isSaved || storageError || answerLock.current) return;
    let alive = true;
    void flushLearningStorage().then(() => {
      const state = useUserStore.getState();
      if (alive && state.activeScope === activeScope && state.attempts.some(a => a.id === attemptId.current)) {
        setIsSaved(true); onAnswer?.(selectedLetter === question.correctAnswer);
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, [storageError, selectedLetter, isSaved, activeScope]);

  const subjectName = scope ? DataService.getSubject(question.subjectId, scope.gradeId)?.name || 'Môn học' : 'Môn học';
  const topicName = DataService.getTopic(question.topicId)?.title || '';

  const isAnswered = selectedLetter !== null;
  const isCorrect = selectedLetter === question.correctAnswer;

  const handleOpenAiTutor = () => {
    router.push({
      pathname: '/ai-chat',
      params: {
        questionId: question.id,
        questionText: question.content,
        options: JSON.stringify(question.options),
        explanation: question.explanation,
        subjectId: question.subjectId,
        subjectName,
        topicName,
      }
    });
  };

  const handleSelectOption = async (optionStr: string) => {
    if (isAnswered || answerLock.current) return;
    answerLock.current = true;

    const letter = optionStr.charAt(0).toUpperCase();
    setSelectedLetter(letter);

    const correct = letter === question.correctAnswer;
    setShowExplanation(true);

    if (hapticEnabled) {
      if (correct) {
        HapticService.success();
      } else {
        HapticService.warning();
      }
    }

    try {
      await recordAttempt(question.id, question.topicId, question.subjectId, correct, letter, correct ? 10 : 0,
        attemptId.current, 0, activeScope);
      if (useUserStore.getState().activeScope === activeScope) { setIsSaved(true); onAnswer?.(correct); }
    } catch {
      Alert.alert('Chưa lưu được câu trả lời', 'Giữ ứng dụng mở và dùng nút Thử lưu trước khi tiếp tục.');
    } finally { answerLock.current = false; }
  };

  return (
    <View className="bg-slate-800/90 rounded-3xl p-5 border border-slate-700/60 shadow-xl mb-4">
      {/* Header Card: Subject/Difficulty & AI Quick Button */}
      <View className="flex-row items-center justify-between mb-3.5 pb-3 border-b border-slate-700/60">
        <View className="flex-row items-center space-x-2 gap-2">
          <View className="bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
            <Text className="text-[11px] font-bold text-indigo-300">
              {subjectName}
            </Text>
          </View>
          {topicName ? (
            <View className="bg-slate-700/40 px-2.5 py-1 rounded-full">
              <Text className="text-[11px] font-medium text-slate-300" numberOfLines={1}>
                {topicName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Nút bấm hỏi AI Gia Sư */}
        <TouchableOpacity
          onPress={handleOpenAiTutor}
          activeOpacity={0.7}
          className="bg-indigo-600/30 hover:bg-indigo-600/50 px-2.5 py-1 rounded-full border border-indigo-400/40 flex-row items-center space-x-1 gap-1"
        >
          <Bot size={13} color="#A5B4FC" />
          <Text className="text-[11px] font-bold text-indigo-200">Hỏi AI Gia Sư</Text>
        </TouchableOpacity>
      </View>

      {/* Question Content */}
      <View className="mb-5">
        <MathRenderer content={question.content} className="text-base text-slate-100 font-medium leading-relaxed" />
      </View>

      {/* Options List */}
      <View className="space-y-3 gap-3">
        {question.options.map((option) => {
          const letter = option.charAt(0).toUpperCase();
          const isThisSelected = selectedLetter === letter;
          const isThisCorrect = letter === question.correctAnswer;

          let buttonStyle = 'border-slate-700/80 bg-slate-800/50';
          let badgeBg = 'bg-slate-700/50 border-slate-600/50';
          let textStyle = 'text-slate-200';

          if (isAnswered) {
            if (isThisCorrect) {
              buttonStyle = 'border-emerald-500/80 bg-emerald-950/40';
              badgeBg = 'bg-emerald-600 border-emerald-500';
              textStyle = 'text-emerald-200 font-semibold';
            } else if (isThisSelected && !isThisCorrect) {
              buttonStyle = 'border-rose-500/80 bg-rose-950/40';
              badgeBg = 'bg-rose-600 border-rose-500';
              textStyle = 'text-rose-200 font-semibold';
            } else {
              buttonStyle = 'border-slate-800 bg-slate-900/30 opacity-40';
              textStyle = 'text-slate-400';
            }
          }

          return (
            <TouchableOpacity
              key={letter}
              onPress={() => handleSelectOption(option)}
              disabled={isAnswered}
              activeOpacity={0.7}
              className={`flex-row items-center p-3.5 rounded-2xl border ${buttonStyle}`}
            >
              <View className={`w-8 h-8 rounded-xl items-center justify-center border font-bold text-sm mr-3 ${badgeBg}`}>
                <Text className="font-bold text-sm text-slate-300">{letter}</Text>
              </View>

              <View className="flex-1">
                <MathRenderer
                  content={option.replace(/^[A-D]\.\s*/, '')}
                  className={`text-sm ${textStyle}`}
                />
              </View>

              {isAnswered && isThisCorrect && (
                <CheckCircle2 size={20} color="#10b981" />
              )}
              {isAnswered && isThisSelected && !isThisCorrect && (
                <XCircle size={20} color="#f43f5e" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation Box */}
      {showExplanation && (
        <View className="mt-5 pt-4 border-t border-slate-700/80">
          {/* Result announcement */}
          <View className={`p-3 rounded-xl mb-3 flex-row items-center space-x-2 gap-2 ${isCorrect ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'}`}>
            {isCorrect ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <XCircle size={20} color="#f43f5e" />
            )}
            <Text className={`font-bold text-sm ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isCorrect ? '🎉 Chính xác! +10 XP' : `Chưa đúng! Đáp án đúng là ${question.correctAnswer}`}
            </Text>
          </View>

          {/* Recognition clue if available */}
          {question.recognition && (
            <View className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 mb-3">
              <View className="flex-row items-center space-x-1.5 gap-1.5 mb-1">
                <Lightbulb size={16} color="#818cf8" />
                <Text className="text-xs font-bold text-indigo-300">Dấu hiệu nhận biết & Phương pháp</Text>
              </View>
              <MathRenderer content={question.recognition} className="text-xs text-slate-300 leading-relaxed" />
            </View>
          )}

          {/* Step by step explanation */}
          <View className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60">
            <Text className="text-xs font-bold text-slate-400 mb-1">Lời giải chi tiết:</Text>
            <MathRenderer content={question.explanation} className="text-xs text-slate-200 leading-relaxed" />
          </View>

          {/* Action Row: Ask AI + Next Button */}
          <View className="mt-4 flex-row items-center space-x-2 gap-2">
            <TouchableOpacity
              onPress={handleOpenAiTutor}
              activeOpacity={0.8}
              className="flex-1 bg-indigo-950/80 border border-indigo-500/40 p-3.5 rounded-xl flex-row items-center justify-center space-x-2 gap-2"
            >
              <Sparkles size={16} color="#A5B4FC" />
              <Text className="text-indigo-200 font-bold text-xs">Hỏi Thầy EZ</Text>
            </TouchableOpacity>

            {onNext && (
              <TouchableOpacity
                onPress={onNext}
                disabled={!isSaved}
                activeOpacity={0.8}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 p-3.5 rounded-xl flex-row items-center justify-center space-x-2 gap-2 shadow-md shadow-indigo-500/20"
              >
                <Text className="text-white font-bold text-xs">
                  {isLast ? 'Hoàn thành 🎯' : 'Câu tiếp theo →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
