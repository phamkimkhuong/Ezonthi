import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ROUTES } from './constants/routes';
import { seoLandingPages } from './seo/landingPages';
import PublicLayout from './components/layout/PublicLayout';
import SeoLandingPage from './features/seo-landing/SeoLandingPage';
import CourseContextRoute from './components/routing/CourseContextRoute';
import AdvancedCourseRoute from './components/routing/AdvancedCourseRoute';
import LegacyCourseRedirect, { DefaultCourseRedirect } from './components/routing/LegacyCourseRedirect';

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    const hasReloaded = sessionStorage.getItem('chunk_reload_retry');
    try {
      const component = await factory();
      sessionStorage.removeItem('chunk_reload_retry');
      return component;
    } catch (error: any) {
      console.warn('Lỗi nạp file JS phiên bản cũ, đang tự động tải lại phiên bản mới:', error);
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload_retry', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

const Dashboard = lazyWithRetry(() => import('./features/dashboard/Dashboard'));
const Roadmap = lazyWithRetry(() => import('./features/roadmap/Roadmap'));
const QuestionTypeDetail = lazyWithRetry(() => import('./features/question-type/QuestionTypeDetail'));
const PracticeEngine = lazyWithRetry(() => import('./features/practice-engine/PracticeEngine'));
const AdvancedPhysics10 = lazyWithRetry(() => import('./features/advanced-physics/AdvancedPhysics10Page'));
const AdvancedMath10 = lazyWithRetry(() => import('./features/advanced-math/AdvancedMath10Page'));
const AdvancedChemistry10 = lazyWithRetry(() => import('./features/advanced-chemistry/AdvancedChemistry10Page'));
const AdvancedBiology10 = lazyWithRetry(() => import('./features/advanced-biology/AdvancedBiology10Page'));
const MistakeNotebook = lazyWithRetry(() => import('./components/mistakes/MistakeNotebook'));
const ExamEngine = lazyWithRetry(() => import('./features/exam-engine/ExamEngine'));
const TeacherDashboard = lazyWithRetry(() => import('./features/teacher/TeacherDashboard'));
const PremiumPricing = lazyWithRetry(() => import('./features/premium/PremiumPricing').then(m => ({ default: m.PremiumPricing })));
const GeneralAiTutor = lazyWithRetry(() => import('./features/ai-tutor/GeneralAiTutor').then(m => ({ default: m.GeneralAiTutor })));
const SupportPage = lazyWithRetry(() => import('./features/support/SupportPage').then(m => ({ default: m.SupportPage })));
const AffiliateDashboard = lazyWithRetry(() => import('./features/affiliate/AffiliateDashboard').then(m => ({ default: m.AffiliateDashboard })));
const AboutPage = lazyWithRetry(() => import('./features/about/AboutPage'));
const VocabularyPage = lazyWithRetry(() => import('./features/vocabulary/VocabularyPage'));
const GrammarPage = lazyWithRetry(() => import('./features/grammar/GrammarPage'));
const NewsPage = lazyWithRetry(() => import('./features/news/NewsPage').then(m => ({ default: m.NewsPage })));
const PrivateAppShell = lazyWithRetry(() => import('./components/layout/PrivateAppShell'));

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: (
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <SeoLandingPage /> },
      ...seoLandingPages
        .filter(page => page.route !== '/')
        .map(page => ({
          path: page.route.replace(/^\//, '').replace(/\/$/, ''),
          element: <SeoLandingPage />
        })),
      { path: ROUTES.ABOUT.substring(1), element: <AboutPage /> },
    ]
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
          <PrivateAppShell />
        </React.Suspense>
      </ErrorBoundary>
    ),
    children: [
      {
        path: 'app/:grade/:subject',
        element: <CourseContextRoute />,
        children: [
          { index: true, element: <DefaultCourseRedirect /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'roadmap', element: <Roadmap /> },
          { path: 'question-types/:questionTypeId', element: <QuestionTypeDetail /> },
          { path: 'practice', element: <PracticeEngine /> },
          { path: 'practice/:questionTypeId', element: <PracticeEngine /> },
          {
            path: 'advanced',
            element: (
              <AdvancedCourseRoute
                math={<AdvancedMath10 />}
                physics={<AdvancedPhysics10 />}
                chemistry={<AdvancedChemistry10 />}
                biology={<AdvancedBiology10 />}
              />
            )
          },
          { path: 'mistakes', element: <MistakeNotebook /> },
          { path: 'exam', element: <ExamEngine /> },
          { path: 'ai-tutor', element: <GeneralAiTutor /> },
          { path: 'vocabulary', element: <VocabularyPage /> },
          { path: 'grammar', element: <GrammarPage /> }
        ]
      },
      { path: ROUTES.DASHBOARD.substring(1), element: <LegacyCourseRedirect section="dashboard" /> },
      { path: ROUTES.ROADMAP.substring(1), element: <LegacyCourseRedirect section="roadmap" /> },
      { path: 'question-types/:questionTypeId', element: <LegacyCourseRedirect section="question-types" useQuestionTypeSubject /> },
      { path: ROUTES.PRACTICE.substring(1), element: <LegacyCourseRedirect section="practice" /> },
      { path: 'practice/:questionTypeId', element: <LegacyCourseRedirect section="practice" useQuestionTypeSubject /> },
      { path: ROUTES.ADVANCED_PHYSICS_10.substring(1), element: <LegacyCourseRedirect section="advanced" grade="grade10" subject="physics" /> },
      { path: ROUTES.ADVANCED_MATH_10.substring(1), element: <LegacyCourseRedirect section="advanced" grade="grade10" subject="math" /> },
      { path: ROUTES.ADVANCED_CHEMISTRY_10.substring(1), element: <LegacyCourseRedirect section="advanced" grade="grade10" subject="chemistry" /> },
      { path: ROUTES.ADVANCED_BIOLOGY_10.substring(1), element: <LegacyCourseRedirect section="advanced" grade="grade10" subject="biology" /> },
      { path: ROUTES.MISTAKES.substring(1), element: <LegacyCourseRedirect section="mistakes" /> },
      { path: ROUTES.EXAM.substring(1), element: <LegacyCourseRedirect section="exam" /> },
      { path: ROUTES.TEACHER.substring(1), element: <TeacherDashboard /> },
      { path: ROUTES.PREMIUM.substring(1), element: <PremiumPricing /> },
      { path: ROUTES.AI_TUTOR.substring(1), element: <LegacyCourseRedirect section="ai-tutor" /> },
      { path: ROUTES.SUPPORT.substring(1), element: <SupportPage /> },
      { path: ROUTES.AFFILIATE.substring(1), element: <AffiliateDashboard /> },
      { path: ROUTES.VOCABULARY.substring(1), element: <LegacyCourseRedirect section="vocabulary" /> },
      { path: ROUTES.GRAMMAR.substring(1), element: <LegacyCourseRedirect section="grammar" /> },
      { path: ROUTES.NEWS.substring(1), element: <NewsPage /> },
    ]
  },

  {
    path: '*',
    element: <DefaultCourseRedirect />
  }
]);

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
};

export default App;
