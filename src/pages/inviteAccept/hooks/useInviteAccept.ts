import { useNavigate, useParams } from 'react-router';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/app/routes/loaders';
import { PATHS, toInviteAppLink } from '@/app/routes/paths';
import { getAccessToken } from '@/shared/api/instance';
import { useInvitationPreview } from '@/shared/api/invitation/queries';

export const useInviteAccept = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { data, isError } = useInvitationPreview(token ?? '');

  const isInvalidInvite = isError;

  const isLoggedIn = Boolean(getAccessToken());

  const teamName = data?.teamName ?? '';

  const handleConfirm = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, `/invite/${token}`);
      navigate(PATHS.LOGIN);
      return;
    }
    navigate(PATHS.TEAM_PROFILE_SETUP, {
      state: { mode: 'join', token, name: teamName },
    });
  };

  // 웹에서 설치된 앱으로 열기 시도. 앱이 전면에 뜨면 페이지가 숨겨져 폴백을 취소하고,
  // 미설치(스킴이 안 열림)면 잠시 후 웹 참여 플로우로 이어간다.
  const openInApp = () => {
    if (!token) return;

    const fallbackTimer = window.setTimeout(handleConfirm, 1500);
    const cancelFallbackIfHidden = () => {
      if (document.hidden) window.clearTimeout(fallbackTimer);
    };
    document.addEventListener('visibilitychange', cancelFallbackIfHidden, { once: true });

    window.location.assign(toInviteAppLink(token));
  };

  return { teamName, isInvalidInvite, handleConfirm, openInApp };
};
