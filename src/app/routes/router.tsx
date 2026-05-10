import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from '@/app/layout';
import { RootErrorBoundary } from '@/pages/error/ErrorBoundary';
import { HomePage } from '@/pages/home/ui';
import { LoginPage } from '@/pages/login/ui';
import { MyPage } from '@/pages/mypage/ui/MyPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { TeamCreatePage } from '@/pages/team-create/ui/TeamCreatePage';
import { TeamDetailPage } from '@/pages/team-detail/ui/TeamDetailPage';
import { TeamProfileSetupPage } from '@/pages/team-profile-setup/ui/TeamProfileSetupPage';
import { TermsPage } from '@/pages/terms/ui';
import { PATHS } from './paths';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        errorElement: <RootErrorBoundary />,
        children: [
          { index: true, element: <Navigate to={PATHS.LOGIN} replace /> },
          { path: PATHS.LOGIN, element: <LoginPage /> },
          { path: PATHS.TERMS, element: <TermsPage /> },
          { path: PATHS.HOME, element: <HomePage /> },
          { path: PATHS.MY_PAGE, element: <MyPage /> },
          { path: PATHS.TEAM_DETAIL, element: <TeamDetailPage /> },
          { path: PATHS.TEAM_CREATE, element: <TeamCreatePage /> },
          { path: PATHS.TEAM_PROFILE_SETUP, element: <TeamProfileSetupPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
