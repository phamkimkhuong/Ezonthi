import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import { progressService } from '../../services/progressService';
import { teacherService } from '../../services/teacherService';
import { teacherAccessService } from '../../services/teacherAccessService';
import { functions } from '../../services/firebase';
import { httpsCallable } from 'firebase/functions';
import {
  allQuestionTypesList,
  allQuestionTypesMap,
  getSubjectInfoByTypeId,
  SubjectCategoryInfo
} from '../../data/allDataRegistry';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { SimulatedStudent, UserProgress, ExamResult, SupportTicket } from '../../types';
import {
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  Award,
  Activity,
  Loader,
  LifeBuoy,
  Wallet,
  Mail
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getStarsFromScore } from '../../utils/theme';
import { TeacherAiStatistics } from './TeacherAiStatistics';
import { TeacherAffiliateManager } from './TeacherAffiliateManager';
import { EmailBroadcastManager } from './components/EmailBroadcastManager';
import { supportService } from '../../services/supportService';
import { StudentSidebar } from './components/StudentSidebar';
import { StudentSummary } from './components/StudentSummary';
import { StudentMasteryTab } from './components/StudentMasteryTab';
import { StudentAdvancedTab } from './components/StudentAdvancedTab';
import { StudentExamsTab } from './components/StudentExamsTab';
import type { StudentAdvancedSubjectData } from '../../services/teacherService';
import { MessageSquareHeart, Bell, MessageCircleCode } from 'lucide-react';
import { TeacherSurveyReport } from './components/TeacherSurveyReport';
import { TeacherNotificationManager } from './components/TeacherNotificationManager';
import { TeacherAdminChatInbox } from './components/TeacherAdminChatInbox';
import { MONETIZATION_ENABLED } from '../../utils/premium';
import { toLocalDateKey } from '../../utils/stats';

type TeacherTabKey = 'students' | 'premium' | 'ai_statistics' | 'support' | 'affiliate_admin' | 'email_broadcast' | 'survey_report' | 'system_notification' | 'admin_chat_inbox';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab') as TeacherTabKey | null;
  const disabledTabs: TeacherTabKey[] = MONETIZATION_ENABLED ? [] : ['premium', 'affiliate_admin'];
  const validTabs: TeacherTabKey[] = ['students', 'premium', 'ai_statistics', 'support', 'affiliate_admin', 'email_broadcast', 'survey_report', 'system_notification', 'admin_chat_inbox'];
  const activeTab: TeacherTabKey =
    rawTab && validTabs.includes(rawTab) && !disabledTabs.includes(rawTab) ? rawTab : 'students';

  const changeTab = useCallback((newTab: TeacherTabKey) => {
    setSearchParams({ tab: newTab }, { replace: true });
  }, [setSearchParams]);
  const [students, setStudents] = useState<SimulatedStudent[]>([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [lastActiveAtCursor, setLastActiveAtCursor] = useState<string | undefined>(undefined);
  const [hasMoreStudents, setHasMoreStudents] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [premiumEmail, setPremiumEmail] = useState('');
  const [grantPackageType, setGrantPackageType] = useState<'trial_1m' | 'plan_3m' | 'plan_12m' | 'permanent'>('plan_12m');
  const [premiumSubmitting, setPremiumSubmitting] = useState(false);
  const [premiumSuccessMsg, setPremiumSuccessMsg] = useState<string | null>(null);
  const [premiumErrorMsg, setPremiumErrorMsg] = useState<string | null>(null);

  // Support states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<'all' | 'bug' | 'feature' | 'question' | 'other'>('all');

  const loadTickets = async () => {
    setIsTicketsLoading(true);
    try {
      const data = await supportService.getAllTickets();
      setTickets(data);
    } catch (e) {
      console.error("Lỗi khi load support tickets ở Dashboard:", e);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'support') {
      loadTickets();
    }
  }, [activeTab]);

  const handleUpdateTicket = async (newStatus: 'resolved' | 'rejected') => {
    if (!selectedTicket) return;
    setTicketSubmitting(true);
    try {
      await supportService.updateTicketResponse(
        selectedTicket.userId,
        selectedTicket.id,
        responseText,
        newStatus
      );
      alert('Đã cập nhật phản hồi hỗ trợ thành công!');
      setResponseText('');
      setSelectedTicket(null);
      loadTickets();
    } catch (err: any) {
      console.error('Lỗi khi cập nhật phản hồi ticket:', err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật phản hồi.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(tk => {
      const matchStatus = ticketStatusFilter === 'all' || tk.status === ticketStatusFilter;
      const matchCategory = ticketCategoryFilter === 'all' || tk.category === ticketCategoryFilter;
      return matchStatus && matchCategory;
    });
  }, [tickets, ticketStatusFilter, ticketCategoryFilter]);

  const [isLoading, setIsLoading] = useState(false);
  const [accessStatus, setAccessStatus] = useState<'checking' | 'allowed' | 'role-missing' | 'denied'>('checking');

  // Trạng thái chọn học sinh xem tiến độ
  const [selectedStudent, setSelectedStudent] = useState<SimulatedStudent | null>(null);
  const [studentProgress, setStudentProgress] = useState<UserProgress | null>(null);
  const [studentExams, setStudentExams] = useState<ExamResult[]>([]);
  const [studentAdvancedData, setStudentAdvancedData] = useState<StudentAdvancedSubjectData[]>([]);
  const [isAdvancedLoading, setIsAdvancedLoading] = useState(false);
  const [selectedStudentTab, setSelectedStudentTab] = useState<'mastery' | 'advanced' | 'exams'>('mastery');
  const [selectedExamForDetail, setSelectedExamForDetail] = useState<ExamResult | null>(null);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('');



  const selectedStudentStats = useMemo(() => {
    const stats = selectedStudent?.stats;
    const totalStudySeconds = stats?.totalStudySeconds || 0;
    const totalStudyMinutes = Math.round((totalStudySeconds / 60) * 10) / 10;
    const totalAttempts = stats?.totalAttempts || 0;
    const correctAttempts = stats?.correctAttempts || 0;
    const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    const dailyActivity = stats?.dailyActivity || {};

    // Tính 7 ngày qua
    const grid = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateKey(d);
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

    return {
      totalStudyMinutes,
      activeDaysInLast7,
      totalAttempts,
      accuracyRate,
      activityGrid: grid
    };
  }, [selectedStudent]);

  const groupedMasteryData = useMemo(() => {
    if (!studentProgress) return [];

    interface MasteryGroup {
      info: SubjectCategoryInfo;
      items: Array<{ typeId: string; name: string; score: number; stars: number }>;
      masteredCount: number;
    }

    const groupsMap = new Map<string, MasteryGroup>();

    // 1. Duyệt tất cả các dạng bài đã được khai báo trong hệ thống
    allQuestionTypesList.forEach(type => {
      const info = getSubjectInfoByTypeId(type.id);
      const score = studentProgress.masteryLevels[type.id] ?? 0;
      const stars = getStarsFromScore(score);

      if (!groupsMap.has(info.key)) {
        groupsMap.set(info.key, { info, items: [], masteredCount: 0 });
      }

      const group = groupsMap.get(info.key)!;
      group.items.push({
        typeId: type.id,
        name: type.name,
        score,
        stars
      });
      if (score >= 60) {
        group.masteredCount++;
      }
    });

    // 2. Duyệt bất kỳ typeId nào có trong masteryLevels mà chưa có trong registry
    Object.entries(studentProgress.masteryLevels).forEach(([typeId, score]) => {
      if (!allQuestionTypesMap.has(typeId)) {
        const info = getSubjectInfoByTypeId(typeId);
        if (!groupsMap.has(info.key)) {
          groupsMap.set(info.key, { info, items: [], masteredCount: 0 });
        }
        const group = groupsMap.get(info.key)!;
        if (!group.items.some(i => i.typeId === typeId)) {
          group.items.push({
            typeId,
            name: `Dạng bài ${typeId}`,
            score,
            stars: getStarsFromScore(score)
          });
          if (score >= 60) {
            group.masteredCount++;
          }
        }
      }
    });

    // Sắp xếp môn có điểm/làm bài lên trước, sau đó xếp theo thứ tự order
    return Array.from(groupsMap.values()).sort((a: MasteryGroup, b: MasteryGroup) => {
      const aHasActivity = a.items.some(i => i.score > 0);
      const bHasActivity = b.items.some(i => i.score > 0);
      if (aHasActivity && !bHasActivity) return -1;
      if (!aHasActivity && bHasActivity) return 1;
      return a.info.order - b.info.order;
    });
  }, [studentProgress]);

  const loadData = useCallback(async (teacherUserId = user?.uid) => {
    setIsLoading(true);
    setSelectedStudent(null);
    setStudentProgress(null);

    try {
      const [res, totalCount] = await Promise.all([
        teacherService.getRealStudents(teacherUserId ? [teacherUserId] : [], 10),
        teacherService.getTotalStudentsCount()
      ]);

      setStudents(res.students);
      setLastActiveAtCursor(res.lastActiveAt);
      setHasMoreStudents(res.hasMore);
      setTotalStudentsCount(totalCount);
    } catch (e) {
      console.error(
        `Lỗi khi load dữ liệu giáo viên từ Firestore. UID hiện tại: "${user?.uid}". ` +
        `Nếu bị permission-denied, hãy kiểm tra UID này có nằm trong firestore.rules/isBootstrapTeacher() không.`,
        e
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const loadMoreStudents = async () => {
    if (isLoadingMore || !hasMoreStudents || !lastActiveAtCursor) return;
    setIsLoadingMore(true);
    try {
      const teacherUserId = user?.uid;
      const res = await teacherService.getRealStudents(
        teacherUserId ? [teacherUserId] : [],
        20,
        lastActiveAtCursor
      );
      setStudents(prev => [...prev, ...res.students]);
      setLastActiveAtCursor(res.lastActiveAt);
      setHasMoreStudents(res.hasMore);
    } catch (e) {
      console.error('Lỗi khi tải thêm học sinh:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setAccessStatus('checking');

    if (!user) {
      setAccessStatus('denied');
      return () => {
        cancelled = true;
      };
    }

    teacherAccessService.isTeacher(user).then((allowed) => {
      if (cancelled) return;

      if (!allowed) {
        setAccessStatus(teacherAccessService.isBootstrapTeacher(user) ? 'role-missing' : 'denied');
        return;
      }

      setAccessStatus('allowed');
      if (activeTab === 'students') {
        loadData(user.uid);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, loadData, activeTab]);

  useEffect(() => {
    if (accessStatus === 'allowed' && user?.uid && activeTab === 'students' && students.length === 0) {
      loadData(user.uid);
    }
  }, [activeTab, accessStatus, user, students.length, loadData]);

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (accessStatus === 'checking') {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-6 p-8 rounded-2xl bg-card border border-border shadow-lg animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <Loader size={34} className="animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-foreground">Đang kiểm tra quyền giáo viên</h3>
          <p className="text-xs font-semibold text-muted-foreground">
            Hệ thống đang xác thực role giáo viên từ Firestore.
          </p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'role-missing') {
    return (
      <div className="max-w-lg mx-auto my-12 text-center space-y-6 p-8 rounded-2xl bg-card border border-amber-500/25 shadow-lg shadow-amber-500/5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <XCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-foreground">Chưa đọc được role giáo viên</h3>
          <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
            Email hiện tại đúng tài khoản giáo viên, nhưng app chưa đọc được document
            {' '}teachers/{user?.uid}. Hãy kiểm tra Firestore Rules đã Publish/Deploy và tải lại trang.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full font-bold py-2.5 text-xs bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
          >
            Tải lại quyền
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full font-bold py-2.5 text-xs border border-border bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer"
          >
            Về Bảng điều khiển
          </Button>
        </div>
      </div>
    );
  }

  if (accessStatus === 'denied') {
    return <Navigate to="/dashboard" replace />;
  }

  if (accessStatus !== 'allowed') {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-6 p-8 rounded-2xl bg-card border border-rose-500/20 shadow-lg shadow-rose-500/5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <XCircle size={40} className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-foreground">Không có quyền truy cập</h3>
          <p className="text-xs font-semibold text-muted-foreground">
            Tài khoản này chưa được cấp role giáo viên trên Firestore.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="w-full font-bold py-2.5 text-xs border border-border bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer"
        >
          Quay lại Bảng điều khiển Học sinh
        </Button>
      </div>
    );
  }

  // Khi chọn một học sinh để xem báo cáo tiến trình
  const handleSelectStudent = async (student: SimulatedStudent) => {
    setSelectedStudent(student);
    setSelectedStudentTab('mastery');
    setSelectedExamForDetail(null);
    setSelectedSubjectKey('');
    setIsLoading(true);
    setIsAdvancedLoading(true);
    try {
      const [exams, advData] = await Promise.all([
        progressService.getExamResults(student.id),
        teacherService.getStudentAdvancedProgress(student.id)
      ]);
      setStudentProgress({
        userId: student.id,
        masteryLevels: student.masteryLevels || {},
        completedLessons: student.completedLessons || [],
        lastUpdatedAt: student.lastActiveAt || new Date().toISOString()
      });
      setStudentExams(exams || []);
      setStudentAdvancedData(advData || []);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin chi tiết học sinh:", err);
    } finally {
      setIsLoading(false);
      setIsAdvancedLoading(false);
    }
  };



  const handleGrantPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumEmail.trim()) return;

    setPremiumSubmitting(true);
    setPremiumSuccessMsg(null);
    setPremiumErrorMsg(null);

    try {
      const grantPremium = httpsCallable<{ studentEmail: string; packageType?: string }, { success: boolean; message: string; studentName: string }>(
        functions,
        'grantPremiumByEmail'
      );
      const res = await grantPremium({ studentEmail: premiumEmail, packageType: grantPackageType });

      if (res.data.success) {
        setPremiumSuccessMsg(res.data.message);
        setPremiumEmail('');
        // Tải lại danh sách học sinh để hiển thị badge/status mới
        await loadData();
      }
    } catch (err: any) {
      console.error(err);
      setPremiumErrorMsg(err.message || 'Có lỗi xảy ra khi cấp quyền Premium.');
    } finally {
      setPremiumSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* Banner góc giáo viên */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              <Users className="text-amber-300" size={24} />
              Hệ thống Quản lý & Phân tích Tiến độ Học sinh
            </h2>
            <p className="text-xs md:text-sm text-emerald-100 font-medium max-w-2xl leading-relaxed">
              Theo dõi sát sao lộ trình tiến bộ, điểm số, thống kê AI và hỗ trợ học sinh trên toàn hệ thống.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <div className="shrink-0 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 text-xs font-extrabold shadow-sm text-white select-none">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Hệ thống: Trực tuyến</span>
            </div>


          </div>
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
      </div>
      {/* Tabs Menu */}
      <div className="flex border-b border-border/30 gap-2">
        <button
          onClick={() => changeTab('students')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'students'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap size={15} />
          Báo cáo Tiến độ Học sinh
        </button>
        <button
          onClick={() => changeTab('ai_statistics')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'ai_statistics'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity size={15} />
          Thống kê AI & Token
        </button>
        {MONETIZATION_ENABLED && (
          <button
            onClick={() => changeTab('premium')}
            className={cn(
              "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
              activeTab === 'premium'
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Award size={15} />
            Cấp Quyền Premium
          </button>
        )}
        <button
          onClick={() => changeTab('support')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'support'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <LifeBuoy size={15} />
          Yêu cầu Hỗ trợ
        </button>
        {MONETIZATION_ENABLED && (
          <button
            onClick={() => changeTab('affiliate_admin')}
            className={cn(
              "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
              activeTab === 'affiliate_admin'
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Wallet size={15} />
            Quản lý Affiliate
          </button>
        )}
        <button
          onClick={() => changeTab('email_broadcast')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'email_broadcast'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Mail size={15} />
          Thông báo Email
        </button>
        <button
          onClick={() => changeTab('survey_report')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'survey_report'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquareHeart size={15} />
          Báo cáo Khảo sát
        </button>
        <button
          onClick={() => changeTab('system_notification')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'system_notification'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Bell size={15} />
          Gửi Thông Báo 🔔
        </button>
        <button
          onClick={() => changeTab('admin_chat_inbox')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
            activeTab === 'admin_chat_inbox'
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageCircleCode size={15} />
          Chat Học Sinh 💬
        </button>
      </div>

      {/* Content Tabs */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 bg-card border border-border/40 rounded-2xl">
          <Loader size={36} className="animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Đang tải thông tin học tập của học sinh...</p>
        </div>
      ) : activeTab === 'students' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Cột trái: Danh sách học sinh */}
          <StudentSidebar
            students={students}
            totalCount={totalStudentsCount}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
            hasMore={hasMoreStudents}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreStudents}
          />

          {/* Cột phải: Báo cáo chi tiết của học sinh được chọn */}
          <div className="md:col-span-2">
            {selectedStudent && studentProgress ? (
              <div className="space-y-6">

                {/* Profile Card */}
                <Card className="border-border/50 bg-card">
                  <CardHeader className="p-5 border-b border-border/20 flex flex-row items-center gap-4 space-y-0">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-12 h-12 rounded-full border border-primary bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-foreground text-sm font-black">{selectedStudent.name}</CardTitle>
                        {MONETIZATION_ENABLED && selectedStudent.isPremium && (() => {
                          const planName = selectedStudent.premiumPlan || (selectedStudent.trialActivated ? 'Gói Dùng Thử (Trial)' : 'Gói Premium VIP');
                          let expiryStr = 'Vĩnh viễn (VIP Trọn Đời)';
                          let isExpired = false;
                          if (selectedStudent.premiumUntil) {
                            const expiry = new Date(selectedStudent.premiumUntil);
                            const diffDays = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const dateStr = expiry.toLocaleDateString('vi-VN');
                            if (diffDays > 0) {
                              expiryStr = `Còn ${diffDays} ngày (Hết hạn ${dateStr})`;
                            } else {
                              expiryStr = `Đã hết hạn ngày ${dateStr}`;
                              isExpired = true;
                            }
                          }
                          return (
                            <span className={cn(
                              "text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-xs",
                              isExpired
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400"
                                : "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            )}>
                              <Award size={12} className="shrink-0 text-amber-500" />
                              <span>{planName}</span>
                              <span className="opacity-40">•</span>
                              <span className="font-semibold">{expiryStr}</span>
                            </span>
                          );
                        })()}
                      </div>
                      <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{selectedStudent.email}</span>
                        <span className="opacity-40">•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Mở web lần cuối: {(() => {
                            if (!selectedStudent.lastActiveAt) return 'Chưa ghi nhận';
                            const date = new Date(selectedStudent.lastActiveAt);
                            if (isNaN(date.getTime())) return 'Chưa ghi nhận';
                            const diffMs = Date.now() - date.getTime();
                            const diffMins = Math.floor(diffMs / (1000 * 60));
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            if (diffMins < 1) return 'Vừa mới truy cập';
                            if (diffMins < 60) return `${diffMins} phút trước`;
                            if (diffHours < 24) return `${diffHours} giờ trước`;
                            if (diffDays < 30) return `${diffDays} ngày trước`;
                            return date.toLocaleDateString('vi-VN');
                          })()}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-6">
                    {/* Thống kê nhanh & 7 ngày */}
                    <StudentSummary
                      completedLessonsCount={studentProgress.completedLessons.length}
                      totalQuestionTypesCount={allQuestionTypesList.length}
                      stats={selectedStudentStats}
                    />

                    {/* Danh sách tiến độ chi tiết từng môn hoặc Lịch sử thi */}
                    <div className="space-y-4">
                      <div className="flex border-b border-border/20 pb-2 gap-4 items-center flex-wrap">
                        <button
                          onClick={() => setSelectedStudentTab('mastery')}
                          className={cn(
                            "text-xs font-black pb-2 px-1 relative -mb-2 border-b-2 transition-all cursor-pointer",
                            selectedStudentTab === 'mastery'
                              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          🎯 Điểm số Mastery ({groupedMasteryData.length} môn)
                        </button>
                        <button
                          onClick={() => setSelectedStudentTab('advanced')}
                          className={cn(
                            "text-xs font-black pb-2 px-1 relative -mb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                            selectedStudentTab === 'advanced'
                              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>🏆 Chuyên đề Nâng cao (4 môn)</span>
                          {studentAdvancedData.some(d => d.completedCount > 0) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedStudentTab('exams')}
                          className={cn(
                            "text-xs font-black pb-2 px-1 relative -mb-2 border-b-2 transition-all cursor-pointer",
                            selectedStudentTab === 'exams'
                              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          📝 Lịch sử Thi thử ({studentExams.length})
                        </button>
                      </div>

                      {selectedStudentTab === 'mastery' && (
                        <StudentMasteryTab
                          groupedMasteryData={groupedMasteryData}
                          selectedSubjectKey={selectedSubjectKey}
                          onSelectSubjectKey={setSelectedSubjectKey}
                        />
                      )}

                      {selectedStudentTab === 'advanced' && (
                        <StudentAdvancedTab
                          advancedData={studentAdvancedData}
                          isLoading={isAdvancedLoading}
                        />
                      )}

                      {selectedStudentTab === 'exams' && (
                        <StudentExamsTab
                          exams={studentExams}
                          selectedExamForDetail={selectedExamForDetail}
                          onSelectExamForDetail={setSelectedExamForDetail}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            ) : (
              <div className="h-64 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-2 bg-slate-50/10 dark:bg-slate-900/5">
                <Users size={32} className="text-muted-foreground/60 animate-pulse" />
                <h4 className="font-bold text-xs text-foreground">Chọn học sinh bên trái</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Để xem chi tiết điểm số Mastery, các ngôi sao đạt được và lịch sử làm bài.</p>
              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'ai_statistics' ? (
        /* Thống kê AI & Token */
        <TeacherAiStatistics />
      ) : activeTab === 'support' ? (
        /* Hỗ trợ Học sinh */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Cột trái: Danh sách các ticket */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="p-4 border-b border-border/20 flex flex-col gap-3">
                <div>
                  <CardTitle className="text-foreground text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <LifeBuoy size={16} className="text-emerald-500" />
                    Danh sách yêu cầu ({filteredTickets.length})
                  </CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Lọc và xem các yêu cầu trợ giúp từ học sinh.
                  </CardDescription>
                </div>

                {/* Bộ lọc */}
                <div className="space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center">Trạng thái:</span>
                    {(['all', 'pending', 'resolved', 'rejected'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setTicketStatusFilter(status)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer",
                          ticketStatusFilter === status
                            ? "bg-emerald-600 border-emerald-600 text-white font-black"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {status === 'all' && 'Tất cả'}
                        {status === 'pending' && 'Chờ duyệt'}
                        {status === 'resolved' && 'Đã giải quyết'}
                        {status === 'rejected' && 'Từ chối'}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center">Danh mục:</span>
                    {(['all', 'bug', 'feature', 'question', 'other'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setTicketCategoryFilter(cat)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer",
                          ticketCategoryFilter === cat
                            ? "bg-indigo-600 border-indigo-600 text-white font-black"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat === 'all' && 'Tất cả'}
                        {cat === 'bug' && 'Báo lỗi'}
                        {cat === 'feature' && 'Góp ý'}
                        {cat === 'question' && 'Hỏi đáp'}
                        {cat === 'other' && 'Khác'}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-2 max-h-[500px] overflow-y-auto space-y-2">
                {isTicketsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <Loader size={20} className="animate-spin text-emerald-600" />
                    <span className="text-[10px] font-bold text-muted-foreground">Đang tải yêu cầu...</span>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground font-semibold">
                    Không có yêu cầu hỗ trợ nào phù hợp bộ lọc.
                  </div>
                ) : (
                  filteredTickets.map(tk => (
                    <button
                      key={tk.id}
                      onClick={() => {
                        setSelectedTicket(tk);
                        setResponseText(tk.teacherResponse || '');
                      }}
                      className={cn(
                        "w-full p-3 rounded-xl border text-left transition-all cursor-pointer shadow-sm hover:shadow flex flex-col gap-1.5",
                        selectedTicket?.id === tk.id
                          ? "border-emerald-500 bg-emerald-500/5"
                          : "border-border/60 bg-card/50 hover:border-border"
                      )}
                    >
                      <div className="flex justify-between items-start w-full gap-2">
                        <span className="text-[10px] font-extrabold text-foreground truncate max-w-[70%]">
                          👤 {tk.userName}
                        </span>
                        {tk.status === 'resolved' ? (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold">Đã giải quyết</span>
                        ) : tk.status === 'rejected' ? (
                          <span className="text-[9px] text-rose-500 font-extrabold">Từ chối</span>
                        ) : (
                          <span className="text-[9px] text-amber-500 font-extrabold animate-pulse">Chờ duyệt</span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-[11px] text-foreground leading-tight truncate w-full">{tk.title}</h4>

                      <div className="flex justify-between items-center w-full text-[9px] text-muted-foreground font-semibold mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-secondary/80 text-[8px] uppercase tracking-wider font-extrabold">
                          {tk.category}
                        </span>
                        <span>{new Date(tk.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cột phải: Chi tiết và Phản hồi */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="border-border/50 bg-card shadow-sm h-full flex flex-col">
                <CardHeader className="p-5 border-b border-border/20">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-wider">
                          {selectedTicket.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          Mã yêu cầu: {selectedTicket.id}
                        </span>
                      </div>
                      <CardTitle className="text-foreground text-sm font-black leading-snug">
                        {selectedTicket.title}
                      </CardTitle>
                      <CardDescription className="text-[10px] font-semibold text-muted-foreground mt-1">
                        Gửi bởi: <span className="font-extrabold text-foreground">{selectedTicket.userName}</span> ({selectedTicket.userEmail}) vào {new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}
                      </CardDescription>
                    </div>

                    <div className="shrink-0">
                      {selectedTicket.status === 'resolved' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Đã giải quyết
                        </span>
                      ) : selectedTicket.status === 'rejected' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          ✗ Từ chối
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          ⏳ Chờ giải quyết
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 flex-1 space-y-5 overflow-y-auto">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-muted-foreground block uppercase tracking-wider">Nội dung học sinh viết:</span>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/20 text-xs font-semibold leading-relaxed text-foreground whitespace-pre-wrap">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {selectedTicket.screenshotUrl && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-muted-foreground block uppercase tracking-wider">Ảnh đính kèm từ học sinh:</span>
                      <a
                        href={selectedTicket.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-fit max-w-full overflow-hidden rounded-2xl border border-border/30 hover:border-primary/40 transition-colors shadow-sm cursor-zoom-in"
                      >
                        <img
                          src={selectedTicket.screenshotUrl}
                          alt="Student Screenshot"
                          className="max-h-[300px] object-contain rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                        />
                      </a>
                    </div>
                  )}

                  {/* Form phản hồi */}
                  <div className="border-t border-border/40 pt-4 space-y-4">
                    <span className="text-[9px] font-black text-muted-foreground block uppercase tracking-wider">Gửi phản hồi cho học sinh:</span>

                    <div className="space-y-2">
                      <textarea
                        rows={5}
                        placeholder="Nhập nội dung phản hồi, hướng dẫn khắc phục hoặc trả lời câu hỏi..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-border/60 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all leading-relaxed"
                        disabled={ticketSubmitting}
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => handleUpdateTicket('rejected')}
                        disabled={ticketSubmitting || !responseText.trim()}
                        className="font-bold text-xs py-2 px-5 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 cursor-pointer h-10 transition-all"
                      >
                        ✗ Từ chối yêu cầu
                      </Button>
                      <Button
                        onClick={() => handleUpdateTicket('resolved')}
                        disabled={ticketSubmitting || !responseText.trim()}
                        className="font-bold text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-10 transition-all"
                      >
                        ✓ Giải quyết xong
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card border border-dashed border-border/40 rounded-2xl min-h-[300px]">
                <LifeBuoy size={48} className="text-muted-foreground/30 mb-3 animate-float" />
                <h4 className="font-extrabold text-sm text-foreground">Chưa chọn yêu cầu hỗ trợ</h4>
                <p className="text-[10px] text-muted-foreground font-semibold max-w-[280px] mt-1 leading-relaxed">
                  Chọn một yêu cầu hỗ trợ từ danh sách bên trái để xem thông tin chi tiết và gửi phản hồi.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : MONETIZATION_ENABLED && activeTab === 'premium' ? (
        /* Cấp Quyền Premium */
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="p-6 border-b border-border/20">
              <CardTitle className="text-foreground text-sm font-black flex items-center gap-2">
                <Award size={18} className="text-amber-500 animate-pulse" />
                Cấp Tài Khoản Premium Cho Học Sinh
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold text-muted-foreground">
                Nhập email học sinh đã đăng ký tài khoản để kích hoạt gói nâng cấp Premium.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleGrantPremium} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="student-email" className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    Email Học Sinh
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    required
                    placeholder="example@student.com"
                    value={premiumEmail}
                    onChange={(e) => setPremiumEmail(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-border/60 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none transition-all"
                    disabled={premiumSubmitting}
                  />
                </div>

                {/* Chọn loại gói Premium */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                    Chọn Loại Gói Kích Hoạt
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'trial_1m', label: '🎁 Dùng Thử 1 Tháng', desc: '30 ngày trải nghiệm' },
                      { id: 'plan_3m', label: '⚡ Gói 3 Tháng', desc: '90 ngày học tập' },
                      { id: 'plan_12m', label: '👑 Gói 12 Tháng', desc: '365 ngày (1 năm)' },
                      { id: 'permanent', label: '♾️ VIP Trọn Đời', desc: 'Không giới hạn hạn dùng' },
                    ].map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setGrantPackageType(pkg.id as any)}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between select-none",
                          grantPackageType === pkg.id
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                            : "bg-slate-50 dark:bg-slate-900 border-border/60 text-muted-foreground hover:border-border"
                        )}
                      >
                        <span className="text-xs font-black text-foreground">{pkg.label}</span>
                        <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">{pkg.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {premiumErrorMsg && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-2">
                    <XCircle size={16} className="shrink-0" />
                    <span>{premiumErrorMsg}</span>
                  </div>
                )}

                {premiumSuccessMsg && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-2">
                    <CheckCircle size={16} className="shrink-0 text-emerald-500 animate-bounce" />
                    <span>{premiumSuccessMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={premiumSubmitting || !premiumEmail}
                  className="w-full font-bold text-xs py-3 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-11 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                >
                  {premiumSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Đang xử lý nâng cấp...
                    </>
                  ) : (
                    <>
                      🚀 Kích hoạt Premium
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : MONETIZATION_ENABLED && activeTab === 'affiliate_admin' ? (
        <TeacherAffiliateManager />
      ) : activeTab === 'email_broadcast' ? (
        <EmailBroadcastManager />
      ) : activeTab === 'survey_report' ? (
        <TeacherSurveyReport />
      ) : activeTab === 'system_notification' ? (
        <TeacherNotificationManager />
      ) : activeTab === 'admin_chat_inbox' ? (
        <TeacherAdminChatInbox />
      ) : null}

    </div>
  );
};

export default TeacherDashboard;
