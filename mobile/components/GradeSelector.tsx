import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GraduationCap, Sparkles } from 'lucide-react-native';
import { useUserStore, GradeId, GRADE_OPTIONS } from '../stores';

export interface GradeSelectorProps {
  compact?: boolean;
  onGradeChange?: (grade: GradeId) => void;
  containerClassName?: string;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({
  compact = false,
  onGradeChange,
  containerClassName = '',
}) => {
  const selectedGrade = useUserStore((s) => s.selectedGrade) || 'grade9';
  const setGrade = useUserStore((s) => s.setGrade);

  const handleSelectGrade = async (gradeId: GradeId) => {
    if (gradeId === selectedGrade) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics might not be supported on some devices / web
    }

    setGrade(gradeId);
    if (onGradeChange) {
      onGradeChange(gradeId);
    }
  };

  const activeOption = GRADE_OPTIONS.find((g) => g.id === selectedGrade) || GRADE_OPTIONS[0];

  return (
    <View className={`w-full ${containerClassName}`}>
      {/* Segmented Control Bar */}
      <View
        style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
        className="flex-row items-center p-1.5 rounded-2xl border"
      >
        {GRADE_OPTIONS.map((option) => {
          const isSelected = option.id === selectedGrade;
          const isGrade9 = option.id === 'grade9';

          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelectGrade(option.id)}
              style={({ pressed }) => [
                {
                  backgroundColor: isSelected
                    ? isGrade9
                      ? '#f59e0b'
                      : '#4f46e5'
                    : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="flex-1 py-2.5 px-2 rounded-xl items-center justify-center"
            >
              <View className="flex-row items-center gap-1.5">
                {isGrade9 && (
                  <Sparkles
                    size={13}
                    color={isSelected ? '#ffffff' : '#f59e0b'}
                  />
                )}
                <Text
                  className={`text-xs ${
                    isSelected
                      ? 'text-white font-black'
                      : isGrade9
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400 font-bold'
                  }`}
                  numberOfLines={1}
                >
                  {option.shortLabel}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Sub-label banner describing selected curriculum (hidden if compact) */}
      {!compact && (
        <View className="flex-row items-center justify-between mt-2 px-1">
          <View className="flex-row items-center gap-1.5">
            <GraduationCap size={14} color="#818cf8" />
            <Text className="text-[11px] text-slate-400 font-medium">
              Chương trình:{' '}
              <Text className="text-slate-200 font-bold">{activeOption.label}</Text>
            </Text>
          </View>
          <View
            style={{
              backgroundColor:
                activeOption.id === 'grade9'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(99, 102, 241, 0.15)',
              borderColor:
                activeOption.id === 'grade9'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(99, 102, 241, 0.3)',
            }}
            className="px-2 py-0.5 rounded-full border"
          >
            <Text
              className={`text-[10px] font-bold ${
                activeOption.id === 'grade9' ? 'text-amber-300' : 'text-indigo-300'
              }`}
            >
              {activeOption.badge}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
