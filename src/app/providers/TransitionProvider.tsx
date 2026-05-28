import { Ssgoi } from '@ssgoi/react';
import { fade, hero, sheet, slide } from '@ssgoi/react/view-transitions';
import { PATHS } from '@/app/routes';
import type { SsgoiConfig } from '@ssgoi/core/types';
import type { PropsWithChildren } from 'react';

const ssgoiConfig: SsgoiConfig = {
  transitions: [
    // 글 작성 시트
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.HOME }),
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.FEED }),
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.MY_PAGE }),
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.ACTIVITY }),

    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.HOME }),
    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.FEED }),
    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.MY_PAGE }),
    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.ACTIVITY }),

    ...sheet({ enter: PATHS.TEAM_CREATE, exit: PATHS.HOME }),
    ...sheet({ enter: PATHS.TEAM_CREATE, exit: PATHS.MY_PAGE }),

    // 인증 흐름 push (양방향 symmetric)
    ...slide({ paths: [PATHS.LOGIN, PATHS.TERMS] }),
    ...slide({ paths: [PATHS.TERMS, PATHS.ONBOARDING] }),
    ...slide({ paths: [PATHS.ONBOARDING, PATHS.HOME] }),
    ...slide({ paths: [PATHS.AUTH_CALLBACK, PATHS.TERMS] }),
    ...slide({ paths: [PATHS.AUTH_CALLBACK, PATHS.ONBOARDING] }),
    ...slide({ paths: [PATHS.AUTH_CALLBACK, PATHS.HOME] }),

    // 팀 흐름
    ...slide({ paths: [PATHS.TEAM_CREATE, PATHS.TEAM_PROFILE_SETUP] }),
    ...slide({ paths: [PATHS.HOME, '/teams/*'] }),
    ...slide({ paths: [PATHS.MY_PAGE, '/teams/*'] }),
    ...slide({ paths: ['/teams/*', '/teams/*/invite'] }),
    ...slide({ paths: ['/teams/*', PATHS.TEAM_PROFILE_SETUP] }),

    // Hero — 양방향 자동
    ...hero({ paths: [PATHS.HOME, '/place/*'], type: 'static', variant: 'smooth' }),
    ...hero({ paths: [PATHS.FEED, '/feed/*'], type: 'static' }),

    // 그 외 모든 경로 fallback
    ...fade({ paths: ['*'] }),
  ],
};

export const TransitionProvider = ({ children }: PropsWithChildren) => (
  <Ssgoi config={ssgoiConfig}>{children}</Ssgoi>
);
