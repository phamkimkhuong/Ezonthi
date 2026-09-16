import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { VocabularyService } from '../../services/vocabularyService';
import { Flashcard3D } from '../../components/Flashcard3D';
import { VocabularyQuiz } from '../../components/VocabularyQuiz';
import { VocabularySpelling } from '../../components/VocabularySpelling';

type Mode = 'flashcard' | 'quiz' | 'spelling';

export default function VocabularyUnitScreen() {
  const router = useRouter();
  const { unitId, mode: initialMode } = useLocalSearchParams<{
    unitId: string;
    mode?: Mode;
  }>();

  const [activeMode, setActiveMode] = useState<Mode>(
    initialMode === 'quiz' || initialMode === 'spelling' ? initialMode : 'flashcard'
  );

  const parsedUnit = unitId === 'all' ? 'all' : parseInt(unitId || '1', 10);

  // Danh sách từ vựng theo Unit
  const words = useMemo(() => {
    return VocabularyService.getWordsByUnit(parsedUnit);
  }, [parsedUnit]);

  // Thông tin Unit
  const unitInfo = useMemo(() => {
    if (parsedUnit === 'all') {
      return { title: 'Tất Cả 10 Unit', theme: 'Ôn tập tổng hợp toàn bộ từ vựng SGK 10' };
    }
    const units = VocabularyService.getUnits();
    const found = units.find(u => u.unit === parsedUnit);
    return found || { title: `Unit ${parsedUnit}`, theme: 'Tiếng Anh 10 Global Success' };
  }, [parsedUnit]);

  const switchMode = (newMode: Mode) => {
    VocabularyService.triggerHaptic('selection');
    setActiveMode(newMode);
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header Điều Hướng */}
      <View className="bg-slate-900 border-b border-slate-800 pt-12 pb-3 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700"
          >
            <ArrowLeft size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View className="items-center flex-1 mx-3">
            <Text className="text-sm font-black text-white text-center" numberOfLines={1}>
              {parsedUnit === 'all' ? 'Toàn Bộ 10 Unit' : `Unit ${parsedUnit}: ${unitInfo.title}`}
            </Text>
            <Text className="text-[11px] text-slate-400 text-center" numberOfLines={1}>
              {unitInfo.theme} • {words.length} từ
            </Text>
          </View>

          <View className="w-9" />
        </View>

        {/* 3 Tabs Chế Độ Học (Segmented Control) */}
        <View className="flex-row bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <TouchableOpacity
            onPress={() => switchMode('flashcard')}
            activeOpacity={0.8}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeMode === 'flashcard' ? 'bg-indigo-600 shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeMode === 'flashcard' ? 'text-white' : 'text-slate-400'
              }`}
            >
              🃏 Flashcard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchMode('quiz')}
            activeOpacity={0.8}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeMode === 'quiz' ? 'bg-indigo-600 shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeMode === 'quiz' ? 'text-white' : 'text-slate-400'
              }`}
            >
              ⚡ Speed Quiz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchMode('spelling')}
            activeOpacity={0.8}
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeMode === 'spelling' ? 'bg-indigo-600 shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeMode === 'spelling' ? 'text-white' : 'text-slate-400'
              }`}
            >
              ✍️ Spelling
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nội dung chính theo chế độ đang chọn */}
      <View className="flex-1">
        {activeMode === 'flashcard' && (
          <Flashcard3D words={words} />
        )}

        {activeMode === 'quiz' && (
          <VocabularyQuiz
            words={words}
            unitKey={`unit_${parsedUnit}`}
            onSwitchToFlashcard={() => switchMode('flashcard')}
          />
        )}

        {activeMode === 'spelling' && (
          <VocabularySpelling
            words={words}
            onSwitchToFlashcard={() => switchMode('flashcard')}
          />
        )}
      </View>
    </View>
  );
}
