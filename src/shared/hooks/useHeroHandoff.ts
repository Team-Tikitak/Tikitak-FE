import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { clearStoredHero, readStoredHero, storeHero } from '@/shared/lib/hero/heroStorage';
import type { NavigationType } from 'react-router';

const STORED_HERO_FADE_DELAY_MS = 120;
const STORED_HERO_CLEAR_DELAY_MS = 260;
const STORED_HERO_MAX_LIFETIME_MS = 5000;
const HERO_FLIGHT_START_GRACE_MS = 300;
const HERO_FLIGHT_MAX_WAIT_MS = 2000;
const STORED_HERO_DEPARTURE_RECOVERY_MS = 1500;
const STORED_HERO_CLONE_SELECTOR = '[data-stored-hero]';

export interface HeroSourceItem {
  id: string;
  heroKey: string;
  thumbnailUrl: string;
  heroPreviewUrl?: string;
}

interface UseHeroHandoffParams {
  storageKey: string;
  navigationType: NavigationType;
  scrollRestored: boolean;
  isItemLoaded: (itemId: string) => boolean;
  scrollFrameRef: RefObject<HTMLElement | null>;
  heroCoordinateMode?: 'frame' | 'scroll-content';
  // 팀 전환처럼 목록의 맥락 자체가 바뀌는 시점에 남은 히어로를 버려야 하는 페이지만 넘긴다
  shouldResetOnContextChange?: boolean;
}

// 목록 썸네일 ↔ 상세 사이 hero 전환의 왕복(특히 뒤로가기) 구간을 매끄럽게 만드는 공용 훅.
// 출발 시 클릭 순간의 화면 좌표에 고정 사본을 sessionStorage에 남기고, 복귀(POP) 시 같은
// 좌표에 사본을 되살려 왕복 히어로의 exit-key를 사본이 대신 든다. feed/notification 페이지에서
// 거의 동일한 로직이 반복되던 것을 여기로 추출했다.
export const useHeroHandoff = ({
  storageKey,
  navigationType,
  scrollRestored,
  isItemLoaded,
  scrollFrameRef,
  heroCoordinateMode = 'frame',
  shouldResetOnContextChange = false,
}: UseHeroHandoffParams) => {
  // 현재 마운트에서 캡처된 출발용 히어로인지 여부 — 복귀 시 sessionStorage에서 복원된 히어로와 구분
  const departureHeroRef = useRef(false);
  // 상세에서 뒤로 돌아온(POP) 경우에만 저장된 히어로를 복원 — 탭 등 새 진입에선 잔여 히어로 폐기
  const [storedHero, setStoredHero] = useState(() => {
    if (navigationType !== 'POP') {
      clearStoredHero(storageKey);
      return null;
    }
    return readStoredHero(storageKey);
  });
  const [storedHeroVisible, setStoredHeroVisible] = useState(Boolean(storedHero));
  const [isDepartureHero, setIsDepartureHero] = useState(false);

  const hideStoredHero = useCallback(() => {
    setStoredHeroVisible(false);
    setStoredHero(null);
  }, []);

  const dismissStoredHero = useCallback(() => {
    departureHeroRef.current = false;
    setIsDepartureHero(false);
    clearStoredHero(storageKey);
    hideStoredHero();
  }, [hideStoredHero, storageKey]);

  const suppressedItemId =
    storedHeroVisible && !isDepartureHero ? (storedHero?.itemId ?? null) : null;
  const isStoredHeroItemLoaded = storedHero ? isItemLoaded(storedHero.itemId) : true;

  useEffect(() => {
    if (!shouldResetOnContextChange) return;
    clearStoredHero(storageKey);
  }, [shouldResetOnContextChange, storageKey]);

  useEffect(() => {
    if (!storedHero) return;

    const maxTimeoutId = window.setTimeout(() => {
      dismissStoredHero();
    }, STORED_HERO_MAX_LIFETIME_MS);
    return () => window.clearTimeout(maxTimeoutId);
  }, [dismissStoredHero, storedHero]);

  // 저장 히어로 핸드오프. ssgoi 역방향 비행 중에는 클론이 타일을 덮고 있어 그 밑에서
  // 미리 페이드인이 끝나면 클론이 걷힐 때 장식이 "뚝" 나타난다. ssgoi가 비행 동안
  // 사본에 inline opacity 0을 걸었다가 착지 시 복원하므로, 그 복원 시점을 기다렸다가
  // 핸드오프(suppress 해제)를 시작한다.
  useEffect(() => {
    if (!storedHero || !scrollRestored || !isStoredHeroItemLoaded) return;

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

    const copy = document.querySelector<HTMLElement>(STORED_HERO_CLONE_SELECTOR);
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
  }, [dismissStoredHero, isStoredHeroItemLoaded, scrollRestored, storedHero]);

  const captureHero = useCallback(
    (item: HeroSourceItem, source: HTMLElement | null) => {
      if (!source || !item.thumbnailUrl) return;
      const rect = source.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const scrollFrame = scrollFrameRef.current;
      const frameRect =
        heroCoordinateMode === 'scroll-content'
          ? scrollFrame?.getBoundingClientRect()
          : scrollFrame?.parentElement?.getBoundingClientRect();
      const localRect = frameRect
        ? new DOMRect(
            rect.left -
              frameRect.left +
              (heroCoordinateMode === 'scroll-content' ? (scrollFrame?.scrollLeft ?? 0) : 0),
            rect.top -
              frameRect.top +
              (heroCoordinateMode === 'scroll-content' ? (scrollFrame?.scrollTop ?? 0) : 0),
            rect.width,
            rect.height,
          )
        : rect;
      const nextStoredHero = storeHero(storageKey, {
        itemId: item.id,
        heroKey: item.heroKey,
        thumbnailUrl: item.thumbnailUrl,
        heroPreviewUrl: item.heroPreviewUrl ?? '',
        left: localRect.left,
        top: localRect.top,
        width: localRect.width,
        height: localRect.height,
      });
      departureHeroRef.current = true;
      flushSync(() => {
        setIsDepartureHero(true);
        setStoredHeroVisible(true);
        setStoredHero(nextStoredHero);
      });
    },
    [heroCoordinateMode, scrollFrameRef, storageKey],
  );

  return {
    storedHero,
    storedHeroVisible,
    suppressedItemId,
    hideStoredHero,
    dismissStoredHero,
    captureHero,
  };
};
