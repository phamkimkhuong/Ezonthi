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

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setAnalyticsUser(user.uid);

        const isTeacher = await teacherAccessService.isTeacher(user);
        if (!isTeacher) {
          await progressService.syncUserData(user.uid);
          refreshProgress();
        }

        unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
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
        });
      } else {
        setAnalyticsUser(null);
        setPremium(false);
        unsubscribeUserDoc?.();
        unsubscribeUserDoc = null;
      }
      setAuthLoading(false);
    });

    return () => {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <Loader size={42} className="animate-spin text-primary" />
        <h2 className="text-xs font-bold text-muted-foreground">Đang thiết lập phòng học trực tuyến…</h2>
      </div>
    );
  }

  return <AppLayout />;
};

export default PrivateAppShell;
