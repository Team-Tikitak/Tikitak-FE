import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/app/layout';
import { RootErrorBoundary } from '@/pages/error/ErrorBoundary';
import { LoginPage } from '@/pages/login/ui';
import { NotFoundPage } from '@/pages/notFound/NotFoundPage';
import { SplashPage } from '@/pages/splash/ui';
import { authCallbackLoader, inviteAcceptLoader, setupFlowLoader } from './loaders';
import { PATHS } from './paths';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    hydrateFallbackElement: <div className="h-dvh w-full bg-white" />,
    children: [
      {
        errorElement: <RootErrorBoundary />,
        children: [
          { index: true, element: <SplashPage /> },
          { path: PATHS.LOGIN, element: <LoginPage /> },
          {
            path: PATHS.TERMS_DETAIL,
            lazy: () =>
              import('@/pages/termsDetail/ui/TermsDetailPage').then((m) => ({
                Component: m.TermsDetailPage,
              })),
          },
          {
            path: PATHS.INVITE_ACCEPT,
            loader: inviteAcceptLoader,
            lazy: () =>
              import('@/pages/inviteAccept/ui').then((m) => ({ Component: m.InviteAcceptPage })),
          },
          { path: PATHS.AUTH_CALLBACK, loader: authCallbackLoader, element: <SplashPage /> },
          {
            element: <ProtectedRoute />,
            loader: setupFlowLoader,
            children: [
              {
                path: PATHS.TERMS,
                lazy: () => import('@/pages/terms/ui').then((m) => ({ Component: m.TermsPage })),
              },
              {
                path: PATHS.ONBOARDING,
                lazy: () =>
                  import('@/pages/onboarding/ui').then((m) => ({ Component: m.OnboardingPage })),
              },
              {
                path: PATHS.HOME,
                lazy: () => import('@/pages/home/ui').then((m) => ({ Component: m.HomePage })),
              },
              {
                path: PATHS.FEED,
                lazy: () => import('@/pages/feed/ui').then((m) => ({ Component: m.FeedPage })),
              },
              {
                path: PATHS.FEED_CREATE,
                lazy: () =>
                  import('@/pages/feedEditor/ui').then((m) => ({ Component: m.FeedCreatePage })),
              },
              {
                path: PATHS.DAILY_FEED_CREATE,
                lazy: () =>
                  import('@/pages/dailyFeedEditor/ui').then((m) => ({
                    Component: m.DailyFeedCreatePage,
                  })),
              },
              {
                path: PATHS.DAILY_FEED_EDIT,
                lazy: () =>
                  import('@/pages/dailyFeedEditor/ui').then((m) => ({
                    Component: m.DailyFeedEditPage,
                  })),
              },
              {
                path: PATHS.MY_PAGE,
                lazy: () => import('@/pages/myPage/ui').then((m) => ({ Component: m.MyPage })),
              },
              {
                path: PATHS.TEAM_DETAIL,
                lazy: () =>
                  import('@/pages/teamDetail/ui').then((m) => ({ Component: m.TeamDetailPage })),
              },
              {
                path: PATHS.TEAM_CREATE,
                lazy: () =>
                  import('@/pages/teamCreate/ui').then((m) => ({ Component: m.TeamCreatePage })),
              },
              {
                path: PATHS.TEAM_PROFILE_SETUP,
                lazy: () =>
                  import('@/pages/teamProfileSetup/ui').then((m) => ({
                    Component: m.TeamProfileSetupPage,
                  })),
              },
              {
                path: PATHS.TEAM_INVITE,
                lazy: () =>
                  import('@/pages/teamInvite/ui').then((m) => ({ Component: m.TeamInvitePage })),
              },
              {
                path: PATHS.GALLERY,
                lazy: () =>
                  import('@/pages/gallery/ui').then((m) => ({ Component: m.GalleryPage })),
              },
              {
                path: PATHS.FEED_DETAIL,
                lazy: () =>
                  import('@/pages/feedDetail/ui/FeedDetailPage').then((m) => ({
                    Component: m.FeedDetailPage,
                  })),
              },
              {
                path: PATHS.FEED_EDIT,
                lazy: () =>
                  import('@/pages/feedEditor/ui').then((m) => ({
                    Component: m.FeedEditPage,
                  })),
              },
              {
                path: PATHS.PLACE_FEEDS,
                lazy: () =>
                  import('@/pages/placeDetail/ui/PlaceDetailPage').then((m) => ({
                    Component: m.PlaceDetailPage,
                  })),
              },
              {
                path: PATHS.ACTIVITY,
                lazy: () =>
                  import('@/pages/activity/ui/ActivityPage').then((m) => ({
                    Component: m.ActivityPage,
                  })),
              },
              {
                path: PATHS.NOTIFICATION,
                lazy: () =>
                  import('@/pages/notification/ui/NotificationPage').then((m) => ({
                    Component: m.NotificationPage,
                  })),
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
