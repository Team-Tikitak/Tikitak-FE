import { useEffect, useRef } from 'react';

interface UseInfiniteScrollParams {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void | Promise<unknown>;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.1,
  rootMargin = '200px',
}: UseInfiniteScrollParams) => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });

  useEffect(() => {
    callbacksRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const target = observerRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const {
          hasNextPage: canFetchNextPage,
          isFetchingNextPage: loadingNextPage,
          fetchNextPage: fetchNext,
        } = callbacksRef.current;

        if (entry?.isIntersecting && canFetchNextPage && !loadingNextPage) {
          void fetchNext();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { observerRef };
};
