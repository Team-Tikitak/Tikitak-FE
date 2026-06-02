import { useNavigate, useParams } from 'react-router';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/app/routes/loaders';
import { PATHS } from '@/app/routes/paths';
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

  return { teamName, isInvalidInvite, handleConfirm };
};
