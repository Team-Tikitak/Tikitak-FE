import { Ssgoi, SsgoiTransition } from '@ssgoi/react';
import { hero, sheet, slide } from '@ssgoi/react/view-transitions';
import { OverlayProvider } from 'overlay-kit';
import { Outlet, useLocation } from 'react-router';
import { PATHS } from '@/app/routes';
import { cn } from '@/shared/lib';
import { BottomNavigation, type BottomNavigationTab } from '@/shared/ui';

interface RootLayoutProps {
  className?: string;
}

const SHEET_PHYSICS = { spring: { stiffness: 600, damping: 45 } };
const HERO_PHYSICS = { spring: { stiffness: 350, damping: 32 } };

const slideForward = slide({ direction: 'left' });
const slideBack = slide({ direction: 'right' });
const heroTransition = hero({ physics: HERO_PHYSICS });
const sheetEnter = sheet({ physics: SHEET_PHYSICS });
const sheetExit = sheet({ direction: 'exit', physics: SHEET_PHYSICS });

const sheetPair = (a: string, b: string) => [
  { from: a, to: b, transition: sheetEnter },
  { from: b, to: a, transition: sheetExit },
];
const pushPair = (a: string, b: string) => [
  { from: a, to: b, transition: slideForward },
  { from: b, to: a, transition: slideBack },
];

const ssgoiConfig = {
  defaultTransition: {},
  transitions: [
    // 스플래시 → 로그인: 로고 morph
    { from: PATHS.ROOT, to: PATHS.LOGIN, transition: {}, symmetric: true },

    // FEED_CREATE: 시트 진입/퇴장
    ...sheetPair(PATHS.HOME, PATHS.FEED_CREATE),
    ...sheetPair(PATHS.FEED, PATHS.FEED_CREATE),
    ...sheetPair(PATHS.MY_PAGE, PATHS.FEED_CREATE),

    // 온보딩 플로우: iOS 푸시 슬라이드
    ...pushPair(PATHS.LOGIN, PATHS.TERMS),
    ...pushPair(PATHS.TERMS, PATHS.ONBOARDING),
    { from: PATHS.ONBOARDING, to: PATHS.HOME, transition: slideForward },

    // 팀 생성: 모달성 task → sheet, 내부 단계는 푸시
    ...sheetPair(PATHS.HOME, PATHS.TEAM_CREATE),
    ...sheetPair(PATHS.MY_PAGE, PATHS.TEAM_CREATE),
    ...pushPair(PATHS.TEAM_CREATE, PATHS.TEAM_PROFILE_SETUP),

    // 팀 상세 / 초대 (dynamic teamId 와일드카드)
    ...pushPair(PATHS.HOME, '/teams/*'),
    ...pushPair('/teams/*', '/teams/*/invite'),

    // 핀 → 장소 상세 hero morph
    { from: PATHS.HOME, to: '/place/*', transition: heroTransition },
    { from: '/place/*', to: PATHS.HOME, transition: heroTransition },
  ],
};

const TAB_PATHS = [PATHS.HOME, PATHS.FEED, PATHS.MY_PAGE] as const;
type TabPath = (typeof TAB_PATHS)[number];

const ACTIVE_TAB_BY_PATH = {
  [PATHS.HOME]: 'home',
  [PATHS.FEED]: 'feed',
  [PATHS.MY_PAGE]: 'my',
} satisfies Record<TabPath, BottomNavigationTab>;

const isTabPath = (pathname: string): pathname is TabPath =>
  (TAB_PATHS as readonly string[]).includes(pathname);

export const RootLayout = ({ className }: RootLayoutProps) => {
  const location = useLocation();
  const showTabBar = isTabPath(location.pathname);
  const activeTab = isTabPath(location.pathname)
    ? ACTIVE_TAB_BY_PATH[location.pathname]
    : undefined;

  return (
    <div
      className={cn(
        'mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-white',
        className,
      )}
    >
      <Ssgoi config={ssgoiConfig}>
        <div id="app-canvas" className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
          <OverlayProvider>
            <SsgoiTransition
              key={location.pathname}
              id={location.pathname}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <Outlet />
            </SsgoiTransition>
          </OverlayProvider>
          {showTabBar && (
            <div className="pointer-events-auto absolute bottom-[calc(8px+env(safe-area-inset-bottom))] left-1/2 z-30 flex w-full max-w-[393px] -translate-x-1/2 justify-center px-5">
              <BottomNavigation activeTab={activeTab} />
            </div>
          )}
        </div>
      </Ssgoi>
    </div>
  );
};
