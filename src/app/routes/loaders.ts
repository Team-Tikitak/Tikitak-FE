import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { postRefreshToken } from '@/shared/api/auth/api';
import { authKeys } from '@/shared/api/auth/keys';
import { getAccessToken, setAccessToken } from '@/shared/api/instance';
import { getInvitationPreview } from '@/shared/api/invitation/api';
import { invitationKeys } from '@/shared/api/invitation/keys';
import { unwrap } from '@/shared/api/request';
import { getAgreements, getMe, getTeams } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { PATHS } from './paths';

export const authCallbackLoader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('accessToken');
  if (accessToken) setAccessToken(accessToken);

  const redirectTo = sessionStorage.getItem('redirectAfterLogin');

  if (redirectTo) {
    sessionStorage.removeItem('redirectAfterLogin');
    return redirect(redirectTo);
  }

  return redirect(PATHS.HOME);
};

export const inviteAcceptLoader = async ({ request }: LoaderFunctionArgs) => {
  const token = new URL(request.url).pathname.split('/invite/')[1];

  try {
    if (!getAccessToken()) {
      await queryClient.fetchQuery({
        queryKey: authKeys.session(),
        queryFn: async () => {
          const { accessToken } = await unwrap(() => postRefreshToken());
          setAccessToken(accessToken);
          return accessToken;
        },
      });
    }

    const [preview, teams] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: invitationKeys.preview(token),
        queryFn: () => unwrap(() => getInvitationPreview(token)),
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.teams(),
        queryFn: async () => (await unwrap(() => getTeams())).teams ?? [],
      }),
    ]);

    const isAlreadyMember = teams.some((team) => team.teamId === preview.teamId);
    if (isAlreadyMember) return redirect(PATHS.HOME);
  } catch {
    // 비로그인 사용자는 정상 흐름
  }
  return null;
};

export const setupFlowLoader = async ({ request }: LoaderFunctionArgs) => {
  if (!getAccessToken()) {
    try {
      await queryClient.fetchQuery({
        queryKey: authKeys.session(),
        queryFn: async () => {
          const { accessToken } = await unwrap(() => postRefreshToken());
          setAccessToken(accessToken);
          return accessToken;
        },
      });
    } catch {
      return redirect(PATHS.LOGIN);
    }
  }

  const [, agreements] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: userKeys.me(),
      queryFn: () => unwrap(() => getMe()),
    }),
    queryClient.fetchQuery({
      queryKey: userKeys.agreements(),
      queryFn: () => unwrap(() => getAgreements()),
      staleTime: 5 * 60 * 1000,
    }),
  ]);

  const hasAgreedAll = agreements.termsAgreed && agreements.privacyAgreed;
  const url = new URL(request.url);
  const isTermsPath = url.pathname === PATHS.TERMS;

  if (!hasAgreedAll && !isTermsPath) {
    return redirect(PATHS.TERMS);
  }
  if (hasAgreedAll && isTermsPath) {
    return redirect(PATHS.ONBOARDING);
  }

  return null;
};
