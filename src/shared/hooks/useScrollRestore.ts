import { type UIEvent, useEffect, useRef } from 'react';
import { safeSessionGet, safeSessionSet } from '@/shared/lib/storage/sessionStore';

const MAX_RESTORE_ATTEMPTS = 8;

const readScrollTop = (key: string) => {
  const value = safeSessionGet(key);
  const scrollTop = value ? Number(value) : 0;

  return Number.isFinite(scrollTop) ? scrollTop : 0;
};

const storeScrollTop = (key: string, scrollTop: number) => {
  safeSessionSet(key, String(Math.max(0, Math.round(scrollTop))));
};

interface UseScrollRestoreOptions {
  ready: boolean;
  contentSignal: unknown;
}

export const useScrollRestore = (
  key: string | null,
  { ready, contentSignal }: UseScrollRestoreOptions,
) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoredKeyRef = useRef<string | null>(null);
  const pendingFrameRef = useRef<number | null>(null);
  const pendingKeyRef = useRef<string | null>(null);
  const latestTopRef = useRef(0);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!key) return;
    const scrollTop = event.currentTarget.scrollTop;
    pendingKeyRef.current = key;
    latestTopRef.current = scrollTop;
    if (pendingFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingFrameRef.current);
    }
    pendingFrameRef.current = window.requestAnimationFrame(() => {
      storeScrollTop(key, scrollTop);
      pendingFrameRef.current = null;
    });
  };

  useEffect(
    () => () => {
      if (pendingFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingFrameRef.current);
        if (pendingKeyRef.current) {
          storeScrollTop(pendingKeyRef.current, latestTopRef.current);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!key || !ready || restoredKeyRef.current === key) return;

    const savedScrollTop = readScrollTop(key);
    if (savedScrollTop <= 0) {
      restoredKeyRef.current = key;
      return;
    }

    let frame = 0;
    let attempts = 0;

    const restore = () => {
      const container = scrollRef.current;
      if (!container) return;

      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
      if (maxScrollTop >= savedScrollTop || attempts >= MAX_RESTORE_ATTEMPTS) {
        container.scrollTop = Math.min(savedScrollTop, maxScrollTop);
        restoredKeyRef.current = key;
        return;
      }

      attempts += 1;
      frame = window.requestAnimationFrame(restore);
    };

    frame = window.requestAnimationFrame(restore);

    return () => window.cancelAnimationFrame(frame);
  }, [key, ready, contentSignal]);

  return { scrollRef, handleScroll };
};
