const OAUTH_LINK_HOST = 'app.tikitak.space';
const OAUTH_CALLBACK_PATH = '/oauth/callback';

const normalizePath = (pathname: string) => pathname.replace(/\/$/, '');

// 앱 흐름 콜백은 `tikitak://oauth/callback?loginCode={code}`로 복귀한다 (웹 흐름은 accessToken이라 제외).
// host/path 검사는 오처리 차단이고 주입은 못 막는다 — intent-filter가 exported라 정규 URL은 누구나 보낼 수 있다.
export const parseLoginCode = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === 'https:' && parsed.hostname === OAUTH_LINK_HOST) {
      if (normalizePath(parsed.pathname) !== OAUTH_CALLBACK_PATH) return null;
      return parsed.searchParams.get('loginCode');
    }

    if (parsed.protocol === 'tikitak:' && parsed.hostname === 'oauth') {
      if (normalizePath(parsed.pathname) !== '/callback') return null;
      return parsed.searchParams.get('loginCode');
    }

    return null;
  } catch {
    return null;
  }
};
