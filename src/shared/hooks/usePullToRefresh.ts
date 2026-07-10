import { useCallback, useRef, useState, type RefObject, type TouchEvent } from 'react';

const DEFAULT_REFRESH_THRESHOLD = 72;
const DEFAULT_MAX_PULL_DISTANCE = 96;
const PULL_RESISTANCE = 0.5;

interface UsePullToRefreshOptions {
  scrollRef: RefObject<HTMLElement | null>;
  onRefresh: () => Promise<unknown> | unknown;
  disabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
}

export const usePullToRefresh = ({
  scrollRef,
  onRefresh,
  disabled = false,
  threshold = DEFAULT_REFRESH_THRESHOLD,
  maxPullDistance = DEFAULT_MAX_PULL_DISTANCE,
}: UsePullToRefreshOptions) => {
  const startYRef = useRef(0);
  const trackingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resetPull = useCallback(() => {
    trackingRef.current = false;
    startYRef.current = 0;
    setPullDistance(0);
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      const scrollElement = scrollRef.current;
      if (disabled || isRefreshing || !scrollElement || scrollElement.scrollTop > 0) return;
      if (event.touches.length !== 1) return;

      trackingRef.current = true;
      startYRef.current = event.touches[0].clientY;
    },
    [disabled, isRefreshing, scrollRef],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      const scrollElement = scrollRef.current;
      if (!trackingRef.current || disabled || isRefreshing || !scrollElement) return;

      if (scrollElement.scrollTop > 0) {
        resetPull();
        return;
      }

      const deltaY = event.touches[0].clientY - startYRef.current;
      if (deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      setPullDistance(Math.min(maxPullDistance, deltaY * PULL_RESISTANCE));
    },
    [disabled, isRefreshing, maxPullDistance, resetPull, scrollRef],
  );

  const handleTouchEnd = useCallback(() => {
    if (!trackingRef.current) return;
    trackingRef.current = false;

    if (pullDistance < threshold || disabled || isRefreshing) {
      setPullDistance(0);
      return;
    }

    setIsRefreshing(true);
    setPullDistance(threshold);

    void Promise.resolve(onRefresh()).finally(() => {
      setIsRefreshing(false);
      setPullDistance(0);
    });
  }, [disabled, isRefreshing, onRefresh, pullDistance, threshold]);

  const handleTouchCancel = useCallback(() => {
    if (isRefreshing) return;
    resetPull();
  }, [isRefreshing, resetPull]);

  return {
    pullDistance,
    threshold,
    isRefreshing,
    isActive: isRefreshing || pullDistance > 0,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
};
