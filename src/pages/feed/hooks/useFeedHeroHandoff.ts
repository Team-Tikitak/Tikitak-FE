import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { clearStoredFeedHero, readStoredFeedHero, storeFeedHero } from '../lib/feedHeroStorage';
import type { FeedItem } from '../model/types';
import type { NavigationType } from 'react-router';

const STORED_HERO_FADE_DELAY_MS = 120;
const STORED_HERO_CLEAR_DELAY_MS = 260;
const STORED_HERO_MAX_LIFETIME_MS = 5000;
const HERO_FLIGHT_START_GRACE_MS = 300;
const HERO_FLIGHT_MAX_WAIT_MS = 2000;
const STORED_HERO_DEPARTURE_RECOVERY_MS = 1500;

interface UseFeedHeroHandoffParams {
  navigationType: NavigationType;
  isTeamSwitch: boolean;
  scrollRestored: boolean;
  feeds: FeedItem[];
  scrollFrameRef: RefObject<HTMLElement | null>;
}

export const useFeedHeroHandoff = ({
  navigationType,
  isTeamSwitch,
  scrollRestored,
  feeds,
  scrollFrameRef,
}: UseFeedHeroHandoffParams) => {
  // 현재 마운트에서 캡처된 출발용 히어로인지 여부 — 복귀 시 sessionStorage에서 복원된 히어로와 구분
  const departureHeroRef = useRef(false);
  // 상세에서 뒤로 돌아온(POP) 경우에만 저장된 히어로를 복원 — 탭 등 새 진입에선 잔여 히어로 폐기
  const [storedFeedHero, setStoredFeedHero] = useState(() => {
    if (navigationType !== 'POP') {
      clearStoredFeedHero();
      return null;
    }
    return readStoredFeedHero();
  });
  const [storedHeroVisible, setStoredHeroVisible] = useState(Boolean(storedFeedHero));

  const hideStoredHero = useCallback(() => {
    setStoredHeroVisible(false);
    setStoredFeedHero(null);
  }, []);

  const dismissStoredHero = useCallback(() => {
    departureHeroRef.current = false;
    clearStoredFeedHero();
    hideStoredHero();
  }, [hideStoredHero]);

  const suppressedHeroId = storedHeroVisible ? (storedFeedHero?.feedId ?? null) : null;
  const isStoredHeroFeedLoaded = storedFeedHero
    ? feeds.some((feed) => feed.id === storedFeedHero.feedId)
    : true;

  useEffect(() => {
    if (!isTeamSwitch) return;
    clearStoredFeedHero();
  }, [isTeamSwitch]);

  useEffect(() => {
    if (!storedFeedHero) return;

    const maxTimeoutId = window.setTimeout(() => {
      dismissStoredHero();
    }, STORED_HERO_MAX_LIFETIME_MS);
    return () => window.clearTimeout(maxTimeoutId);
  }, [dismissStoredHero, storedFeedHero]);

  // 저장 히어로 핸드오프. ssgoi 역방향 비행 중에는 클론이 타일을 덮고 있어 그 밑에서
  // 미리 페이드인이 끝나면 클론이 걷힐 때 장식이 "뚝" 나타난다. ssgoi가 비행 동안
  // 사본에 inline opacity 0을 걸었다가 착지 시 복원하므로, 그 복원 시점을 기다렸다가
  // 핸드오프(suppress 해제)를 시작한다.
  useEffect(() => {
    if (!storedFeedHero || !scrollRestored || !isStoredHeroFeedLoaded) return;

    let finished = false;
    const timeoutIds: number[] = [];
    const observers: MutationObserver[] = [];
    const schedule = (callback: () => void, ms: number) => {
      timeoutIds.push(window.setTimeout(callback, ms));
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      schedule(() => setStoredHeroVisible(false), STORED_HERO_FADE_DELAY_MS);
      schedule(() => dismissStoredHero(), STORED_HERO_CLEAR_DELAY_MS);
    };

    const copy = document.querySelector<HTMLElement>('[data-stored-feed-hero]');
    const isInFlight = () => copy?.style.opacity === '0';
    const observeStyle = (onChange: () => void) => {
      if (!copy) return;
      const observer = new MutationObserver(onChange);
      observer.observe(copy, { attributes: true, attributeFilter: ['style'] });
      observers.push(observer);
    };
    const waitForLanding = () => {
      observeStyle(() => {
        if (!isInFlight()) finish();
      });
      schedule(finish, HERO_FLIGHT_MAX_WAIT_MS);
    };

    if (departureHeroRef.current) {
      // 출발용 히어로(이 페이지에서 방금 캡처)는 핸드오프하지 않고, 탭이 취소된 경우만 늦게 복구.
      schedule(finish, STORED_HERO_DEPARTURE_RECOVERY_MS);
    } else if (!copy) {
      finish();
    } else if (isInFlight()) {
      waitForLanding();
    } else {
      let flightStarted = false;
      observeStyle(() => {
        if (!flightStarted && isInFlight()) {
          flightStarted = true;
          waitForLanding();
        }
      });
      schedule(() => {
        if (!flightStarted) finish();
      }, HERO_FLIGHT_START_GRACE_MS);
    }

    return () => {
      for (const id of timeoutIds) window.clearTimeout(id);
      for (const observer of observers) observer.disconnect();
    };
  }, [dismissStoredHero, isStoredHeroFeedLoaded, scrollRestored, storedFeedHero]);

  const captureFeedHero = useCallback(
    (item: FeedItem, source: HTMLElement) => {
      const rect = source.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const frameRect = scrollFrameRef.current?.parentElement?.getBoundingClientRect();
      const localRect = frameRect
        ? new DOMRect(rect.left - frameRect.left, rect.top - frameRect.top, rect.width, rect.height)
        : rect;
      const nextStoredFeedHero = storeFeedHero(item, localRect);
      departureHeroRef.current = true;
      flushSync(() => {
        setStoredHeroVisible(true);
        setStoredFeedHero(nextStoredFeedHero);
      });
    },
    [scrollFrameRef],
  );

  return {
    storedFeedHero,
    storedHeroVisible,
    suppressedHeroId,
    hideStoredHero,
    dismissStoredHero,
    captureFeedHero,
  };
};
