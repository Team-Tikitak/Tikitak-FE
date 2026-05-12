import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { MOCK_INVITE_INFO } from '../model/mock';

export const useInviteAccept = () => {
  const navigate = useNavigate();

  const isInvalidInvite = false;
  const isAlreadyMember = false; // TODO: 서버에서 받아올 팀 참여 여부
  const { inviterName, teamName, avatarUrl } = MOCK_INVITE_INFO;

  const handleConfirm = () => {
    if (isAlreadyMember) {
      navigate(PATHS.HOME);
    } else {
      navigate(PATHS.TEAM_PROFILE_SETUP, { state: { name: teamName } });
    }
  };

  return { inviterName, teamName, avatarUrl, isInvalidInvite, handleConfirm };
};
