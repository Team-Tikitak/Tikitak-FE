import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { getAccessToken } from '@/shared/api/instance';
import { getInvitationPreview } from '@/shared/api/invitation/api';
import { invitationKeys } from '@/shared/api/invitation/keys';
import { unwrap } from '@/shared/api/request';
import { getAgreements, getMe, getTeams } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { PATHS } from '../paths';
import { ensureSessionAccessToken, getHttpStatus } from './shared';

export const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

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
