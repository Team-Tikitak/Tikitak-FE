import { redirect, type LoaderFunctionArgs } from 'react-router';
import { setAccessToken } from '@/shared/api/instance';
import {
  consumeRedirectAfterLogin,
  REDIRECT_AFTER_LOGIN_KEY,
} from '@/shared/lib/routing/redirectAfterLogin';
import { PATHS } from '../paths';

export { REDIRECT_AFTER_LOGIN_KEY };

export const authCallbackLoader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('accessToken');
  if (accessToken) {
    setAccessToken(accessToken);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', PATHS.HOME);
    }
  }

  const redirectTo = consumeRedirectAfterLogin();
  if (redirectTo) {
    return redirect(redirectTo);
  }

  return redirect(PATHS.HOME);
};
