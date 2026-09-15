import { hasActivePremium } from '../../utils/premium';
import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import AppLayout from './AppLayout';
import { auth, db, initializeFirebaseTelemetry, setAnalyticsUser } from '../../services/firebase';
import { progressService } from '../../services/progressService';
import { storageService } from '../../services/storage';
import { teacherAccessService } from '../../services/teacherAccessService';
import { useAppStore } from '../../services/store';
import type { UserProgress } from '../../types';

const scheduleAfterPageLoad = (task: () => void) => {
  const scheduleIdle = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(task, { timeout: 5000 });
    } else {
      setTimeout(task, 2500);
    }
  };

  if (document.readyState === 'complete') scheduleIdle();
  else window.addEventListener('load', scheduleIdle, { once: true });
};

const PrivateAppShell: React.FC = () => {
  const { authLoading, setUser, setAuthLoading, refreshProgress, setPremium } = useAppStore();

  useEffect(() => {
    const check = () => setPremium(hasActivePremium(useAppStore.getState().userData));
    const timer = window.setInterval(check, 30_000);
    window.addEventListener('focus', check);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', check); };
  }, [setPremium]);

  useEffect(() => {
    scheduleAfterPageLoad(() => {
      void initializeFirebaseTelemetry();
      void import('../../sentry');
    });

    let unsubscribeUserDoc: (() => void) | null = null;
    let isSettled = false;

    const markAuthSettled = () => {
      if (isSettled) return;
      isSettled = true;
      setAuthLoading(false);
    };

    // Watchdog timer: Nếu Firebase Auth hoặc IndexedDB bị treo/chậm quá 3.5s,
    // tự động giải phóng loading để học sinh vào học ngay bằng dữ liệu cache cục bộ.
    const watchdogTimer = window.setTimeout(() => {
      if (useAppStore.getState().authLoading) {
        console.warn('[PrivateAppShell] Auth resolution watchdog kích hoạt (>3.5s). Mở khóa giao diện an toàn.');
        if (auth.currentUser && !useAppStore.getState().user) {
          setUser(auth.currentUser);
        }
        markAuthSettled();
      }
    }, 3500);

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          setUser(user);
          if (user) {
            setAnalyticsUser(user.uid);

            // Kiểm tra quyền giáo viên với timeout bảo vệ 2s (không làm nghẽn luồng học sinh)
            let isTeacher = false;
            try {
              isTeacher = await Promise.race([
                teacherAccessService.isTeacher(user),
                new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000))
              ]);
            } catch (err) {
              console.warn('[PrivateAppShell] Kiểm tra quyền giáo viên gặp lỗi (fallback học sinh):', err);
            }

            if (!isTeacher) {
              // Đồng bộ dữ liệu nền (non-blocking) - không bắt học sinh chờ xong sync mới được vào giao diện
              void progressService.syncUserData(user.uid)
                .then(refreshProgress)
                .catch((err) => console.warn('[PrivateAppShell] Đồng bộ tiến trình nền (non-fatal):', err));
            }

            // Đăng ký realtime listener cho hồ sơ người dùng kèm callback xử lý lỗi
            try {
              unsubscribeUserDoc?.();
              unsubscribeUserDoc = onSnapshot(
                doc(db, 'users', user.uid),
                (docSnap) => {
                  if (docSnap.exists()) {
                    const data = docSnap.data();
                    const premiumStatus = hasActivePremium(data);

                    const prevPremium = useAppStore.getState().isPremium;
                    if (premiumStatus && !prevPremium) {
                      void import('canvas-confetti').then((confetti) => {
                        confetti.default({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                      });
                    }

                    setPremium(premiumStatus);
                    useAppStore.setState({
                      userData: data,
                      trialActivated: data.trialActivated === true,
                      premiumUntil: data.premiumUntil || null
                    });

                    let hasProgressChanges = false;
                    if (Array.isArray(data.readLessons)) {
                      const currentRead = storageService.getReadLessons(user.uid);
                      const mergedRead = Array.from(new Set([...currentRead, ...data.readLessons]));
                      if (mergedRead.length !== currentRead.length) {
                        storageService.saveReadLessonsLocal(user.uid, mergedRead);
                        hasProgressChanges = true;
                      }
                    }
                    if (Array.isArray(data.passedCheckpoints)) {
                      const currentCheckpoints = storageService.getPassedTheoryCheckpoints(user.uid);
                      const mergedCheckpoints = Array.from(new Set([...currentCheckpoints, ...data.passedCheckpoints]));
                      if (mergedCheckpoints.length !== currentCheckpoints.length) {
                        storageService.savePassedTheoryCheckpointsLocal(user.uid, mergedCheckpoints);
                        hasProgressChanges = true;
                      }
                    }
                    if (data.masteryLevels || data.completedLessons) {
                      const currentProg = storageService.getProgress(user.uid);
                      const updatedProg: UserProgress = {
                        ...currentProg,
                        masteryLevels: { ...(currentProg.masteryLevels || {}), ...(data.masteryLevels || {}) },
                        completedLessons: Array.from(new Set([...(currentProg.completedLessons || []), ...(data.completedLessons || [])])),
                        lastUpdatedAt: data.lastActiveAt || currentProg.lastUpdatedAt
                      };
                      storageService.saveProgressLocal(user.uid, updatedProg);
                      hasProgressChanges = true;
                    }

                    if (hasProgressChanges) refreshProgress();

                    if (typeof sessionStorage !== 'undefined') {
                      const hasAutoOpened = sessionStorage.getItem('ezonthi_profile_auto_opened');
                      if (!hasAutoOpened && (!data.birthYear || !data.gender || !data.province)) {
                        sessionStorage.setItem('ezonthi_profile_auto_opened', 'true');
                        useAppStore.setState({ isProfileModalOpen: true, isAutoProfileModal: true });
                      }
                    }
                  } else {
                    setPremium(false);
                    useAppStore.setState({ userData: null, trialActivated: false, premiumUntil: null });
                  }
                },
                (snapshotError) => {
                  console.warn('[PrivateAppShell] Lỗi lắng nghe snapshot userDoc:', snapshotError);
                }
              );
            } catch (err) {
              console.warn('[PrivateAppShell] Không thể đăng ký snapshot userDoc:', err);
            }
          } else {
            setAnalyticsUser(null);
            setPremium(false);
            unsubscribeUserDoc?.();
            unsubscribeUserDoc = null;
          }
        } catch (error) {
          console.error('[PrivateAppShell] Lỗi trong quá trình xử lý auth state:', error);
        } finally {
          window.clearTimeout(watchdogTimer);
          markAuthSettled();
        }
      },
      (authError) => {
        console.error('[PrivateAppShell] onAuthStateChanged báo lỗi:', authError);
        window.clearTimeout(watchdogTimer);
        markAuthSettled();
      }
    );

    return () => {
      window.clearTimeout(watchdogTimer);
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, [setUser, setAuthLoading, refreshProgress, setPremium]);

  useEffect(() => {
    const retryLearningOutbox = () => {
      const currentUser = useAppStore.getState().user;
      if (currentUser) void progressService.syncUserData(currentUser.uid).then(refreshProgress);
    };
    window.addEventListener('online', retryLearningOutbox);
    return () => window.removeEventListener('online', retryLearningOutbox);
  }, [refreshProgress]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 px-4 text-center">
        <Loader size={42} className="animate-spin text-primary" />
        <h2 className="text-xs font-bold text-muted-foreground">Đang thiết lập phòng học trực tuyến…</h2>
        <button
          type="button"
          onClick={() => setAuthLoading(false)}
          className="text-xs font-semibold text-primary/80 hover:text-primary underline cursor-pointer transition-colors mt-2"
        >
          Nếu chờ lâu, bấm vào đây để vào học ngay
        </button>
      </div>
    );
  }

  return <AppLayout />;
};

export default PrivateAppShell;
