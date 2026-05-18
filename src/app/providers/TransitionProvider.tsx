import { Ssgoi } from '@ssgoi/react';
import { fade, hero, sheet, slide } from '@ssgoi/react/view-transitions';
import { PATHS } from '@/app/routes';
import type { PropsWithChildren } from 'react';

const SHEET_PHYSICS = { spring: { stiffness: 600, damping: 45 } };
const HERO_PHYSICS = { spring: { stiffness: 350, damping: 32 } };

const fadeTransition = fade({ physics: { spring: { stiffness: 3200, damping: 60 } } });
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
  defaultTransition: fadeTransition,
  transitions: [
    { from: PATHS.ROOT, to: PATHS.LOGIN, transition: fadeTransition, symmetric: true },

    ...sheetPair(PATHS.HOME, PATHS.FEED_CREATE),
    ...sheetPair(PATHS.FEED, PATHS.FEED_CREATE),
    ...sheetPair(PATHS.MY_PAGE, PATHS.FEED_CREATE),

    ...pushPair(PATHS.LOGIN, PATHS.TERMS),
    ...pushPair(PATHS.TERMS, PATHS.ONBOARDING),
    { from: PATHS.ONBOARDING, to: PATHS.HOME, transition: slideForward },

    // OAuth 콜백 → 분기 페이지: push 슬라이드
    { from: PATHS.AUTH_CALLBACK, to: PATHS.TERMS, transition: slideForward },
    { from: PATHS.AUTH_CALLBACK, to: PATHS.ONBOARDING, transition: slideForward },
    { from: PATHS.AUTH_CALLBACK, to: PATHS.HOME, transition: slideForward },

    ...sheetPair(PATHS.HOME, PATHS.TEAM_CREATE),
    ...sheetPair(PATHS.MY_PAGE, PATHS.TEAM_CREATE),
    ...pushPair(PATHS.TEAM_CREATE, PATHS.TEAM_PROFILE_SETUP),

    ...pushPair(PATHS.HOME, '/teams/*'),
    ...pushPair('/teams/*', '/teams/*/invite'),

    { from: PATHS.HOME, to: '/place/*', transition: heroTransition },
    { from: '/place/*', to: PATHS.HOME, transition: heroTransition },
  ],
};

export const TransitionProvider = ({ children }: PropsWithChildren) => (
  <Ssgoi config={ssgoiConfig}>{children}</Ssgoi>
);
