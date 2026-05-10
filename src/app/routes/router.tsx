import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from '@/app/layout';
import { RootErrorBoundary } from '@/pages/error/ErrorBoundary';
import { LoginPage } from '@/pages/login/ui';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { PATHS } from './paths';
import { MyPage } from '@/pages/mypage/ui/MyPage';
import { TeamDetailPage } from '@/pages/team-detail/ui/TeamDetailPage';
import { TeamCreatePage } from '@/pages/team-create/ui/TeamCreatePage';
import { TeamProfileSetupPage } from '@/pages/team-profile-setup/ui/TeamProfileSetupPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        errorElement: <RootErrorBoundary />,
        children: [
          { index: true, element: <Navigate to={PATHS.LOGIN} replace /> },
          { path: PATHS.LOGIN, element: <LoginPage /> },
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
