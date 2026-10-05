import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { setAccessToken } from '@/shared/api/instance';
import { clearPersistedQueryCache } from '@/shared/api/queryCachePersist';
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
    // 새 로그인이므로 이전 계정의 영속 캐시를 먼저 비운다
    clearPersistedQueryCache(queryClient);
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
