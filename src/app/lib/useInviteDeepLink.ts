import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toInviteAccept } from '@/app/routes/paths';

// Universal Link로 앱이 열리면 초대 수락 화면으로 라우팅(앱 미설치 시엔 OS가 웹으로 보냄)
const parseInviteToken = (url: string): string | null => {
  try {
    const match = new URL(url).pathname.match(/^\/invite\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

export const useInviteDeepLink = (): void => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const openInvite = (url: string) => {
      const token = parseInviteToken(url);
      if (token) navigate(toInviteAccept(token));
    };

    // 콜드스타트: 링크로 앱이 실행된 경우 최초 URL 처리
    void App.getLaunchUrl().then((launch) => {
      if (launch?.url) openInvite(launch.url);
    });

    // 이미 실행 중일 때 링크로 진입
    const listener = App.addListener('appUrlOpen', ({ url }) => openInvite(url));

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [navigate]);
};
