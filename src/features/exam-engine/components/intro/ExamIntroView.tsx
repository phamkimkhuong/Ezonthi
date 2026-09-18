import React, { useState, useMemo, useEffect } from 'react';
import { ActiveExamSession, AssessmentBlueprint, ExamSummaryMap, MockExam } from '@/types';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { formatTime, formatCompletedDate } from '../../utils/examFormatters';
import { authService } from '@/services/authService';
import {
  Award,
  Timer,
  Play,
  Sparkles,
  BookOpen,
  Target,
  ShieldCheck,
  Layers,
  RotateCcw,
  Check,
  FileText,
  Clock,
  ArrowRight,
  Zap,
  X
} from 'lucide-react';

export type ExamTab = 'all' | 'diagnostic' | 'theory' | 'checkpoint' | 'midterm' | 'final';

export interface ExamIntroViewProps {
  subjectLabel: string;
  user: User | null;
  selectedSubject: string;
  mockExamsList: MockExam[];
  subjectAssessmentBlueprints: AssessmentBlueprint[];
  activeSessions: ActiveExamSession[];
  examSummaryMap: ExamSummaryMap;
  selectedExamId: string;
  setSelectedExamId: (id: string) => void;
  isLoadingReview: boolean;
  onStartExam: () => void;
  onResumeExam: (session?: ActiveExamSession) => void;
  onDiscardActiveSession: (sourceExamId?: string) => void;
  onReviewPastResult: (examId: string, resultExamId?: string) => Promise<void>;
}

const assessmentKindLabels: Record<string, string> = {
  diagnostic: 'Chẩn đoán',
  module_checkpoint: 'Kiểm tra Chuyên đề',
  midterm: 'Giữa kỳ',
  final: 'Cuối kỳ',
  full_course: 'Tổng hợp toàn khóa'
};

export const ExamIntroView: React.FC<ExamIntroViewProps> = ({
  subjectLabel,
  user,
  selectedSubject,
  mockExamsList,
  subjectAssessmentBlueprints,
  activeSessions,
  examSummaryMap,
  selectedExamId,
  setSelectedExamId,
  isLoadingReview,
  onStartExam,
  onResumeExam,
  onDiscardActiveSession,
  onReviewPastResult
}) => {
  const [activeTab, setActiveTab] = useState<ExamTab>('all');

  const subjectExams = useMemo(() => {
    return mockExamsList.filter(exam => exam.subjectId === selectedSubject);
  }, [selectedSubject, mockExamsList]);

  const availableTabs = useMemo<ExamTab[]>(() => {
    const tabs: ExamTab[] = ['all'];
    if (subjectExams.some(exam => exam.kind === 'diagnostic')) tabs.push('diagnostic');
    if (subjectExams.some(exam => exam.focus === 'theory')) tabs.push('theory');
    if (subjectExams.some(exam => exam.kind === 'module_checkpoint' && exam.focus !== 'theory')) tabs.push('checkpoint');
    if (subjectExams.some(exam => exam.kind === 'midterm' && exam.focus !== 'theory')) tabs.push('midterm');
    if (subjectExams.some(exam => exam.kind === 'final' && exam.focus !== 'theory')) tabs.push('final');
    return tabs;
  }, [subjectExams]);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) setActiveTab('all');
  }, [activeTab, availableTabs]);

  // Lọc đề thi theo tab đang chọn
  const filteredExams = useMemo(() => {
    return subjectExams.filter(exam => {
      if (activeTab === 'all') return true;
      if (activeTab === 'diagnostic') return exam.kind === 'diagnostic';
      if (activeTab === 'theory') return exam.focus === 'theory';
      if (activeTab === 'checkpoint') return exam.kind === 'module_checkpoint' && exam.focus !== 'theory';
      if (activeTab === 'midterm') return exam.kind === 'midterm' && exam.focus !== 'theory';
      if (activeTab === 'final') return exam.kind === 'final' && exam.focus !== 'theory';
      return true;
    });
  }, [subjectExams, activeTab]);

  // Gộp các đề thi trùng tên (chỉ khác mã đề A/B)
  const groupedExams = useMemo(() => {
    const groups: Record<string, { baseTitle: string; exams: MockExam[] }> = {};
    filteredExams.forEach(exam => {
      const baseTitle = exam.title.replace(/\s*\(Mã\s+[A-Z]\)\s*$/, '').trim();
      if (!groups[baseTitle]) {
        groups[baseTitle] = { baseTitle, exams: [] };
      }
      groups[baseTitle].exams.push(exam);
    });
    return Object.values(groups);
  }, [filteredExams]);

  // Tự động cập nhật selectedExamId khi đổi tab hoặc đổi môn học
  useEffect(() => {
    if (filteredExams.length > 0) {
      const stillAvailable = filteredExams.some(e => e.id === selectedExamId);
      if (!stillAvailable) {
        setSelectedExamId(filteredExams[0].id);
      }
    } else {
      setSelectedExamId('');
    }
  }, [activeTab, filteredExams, selectedExamId, setSelectedExamId]);

  const activeSessionsByExamId = useMemo(() => {
    const map = new Map<string, ActiveExamSession>();
    activeSessions.forEach(s => map.set(s.sourceExamId, s));
    return map;
  }, [activeSessions]);

  const currentExam = mockExamsList.find(exam => exam.id === selectedExamId) || subjectExams[0];
  const currentExamSummary = currentExam ? examSummaryMap[currentExam.id] : undefined;
  const currentBlueprint = currentExam?.blueprintId
    ? subjectAssessmentBlueprints.find(blueprint => blueprint.id === currentExam.blueprintId)
    : undefined;
  const activeSessionForSelectedExam = selectedExamId ? activeSessionsByExamId.get(selectedExamId) : null;

  const getExamCategoryLabel = (exam: MockExam) => {
    if (exam.focus === 'theory') {
      return exam.theoryScope === 'comprehensive' ? 'Lý thuyết tổng hợp' : 'Lý thuyết chuyên đề';
    }
    return assessmentKindLabels[exam.kind ?? 'module_checkpoint'];
  };

  const getExamCategoryStyle = (exam: MockExam) => {
    if (exam.focus === 'theory') {
      return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20';
    }
    if (exam.kind === 'midterm') {
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20';
    }
    if (exam.kind === 'final') {
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20';
    }
    if (exam.kind === 'diagnostic') {
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';
  };

  const getDifficultyBandLabel = (exam: MockExam) => {
    if (exam.difficultyBand === 'foundation') return 'Nền tảng';
    if (exam.difficultyBand === 'score8') return 'Mục tiêu 8+';
    if (exam.difficultyBand === 'score9') return 'Mục tiêu 9+';
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-in fade-in duration-300 font-sans pb-16">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/80 text-xs font-bold text-foreground uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-primary" />
              Phòng Thi Thử Thực Chiến
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Thi thử & Kiểm tra {subjectLabel}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-2xl leading-relaxed">
              Hệ thống đề thi chuẩn cấu trúc Bộ GD&ĐT với đồng hồ đếm ngược và phân tích phổ điểm chi tiết.
            </p>
          </div>

          {/* Guest Mode Slim Notice */}
          {!user && (
            <div className="bg-secondary/40 border border-border/70 rounded-xl p-3 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 shadow-2xs shrink-0 md:max-w-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-background border border-border/60 text-muted-foreground flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">Chế độ tự do</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">Khách</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-normal line-clamp-1">
                    Làm bài và bấm giờ bình thường
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await authService.signInWithGoogle();
                  } catch (err: any) {
                    alert(err.message || 'Lỗi đăng nhập bằng Google.');
                  }
                }}
                className="px-3 py-1.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>

        {/* Resume Hub: Spotlight Bar - Cảnh báo dở dang */}
        {activeSessions.length > 0 && (
          <div className="bg-secondary/30 border border-border/80 border-l-3 border-l-amber-500 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 text-foreground text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Bạn đang có {activeSessions.length} bài thi chưa hoàn thành (Thời gian đã tự động đóng băng)
              </div>
            </div>

            <div className={cn(
              "grid gap-2.5",
              activeSessions.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}>
              {activeSessions.map(session => {
                const answeredCount = Object.keys(session.answers || {}).length + Object.keys(session.finalAnswers || {}).length;
                const totalCount = session.questionIds.length;
                return (
                  <div
                    key={session.sourceExamId}
                    className="bg-card border border-border/70 rounded-lg p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-border transition-all"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {session.examTitle}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Đã làm: <strong className="text-foreground font-semibold">{answeredCount}/{totalCount}</strong> câu</span>
                        <span>•</span>
                        <span>Còn lại: <strong className="text-amber-600 dark:text-amber-400 font-semibold">{formatTime(session.timeLeft)}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        onClick={() => onResumeExam(session)}
                        className="font-bold text-xs py-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Play size={11} className="fill-current" /> Tiếp tục ({formatTime(session.timeLeft)})
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onDiscardActiveSession(session.sourceExamId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                        title="Hủy bài thi này"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lọc đề thi theo Tab với Count badge */}
        <div role="tablist" aria-label="Lọc loại bài kiểm tra" className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-1 justify-start scroll-smooth pt-1">
          {availableTabs.map(tab => {
            const tabLabels: Record<ExamTab, string> = {
              all: 'Tất cả',
              diagnostic: 'Chẩn đoán',
              theory: 'Lý thuyết',
              checkpoint: 'Chuyên đề',
              midterm: 'Giữa kỳ',
              final: 'Cuối kỳ'
            };
            const count = tab === 'all'
              ? subjectExams.length
              : tab === 'diagnostic'
                ? subjectExams.filter(e => e.kind === 'diagnostic').length
                : tab === 'theory'
                  ? subjectExams.filter(e => e.focus === 'theory').length
                  : tab === 'checkpoint'
                    ? subjectExams.filter(e => e.kind === 'module_checkpoint' && e.focus !== 'theory').length
                    : tab === 'midterm'
                      ? subjectExams.filter(e => e.kind === 'midterm' && e.focus !== 'theory').length
                      : subjectExams.filter(e => e.kind === 'final' && e.focus !== 'theory').length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-2xs ring-1 ring-primary/30'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50'
                )}
              >
                <span>{tabLabels[tab]}</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout 2-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Danh sách đề thi */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
              Danh sách đề thi ({groupedExams.length} bộ đề · {filteredExams.length} mã đề)
            </label>
          </div>

          {groupedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedExams.map(group => {
                const isGroupSelected = group.exams.some(e => e.id === selectedExamId);
                const selectedExamInGroup = group.exams.find(e => e.id === selectedExamId) || group.exams[0];
                const isSelected = selectedExamId === selectedExamInGroup.id;
                const groupActiveSession = group.exams.map(e => activeSessionsByExamId.get(e.id)).find(Boolean);

                return (
                  <div
                    key={group.baseTitle}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isGroupSelected}
                    aria-label={`Chọn ${group.baseTitle}${group.exams.length > 1 ? `, có ${group.exams.length} mã đề` : ''}`}
                    onClick={() => setSelectedExamId(selectedExamInGroup.id)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedExamId(selectedExamInGroup.id);
                      }
                    }}
                    className={cn(
                      'p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-full bg-card hover:shadow-md cursor-pointer select-none relative overflow-hidden group',
                      isGroupSelected
                        ? 'border-primary ring-2 ring-primary/25 shadow-sm bg-gradient-to-br from-card via-card to-primary/[0.02]'
                        : 'border-border/70 hover:border-border'
                    )}
                  >
                    <div className="space-y-3">
                      {/* Header Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', getExamCategoryStyle(selectedExamInGroup))}>
                            {getExamCategoryLabel(selectedExamInGroup)}
                          </span>
                          {getDifficultyBandLabel(selectedExamInGroup) && (
                            <span className="rounded-md bg-muted text-muted-foreground px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                              {getDifficultyBandLabel(selectedExamInGroup)}
                            </span>
                          )}
                          {groupActiveSession && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wider border border-amber-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Đang làm dở
                            </span>
                          )}
                        </div>

                        {isGroupSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                            <Check size={11} strokeWidth={3} /> Đang chọn
                          </span>
                        ) : (
                          group.exams.length > 1 && (
                            <span className="text-[10px] text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {group.exams.length} mã đề
                            </span>
                          )
                        )}
                      </div>

                      {/* Exam Title */}
                      <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {group.baseTitle}
                      </h4>
                    </div>

                    {/* Variant selector & footer */}
                    <div className="space-y-3 pt-3 border-t border-border/40 mt-4">
                      {group.exams.length > 1 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Chọn mã đề:</span>
                          <div className="inline-flex p-0.5 rounded-lg bg-secondary/60 border border-border/50 gap-0.5">
                            {group.exams.map(exam => {
                              const isVariantSelected = selectedExamId === exam.id;
                              const variantSummary = examSummaryMap[exam.id];
                              return (
                                <button
                                  key={exam.id}
                                  type="button"
                                  aria-pressed={isVariantSelected}
                                  aria-label={`Chọn mã đề ${exam.formCode}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExamId(exam.id);
                                  }}
                                  className={cn(
                                    'px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                                    isVariantSelected
                                      ? 'bg-background text-foreground shadow-2xs'
                                      : 'text-muted-foreground hover:text-foreground'
                                  )}
                                >
                                  <span>Mã {exam.formCode}</span>
                                  {variantSummary && (
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                                      ({variantSummary.bestScore.toFixed(1)})
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer size={13} className="text-muted-foreground/70" />
                            <strong className="text-foreground font-semibold">{selectedExamInGroup.duration}</strong> phút
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={13} className="text-muted-foreground/70" />
                            <strong className="text-foreground font-semibold">{selectedExamInGroup.questionIds.length}</strong> câu
                          </span>
                        </div>

                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-bold transition-all",
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {isSelected ? 'Sẵn sàng thi' : 'Xem chi tiết'}
                          <ArrowRight size={12} className={cn("transition-transform", isSelected ? "translate-x-0.5" : "")} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
              <p className="text-sm font-bold text-foreground">Không tìm thấy đề thi phù hợp</p>
              <p className="text-xs text-muted-foreground">Vui lòng quay lại sau hoặc thử chọn danh mục khác.</p>
            </div>
          )}
        </div>

        {/* Cột phải: Sticky chi tiết đề thi */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
          {currentExam && filteredExams.some(e => e.id === currentExam.id) ? (
            <Card className="border-border shadow-md overflow-hidden rounded-2xl bg-card">
              <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-foreground text-sm font-bold flex items-center gap-2">
                  <Award className="text-primary" size={18} />
                  Chi tiết đề thi
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase">
                  Mã {currentExam.formCode || 'A'}
                </span>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* 4 Metric Tiles */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Thời gian */}
                  <div className="p-3 rounded-xl border border-border/60 bg-secondary/30 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Timer size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase truncate">
                        Thời gian
                      </span>
                      <span className="text-xs sm:text-sm font-black text-foreground">
                        {currentExam.duration} <span className="text-[10px] font-normal text-muted-foreground">phút</span>
                      </span>
                    </div>
                  </div>

                  {/* Số câu */}
                  <div className="p-3 rounded-xl border border-border/60 bg-secondary/30 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <BookOpen size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase truncate">
                        Số câu hỏi
                      </span>
                      <span className="text-xs sm:text-sm font-black text-foreground">
                        {currentExam.questionIds.length} <span className="text-[10px] font-normal text-muted-foreground">câu</span>
                      </span>
                    </div>
                  </div>

                  {/* Trọng tâm */}
                  <div className="p-3 rounded-xl border border-border/60 bg-secondary/30 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Target size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase truncate">
                        Đánh giá
                      </span>
                      <span className="text-xs sm:text-sm font-black text-foreground truncate block">
                        {getExamCategoryLabel(currentExam)}
                      </span>
                    </div>
                  </div>

                  {/* Mã đề */}
                  <div className="p-3 rounded-xl border border-border/60 bg-secondary/30 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Zap size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground block tracking-wider uppercase truncate">
                        Mã đề
                      </span>
                      <span className="text-xs sm:text-sm font-black text-foreground">
                        Mã {currentExam.formCode || 'A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lịch sử làm đề này */}
                {currentExamSummary && (
                  <div className="rounded-xl border border-border/80 bg-secondary/25 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award size={15} className="text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                          Lịch sử làm đề này
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        Đã thi {currentExamSummary.attemptsCount} lần
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-card/80 border border-border/50">
                        <span className="text-[10px] text-muted-foreground block font-medium">Điểm cao nhất</span>
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {currentExamSummary.bestScore.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">/ 10</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card/80 border border-border/50">
                        <span className="text-[10px] text-muted-foreground block font-medium">Lần thi gần nhất</span>
                        <div className="text-base font-black text-foreground">
                          {currentExamSummary.lastScore.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">/ 10</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> Hoàn thành lúc:
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatCompletedDate(currentExamSummary.lastCompletedAt)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoadingReview}
                      onClick={() => onReviewPastResult(currentExam.id, currentExamSummary.lastExamId)}
                      className="w-full text-xs font-bold gap-1.5 h-8.5 rounded-lg border-border/80 hover:bg-secondary cursor-pointer shadow-2xs"
                    >
                      <FileText size={13} className="text-primary" />
                      {isLoadingReview ? 'Đang mở bài thi...' : 'Xem lại bài thi gần nhất'}
                    </Button>
                  </div>
                )}

                {/* Cấu trúc bài kiểm tra */}
                {currentBlueprint && (
                  <div className="rounded-xl border border-border/70 bg-secondary/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers size={14} className="text-muted-foreground" />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                          Cấu trúc ma trận đề
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {currentBlueprint.totalPoints} điểm
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex gap-0.5">
                      {currentBlueprint.sections.map((section, idx) => {
                        const spectrumShades = ['bg-blue-500', 'bg-indigo-500', 'bg-teal-500', 'bg-emerald-500'];
                        const pct = Math.max(10, Math.round((section.points / (currentBlueprint.totalPoints || 10)) * 100));
                        return (
                          <div
                            key={section.id}
                            style={{ width: `${pct}%` }}
                            className={cn(spectrumShades[idx % spectrumShades.length], 'h-full transition-all')}
                            title={`${section.title}: ${section.points} điểm`}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      {currentBlueprint.sections.map((section, idx) => {
                        const dotShades = ['bg-blue-500', 'bg-indigo-500', 'bg-teal-500', 'bg-emerald-500'];
                        return (
                          <div key={section.id} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn('w-2 h-2 rounded-full shrink-0', dotShades[idx % dotShades.length])} />
                              <span className="font-medium text-foreground truncate">{section.title}</span>
                            </div>
                            <span className="shrink-0 font-medium text-muted-foreground ml-2">
                              {section.itemCount} câu · <strong className="text-foreground font-semibold">{section.points}đ</strong>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quy chế thi */}
                <div className="space-y-2 bg-secondary/30 border border-border/60 p-3.5 rounded-xl text-xs">
                  <h4 className="font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-wider text-foreground">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Quy chế phòng thi
                  </h4>
                  <div className="space-y-1 text-[11px] text-muted-foreground font-normal">
                    <div className="flex gap-1.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-1.5 shrink-0" />
                      <span>Đồng hồ đếm ngược tự động khóa & thu bài khi hết giờ.</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-1.5 shrink-0" />
                      <span>Hệ thống tự động lưu từng câu trả lời khi thao tác.</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-1.5 shrink-0" />
                      <span>Xem phổ điểm & lời giải chi tiết ngay sau khi nộp bài.</span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Area */}
                {activeSessionForSelectedExam ? (
                  <div className="space-y-2 pt-1">
                    <div className="p-3 rounded-xl border border-border/70 bg-secondary/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-foreground block">Đang làm dở</span>
                        <span className="text-xs text-muted-foreground">
                          Đã làm <strong className="text-foreground font-semibold">{Object.keys(activeSessionForSelectedExam.answers || {}).length + Object.keys(activeSessionForSelectedExam.finalAnswers || {}).length}/{activeSessionForSelectedExam.questionIds.length}</strong> câu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">{formatTime(activeSessionForSelectedExam.timeLeft)}</span>
                        <span className="text-[10px] text-muted-foreground">còn lại</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => onResumeExam(activeSessionForSelectedExam)}
                      className="h-12 w-full font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                    >
                      <Play size={14} className="fill-current" /> Tiếp tục làm bài ({formatTime(activeSessionForSelectedExam.timeLeft)})
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onStartExam}
                      className="w-full font-semibold text-xs py-2 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw size={13} /> Hủy bài cũ & Thi lại từ đầu
                    </Button>
                  </div>
                ) : currentExamSummary ? (
                  <div className="space-y-2 pt-1">
                    <Button
                      onClick={onStartExam}
                      className="h-12 w-full font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
                    >
                      <RotateCcw size={14} /> Làm lại đề thi này (Lần {currentExamSummary.attemptsCount + 1})
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground font-normal flex items-center justify-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                      Điểm cao nhất hiện tại: <strong className="text-foreground">{currentExamSummary.bestScore.toFixed(1)}/10</strong>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Button
                      onClick={onStartExam}
                      className="h-12 w-full font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
                    >
                      <Play size={14} className="fill-current" /> {currentExam.focus === 'theory' ? 'Bắt đầu kiểm tra lý thuyết' : 'Bắt đầu tính giờ thi thử'}
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground font-normal flex items-center justify-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                      Thời gian được tính tự động • Lưu bài an toàn
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center space-y-3">
              <Sparkles className="text-muted-foreground mx-auto w-8 h-8 opacity-40 animate-pulse" />
              <p className="text-xs font-extrabold text-muted-foreground">Vui lòng chọn đề thi để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
