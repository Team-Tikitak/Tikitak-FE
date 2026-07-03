import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toInviteAccept } from '@/app/routes/paths';

// Universal Link로 앱이 열리면 초대 수락 화면으로 라우팅(앱 미설치 시엔 OS가 웹으로 보냄)
// AASA "/invite/*"가 다중 세그먼트도 앱으로 보내므로, 끝 앵커 없이 첫 세그먼트를 토큰으로 잡아 계약을 맞춘다.
const parseInviteToken = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Universal Link: https://app.tikitak.space/invite/<token>
    const pathMatch = parsed.pathname.match(/^\/invite\/([^/]+)/);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);
    // 커스텀 스킴: tikitak://invite/<token> (host='invite', pathname='/<token>')
    if (parsed.hostname === 'invite') {
      const [segment] = parsed.pathname.replace(/^\//, '').split('/');
      if (segment) return decodeURIComponent(segment);
    }
    return null;
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
