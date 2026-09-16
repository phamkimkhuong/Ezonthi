import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Search,
  ChevronRight,
  Flame,
  Layers,
  ArrowLeft,
  RotateCw,
} from 'lucide-react-native';
import { VocabularyService, UnitProgress, IVocabItem } from '../../services/vocabularyService';

export default function VocabularyIndexScreen() {
  const router = useRouter();
  const [unitsProgress, setUnitsProgress] = useState<UnitProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalMastered, setTotalMastered] = useState(0);

  const loadData = useCallback(async () => {
    const progressList = await VocabularyService.getAllUnitsProgress();
    setUnitsProgress(progressList);

    const mastered = await VocabularyService.getMasteredWordIds();
    setTotalMastered(mastered.length);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tổng số từ vựng toàn bộ 10 Unit
  const totalAllWords = useMemo(() => {
    return unitsProgress.reduce((acc, u) => acc + u.totalWords, 0);
  }, [unitsProgress]);

  const overallPercentage = totalAllWords > 0 ? Math.round((totalMastered / totalAllWords) * 100) : 0;

  // Lọc theo tìm kiếm
  const searchResults: IVocabItem[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return VocabularyService.searchWords(searchQuery);
  }, [searchQuery]);

  const handleOpenUnit = (unitId: number | 'all', defaultMode: 'flashcard' | 'quiz' | 'spelling' = 'flashcard') => {
    VocabularyService.triggerHaptic('light');
    router.push({
      pathname: `/vocabulary/${unitId}` as any,
      params: { mode: defaultMode },
    });
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <View className="bg-slate-900 border-b border-slate-800 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700"
          >
            <ArrowLeft size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-base font-black text-white">Luyện Từ Vựng SGK 10</Text>
            <Text className="text-[11px] font-semibold text-indigo-400">
              Tiếng Anh Global Success
            </Text>
          </View>
          <TouchableOpacity
            onPress={loadData}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700"
          >
            <RotateCw size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Thanh Tìm Kiếm */}
        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2">
          <Search size={16} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm từ vựng (Anh - Việt)..."
            placeholderTextColor="#64748b"
            className="flex-1 ml-2 text-xs text-white"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-xs text-slate-400 font-bold px-1">Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Kết quả tìm kiếm trực tiếp (nếu có gõ từ khóa) */}
        {searchQuery.trim().length > 0 ? (
          <View className="mb-8">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Kết Quả Tìm Kiếm ({searchResults.length} từ)
            </Text>
            {searchResults.length === 0 ? (
              <View className="bg-slate-900 border border-slate-800 rounded-2xl p-6 items-center">
                <Text className="text-slate-400 text-xs">Không tìm thấy từ vựng phù hợp.</Text>
              </View>
            ) : (
              <View className="space-y-2.5 gap-2.5">
                {searchResults.slice(0, 20).map(item => (
                  <View
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center space-x-2 gap-2 mb-1">
                        <Text className="font-black text-sm text-white">{item.word}</Text>
                        <Text className="text-xs text-slate-400">{item.phonetic}</Text>
                        <View className="px-1.5 py-0.5 rounded bg-indigo-500/20">
                          <Text className="text-[10px] font-bold text-indigo-300">U{item.unit}</Text>
                        </View>
                      </View>
                      <Text className="text-xs text-emerald-400 font-semibold">{item.meaning}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => VocabularyService.speakWord(item.word)}
                      className="p-2.5 rounded-full bg-indigo-600/20 border border-indigo-500/30"
                    >
                      <Sparkles size={16} color="#818cf8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Banner Tiến Độ Tổng Hợp */}
            <View className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 mb-5 shadow-xl">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-sm font-black text-white">Tiến Độ Tích Lũy</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    Đã thuộc {totalMastered} / {totalAllWords} từ vựng
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 items-center justify-center">
                  <Flame size={24} color="#f59e0b" />
                </View>
              </View>

              {/* Progress bar */}
              <View className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <View
                  style={{ width: `${overallPercentage}%` }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </View>
              <View className="flex-row items-center justify-between text-xs">
                <Text className="text-[11px] font-semibold text-slate-400">10 Units SGK</Text>
                <Text className="text-xs font-black text-emerald-400">{overallPercentage}% Hoàn Thành</Text>
              </View>
            </View>

            {/* Thẻ Luyện Toàn Bộ 10 Unit */}
            <TouchableOpacity
              onPress={() => handleOpenUnit('all')}
              activeOpacity={0.7}
              className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 mb-5 flex-row items-center justify-between shadow-lg"
            >
              <View className="flex-row items-center space-x-3.5 gap-3.5 flex-1">
                <View className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center">
                  <Layers size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center space-x-1.5 gap-1.5 mb-0.5">
                    <Text className="font-black text-sm text-white">Tất Cả 10 Unit</Text>
                    <View className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                      <Text className="text-[9px] font-black text-amber-300">TỔNG HỢP</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-slate-400">
                    Luyện ngẫu nhiên toàn bộ {totalAllWords} từ vựng SGK 10
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#818cf8" />
            </TouchableOpacity>

            {/* Danh Sách 10 Unit */}
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Danh Sách Bài Học Theo SGK (10 Units)
            </Text>

            <View className="space-y-3 gap-3 mb-10">
              {unitsProgress.map(unit => (
                <View
                  key={unit.unit}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center space-x-2.5 gap-2.5 flex-1 mr-2">
                      <View className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 items-center justify-center">
                        <Text className="text-xs font-black text-indigo-300">{unit.unit}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-black text-sm text-white" numberOfLines={1}>
                          {unit.title}
                        </Text>
                        <Text className="text-xs text-slate-400" numberOfLines={1}>
                          {unit.theme}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-black text-emerald-400">
                        {unit.masteredCount}/{unit.totalWords}
                      </Text>
                      <Text className="text-[10px] text-slate-500">từ đã thuộc</Text>
                    </View>
                  </View>

                  {/* Progress bar của unit */}
                  <View className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <View
                      style={{ width: `${unit.percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </View>

                  {/* 3 Nút Hành Động Nhanh */}
                  <View className="flex-row space-x-2 gap-2 pt-2 border-t border-slate-800/80">
                    <TouchableOpacity
                      onPress={() => handleOpenUnit(unit.unit, 'flashcard')}
                      activeOpacity={0.7}
                      className="flex-1 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 items-center justify-center"
                    >
                      <Text className="text-xs font-bold text-indigo-300">🃏 Flashcard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenUnit(unit.unit, 'quiz')}
                      activeOpacity={0.7}
                      className="flex-1 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 items-center justify-center"
                    >
                      <Text className="text-xs font-bold text-amber-300">⚡ Quiz Phản Xạ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenUnit(unit.unit, 'spelling')}
                      activeOpacity={0.7}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center"
                    >
                      <Text className="text-xs font-bold text-emerald-300">✍️ Gõ Từ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
