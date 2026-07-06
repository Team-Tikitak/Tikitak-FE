import axios from 'axios';
import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { postRefreshToken } from '@/shared/api/auth/api';
import { authKeys } from '@/shared/api/auth/keys';
import { getFeeds } from '@/shared/api/feed/api';
import { feedKeys } from '@/shared/api/feed/keys';
import { feedDetailQueryOptions } from '@/shared/api/feed/queries';
import { getAccessToken, setAccessToken } from '@/shared/api/instance';
import { getInvitationPreview } from '@/shared/api/invitation/api';
import { invitationKeys } from '@/shared/api/invitation/keys';
import { unwrap } from '@/shared/api/request';
import { teamDetailQueryOptions } from '@/shared/api/team/queries';
import { getAgreements, getMe, getTeams } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { PATHS } from './paths';

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

export const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

const parsePositiveIntegerParam = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const ensureMe = () =>
  queryClient.ensureQueryData({
    queryKey: userKeys.me(),
    queryFn: () => unwrap(() => getMe()),
    staleTime: 5 * 60 * 1000,
  });

const ensureSessionAccessToken = () =>
  queryClient.ensureQueryData({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { accessToken } = await unwrap(() => postRefreshToken());
      setAccessToken(accessToken);
      return accessToken;
    },
  });

const getHttpStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

const ensureAuthenticatedForLoader = async () => {
  if (getAccessToken()) return;

  try {
    await ensureSessionAccessToken();
  } catch (error) {
    const status = getHttpStatus(error);
    if (status !== undefined && status >= 400 && status < 500) {
      throw redirect(PATHS.LOGIN);
    }
    throw error;
  }
};

const ensureActiveTeamId = async () => {
  const me = await ensureMe();
  return me.activeTeamId;
};

export const inviteAcceptLoader = async ({ request }: LoaderFunctionArgs) => {
  const token = new URL(request.url).pathname.split('/invite/')[1];

  if (token && typeof window !== 'undefined') {
    sessionStorage.setItem(PENDING_INVITE_TOKEN_KEY, token);
  }

  try {
    if (!getAccessToken()) {
      await ensureSessionAccessToken();
    }

    const [preview, teams, me, agreements] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: invitationKeys.preview(token),
        queryFn: () => unwrap(() => getInvitationPreview(token)),
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.teams(),
        queryFn: async () => (await unwrap(() => getTeams())).teams ?? [],
      }),
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

    const isAlreadyMember = teams.some((team) => team.teamId === preview.teamId);
    if (isAlreadyMember) {
      sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
      if (!agreements.termsAgreed || !agreements.privacyAgreed) {
        return redirect(PATHS.TERMS);
      }
      return redirect(me.onboardingCompleted ? PATHS.HOME : PATHS.ONBOARDING);
    }

    if (!agreements.termsAgreed || !agreements.privacyAgreed) {
      return redirect(PATHS.TERMS);
    }
    if (!me.onboardingCompleted) {
      return redirect(PATHS.ONBOARDING);
    }
  } catch {
    // 비로그인 사용자는 정상 흐름
  }
  return null;
};

export const setupFlowLoader = async ({ request }: LoaderFunctionArgs) => {
  if (!getAccessToken()) {
    try {
      await ensureSessionAccessToken();
    } catch (error) {
      // 4xx(세션 없음·무효: 400/401/403 등) → 로그인, 5xx·네트워크는 에러 바운더리로
      const status = getHttpStatus(error);
      if (status !== undefined && status >= 400 && status < 500) {
        return redirect(PATHS.LOGIN);
      }
      throw error;
    }
  }

  const [me, agreements] = await Promise.all([
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
  const isOnboardingPath = url.pathname === PATHS.ONBOARDING;

  if (!hasAgreedAll && !isTermsPath) {
    return redirect(PATHS.TERMS);
  }
  if (hasAgreedAll && isTermsPath) {
    return redirect(me.onboardingCompleted ? PATHS.HOME : PATHS.ONBOARDING);
  }
  if (hasAgreedAll && !me.onboardingCompleted && !isOnboardingPath) {
    return redirect(PATHS.ONBOARDING);
  }
  if (me.onboardingCompleted && isOnboardingPath) {
    return redirect(PATHS.HOME);
  }

  return null;
};

export const feedDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const feedId = parsePositiveIntegerParam(params.feedId);
  if (!feedId) return redirect(PATHS.FEED);

  await ensureAuthenticatedForLoader();
  const activeTeamId = await ensureActiveTeamId();
  if (!activeTeamId) return redirect(PATHS.HOME);

  await queryClient.ensureQueryData(feedDetailQueryOptions(activeTeamId, feedId));
  return null;
};

export const teamDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const teamId = parsePositiveIntegerParam(params.teamId);
  if (!teamId) return redirect(PATHS.HOME);

  await ensureAuthenticatedForLoader();
  await queryClient.ensureQueryData(teamDetailQueryOptions(teamId));
  return null;
};

export const placeFeedsLoader = async ({ params }: LoaderFunctionArgs) => {
  const placeId = params.placeId;
  if (!placeId) return redirect(PATHS.HOME);

  await ensureAuthenticatedForLoader();
  const activeTeamId = await ensureActiveTeamId();
  if (!activeTeamId) return redirect(PATHS.HOME);

  const feedParams = { placeId };
  await queryClient.prefetchInfiniteQuery({
    queryKey: feedKeys.infiniteListFiltered(activeTeamId, feedParams),
    queryFn: ({ pageParam }) =>
      unwrap(() => getFeeds(activeTeamId, { ...feedParams, cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    staleTime: 30 * 1000,
  });
  return null;
};
