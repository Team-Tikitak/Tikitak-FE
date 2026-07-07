import {
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
} from '@/shared/lib/storage/sessionStore';

export const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin';

export const isSafeInternalPath = (path: string): boolean => {
  if (typeof path !== 'string' || !path.startsWith('/')) return false;
  if (path.startsWith('//') || path.startsWith('/\\')) return false;
  if ([...path].some((ch) => ch.charCodeAt(0) <= 0x1f || ch.charCodeAt(0) === 0x7f)) {
    return false;
  }

  try {
    const url = new URL(path, 'https://placeholder.invalid');
    return url.origin === 'https://placeholder.invalid';
  } catch {
    return false;
  }
};

export const saveRedirectAfterLogin = (path: string): void => {
  if (isSafeInternalPath(path)) {
    safeSessionSet(REDIRECT_AFTER_LOGIN_KEY, path);
  }
};

export const consumeRedirectAfterLogin = (): string | null => {
  const redirectTo = safeSessionGet(REDIRECT_AFTER_LOGIN_KEY);
  safeSessionRemove(REDIRECT_AFTER_LOGIN_KEY);

  return redirectTo && isSafeInternalPath(redirectTo) ? redirectTo : null;
};
