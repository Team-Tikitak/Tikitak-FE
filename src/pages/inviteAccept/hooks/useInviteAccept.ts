import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PATHS, toInviteAppLink } from '@/app/routes/paths';
import { getAccessToken } from '@/shared/api/instance';
import { useInvitationPreview } from '@/shared/api/invitation/queries';
import { useGetTeams, usePatchActiveTeam } from '@/shared/api/user/queries';
import { saveRedirectAfterLogin } from '@/shared/lib/routing/redirectAfterLogin';

export const useInviteAccept = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { data, isError } = useInvitationPreview(token ?? '');

  const isInvalidInvite = isError;

  const isLoggedIn = Boolean(getAccessToken());

  const teamName = data?.teamName ?? '';
  const { data: teams, isPending: isTeamsPending } = useGetTeams({ enabled: isLoggedIn });
  const { mutateAsync: patchActiveTeam, isPending: isPatchingActiveTeam } = usePatchActiveTeam();
  const isCheckingMembership = isLoggedIn && (isTeamsPending || isPatchingActiveTeam);
  const isAlreadyMember = teams?.some((team) => team.teamId === data?.teamId) ?? false;

  const handleConfirm = async () => {
    if (isCheckingMembership) return;
    if (!token) return;

    if (!isLoggedIn) {
      saveRedirectAfterLogin(`/invite/${token}`);
      navigate(PATHS.LOGIN);
      return;
    }
    if (isAlreadyMember && data?.teamId) {
      try {
        await patchActiveTeam(data.teamId);
      } catch (error) {
        console.error('초대 팀 활성화 실패', error);
      }
      navigate(PATHS.HOME, { replace: true });
      return;
    }
    navigate(PATHS.TEAM_PROFILE_SETUP, {
      state: { mode: 'join', token, name: teamName },
    });
  };

  const fallbackTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(fallbackTimerRef.current);
  }, []);

  // 웹에서 설치된 앱으로 열기 시도. 앱이 전면에 뜨면 페이지가 숨겨져 폴백을 취소하고,
  // 미설치(스킴이 안 열림)면 잠시 후 웹 참여 플로우로 이어간다.
  const openInApp = () => {
    if (!token) return;

    window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = window.setTimeout(() => {
      void handleConfirm();
    }, 1500);
    const cancelFallbackIfHidden = () => {
      if (document.hidden) window.clearTimeout(fallbackTimerRef.current);
    };
    document.addEventListener('visibilitychange', cancelFallbackIfHidden, { once: true });

    window.location.assign(toInviteAppLink(token));
  };

  return { teamName, isInvalidInvite, isCheckingMembership, handleConfirm, openInApp };
};
