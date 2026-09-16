import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Volume2, Star, CheckCircle, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { IVocabItem, VocabularyService } from '../services/vocabularyService';

interface Flashcard3DProps {
  words: IVocabItem[];
  initialIndex?: number;
  onIndexChange?: (newIndex: number) => void;
}

const POS_LABELS: Record<string, string> = {
  n: 'Danh từ (n)',
  v: 'Động từ (v)',
  adj: 'Tính từ (adj)',
  adv: 'Phó từ (adv)',
  phrase: 'Cụm từ (phrase)',
};

export const Flashcard3D: React.FC<Flashcard3DProps> = ({
  words,
  initialIndex = 0,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  // Shared value góc xoay: 0 độ (mặt trước), 180 độ (mặt sau)
  const rotateVal = useSharedValue(0);

  // Tải trạng thái Mastered & Starred khi mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [mastered, starred] = await Promise.all([
        VocabularyService.getMasteredWordIds(),
        VocabularyService.getStarredWordIds(),
      ]);
      if (isMounted) {
        setMasteredIds(new Set(mastered));
        setStarredIds(new Set(starred));
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentCard = words[currentIndex] || words[0];
  const isMastered = currentCard ? masteredIds.has(currentCard.id) : false;
  const isStarred = currentCard ? starredIds.has(currentCard.id) : false;

  const flipCard = () => {
    VocabularyService.triggerHaptic('selection');
    const toValue = isFlipped ? 0 : 180;
    rotateVal.value = withTiming(toValue, {
      duration: 320,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    setIsFlipped(!isFlipped);
  };

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      goToIndex(currentIndex + 1);
    } else {
      // Vòng tròn lại từ đầu
      goToIndex(0);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    } else {
      goToIndex(words.length - 1);
    }
  };

  const goToIndex = (index: number) => {
    VocabularyService.triggerHaptic('light');
    if (isFlipped) {
      rotateVal.value = withTiming(0, { duration: 200 });
      setIsFlipped(false);
    }
    setCurrentIndex(index);
    onIndexChange?.(index);
  };

  const handleSpeak = () => {
    if (!currentCard) return;
    VocabularyService.triggerHaptic('light');
    VocabularyService.speakWord(currentCard.word);
  };

  const handleToggleMastered = async () => {
    if (!currentCard) return;
    const newState = await VocabularyService.toggleMasteredWord(currentCard.id);
    VocabularyService.triggerHaptic(newState ? 'success' : 'light');
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (newState) next.add(currentCard.id);
      else next.delete(currentCard.id);
      return next;
    });
  };

  const handleToggleStarred = async () => {
    if (!currentCard) return;
    const newState = await VocabularyService.toggleStarredWord(currentCard.id);
    VocabularyService.triggerHaptic('selection');
    setStarredIds(prev => {
      const next = new Set(prev);
      if (newState) next.add(currentCard.id);
      else next.delete(currentCard.id);
      return next;
    });
  };

  // Animation style mặt trước
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(rotateVal.value, [0, 180], [0, 180])}deg`;
    return {
      transform: [{ rotateY }],
      backfaceVisibility: 'hidden',
    };
  });

  // Animation style mặt sau
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(rotateVal.value, [0, 180], [180, 360])}deg`;
    return {
      transform: [{ rotateY }],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  if (!currentCard) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-slate-400">Không có từ vựng nào trong danh sách.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col justify-between py-2">
      {/* Thanh Header Tiến Độ */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center space-x-2 gap-2">
          <View className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <Text className="text-xs font-black text-indigo-300">
              Unit {currentCard.unit}
            </Text>
          </View>
          <Text className="text-xs font-semibold text-slate-400">
            {currentCard.unitTitle}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2 gap-2">
          <TouchableOpacity
            onPress={handleToggleStarred}
            className={`p-2 rounded-full border ${
              isStarred
                ? 'bg-amber-500/20 border-amber-500/40'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <Star
              size={16}
              color={isStarred ? '#f59e0b' : '#94a3b8'}
              fill={isStarred ? '#f59e0b' : 'transparent'}
            />
          </TouchableOpacity>

          <View className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700">
            <Text className="text-xs font-bold text-slate-300">
              {currentIndex + 1} / {words.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Khung Thẻ 3D Flashcard */}
      <View className="px-4 flex-1 justify-center my-2">
        <Pressable onPress={flipCard} className="w-full h-80 relative">
          {/* MẶT TRƯỚC (Front) */}
          <Animated.View
            style={[frontAnimatedStyle]}
            className="w-full h-full bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl justify-between"
          >
            {/* Top Bar mặt trước */}
            <View className="flex-row items-center justify-between">
              <View className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30">
                <Text className="text-xs font-bold text-indigo-300">
                  {POS_LABELS[currentCard.pos] || currentCard.pos}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSpeak}
                className="w-11 h-11 rounded-full bg-indigo-600/30 border border-indigo-500/50 items-center justify-center"
              >
                <Volume2 size={22} color="#818cf8" />
              </TouchableOpacity>
            </View>

            {/* Nội dung chính mặt trước: Từ vựng & IPA */}
            <View className="items-center justify-center my-auto">
              <Text className="text-3xl font-black text-white text-center tracking-tight mb-2">
                {currentCard.word}
              </Text>
              <Text className="text-base font-semibold text-slate-400 text-center">
                {currentCard.phonetic}
              </Text>
            </View>

            {/* Hint chạm lật */}
            <View className="flex-row items-center justify-center space-x-1.5 gap-1.5 pt-2 border-t border-slate-800">
              <RotateCw size={13} color="#64748b" />
              <Text className="text-xs font-medium text-slate-500">
                Chạm vào thẻ để xem nghĩa & ví dụ
              </Text>
            </View>
          </Animated.View>

          {/* MẶT SAU (Back) */}
          <Animated.View
            style={[backAnimatedStyle]}
            className="w-full h-full bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl justify-between"
          >
            {/* Top Bar mặt sau */}
            <View className="flex-row items-center justify-between">
              <View className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30">
                <Text className="text-xs font-bold text-emerald-300">Định Nghĩa Tiếng Việt</Text>
              </View>

              <TouchableOpacity
                onPress={handleSpeak}
                className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/50 items-center justify-center"
              >
                <Volume2 size={20} color="#34d399" />
              </TouchableOpacity>
            </View>

            {/* Nghĩa & Ví dụ ngữ cảnh */}
            <View className="my-auto">
              <Text className="text-2xl font-black text-emerald-300 text-center mb-3">
                {currentCard.meaning}
              </Text>

              {/* Hộp ví dụ */}
              <View className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
                <Text className="text-xs font-semibold text-slate-400 mb-1">Ví dụ SGK:</Text>
                <Text className="text-sm font-medium text-slate-200 leading-relaxed mb-1.5">
                  "{currentCard.example}"
                </Text>
                <Text className="text-xs text-slate-400 italic">
                  ➔ {currentCard.exampleTranslation}
                </Text>
              </View>
            </View>

            {/* Hint chạm lật lại */}
            <View className="flex-row items-center justify-center space-x-1.5 gap-1.5 pt-2 border-t border-slate-800">
              <RotateCw size={13} color="#64748b" />
              <Text className="text-xs font-medium text-slate-500">
                Chạm để quay lại mặt trước
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </View>

      {/* Bảng Nút Điều Hướng & Đánh Dấu */}
      <View className="px-4 py-2 space-y-3 gap-3">
        {/* Nút Đã Thuộc / Đánh Dấu */}
        <View className="flex-row space-x-3 gap-3">
          <TouchableOpacity
            onPress={handleToggleMastered}
            activeOpacity={0.7}
            className={`flex-1 py-3 px-4 rounded-2xl border flex-row items-center justify-center space-x-2 gap-2 ${
              isMastered
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <CheckCircle size={18} color={isMastered ? '#ffffff' : '#10b981'} />
            <Text
              className={`font-black text-sm ${
                isMastered ? 'text-white' : 'text-emerald-400'
              }`}
            >
              {isMastered ? 'Đã Ghi Nhớ' : 'Đánh Dấu Đã Thuộc'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nút Lùi - Tiến */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToPrev}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 space-x-1.5 gap-1.5"
          >
            <ChevronLeft size={18} color="#94a3b8" />
            <Text className="font-bold text-xs text-slate-300">Từ Trước</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={flipCard}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center"
          >
            <RotateCw size={16} color="#818cf8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNext}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-2.5 rounded-xl bg-indigo-600/90 border border-indigo-500 space-x-1.5 gap-1.5"
          >
            <Text className="font-bold text-xs text-white">Từ Tiếp Theo</Text>
            <ChevronRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
