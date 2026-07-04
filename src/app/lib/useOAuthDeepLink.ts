import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';
import { useLoginCodeExchange } from '@/shared/api/auth/queries';

const parseLoginCode = (url: string): string | null => {
  try {
    return new URL(url).searchParams.get('loginCode');
  } catch {
    return null;
  }
};

export const useOAuthDeepLink = (): void => {
  const { mutate } = useLoginCodeExchange();
  const handledLoginCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const exchangeLoginCode = (url: string) => {
      const loginCode = parseLoginCode(url);
      if (!loginCode || handledLoginCodeRef.current === loginCode) return;

      void Browser.close().catch(() => undefined);
      handledLoginCodeRef.current = loginCode;
      mutate(loginCode, {
        onError: () => {
          handledLoginCodeRef.current = null;
        },
      });
    };

    void App.getLaunchUrl()
      .then((launch) => {
        if (launch?.url) exchangeLoginCode(launch.url);
      })
      .catch(() => undefined);

    const listener = App.addListener('appUrlOpen', ({ url }) => exchangeLoginCode(url));

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [mutate]);
};
