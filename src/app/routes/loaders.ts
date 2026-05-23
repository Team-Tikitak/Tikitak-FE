import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { postRefreshToken } from '@/shared/api/auth/api';
import { authKeys } from '@/shared/api/auth/keys';
import { getAccessToken, setAccessToken } from '@/shared/api/instance';
import { getInvitationPreview } from '@/shared/api/invitation/api';
import { invitationKeys } from '@/shared/api/invitation/keys';
import { getMe, getTeams } from '@/shared/api/user/api';
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
        queryFn: () =>
          postRefreshToken().then((res) => {
            setAccessToken(res.data.data.accessToken);
            return res.data.data.accessToken;
          }),
      });
    }

    const [preview, teams] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: invitationKeys.preview(token),
        queryFn: () => getInvitationPreview(token).then((res) => res.data.data),
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.teams(),
        queryFn: () => getTeams().then((res) => res.data.data.teams ?? []),
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

  return null;
};
