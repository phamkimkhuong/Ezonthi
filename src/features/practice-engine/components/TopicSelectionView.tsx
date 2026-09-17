import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { QuestionType, SubjectCode } from '@/types';
import { getPracticeQuestions, getTopics } from '@/data';
import { useAppStore } from '@/services/store';
import { getSubjectTheme, getStarsFromScore } from '@/utils/theme';
import { storageService } from '@/services/storage';
import { LatexRenderer } from '@/components/common/LatexRenderer';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { buildAdaptivePracticeSequence } from '../utils/adaptivePracticeSequence';
import { isQuestionTypePremiumLocked } from '@/utils/subject';

interface TopicSelectionViewProps {
  routeSubject: SubjectCode;
  questionTypes: QuestionType[];
  grammarSection: 'dang1' | 'dang2' | 'dang3' | 'dang4' | 'dang5' | null;
  setGrammarSection: (val: 'dang1' | 'dang2' | 'dang3' | 'dang4' | 'dang5' | null) => void;
  setSelectedSubTense: (val: any) => void;
  setSelectedTensesForCombo: (val: string[]) => void;
  setIsConfiguringAll: (val: boolean) => void;
  setIsConfiguringExam: (val: boolean) => void;
  setExamTenses: (val: string[]) => void;
  globalProgressPercent: number;
  tensesReviewAttemptsCount: number;
  tensesReviewBestScore: number;
  startTensesReview: () => void;
  getSubTenseProgress: (qIds: string[]) => number;
  isPremium: boolean;
  questionTypeId?: string;
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({
  routeSubject,
  questionTypes,
  grammarSection,
  setGrammarSection,
  setSelectedSubTense,
  setSelectedTensesForCombo,
  setIsConfiguringAll,
  setIsConfiguringExam,
  setExamTenses,
  globalProgressPercent,
  tensesReviewAttemptsCount,
  tensesReviewBestScore,
  startTensesReview,
  getSubTenseProgress,
  isPremium,
  questionTypeId,
}) => {
  const navigate = useNavigate();
  const { selectedGrade, user, progressVersion } = useAppStore();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topicId: string) => {
    setCollapsedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const requireAuth = (action: () => void) => {
    action();
  };
  const theme = getSubjectTheme(routeSubject);
  const isMath = routeSubject === 'math';
  const isEnglish = routeSubject === 'english';
  const isChemistry = routeSubject === 'chemistry';
  const isPhysics = routeSubject === 'physics';
  const isBiology = routeSubject === 'biology';

  const allQuestions = useMemo(
    () => getPracticeQuestions(selectedGrade, routeSubject),
    [selectedGrade, routeSubject]
  );
  const userId = user?.uid || 'guest';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const progress = useMemo(() => storageService.getProgress(userId), [userId, progressVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const attempts = useMemo(() => storageService.getAttempts(userId), [userId, progressVersion]);

  const dang1QIds = useMemo(() => [
    ...Array.from({ length: 80 }, (_, i) => `eng-q${i + 5}`),
    ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 102}`),
    ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 122}`),
    ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 142}`),
    ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 162}`),
    ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 182}`),
    ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 202}`)
  ], []);

  const dang2QIds = useMemo(() => Array.from({ length: 40 }, (_, i) => `eng-q${i + 222}`), []);
  const dang3QIds = useMemo(() => Array.from({ length: 40 }, (_, i) => `eng-q${i + 262}`), []);
  const dang4QIds = useMemo(() => Array.from({ length: 30 }, (_, i) => `eng-q${i + 302}`), []);
  const dang5QIds = useMemo(() => Array.from({ length: 30 }, (_, i) => `eng-q${i + 332}`), []);

  if (isEnglish && questionTypeId === 'eng-qt6' && grammarSection === null) {
    const dangCards = [
      {
        id: 'dang1',
        name: '⏱️ Dạng 1: Thì động từ cơ bản',
        description: 'Luyện tập 6 thì động từ chủ chốt (Hiện tại đơn, Quá khứ đơn, Tiếp diễn, Hoàn thành, Tương lai đơn, Quá khứ tiếp diễn) và các quy tắc phối hợp thì.',
        qIds: dang1QIds,
      },
      {
        id: 'dang2',
        name: '📦 Dạng 2: Cấu trúc động từ',
        description: 'Luyện tập cấu trúc động từ nguyên mẫu và danh động từ (to V, V-ing, V0) để củng cố phản xạ phân biệt.',
        qIds: dang2QIds,
      },
      {
        id: 'dang3',
        name: '🔌 Dạng 3: Giới từ & Phrasal verbs',
        description: 'Luyện giới từ cố định đi kèm tính từ, động từ và các cụm động từ cơ bản thông dụng.',
        qIds: dang3QIds,
      },
      {
        id: 'dang4',
        name: '⚖️ Dạng 4: Cấu trúc So sánh',
        description: 'Rèn luyện các cấu trúc so sánh bằng, so sánh hơn, so sánh nhất của tính từ và trạng từ.',
        qIds: dang4QIds,
      },
      {
        id: 'dang5',
        name: '📐 Dạng 5: Vị trí của các loại từ',
        description: 'Rèn luyện kỹ năng xác định từ loại phù hợp (Danh - Động - Tính - Trạng) để điền vào câu dựa trên ngữ cảnh.',
        qIds: dang5QIds,
      },
    ];

    return (
      <div className="space-y-6 max-w-4xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto pb-12 px-4 md:px-6 animate-fade-in">
        <button
          onClick={() => {
            navigate('/practice');
          }}
          className="p-2 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer bg-secondary/50 hover:bg-secondary rounded-xl transition-all self-start animate-fade-in"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Trắc nghiệm Ngữ pháp & Từ vựng</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Chọn một trong 5 dạng chuyên đề dưới đây để bắt đầu ôn tập ngữ pháp và từ vựng Tiếng Anh vào 10.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
          {dangCards.map((card) => {
            const percent = getSubTenseProgress(card.qIds);
            return (
              <Card
                key={card.id}
                className="hover:border-primary/50 cursor-pointer transition-all duration-200 hover:translate-x-[2px] border bg-card flex flex-col justify-between"
                onClick={() => {
                  setGrammarSection(card.id as any);
                }}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                        🗣️ Anh
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1">
                      <LatexRenderer text={card.name} />
                    </h4>
                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      <LatexRenderer text={card.description} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/20 pt-3 text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1.5 flex-1 max-w-[60%]">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[9px] text-primary shrink-0">{percent}%</span>
                    </div>

                    <Button variant="outline" size="sm" className="font-bold text-[10px] py-1 px-3 shrink-0 border border-border/50 cursor-pointer h-7">
                      Luyện tập →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
          <Card
            className="cursor-pointer transition-all duration-200 hover:translate-y-[-2px] border bg-card flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-indigo-500/30"
            onClick={() => {
              requireAuth(() => {
                setSelectedTensesForCombo(isG9
                  ? ['module1', 'module2', 'module3', 'module4', 'module5']
                  : topics.map(topic => topic.id));
                setIsConfiguringAll(true);
              });
            }}
          >
            <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full text-[9px] font-bold w-fit">
                    <span className="text-[10px]">🗣️</span> Anh
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  📝 Tổng ôn thông minh
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tự chọn tổ hợp các dạng bài mong muốn và tạo ngẫu nhiên lượt luyện tập tối đa 40 câu hỏi.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-auto">
                <div className="flex items-center gap-2 flex-1 max-w-[65%]">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${globalProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">{globalProgressPercent}%</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-[11px] py-1 px-3.5 border border-border/50 hover:bg-accent hover:text-accent-foreground cursor-pointer h-8 rounded-xl shrink-0"
                >
                  Luyện tập →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:translate-y-[-2px] border bg-card flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-indigo-500/30"
            onClick={() => {
              requireAuth(() => {
                setExamTenses(['module1', 'module2', 'module3', 'module4', 'module5']);
                setIsConfiguringExam(true);
              });
            }}
          >
            <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full text-[9px] font-bold w-fit">
                    <span className="text-[10px]">🗣️</span> Anh
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  🏆 Luyện thi trắc nghiệm
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Luyện thi tính giờ với số lượng câu và dạng bài tự chọn. Không hiện giải thích ngay khi làm, chỉ hiện toàn bộ khi nộp bài hoặc hết giờ.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-auto">
                <div className="flex items-center gap-2 flex-1 max-w-[65%]">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${globalProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">{globalProgressPercent}%</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-[11px] py-1 px-3.5 border border-border/50 hover:bg-accent hover:text-accent-foreground cursor-pointer h-8 rounded-xl shrink-0"
                >
                  Luyện tập →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isMath && grammarSection !== null) {
    let subTenseCards: Array<{ id: string; name: string; description: string; qIds: string[] }> = [];
    let sectionTitle = '';
    let sectionDesc = '';

    if (grammarSection === 'dang1') {
      sectionTitle = 'Dạng 1: Thì động từ cơ bản';
      sectionDesc = 'Luyện tập sâu từng thì hoặc làm bài thi thử để kiểm tra trình độ.';
      subTenseCards = [
        {
          id: 'present_simple',
          name: '⏱️ Thì Hiện tại đơn (Present Simple)',
          description: 'Tập trung luyện các câu chia thì Hiện tại đơn với các dấu hiệu nhận biết quen thuộc: usually, often, always, every day...',
          qIds: [...Array.from({ length: 20 }, (_, i) => `eng-q${i + 5}`), ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 102}`)]
        },
        {
          id: 'past_simple',
          name: '🗓️ Thì Quá khứ đơn (Past Simple)',
          description: 'Tập trung luyện các câu chia thì Quá khứ đơn với các dấu hiệu thời gian quá khứ: yesterday, last summer, ago...',
          qIds: [...Array.from({ length: 20 }, (_, i) => `eng-q${i + 25}`), ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 122}`)]
        },
        {
          id: 'present_continuous',
          name: '⚡ Thì Hiện tại tiếp diễn (Present Continuous)',
          description: 'Tập trung luyện các câu chia thì Hiện tại tiếp diễn với các dấu hiệu thời điểm hoặc cảm thán: now, at the moment, Look!...',
          qIds: [...Array.from({ length: 20 }, (_, i) => `eng-q${i + 45}`), ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 142}`)]
        },
        {
          id: 'past_continuous',
          name: '⏳ Thì Quá khứ tiếp diễn (Past Continuous)',
          description: 'Tập trung luyện các câu chia thì Quá khứ tiếp diễn diễn tả hành động đang xảy ra tại một thời điểm quá khứ với liên từ while.',
          qIds: [...Array.from({ length: 20 }, (_, i) => `eng-q${i + 65}`), ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 162}`)]
        },
        {
          id: 'present_perfect',
          name: '✨ Thì Hiện tại hoàn thành (Present Perfect)',
          description: 'Tập trung chia động từ ở thì Hiện tại hoàn thành (has/have + V3/ed) và phân biệt với Quá khứ đơn.',
          qIds: Array.from({ length: 20 }, (_, i) => `eng-q${i + 182}`)
        },
        {
          id: 'future_simple',
          name: '🔮 Thì Tương lai đơn (Future Simple / Will)',
          description: 'Tập trung chia động từ ở thì Tương lai đơn (will + V) và cấu trúc câu điều kiện loại 1.',
          qIds: Array.from({ length: 20 }, (_, i) => `eng-q${i + 202}`)
        },
        {
          id: 'all',
          name: '📑 Tổng ôn thông minh',
          description: 'Tự chọn tổ hợp các dạng thì mong muốn và tạo ngẫu nhiên lượt luyện tập tối đa 40 câu hỏi.',
          qIds: [
            ...Array.from({ length: 80 }, (_, i) => `eng-q${i + 5}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 102}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 122}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 142}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 162}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 182}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 202}`)
          ]
        },
        {
          id: 'exam',
          name: '🏆 Luyện thi trắc nghiệm',
          description: 'Luyện thi tính giờ với số lượng câu và thì tự chọn. Không hiện giải thích ngay khi làm, chỉ hiện toàn bộ khi nộp bài hoặc hết giờ.',
          qIds: [
            ...Array.from({ length: 80 }, (_, i) => `eng-q${i + 5}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 102}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 122}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 142}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 162}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 182}`),
            ...Array.from({ length: 20 }, (_, i) => `eng-q${i + 202}`)
          ]
        }
      ];
    } else if (grammarSection === 'dang2') {
      sectionTitle = 'Dạng 2: Cấu trúc động từ (to V, V-ing, V0)';
      sectionDesc = 'Luyện tập các cấu trúc động từ nguyên mẫu và danh động từ.';
      subTenseCards = [
        {
          id: 'to_v',
          name: '👉 Cấu trúc động từ dạng "to V"',
          description: 'Luyện chia động từ dạng to V sau các từ chỉ mong muốn, quyết định: decide, want, hope, agree, would like...',
          qIds: Array.from({ length: 20 }, (_, i) => `eng-q${i + 222}`)
        },
        {
          id: 'v_ing',
          name: '👉 Cấu trúc động từ dạng "V-ing"',
          description: 'Luyện chia động từ dạng V-ing sau các từ chỉ sở thích, trì hoãn: enjoy, avoid, practice, finish, spend time...',
          qIds: Array.from({ length: 20 }, (_, i) => `eng-q${i + 242}`)
        },
        {
          id: 'verb_combo',
          name: '📑 Tổng hợp Cấu trúc động từ',
          description: 'Luyện tập tổng hợp các cấu trúc động từ (to V, V-ing, V0) để củng cố phản xạ phân biệt.',
          qIds: Array.from({ length: 40 }, (_, i) => `eng-q${i + 222}`)
        }
      ];
    } else if (grammarSection === 'dang3') {
      sectionTitle = 'Dạng 3: Giới từ & Phrasal verbs cơ bản';
      sectionDesc = 'Luyện giới từ cố định, phrasal verbs, giới từ thời gian/nơi chốn thông dụng.';
      subTenseCards = [
        {
          id: 'prep_phrasal',
          name: '🔌 Giới từ & Phrasal Verbs',
          description: 'Luyện giới từ đi kèm tính từ, động từ cố định (interested in, good at, turn off, look after, cut down on...).',
          qIds: Array.from({ length: 40 }, (_, i) => `eng-q${i + 262}`)
        }
      ];
    } else if (grammarSection === 'dang4') {
      sectionTitle = 'Dạng 4: Cấu trúc So sánh (Comparisons)';
      sectionDesc = 'Luyện các cấu trúc so sánh hơn, so sánh nhất, so sánh bằng/không bằng của tính từ và trạng từ.';
      subTenseCards = [
        {
          id: 'comparison',
          name: '⚖️ Cấu trúc So sánh (Comparisons)',
          description: 'Rèn luyện các cấu trúc so sánh bằng, so sánh hơn, so sánh nhất của tính từ/trạng từ ngắn và dài.',
          qIds: Array.from({ length: 30 }, (_, i) => `eng-q${i + 302}`)
        }
      ];
    } else if (grammarSection === 'dang5') {
      sectionTitle = 'Dạng 5: Vị trí từ loại (Word Positions)';
      sectionDesc = 'Luyện xác định vị trí của danh từ, động từ, tính từ, trạng từ trong cấu trúc câu.';
      subTenseCards = [
        {
          id: 'word_position',
          name: '📐 Vị trí từ loại (Word Positions)',
          description: 'Rèn luyện kỹ năng xác định từ loại phù hợp để điền vào câu dựa trên ngữ cảnh và từ đứng trước/sau.',
          qIds: Array.from({ length: 30 }, (_, i) => `eng-q${i + 332}`)
        }
      ];
    }

    return (
      <div className="space-y-6 max-w-4xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto pb-12 px-4 md:px-6 animate-fade-in">
        <button
          onClick={() => {
            setGrammarSection(null);
          }}
          className="p-2 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer bg-secondary/50 hover:bg-secondary rounded-xl transition-all self-start animate-fade-in"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">{sectionTitle}</h2>
          <p className="text-xs text-muted-foreground font-semibold">{sectionDesc}</p>
        </div>

        {/* Hero Milestone Card: Bài kiểm tra tổng hợp 6 thì */}
        {grammarSection === 'dang1' && (
          <Card className="border-indigo-500/20 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-900/50 dark:to-indigo-950/10 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500 text-white flex items-center gap-1">
                    📝 ĐÁNH GIÁ NĂNG LỰC
                  </span>
                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    🔓 Tự do ôn tập
                  </span>
                </div>
                <h3 className="font-extrabold text-sm md:text-base text-foreground">
                  Bài kiểm tra tổng hợp 6 thì
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  Bài thi tổng hợp gồm **20 câu hỏi trắc nghiệm** trộn ngẫu nhiên từ cả 6 thì (thời gian làm bài: 15 phút, không hiện đáp án ngay). Khuyên dùng để tự đánh giá mức độ phản xạ phối hợp giữa các thì.
                </p>
                {tensesReviewAttemptsCount > 0 && (
                  <div className="flex gap-4 text-[10px] font-extrabold text-muted-foreground pt-1.5">
                    <span>Đã làm: <span className="text-foreground">{tensesReviewAttemptsCount} lần</span></span>
                    <span>Điểm cao nhất: <span className={cn(tensesReviewBestScore >= 15 ? "text-emerald-600" : "text-rose-600")}>{tensesReviewBestScore}/20 câu đúng ({Math.round(tensesReviewBestScore / 20 * 100)}%)</span></span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => requireAuth(startTensesReview)}
                className="font-bold text-xs py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer h-10 shrink-0 shadow-sm"
              >
                {tensesReviewAttemptsCount > 0 ? '🔄 Kiểm tra lại' : '✍️ Làm bài ngay'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
          {subTenseCards.map((card) => {
            const percent = getSubTenseProgress(card.qIds);
            return (
              <Card
                key={card.id}
                className="hover:border-primary/50 cursor-pointer transition-all duration-200 hover:translate-x-[2px] border bg-card flex flex-col justify-between"
                onClick={() => {
                  requireAuth(() => {
                    if (card.id === 'all') {
                      setIsConfiguringAll(true);
                    } else if (card.id === 'exam') {
                      setIsConfiguringExam(true);
                    } else {
                      setSelectedSubTense(card.id as any);
                    }
                  });
                }}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                        🗣️ Anh
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1">
                      <LatexRenderer text={card.name} />
                    </h4>
                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      <LatexRenderer text={card.description} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/20 pt-3 text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1.5 flex-1 max-w-[60%]">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[9px] text-primary shrink-0">{percent}%</span>
                    </div>

                    <Button variant="outline" size="sm" className="font-bold text-[10px] py-1 px-3 shrink-0 border border-border/50 cursor-pointer h-7">
                      Luyện tập →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Màn hình chọn dạng bài chính
  const topics = getTopics(selectedGrade, routeSubject);
  const qTypes = questionTypes;

  const isG9 = selectedGrade === 'grade9';
  const isG11 = selectedGrade === 'grade11';
  const isG12 = selectedGrade === 'grade12';
  const gradeText = isG9 ? 'tuyển sinh 10' : isG11 ? 'Lớp 11' : isG12 ? 'Lớp 12' : 'Lớp 10';
  const gradeTextLower = isG9 ? 'ôn thi vào 10' : isG11 ? 'lớp 11' : isG12 ? 'lớp 12' : 'lớp 10';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-3 sm:px-6 lg:px-8 py-3 animate-fade-in pb-12 font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          {isMath
            ? (isG9 ? '📐 Luyện tập Toán tuyển sinh 10' : `📐 Học tốt Toán ${gradeText}`)
            : isChemistry
              ? `🧪 Luyện tập Hóa học ${gradeText}`
              : isPhysics
                ? `⚛️ Luyện tập Vật lí ${gradeText}`
                : routeSubject === 'biology'
                  ? `🧬 Luyện tập Sinh học ${gradeText}`
                  : routeSubject === 'history'
                    ? `📜 Luyện tập Lịch sử ${gradeText}`
                    : (isG9 ? '🗣️ Luyện tập Tiếng Anh vào 10' : `🗣️ Học tốt Tiếng Anh ${gradeText}`)}
        </h2>
        <p className="text-xs text-muted-foreground font-semibold">
          {isMath
            ? (isG9 ? 'Học sinh làm bài tự luận chi tiết ra giấy, chụp ảnh gửi bài để thầy cô chấm và nhận xét.' : `Bài tập tự luận ${gradeTextLower} bám sát chương trình mới, chụp ảnh để nhận xét chi tiết.`)
            : isChemistry
              ? `Luyện tập các dạng bài Hóa học ${gradeTextLower} bám sát chương trình GDPT 2018 mới.`
              : isPhysics
                ? 'Học tăng dần từ nền tảng đến vận dụng; kiểm tra làm chủ chỉ mở khi em đã sẵn sàng.'
                : routeSubject === 'biology'
                  ? `Luyện tập các dạng bài Sinh học ${gradeTextLower} bám sát chương trình GDPT 2018 mới.`
                  : routeSubject === 'history'
                    ? `Luyện tập các dạng bài Lịch sử ${gradeTextLower} bám sát chương trình GDPT 2018 mới.`
                    : (isG9 ? 'Tổng hợp các câu hỏi trắc nghiệm & điền từ bám sát đề thi chính thức tỉnh Bình Định.' : 'Học tốt các chuyên đề từ vựng & ngữ pháp bám sát sách giáo khoa mới.')}
        </p>
      </div>

      {/* Khung thông báo Chế độ luyện tập xem thử dành cho khách */}
      {!user && (
        <div className="bg-primary/7 border border-primary/20 border-l-4 border-l-primary rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 w-full mx-auto">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-black text-foreground">Bạn đang luyện tập ở chế độ xem thử</h3>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Kết quả làm bài được lưu tạm trên máy. Đăng nhập tài khoản để đồng bộ tiến trình học tập lên đám mây và mở khóa lưu vết đầy đủ.
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                await authService.signInWithGoogle();
              } catch (err: any) {
                alert(err.message || 'Lỗi đăng nhập bằng Google.');
              }
            }}
            className="px-6 py-2.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {topics.map((topic) => {
        const topicQTypes = qTypes.filter(qt => qt.topicId === topic.id);
        if (topicQTypes.length === 0) return null;
        const isCollapsed = Boolean(collapsedTopics[topic.id]);

        return (
          <div key={topic.id} className="space-y-3">
            {/* Header Accordion Toggle - Nút xổ xuống thu gọn/mở rộng chuyên đề */}
            <div
              onClick={() => toggleTopic(topic.id)}
              className="flex items-start justify-between gap-3 border-b border-border/20 pb-2.5 cursor-pointer select-none group/topic py-1.5"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {/* Chỉ thị dọc đổi màu theo môn học */}
                <div className={cn(
                  "h-4 w-1 rounded-full shrink-0 mt-1 transition-all",
                  routeSubject === 'math' ? 'bg-indigo-500' :
                    routeSubject === 'chemistry' ? 'bg-emerald-500' :
                      routeSubject === 'physics' ? 'bg-cyan-500' :
                        routeSubject === 'biology' ? 'bg-green-500' :
                          'bg-purple-500'
                )} />
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  <h3 className="text-sm font-black text-foreground tracking-tight group-hover/topic:text-primary transition-colors leading-snug">
                    {topic.name}
                  </h3>
                  <span className="text-[9px] bg-secondary text-muted-foreground border border-border/40 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap">
                    {topicQTypes.length} dạng bài
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground group-hover/topic:text-foreground transition-colors shrink-0 mt-0.5">
                <span className="text-[10px] font-bold hidden sm:inline-block">
                  {isCollapsed ? "Mở rộng" : "Thu gọn"}
                </span>
                <div className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </div>
            </div>

            {/* Grid 3 cột rộng rãi thoáng đãng trên Laptop, 4 cột trên 2xl */}
            {!isCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-5 animate-fade-in pt-1">
                {topicQTypes.map((qType) => {
                  const qTypeAttempts = attempts.filter(a => a.questionTypeId === qType.id);
                  const qTypeQuestions = allQuestions.filter(q => q.questionTypeId === qType.id);
                  const adaptiveStatus = (isChemistry || isPhysics || isBiology)
                    ? buildAdaptivePracticeSequence(qTypeQuestions, qTypeAttempts)
                    : null;
                  const totalQuestions = adaptiveStatus?.learningQuestionCount ?? qTypeQuestions.length;
                  const solvedQuestionIds = new Set(
                    qTypeAttempts
                      .filter(a => a.isCorrect)
                      .filter(a => !qTypeQuestions.find(question => question.id === a.questionId)?.isMasteryHoldout)
                      .map(a => a.questionId)
                  );
                  const solvedCount = adaptiveStatus
                    ? adaptiveStatus.readiness.correctLearningCount
                    : Math.min(solvedQuestionIds.size, totalQuestions);
                  const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;
                  const masteryScore = progress?.masteryLevels[qType.id] ?? 0;
                  const starsCount = getStarsFromScore(masteryScore);
                  const isLockedByPremium = isQuestionTypePremiumLocked(qType.id, topic.tier, routeSubject, selectedGrade) && !isPremium;

                  const statusBadge = (() => {
                    if (isLockedByPremium) {
                      return (
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse flex items-center gap-0.5">
                          👑 Khóa Premium
                        </span>
                      );
                    }
                    if (qTypeAttempts.length === 0) {
                      return (
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border/40 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          Sẵn sàng
                        </span>
                      );
                    }
                    if (
                      adaptiveStatus
                      && adaptiveStatus.holdoutQuestionCount > 0
                      && adaptiveStatus.correctHoldoutCount === adaptiveStatus.holdoutQuestionCount
                    ) {
                      return (
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 inline-flex items-center gap-1">
                          🛡️ Đã vượt kiểm tra làm chủ
                        </span>
                      );
                    }
                    if (adaptiveStatus?.holdoutUnlocked && adaptiveStatus.holdoutQuestionCount > 0) {
                      return (
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1">
                          🛡️ Sẵn sàng kiểm tra
                        </span>
                      );
                    }
                    if (progressPercent === 100) {
                      return (
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          ✓ Đã hoàn thành
                        </span>
                      );
                    }
                    return (
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                        Đang luyện ({solvedCount}/{totalQuestions})
                      </span>
                    );
                  })();

                  const handleTypeClick = () => {
                    if (isLockedByPremium) {
                      setPremiumModalOpen(true);
                      return;
                    }
                    requireAuth(() => {
                      if (qType.id === 'eng-qt6') {
                        setGrammarSection('dang1');
                      } else {
                        navigate(ROUTES.PRACTICE_DETAIL(qType.id));
                      }
                    });
                  };

                  return (
                    <div
                      key={qType.id}
                      onClick={handleTypeClick}
                      className={cn(
                        "p-5 rounded-2xl border border-border/40 transition-all duration-300 flex flex-col justify-between h-full bg-card hover:shadow-md hover:-translate-y-0.5 cursor-pointer select-none relative overflow-hidden group font-sans",
                        routeSubject === 'math' ? 'hover:border-indigo-500/50' :
                          routeSubject === 'chemistry' ? 'hover:border-emerald-500/50' :
                            routeSubject === 'physics' ? 'hover:border-cyan-500/50' :
                              'hover:border-purple-500/50'
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 bg-secondary/80 px-2.5 py-1 rounded-full text-[9px] font-extrabold text-muted-foreground border border-border/30">
                            <span>Luyện tập</span>
                          </div>
                          {statusBadge}
                        </div>

                        {/* Hover text color đồng bộ môn học */}
                        <h3 className={cn(
                          "font-extrabold text-base text-foreground transition-colors",
                          routeSubject === 'math' ? 'group-hover:text-indigo-600' :
                            routeSubject === 'chemistry' ? 'group-hover:text-emerald-600' :
                              routeSubject === 'physics' ? 'group-hover:text-cyan-600' :
                                'group-hover:text-purple-600'
                        )}>
                          <LatexRenderer text={qType.name} />
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          <LatexRenderer text={qType.description} />
                        </p>
                      </div>

                      <div className="space-y-3 pt-4">
                        {/* Progress Bar & Stars */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-extrabold">
                            <span className="text-muted-foreground">Tiến độ: {solvedCount}/{totalQuestions} ({progressPercent}%)</span>
                            <div className="flex gap-0.5 text-amber-400">
                              {[1, 2, 3].map((star) => (
                                <span key={star} className={star <= starsCount ? 'opacity-100' : 'opacity-25'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                routeSubject === 'math' ? 'bg-indigo-500' :
                                  routeSubject === 'chemistry' ? 'bg-emerald-500' :
                                    routeSubject === 'physics' ? 'bg-cyan-500' :
                                      'bg-purple-500'
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Text link đồng bộ màu môn học */}
                        <div className={cn("flex items-center justify-between border-t border-border/20 pt-3 text-xs font-black", theme.text)}>
                          <span>
                            {qType.id === 'eng-qt6'
                              ? 'Khám phá 6 chuyên đề →'
                              : isLockedByPremium
                                ? 'Mở khóa Premium 👑'
                                : 'Luyện tập ngay →'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {isEnglish && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
          <Card
            className="cursor-pointer transition-all duration-200 hover:translate-y-[-2px] border bg-card flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-indigo-500/30"
            onClick={() => {
              requireAuth(() => {
                setSelectedTensesForCombo(isG9
                  ? ['module1', 'module2', 'module3', 'module4', 'module5']
                  : topics.map(topic => topic.id));
                setIsConfiguringAll(true);
              });
            }}
          >
            <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full text-[9px] font-bold w-fit">
                    <span className="text-[10px]">🗣️</span> Anh
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {isG9 ? '📝 Tổng ôn thông minh' : `📝 Tổng ôn Unit 1–${topics.length}`}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isG9
                    ? 'Tự chọn tổ hợp các dạng thì mong muốn và tạo ngẫu nhiên lượt luyện tập tối đa 40 câu hỏi.'
                    : 'Chọn một hoặc nhiều Unit, sau đó luyện ngẫu nhiên ngữ pháp, từ vựng và phát âm trong tối đa 40 câu.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-auto">
                <div className="flex items-center gap-2 flex-1 max-w-[65%]">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${globalProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">{globalProgressPercent}%</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-[11px] py-1 px-3.5 border border-border/50 hover:bg-accent hover:text-accent-foreground cursor-pointer h-8 rounded-xl shrink-0"
                >
                  Luyện tập →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-200 hover:translate-y-[-2px] border bg-card flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-indigo-500/30"
            onClick={() => {
              requireAuth(() => {
                setExamTenses(isG9
                  ? ['module1', 'module2', 'module3', 'module4', 'module5']
                  : topics.map(topic => topic.id));
                setIsConfiguringExam(true);
              });
            }}
          >
            <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full text-[9px] font-bold w-fit">
                    <span className="text-[10px]">🗣️</span> Anh
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {isG9 ? '🏆 Luyện thi trắc nghiệm' : `🏆 Kiểm tra tổng hợp Unit 1–${topics.length}`}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isG9
                    ? 'Luyện thi tính giờ với số lượng câu và thì tự chọn. Không hiện giải thích ngay khi làm, chỉ hiện toàn bộ khi nộp bài hoặc hết giờ.'
                    : 'Tạo bài kiểm tra tính giờ từ các Unit đã chọn. Lời giải chỉ xuất hiện sau khi nộp bài hoặc hết giờ.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-auto">
                <div className="flex items-center gap-2 flex-1 max-w-[65%]">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${globalProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">{globalProgressPercent}%</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-[11px] py-1 px-3.5 border border-border/50 hover:bg-accent hover:text-accent-foreground cursor-pointer h-8 rounded-xl shrink-0"
                >
                  Luyện tập →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🌟 Premium Unlock Modal */}
      <ConfirmationModal
        isOpen={premiumModalOpen}
        title="Mở khóa đặc quyền Premium 🌟"
        description="Chặng 3 (Mục tiêu điểm 9-10) là đặc quyền dành riêng cho tài khoản Premium. Bạn có muốn nâng cấp lên Premium ngay để mở khóa toàn bộ nội dung không?"
        confirmLabel="Nâng cấp Premium"
        cancelLabel="Để sau"
        variant="warning"
        icon={
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Crown size={26} />
          </div>
        }
        onConfirm={() => {
          setPremiumModalOpen(false);
          navigate('/premium');
        }}
        onCancel={() => setPremiumModalOpen(false)}
      />

      {/* 🔒 Login Requirement Modal */}
      <ConfirmationModal
        isOpen={showLoginConfirm}
        title="Yêu cầu đăng nhập học tập"
        description="Bạn cần đăng nhập học tập để bắt đầu luyện tập dạng bài này và lưu lịch sử tiến trình học tập."
        confirmLabel="Đăng nhập với Google"
        cancelLabel="Hủy bỏ"
        onConfirm={async () => {
          setShowLoginConfirm(false);
          try {
            await authService.signInWithGoogle();
          } catch (err: any) {
            if (err?.message) {
              alert(err.message);
            }
          }
        }}
        onCancel={() => setShowLoginConfirm(false)}
      />
    </div>
  );
};
