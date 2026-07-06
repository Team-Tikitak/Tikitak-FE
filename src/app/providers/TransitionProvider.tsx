import { Ssgoi, type SsgoiConfig } from '@ssgoi/react';
import { fade, hero, scroll, sheet, slide } from '@ssgoi/react/view-transitions';
import { PATHS } from '@/app/routes/paths';
import { consumeFeedDeleting } from '@/shared/lib/storage/deleteContextStorage';
import type { PropsWithChildren } from 'react';

const ssgoiConfig: SsgoiConfig = {
  transitions: [
    // Compose sheets
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.HOME }),
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.FEED }),
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.MY_PAGE }),
    ...sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.ACTIVITY }),

    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.HOME }),
    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.FEED }),
    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.MY_PAGE }),
    ...sheet({ enter: PATHS.DAILY_FEED_CREATE, exit: PATHS.ACTIVITY }),

    ...sheet({ enter: PATHS.TEAM_CREATE, exit: PATHS.HOME }),
    ...sheet({ enter: PATHS.TEAM_CREATE, exit: PATHS.FEED }),
    ...sheet({ enter: PATHS.TEAM_CREATE, exit: PATHS.ACTIVITY }),
    ...sheet({ enter: PATHS.TEAM_CREATE, exit: PATHS.MY_PAGE }),

    // Auth flow
    ...slide({ paths: [PATHS.LOGIN, PATHS.TERMS] }),
    ...slide({ paths: [PATHS.TERMS, '/terms/*'] }),
    ...slide({ paths: [PATHS.TERMS, PATHS.ONBOARDING] }),
    ...slide({ paths: [PATHS.ONBOARDING, PATHS.HOME] }),
    ...slide({ paths: [PATHS.AUTH_CALLBACK, PATHS.TERMS] }),
    ...slide({ paths: [PATHS.AUTH_CALLBACK, PATHS.ONBOARDING] }),
    ...slide({ paths: [PATHS.AUTH_CALLBACK, PATHS.HOME] }),

    // Team flow
    ...slide({ paths: [PATHS.TEAM_CREATE, PATHS.TEAM_PROFILE_SETUP] }),
    ...slide({ paths: [PATHS.HOME, '/teams/*'] }),
    ...slide({ paths: [PATHS.MY_PAGE, '/teams/*'] }),
    ...slide({ paths: [PATHS.TEAM_DETAIL, PATHS.TEAM_INVITE] }),
    ...slide({ paths: ['/teams/*', PATHS.TEAM_PROFILE_SETUP] }),

    // Notification enters from above when opened from the main tabs.
    ...scroll({ paths: [PATHS.NOTIFICATION, PATHS.HOME] }),
    ...scroll({ paths: [PATHS.NOTIFICATION, PATHS.FEED] }),
    ...scroll({ paths: [PATHS.NOTIFICATION, PATHS.ACTIVITY] }),
    ...scroll({ paths: [PATHS.NOTIFICATION, PATHS.MY_PAGE] }),

    // Home <-> place: Home renders a placeholder target before Kakao map pins mount.
    ...hero({ paths: [PATHS.HOME, '/place/*'], type: 'static', variant: 'default' }),

    ...hero({ paths: [PATHS.FEED, '/feed/*'], type: 'static' }),

    ...hero({ paths: [PATHS.NOTIFICATION, '/feed/*'], type: 'static' }),

    ...slide({ paths: [PATHS.ACTIVITY, '/feed/*'] }),

    ...fade({ paths: ['*'] }),
  ],
  middleware: (from, to) => {
    if (from.startsWith('/feed/') && to === PATHS.FEED && consumeFeedDeleting()) {
      return { from: '__feed-delete__', to: PATHS.FEED };
    }
    return { from, to };
  },
};

export const TransitionProvider = ({ children }: PropsWithChildren) => (
  <Ssgoi config={ssgoiConfig}>{children}</Ssgoi>
);
