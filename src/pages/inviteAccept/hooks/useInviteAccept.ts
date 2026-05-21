import { useNavigate, useParams } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { getAccessToken } from '@/shared/api/instance';
import { useInvitationPreview } from '@/shared/api/invitation/queries';

export const useInviteAccept = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { data, isError } = useInvitationPreview(token ?? '');

  const isInvalidInvite = token || isError;
  const isLoggedIn = Boolean(getAccessToken());

  const inviterName = data?.inviterName ?? '';
  const teamName = data?.teamName ?? '';
  const avatarUrl = data?.avatarUrl ?? '';

  const handleConfirm = () => {
    if (!isLoggedIn) {
      navigate(PATHS.LOGIN);
    }
    navigate(PATHS.TEAM_PROFILE_SETUP, {
      state: { mode: 'join', token, name: teamName },
    });
  };

  return { inviterName, teamName, avatarUrl, isInvalidInvite, handleConfirm };
};
