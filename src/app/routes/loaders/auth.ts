import { redirect, type LoaderFunctionArgs } from 'react-router';
import { setAccessToken } from '@/shared/api/instance';
import { PATHS } from '../paths';

const isSafeInternalPath = (path: string): boolean => {
  if (typeof path !== 'string' || !path.startsWith('/')) return false;
  if (path.startsWith('//') || path.startsWith('/\\')) return false;
  if ([...path].some((ch) => ch.charCodeAt(0) <= 0x1f || ch.charCodeAt(0) === 0x7f)) return false;
  try {
    const url = new URL(path, 'https://placeholder.invalid');
    return url.origin === 'https://placeholder.invalid';
  } catch {
    return false;
  }
};

export const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin';

export const authCallbackLoader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('accessToken');
  if (accessToken) {
    setAccessToken(accessToken);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', PATHS.HOME);
    }
  }

  const redirectTo = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
  sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);

  if (redirectTo && isSafeInternalPath(redirectTo)) {
    return redirect(redirectTo);
  }

  return redirect(PATHS.HOME);
};
