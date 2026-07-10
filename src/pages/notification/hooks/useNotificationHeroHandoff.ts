import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { toSafeImageUrl } from '@/shared/lib/image/normalizeImageUrl';
import {
  clearStoredNotificationHero,
  readStoredNotificationHero,
  storeNotificationHero,
} from '../lib/notificationHeroStorage';
import type { NotificationListItem } from './useNotifications';
import type { NavigationType } from 'react-router';

const STORED_HERO_FADE_DELAY_MS = 120;
const STORED_HERO_CLEAR_DELAY_MS = 260;
const STORED_HERO_MAX_LIFETIME_MS = 5000;
const HERO_FLIGHT_START_GRACE_MS = 300;
const HERO_FLIGHT_MAX_WAIT_MS = 2000;
const STORED_HERO_DEPARTURE_RECOVERY_MS = 1500;

interface UseNotificationHeroHandoffParams {
  navigationType: NavigationType;
  scrollRestored: boolean;
  notifications: NotificationListItem[];
  scrollFrameRef: RefObject<HTMLElement | null>;
}

// ssgoi는 exit 시점에 페이지 DOM을 다시 붙이면서 이너 스크롤 위치가 유실되고, 세로 700px
// 넘게 어긋난 히어로 페어는 조용히 스킵한다. 출발 시 클릭 순간의 화면 좌표에 고정 사본을
// 남기고, 복귀(POP) 시에도 같은 좌표에 사본을 되살려 왕복 히어로의 exit-key를 사본이 대신
// 든다 — FeedPage의 useFeedHeroHandoff와 같은 패턴.
export const useNotificationHeroHandoff = ({
  navigationType,
  scrollRestored,
  notifications,
  scrollFrameRef,
}: UseNotificationHeroHandoffParams) => {
  // 현재 마운트에서 캡처된 출발용 히어로인지 여부 — 복귀 시 sessionStorage에서 복원된 히어로와 구분
  const departureHeroRef = useRef(false);
  // 상세에서 뒤로 돌아온(POP) 경우에만 저장된 히어로를 복원 — 종 아이콘 등 새 진입에선 잔여 히어로 폐기
  const [storedHero, setStoredHero] = useState(() => {
    if (navigationType !== 'POP') {
      clearStoredNotificationHero();
      return null;
    }
    return readStoredNotificationHero();
  });
  const [storedHeroVisible, setStoredHeroVisible] = useState(Boolean(storedHero));

  const hideStoredHero = useCallback(() => {
    setStoredHeroVisible(false);
    setStoredHero(null);
  }, []);

  const dismissStoredHero = useCallback(() => {
    departureHeroRef.current = false;
    clearStoredNotificationHero();
    hideStoredHero();
  }, [hideStoredHero]);

  const suppressedNotificationId = storedHeroVisible ? (storedHero?.notificationId ?? null) : null;
  const isStoredHeroItemLoaded = storedHero
    ? notifications.some((notification) => notification.id === storedHero.notificationId)
    : true;

  useEffect(() => {
    if (!storedHero) return;

    const maxTimeoutId = window.setTimeout(() => {
      dismissStoredHero();
    }, STORED_HERO_MAX_LIFETIME_MS);
    return () => window.clearTimeout(maxTimeoutId);
  }, [dismissStoredHero, storedHero]);

  // 저장 히어로 핸드오프. ssgoi 역방향 비행 중에는 클론이 사본을 덮고 있어 그 밑에서
  // 미리 페이드가 끝나면 클론이 걷힐 때 원본이 "뚝" 나타난다. ssgoi가 비행 동안
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

    const copy = document.querySelector<HTMLElement>('[data-stored-notification-hero]');
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

  const captureNotificationHero = useCallback(
    (notification: NotificationListItem, source: HTMLElement | null) => {
      if (!source) return;
      const thumbnailUrl = toSafeImageUrl(notification.thumbnailUrl);
      if (!thumbnailUrl) return;
      const rect = source.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const frameRect = scrollFrameRef.current?.parentElement?.getBoundingClientRect();
      const nextStoredHero = storeNotificationHero({
        notificationId: notification.id,
        feedId: notification.feedId,
        thumbnailUrl,
        left: frameRect ? rect.left - frameRect.left : rect.left,
        top: frameRect ? rect.top - frameRect.top : rect.top,
        width: rect.width,
        height: rect.height,
      });
      departureHeroRef.current = true;
      flushSync(() => {
        setStoredHeroVisible(true);
        setStoredHero(nextStoredHero);
      });
    },
    [scrollFrameRef],
  );

  return {
    storedHero,
    storedHeroVisible,
    suppressedNotificationId,
    dismissStoredHero,
    captureNotificationHero,
  };
};
