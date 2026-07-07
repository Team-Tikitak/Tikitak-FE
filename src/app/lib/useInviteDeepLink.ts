import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getInviteAcceptPathFromUrl } from '@/shared/lib/routing/inviteDeepLink';

export const useInviteDeepLink = (): void => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const openInvite = (url: string) => {
      const invitePath = getInviteAcceptPathFromUrl(url);
      if (invitePath) navigate(invitePath);
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
