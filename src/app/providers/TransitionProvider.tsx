import {
  MultiAnimation,
  Ssgoi,
  WebAnimation,
  type SsgoiConfig,
  type SsgoiPathTransition,
} from '@ssgoi/react';
import { fade, hero, sheet, slide } from '@ssgoi/react/view-transitions';
import { PATHS } from '@/app/routes/paths';
import { consumeFeedDeleting } from '@/shared/lib/storage/deleteContextStorage';
import { topSheet } from './topSheet';
import type { PropsWithChildren } from 'react';

const TAB_FADE_DURATION_MS = 80;
const SLIDE_DURATION_MS = 500;
// WebAnimation samples at 60 Hz and adds two settled frames after reaching the target.
const SETTLE_OVERHEAD_MS = (2 * 1000) / 60;
const tabPaths = [PATHS.HOME, PATHS.FEED, PATHS.ACTIVITY, PATHS.MY_PAGE];

const timedTransition = (duration: number, direction?: number) => ({
  animation: ({ from: outgoing, to: incoming }: { from: HTMLElement; to: HTMLElement }) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return new MultiAnimation([]);
    }

    const integrator = () => ({
      step: ({ position }: { position: number }, target: number, dt: number) => ({
        position:
          position +
          Math.sign(target - position) *
            Math.min(Math.abs(target - position), (dt * 1000) / (duration - SETTLE_OVERHEAD_MS)),
        velocity: 0,
      }),
      isSettled: ({ position }: { position: number }, target: number) =>
        Math.abs(position - target) < 1e-9,
    });
    outgoing.inert = true;
    incoming.inert = false;

    return new MultiAnimation([
      new WebAnimation({
        element: outgoing,
        integrator: integrator(),
        style: (t): Record<string, string | number> =>
          direction
            ? { transform: `translate3d(${-direction * 100 * (1 - (1 - t) ** 2)}%, 0, 0)` }
            : { opacity: 1 - t },
        onComplete: () => {
          outgoing.inert = false;
        },
      }),
      new WebAnimation({
        element: incoming,
        integrator: integrator(),
        style: (t): Record<string, string | number> =>
          direction
            ? { transform: `translate3d(${direction * 100 * (1 - t) ** 2}%, 0, 0)` }
            : { opacity: t },
      }),
    ]);
  },
});

const tabTransitions = fade({ paths: tabPaths }).map((rule) => ({
  ...rule,
  transition: timedTransition(TAB_FADE_DURATION_MS),
}));

const fastSlide = (paths: [string, string]) =>
  slide({ paths }).map((rule) => ({
    ...rule,
    transition: timedTransition(SLIDE_DURATION_MS, rule.from === paths[0] ? 1 : -1),
  }));

// 끝난 전환 남겨두면 다음 전환이 이 페이지를 inline opacity로 숨기지 못해 히어로 중 이전 화면이 비침
const isSettled = (animation: Animation) =>
  animation.playState === 'finished' || animation.effect?.getComputedTiming().progress === 1;

const releaseFinishedAnimations = (element: HTMLElement) => {
  for (const animation of element.getAnimations?.() ?? []) {
    if (isSettled(animation)) animation.cancel();
  }
};

// 나가는 페이지는 다시 붙거나, 복제되면서 CSS 애니메이션이 처음부터 다시 재생됨
const finishReplayedCssAnimations = (element: HTMLElement) => {
  for (const animation of element.getAnimations?.({ subtree: true }) ?? []) {
    if (!('animationName' in animation)) continue;
    if (animation.effect?.getComputedTiming().endTime === Infinity) continue;
    animation.finish();
  }
};

const withReleasedAnimations = (rule: SsgoiPathTransition): SsgoiPathTransition => {
  const { animation } = rule.transition;
  return {
    ...rule,
    transition: {
      ...rule.transition,
      animation: (args) => {
        releaseFinishedAnimations(args.from);
        finishReplayedCssAnimations(args.from);
        return animation(args);
      },
    },
  };
};

const ssgoiConfig: SsgoiConfig = {
  transitions: [
    ...tabTransitions,
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
    ...fastSlide([PATHS.INVITE_ACCEPT, PATHS.LOGIN]),
    ...fastSlide([PATHS.INVITE_ACCEPT, PATHS.HOME]),
    ...fastSlide([PATHS.LOGIN, PATHS.TERMS]),
    ...fastSlide([PATHS.TERMS, '/terms/*']),
    ...fastSlide([PATHS.TERMS, PATHS.ONBOARDING]),
    ...fastSlide([PATHS.ONBOARDING, PATHS.HOME]),
    ...fastSlide([PATHS.AUTH_CALLBACK, PATHS.TERMS]),
    ...fastSlide([PATHS.AUTH_CALLBACK, PATHS.ONBOARDING]),
    ...fastSlide([PATHS.AUTH_CALLBACK, PATHS.HOME]),
    ...fastSlide([PATHS.MY_PAGE, PATHS.LOGIN]),

    // Team flow
    ...fastSlide([PATHS.INVITE_ACCEPT, PATHS.TEAM_PROFILE_SETUP]),
    ...fastSlide([PATHS.TEAM_CREATE, PATHS.TEAM_PROFILE_SETUP]),
    ...fastSlide([PATHS.HOME, '/teams/*']),
    ...fastSlide([PATHS.MY_PAGE, '/teams/*']),
    ...fastSlide([PATHS.MY_PAGE, '/terms/*']),
    ...fastSlide([PATHS.TEAM_DETAIL, PATHS.TEAM_INVITE]),
    ...fastSlide(['/teams/*', PATHS.TEAM_PROFILE_SETUP]),

    // Notification opens like the compose sheets, but mirrored: descends from the top.
    ...topSheet({ enter: PATHS.NOTIFICATION, exit: PATHS.HOME }),
    ...topSheet({ enter: PATHS.NOTIFICATION, exit: PATHS.FEED }),
    ...topSheet({ enter: PATHS.NOTIFICATION, exit: PATHS.ACTIVITY }),
    ...topSheet({ enter: PATHS.NOTIFICATION, exit: PATHS.MY_PAGE }),

    // Home <-> place: Home renders a placeholder target before Kakao map pins mount.
    ...hero({ paths: [PATHS.HOME, '/place/*'], type: 'static', variant: 'default' }),

    ...hero({ paths: [PATHS.FEED, '/feed/*'], type: 'static' }),

    ...hero({ paths: [PATHS.NOTIFICATION, '/feed/*'], type: 'static' }),

    ...hero({ paths: [PATHS.ACTIVITY, '/activity/*'], type: 'static' }),

    ...fastSlide([PATHS.ACTIVITY, '/feed/*']),

    ...fade({ paths: ['*'] }),
  ].map(withReleasedAnimations),
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
