import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import { storageService } from '../../services/storage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getTopics, getQuestionTypes } from '../../data';
import { useRoadmapBundle } from '../../services/roadmapService';
import {
  Bookmark,
  Award,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  BookOpen,
  Loader,
  Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getSubjectTheme, getStarsFromScore } from '../../utils/theme';
import { getSubjectName, getSubjectIcon, getSubjectFromQuestionTypeId } from '../../utils/subject';
import { LatexRenderer } from '../../components/common/LatexRenderer';
import { authService } from '../../services/authService';
import { LeaderboardWidget } from '../../components/dashboard/LeaderboardWidget';
import { calculateStudentStats } from '../../utils/stats';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSubject, selectedGrade, user, userData, progressVersion, isPremium, trialActivated, premiumUntil } = useAppStore();
  const subjectTheme = getSubjectTheme(selectedSubject);
  void progressVersion;

  const [remainingDays, setRemainingDays] = useState(0);

  React.useEffect(() => {
    if (premiumUntil) {
      const diffTime = new Date(premiumUntil).getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRemainingDays(diffDays > 0 ? diffDays : 0);
    }
  }, [premiumUntil]);

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await authService.signInWithGoogle();
      useAppStore.getState().refreshProgress();
    } catch (err: any) {
      alert(err.message || 'Lỗi đăng nhập bằng Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const currentUserId = user?.uid || 'guest';
  const progress = storageService.getProgress(currentUserId);
  const readLessons = storageService.getReadLessons(currentUserId);
  const readLessonsSet = new Set(readLessons);
  const completedLessonsSet = new Set(progress.completedLessons);

  // 1. Lấy danh sách chuyên đề & dạng bài từ Cloud R2 (fallback runtime data)
  const { bundle: roadmapBundle } = useRoadmapBundle(selectedGrade, selectedSubject);
  const topics = useMemo(() => {
    if (roadmapBundle?.topics?.length) return roadmapBundle.topics;
    return getTopics(selectedGrade, selectedSubject);
  }, [roadmapBundle, selectedGrade, selectedSubject]);

  const questionTypes = useMemo(() => {
    if (roadmapBundle?.questionTypes?.length) return roadmapBundle.questionTypes;
    return getQuestionTypes(selectedGrade, selectedSubject);
  }, [roadmapBundle, selectedGrade, selectedSubject]);

  const sequentialTypes: any[] = [];
  [1, 2, 3].forEach(tierId => {
    const tierTopics = topics.filter(t => t.tier === tierId);
    tierTopics.forEach(topic => {
      const filteredTypes = questionTypes.filter(type => type.topicId === topic.id);
      sequentialTypes.push(...filteredTypes);
    });
  });

  const totalTypesCount = sequentialTypes.length;

  // 2. Tính toán thống kê theo môn học hiện tại
  // Tiến độ Lộ trình học (Lý thuyết)
  const readTypesCount = sequentialTypes.filter(type => readLessonsSet.has(type.id)).length;
  const roadmapPercent = totalTypesCount > 0 ? Math.round((readTypesCount / totalTypesCount) * 100) : 0;

  // Tiến độ Luyện tập (Bài tập)
  const masteredTypesCount = sequentialTypes.filter(type => completedLessonsSet.has(type.id)).length;
  const practicePercent = totalTypesCount > 0 ? Math.round((masteredTypesCount / totalTypesCount) * 100) : 0;

  // Sổ lỗi sai môn hiện tại
  const mistakes = storageService.getMistakes(currentUserId)
    .filter(m => m.reviewStatus !== 'fixed' && getSubjectFromQuestionTypeId(m.questionTypeId) === selectedSubject);

  // Thi thử môn hiện tại
  const exams = storageService.getExamResults(currentUserId);
  const subjectExams = exams.filter(e => {
    if (selectedSubject === 'math') return e.examId.startsWith('math');
    if (selectedSubject === 'english') return e.examId.startsWith('eng');
    if (selectedSubject === 'chemistry') return e.examId.startsWith('chem');
    if (selectedSubject === 'biology') return e.examId.startsWith('bio');
    if (selectedSubject === 'physics') return e.examId.startsWith('phy');
    if (selectedSubject === 'history') return e.examId.startsWith('his');
    return true;
  });
  const examScore = subjectExams.length > 0 ? `${subjectExams[subjectExams.length - 1].score}/10` : 'Chưa thi';

  // 3. Xử lý "Học tiếp dạng bài dở dang" (Lộ trình lý thuyết)
  const lastActiveTheoryId = localStorage.getItem('otv10_last_active_theory');
  let activeTheoryType: any = null;
  let activeTheoryStatus: 'inprogress' | 'next' | 'completed';

  if (lastActiveTheoryId && sequentialTypes.some(t => t.id === lastActiveTheoryId) && !readLessonsSet.has(lastActiveTheoryId)) {
    activeTheoryType = sequentialTypes.find(t => t.id === lastActiveTheoryId);
    activeTheoryStatus = 'inprogress';
  } else {
    const nextUnread = sequentialTypes.find(t => !readLessonsSet.has(t.id));
    if (nextUnread) {
      activeTheoryType = nextUnread;
      activeTheoryStatus = 'next';
    } else {
      activeTheoryStatus = 'completed';
    }
  }

  // 4. Xử lý "Luyện tiếp dạng bài dở dang" (Luyện tập)
  const attempts = storageService.getAttempts(currentUserId);
  const subjectAttempts = attempts.filter(a => getSubjectFromQuestionTypeId(a.questionTypeId) === selectedSubject);
  let lastActivePracticeId: string | null = null;
  if (subjectAttempts.length > 0) {
    lastActivePracticeId = subjectAttempts[subjectAttempts.length - 1].questionTypeId;
  }

  let activePracticeType: any = null;
  let activePracticeStatus: 'inprogress' | 'next' | 'completed';
  let activePracticeScore = 0;
  let activePracticeLevel = 0;

  if (lastActivePracticeId && sequentialTypes.some(t => t.id === lastActivePracticeId) && !completedLessonsSet.has(lastActivePracticeId)) {
    activePracticeType = sequentialTypes.find(t => t.id === lastActivePracticeId);
    activePracticeStatus = 'inprogress';
    activePracticeScore = progress.masteryLevels[lastActivePracticeId] || 0;
    activePracticeLevel = getStarsFromScore(activePracticeScore);
  } else {
    const nextUnmastered = sequentialTypes.find(t => !completedLessonsSet.has(t.id));
    if (nextUnmastered) {
      activePracticeType = nextUnmastered;
      activePracticeStatus = 'next';
      activePracticeScore = progress.masteryLevels[nextUnmastered.id] || 0;
      activePracticeLevel = getStarsFromScore(activePracticeScore);
    } else {
      activePracticeStatus = 'completed';
    }
  }

  // 5. Tính toán Tần suất học tập 7 ngày qua
  const weeklyStats = useMemo(() => {
    const stats = calculateStudentStats(attempts);
    const dailyActivity = stats.dailyActivity || {};

    const grid = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const count = dailyActivity[dateStr] || 0;

      const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const label = `${weekdayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

      grid.push({
        dateStr,
        label,
        count,
        active: count > 0
      });
    }

    const activeDaysInLast7 = grid.filter(g => g.active).length;
    const totalLast7Attempts = grid.reduce((acc, g) => acc + g.count, 0);

    return {
      activeDaysInLast7,
      totalLast7Attempts,
      grid
    };
  }, [attempts]);

  // Lấy câu trích dẫn ngẫu nhiên truyền động lực học
  const quotes = [
    "Hành trình vạn dặm bắt đầu từ những bước chân đầu tiên. Hãy giải quyết gọn gàng từng dạng bài hôm nay!",
    "Thi đỗ vào lớp 10 không khó, chỉ cần bạn không lặp lại sai lầm cũ. Hãy ôn lại sổ lỗi sai thường xuyên nhé!",
    "Chăm chỉ cộng phương pháp đúng là chìa khóa của thành công. Roadmap đã sẵn sàng, đi thôi!",
    "Từng câu Toán rút gọn, từng cấu trúc bị động bạn luyện hôm nay chính là bậc thang dẫn tới cánh cổng trường cấp 3 mơ ước."
  ];

  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">

      {/* 🌟 Minimalist Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2 font-sans">
            <Sparkles className="text-amber-500 fill-amber-500 shrink-0" size={24} />
            Chào {user?.displayName || 'bạn'}, người chiến thắng!
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-bold italic max-w-2xl leading-relaxed">
            "{quote}"
          </p>
        </div>
      </div>

      {/* 🌟 Guest Mode Banner */}
      {!user && (
        <div className="bg-primary/7 border border-primary/20 border-l-4 border-l-primary rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-black text-foreground">Bạn đang học ở chế độ xem thử (Guest Mode)</h3>
            <p className="text-[11px] text-muted-foreground font-semibold">Đăng nhập tài khoản Google để nhận ngay 30 ngày dùng thử Premium miễn phí, học lý thuyết đầy đủ và lưu trữ toàn bộ tiến trình học.</p>
          </div>
          <button
            disabled={isAuthLoading}
            onClick={handleGoogleSignIn}
            className="px-6 py-2.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none min-w-[120px]"
          >
            {isAuthLoading ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <>Kích hoạt Premium Free</>
            )}
          </button>
        </div>
      )}

      {/* 🌟 Premium & Trial Status Banners */}
      {user && (
        <>
          {/* Chưa Premium & Chưa dùng thử */}
          {!isPremium && !trialActivated && !userData?.trialConsumed && (
            <div className="bg-brand-action/7 border border-brand-action/20 border-l-4 border-l-brand-action rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  🎁 Quà tặng bứt phá: Trải nghiệm Premium 30 ngày hoàn toàn miễn phí!
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Mở khóa ngay Gia sư AI không giới hạn và toàn bộ chặng 3 (Mục tiêu 9-10 điểm) để tăng tốc ôn luyện. Không cần thẻ thanh toán.
                </p>
              </div>
              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-2.5 font-bold text-xs bg-brand-action hover:bg-brand-action/90 text-white rounded-lg transition-all cursor-pointer shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5 min-w-[150px]"
              >
                Nhận dùng thử ngay
              </button>
            </div>
          )}

          {/* Đang dùng thử */}
          {isPremium && trialActivated && (
            <div className="bg-amber-500/7 border border-amber-600/20 border-l-4 border-l-amber-600 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  👑 Bạn đang trong thời gian trải nghiệm Premium miễn phí (Còn lại {remainingDays} ngày)
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Nâng cấp gói trọn đời vĩnh viễn ngay hôm nay chỉ với 99.000đ (tiết kiệm 50%) để duy trì quyền học tập bứt phá và giữ lại toàn bộ tiến độ.
                </p>
              </div>
              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-2.5 font-bold text-xs bg-brand-action hover:bg-brand-action/90 text-white rounded-lg transition-all cursor-pointer shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5 min-w-[150px]"
              >
                Nâng cấp trọn đời 99k
              </button>
            </div>
          )}

          {/* Hết hạn dùng thử */}
          {!isPremium && trialActivated && (
            <div className="bg-rose-500/7 border border-rose-500/20 border-l-4 border-l-rose-600 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  ⚠️ Thời gian dùng thử Premium 30 ngày của bạn đã kết thúc
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Các tính năng nâng cao (Gia sư AI không giới hạn, Chặng 3 ôn tập nâng cao) đã bị tạm khóa. Nâng cấp trọn đời ngay để tiếp tục bứt phá điểm số!
                </p>
              </div>
              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-2.5 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5 min-w-[150px]"
              >
                Gia hạn Premium trọn đời
              </button>
            </div>
          )}
        </>
      )}

      {/* ⚡ Tần suất học tập 7 ngày qua (7-Day Learning Activity Grid) */}
      <Card className="paper-panel rounded-xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/20 pb-3 flex-wrap gap-2">
          <h3 className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-2 font-sans">
            <Activity size={18} className="text-emerald-500 animate-pulse shrink-0" />
            Tần suất học tập 7 ngày qua ({weeklyStats.activeDaysInLast7}/7 ngày hoạt động)
          </h3>
          <span className="text-xs font-extrabold text-muted-foreground bg-secondary/40 px-3 py-1 rounded-full border border-border/30">
            Tổng cộng <strong className="text-emerald-500 font-black">{weeklyStats.totalLast7Attempts}</strong> câu đã làm
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyStats.grid.map((day, dIdx) => (
            <div
              key={dIdx}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-secondary/15 border border-border/30 hover:border-emerald-500/30 transition-all"
            >
              <span className="text-[10px] font-extrabold text-muted-foreground">{day.label.split(' ')[0]}</span>
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow-xs",
                  day.active
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-muted-foreground/40 border border-dashed border-border/40"
                )}
                title={day.active ? `Đã làm ${day.count} câu vào ngày ${day.dateStr}` : 'Không có hoạt động'}
              >
                {day.count > 0 ? day.count : '-'}
              </div>
              <span className="text-[8px] font-extrabold text-muted-foreground/60">{day.label.split(' ')[1]?.replace(/[()]/g, '')}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 📐 Main Workspace Grid: 2 Columns (Left 2/3 - Core Study Actions, Right 1/3 - Stats & Weaknesses) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 👈 Left Column (2/3 width) - Focus actions & Roadmap */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card 1: LỘ TRÌNH HỌC (LÝ THUYẾT) */}
          <Card className="bg-card border-border/40 shadow-md rounded-3xl overflow-hidden relative group">
            <CardHeader className="bg-secondary/25 border-b border-border/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className={getSubjectTheme(selectedSubject).iconColor} />
                  <CardTitle className="text-foreground text-sm font-black uppercase tracking-wider font-sans">Lộ trình học (Lý thuyết)</CardTitle>
                </div>
                <span className={cn(
                  'text-[9px] font-black px-2.5 py-0.5 rounded-lg border',
                  getSubjectTheme(selectedSubject).badge
                )}>
                  {`${getSubjectIcon(selectedSubject)} ${getSubjectName(selectedSubject)}`}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5 flex flex-col">
              {activeTheoryStatus === 'completed' ? (
                <div className="space-y-3 py-4 text-center flex flex-col items-center">
                  <CheckCircle className="text-emerald-500" size={40} />
                  <h3 className="text-base font-black text-foreground">Đã học xong lý thuyết!</h3>
                  <p className="text-xs text-muted-foreground font-semibold max-w-sm leading-relaxed">
                    Tuyệt vời! Bạn đã hoàn thành đọc toàn bộ lý thuyết lộ trình môn học này. Hãy chuyển sang phần luyện tập để thực chiến.
                  </p>
                  <Button
                    onClick={() => navigate('/roadmap')}
                    variant="outline"
                    className="mt-2 font-black py-2.5 px-6 text-xs border border-border text-foreground hover:text-primary rounded-xl cursor-pointer"
                  >
                    Xem lại lộ trình học <ArrowRight size={12} className="ml-1" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border inline-block leading-none",
                      activeTheoryStatus === 'inprogress'
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-secondary text-muted-foreground border-border/40"
                    )}>
                      {activeTheoryStatus === 'inprogress' ? "⚡ Học tiếp dạng bài dở dang" : "🎯 Dạng bài tiếp theo cần học"}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-foreground leading-snug font-sans pt-1">
                      <LatexRenderer text={activeTheoryType.name} />
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-2xl">
                      {activeTheoryType.description || 'Đọc lý thuyết và cách giải dạng bài này để chuẩn bị làm bài tập.'}
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate(`/question-types/${activeTheoryType.id}`)}
                    className={cn(
                      "w-fit px-8 font-black py-3 text-xs text-white rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start",
                      subjectTheme.solid
                    )}
                  >
                    {activeTheoryStatus === 'inprogress' ? "Tiếp tục học ngay" : "Bắt đầu học ngay"} <ArrowRight size={13} />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 2: LUYỆN TẬP (BÀI TẬP) */}
          <Card className="bg-card border-border/40 shadow-md rounded-3xl overflow-hidden relative group">
            <CardHeader className="bg-secondary/25 border-b border-border/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
                  <CardTitle className="text-foreground text-sm font-black uppercase tracking-wider font-sans">Luyện tập (Bài tập)</CardTitle>
                </div>
                <span className={cn(
                  'text-[9px] font-black px-2.5 py-0.5 rounded-lg border',
                  getSubjectTheme(selectedSubject).badge
                )}>
                  {`${getSubjectIcon(selectedSubject)} ${getSubjectName(selectedSubject)}`}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5 flex flex-col">
              {activePracticeStatus === 'completed' ? (
                <div className="space-y-3 py-4 text-center flex flex-col items-center">
                  <Award className="text-amber-500" size={40} />
                  <h3 className="text-base font-black text-foreground">Đã hoàn thành luyện tập!</h3>
                  <p className="text-xs text-muted-foreground font-semibold max-w-sm leading-relaxed">
                    Chúc mừng! Bạn đã đạt mức thành thạo tối thiểu 2 sao cho toàn bộ các dạng bài tập môn học này.
                  </p>
                  <Button
                    onClick={() => navigate('/practice')}
                    variant="outline"
                    className="mt-2 font-black py-2.5 px-6 text-xs border border-border text-foreground hover:text-primary rounded-xl cursor-pointer"
                  >
                    Xem lại các dạng bài luyện tập <ArrowRight size={12} className="ml-1" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border inline-block leading-none",
                      activePracticeStatus === 'inprogress'
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-secondary text-muted-foreground border-border/40"
                    )}>
                      {activePracticeStatus === 'inprogress' ? "⚡ Luyện tiếp dạng bài dở dang" : "🎯 Dạng bài tiếp theo cần luyện"}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-foreground leading-snug font-sans pt-1">
                      <LatexRenderer text={activePracticeType.name} />
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-2xl">
                      {activePracticeType.description || 'Luyện tập dạng bài này ngay để tăng mức độ thành thạo và tích lũy sao.'}
                    </p>
                  </div>

                  <div className="space-y-2 bg-secondary/20 p-4.5 rounded-2xl border border-border/10">
                    <div className="flex items-center justify-between text-xs font-black text-foreground">
                      <span className="flex items-center gap-1">
                        🎯 Mức thành thạo: <span className="text-primary">{activePracticeScore}/100</span>
                      </span>
                      <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                        Đánh giá: {activePracticeLevel}/3 ⭐
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          subjectTheme.dot
                        )}
                        style={{ width: `${activePracticeScore}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/practice/${activePracticeType.id}`)}
                    className={cn(
                      "w-fit px-8 font-black py-3 text-xs text-white rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start",
                      subjectTheme.solid
                    )}
                  >
                    {activePracticeStatus === 'inprogress' ? "Tiếp tục luyện tập" : "Bắt đầu luyện tập"} <ArrowRight size={13} />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

        </div>

        {/* 👉 Right Column (1/3 width) - Stats Widget & Weakness list */}
        <div className="space-y-6">

          {/* Widget Thống kê tổng quan (Mastery Stats Widget) */}
          <Card className="border border-border/40 rounded-3xl shadow-md overflow-hidden">
            <CardHeader className="bg-secondary/15 p-5 border-b border-border/20">
              <CardTitle className="text-foreground font-black text-sm uppercase tracking-wider font-sans">Thống kê tổng quan</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">

              {/* Sổ lỗi sai */}
              <div
                onClick={() => navigate('/mistakes')}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/8 dark:bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/10 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Bookmark size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-muted-foreground font-black tracking-wider block uppercase mb-0.5">Sổ lỗi sai</span>
                  <span className="text-sm font-black text-foreground">
                    {mistakes.length} câu <span className="text-[10px] text-slate-400 font-bold">chờ ôn tập</span>
                  </span>
                </div>
              </div>

              {/* Điểm thi thử */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/10 shrink-0 shadow-sm">
                  <Award size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-muted-foreground font-black tracking-wider block uppercase mb-0.5">Đề thi mới nhất</span>
                  <span className="text-sm font-black text-foreground">
                    {examScore}
                  </span>
                </div>
              </div>

              {/* Tiến độ Lộ trình học (Lý thuyết) */}
              <div className="p-4 rounded-2xl bg-secondary/25 border border-border/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-foreground">
                  <span className="flex items-center gap-1">📖 Tiến độ Lộ trình học (Lý thuyết)</span>
                  <span>{roadmapPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      subjectTheme.dot
                    )}
                    style={{ width: `${roadmapPercent}%` }}
                  />
                </div>
              </div>

              {/* Tiến độ Luyện tập (Bài tập) */}
              <div className="p-4 rounded-2xl bg-secondary/25 border border-border/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-foreground">
                  <span className="flex items-center gap-1">🎯 Tiến độ Luyện tập (Bài tập)</span>
                  <span>{practicePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      subjectTheme.dot
                    )}
                    style={{ width: `${practicePercent}%` }}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🏆 Bảng Xếp Hạng Top 20 Học Sinh Tuần Này */}
      <div className="pt-2">
        <LeaderboardWidget />
      </div>
    </div>
  );
};
export default Dashboard;
