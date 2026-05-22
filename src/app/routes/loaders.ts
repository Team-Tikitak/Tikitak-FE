import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { postRefreshToken } from '@/shared/api/auth/api';
import { authKeys } from '@/shared/api/auth/keys';
import { getAccessToken, setAccessToken } from '@/shared/api/instance';
import { getMe } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { PATHS } from './paths';

export const authCallbackLoader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('accessToken');
  if (accessToken) setAccessToken(accessToken);
  return redirect(PATHS.HOME);
};

export const setupFlowLoader = async ({ request }: LoaderFunctionArgs) => {
  if (!getAccessToken()) {
    await queryClient.fetchQuery({
      queryKey: authKeys.session(),
      queryFn: () =>
        postRefreshToken().then((res) => {
          const accessToken = res.data.data.accessToken;
          setAccessToken(accessToken);
          return accessToken;
        }),
    });
  }

  const me = await queryClient.fetchQuery({
    queryKey: userKeys.me(),
    queryFn: () => getMe().then((res) => res.data.data),
  });
  const url = new URL(request.url);
  if (!me.hasAgreedRequiredTerms && url.pathname !== PATHS.TERMS) {
    return redirect(PATHS.TERMS);
  }
  if (!me.onboardingCompleted && url.pathname !== PATHS.ONBOARDING) {
    return redirect(PATHS.ONBOARDING);
  }
  return null;
};
