import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/app/layout';
import { RootErrorBoundary } from '@/pages/error/ErrorBoundary';
import { GalleryPage } from '@/pages/gallery/ui';
import { HomePage } from '@/pages/home/ui';
import { InviteAcceptPage } from '@/pages/inviteAccept/ui';
import { LoginPage } from '@/pages/login/ui';
import { MyPage } from '@/pages/myPage/ui';
import { NotFoundPage } from '@/pages/notFound/NotFoundPage';
import { OnboardingPage } from '@/pages/onboarding/ui';
import { PlaceDetailPage } from '@/pages/placeDetail/ui/PlaceDetailPage';
import { SplashPage } from '@/pages/splash/ui';
import { TeamCreatePage } from '@/pages/teamCreate/ui';
import { TeamDetailPage } from '@/pages/teamDetail/ui';
import { TeamInvitePage } from '@/pages/teamInvite/ui';
import { TeamProfileSetupPage } from '@/pages/teamProfileSetup/ui';
import { TermsPage } from '@/pages/terms/ui';
import { PATHS } from './paths';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        errorElement: <RootErrorBoundary />,
        children: [
          { index: true, element: <SplashPage /> },
          { path: PATHS.LOGIN, element: <LoginPage /> },
          { path: PATHS.TERMS, element: <TermsPage /> },
          { path: PATHS.HOME, element: <HomePage /> },
          { path: PATHS.ONBOARDING, element: <OnboardingPage /> },
          { path: PATHS.MY_PAGE, element: <MyPage /> },
          { path: PATHS.TEAM_DETAIL, element: <TeamDetailPage /> },
          { path: PATHS.TEAM_CREATE, element: <TeamCreatePage /> },
          { path: PATHS.TEAM_PROFILE_SETUP, element: <TeamProfileSetupPage /> },
          { path: PATHS.TEAM_INVITE, element: <TeamInvitePage /> },
          { path: PATHS.INVITE_ACCEPT, element: <InviteAcceptPage /> },
          { path: PATHS.GALLERY, element: <GalleryPage /> },
          { path: PATHS.PLACE_DETAIL, element: <PlaceDetailPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
