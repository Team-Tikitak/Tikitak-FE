import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { setAccessToken } from '@/shared/api/instance';
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
  const me = await queryClient.fetchQuery({
    queryKey: userKeys.me(),
    queryFn: () => getMe().then((res) => res.data.data),
  });
  const url = new URL(request.url);
  if (!me.hasAgreedRequiredTerms && url.pathname !== PATHS.TERMS) {
    return redirect(PATHS.TERMS);
  }
  // TODO: 백엔드 `hasCompletedOnboarding` 도입 후 분기 추가
  return null;
};
