import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export const DESKTOP_WEB_MEDIA_QUERY = '(min-width: 768px) and (hover: hover) and (pointer: fine)';

const getDesktopMediaQuery = (): MediaQueryList | null => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(DESKTOP_WEB_MEDIA_QUERY);
};

export const isDesktopWeb = (): boolean => {
  if (Capacitor.isNativePlatform()) return false;
  return getDesktopMediaQuery()?.matches ?? false;
};

export const useDesktopWebGate = (): boolean => {
  const [isBlocked, setIsBlocked] = useState(isDesktopWeb);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      return;
    }

    const mediaQuery = getDesktopMediaQuery();
    if (!mediaQuery) {
      return;
    }

    const updateBlocked = () => setIsBlocked(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateBlocked);

    return () => {
      mediaQuery.removeEventListener('change', updateBlocked);
    };
  }, []);

  return isBlocked;
};
