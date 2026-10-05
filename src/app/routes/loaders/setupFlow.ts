import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { getAccessToken } from '@/shared/api/instance';
import { getInvitationPreview } from '@/shared/api/invitation/api';
import { invitationKeys } from '@/shared/api/invitation/keys';
import { requestResult } from '@/shared/api/request';
import { getAgreements, getMe, getTeams } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { safeSessionRemove, safeSessionSet } from '@/shared/lib/storage/sessionStore';
import { PATHS } from '../paths';
import { ensureMe, ensureSessionAccessToken, getHttpStatus } from './shared';

export const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

export const inviteAcceptLoader = async ({ params }: LoaderFunctionArgs) => {
  const token = params.token;
  if (!token) return null;

  safeSessionSet(PENDING_INVITE_TOKEN_KEY, token);

  try {
    if (!getAccessToken()) {
      await ensureSessionAccessToken();
    }

    const [preview, teams, me, agreements] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: invitationKeys.preview(token),
        queryFn: () => requestResult(() => getInvitationPreview(token)),
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.teams(),
        queryFn: async () => (await requestResult(() => getTeams())).teams ?? [],
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.me(),
        queryFn: () => requestResult(() => getMe()),
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.agreements(),
        queryFn: () => requestResult(() => getAgreements()),
        staleTime: 5 * 60 * 1000,
      }),
    ]);

    const isAlreadyMember = teams.some((team) => team.teamId === preview.teamId);
    if (isAlreadyMember) {
      safeSessionRemove(PENDING_INVITE_TOKEN_KEY);
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
  } catch (error) {
    // 비로그인 사용자는 정상 흐름
    const status = getHttpStatus(error);
    if (status === undefined || status >= 500) {
      throw error;
    }
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

  // 복원된 캐시가 있으면 기다리지 않고 쓰고, stale이면 백그라운드에서 갱신(revalidateIfStale)
  const loadCached = () =>
    Promise.all([
      ensureMe(),
      queryClient.ensureQueryData({
        queryKey: userKeys.agreements(),
        queryFn: () => requestResult(() => getAgreements()),
        staleTime: 5 * 60 * 1000,
        revalidateIfStale: true,
      }),
    ]);
  const loadFresh = () =>
    Promise.all([
      queryClient.fetchQuery({
        queryKey: userKeys.me(),
        queryFn: () => requestResult(() => getMe()),
      }),
      queryClient.fetchQuery({
        queryKey: userKeys.agreements(),
        queryFn: () => requestResult(() => getAgreements()),
        staleTime: 5 * 60 * 1000,
      }),
    ]);

  // 약관·온보딩 완료는 되돌아가지 않으므로 "완료" 상태일 때만 복원된 값을 믿는다.
  // 미완료면 이전 값일 수 있어 기존처럼 최신 값으로 다시 판단한다.
  let [me, agreements] = await loadCached();
  if (!agreements.termsAgreed || !agreements.privacyAgreed || !me.onboardingCompleted) {
    [me, agreements] = await loadFresh();
  }

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
