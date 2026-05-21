import { useParams } from 'react-router';
import { useInvitationLink } from '@/shared/api/invitation/queries';

export const useTeamInvite = (): { teamName: string; inviteUrl: string; handleCopy: () => Promise<void> } => {
  const { teamId } = useParams();
  const teamName = '스핀기타'; // TODO: 서버에서 받아올 팀 이름
  const { data } = useInvitationLink(Number(teamId));
  const inviteUrl = `http://localhost:5173/invite/${data?.inviteToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // TODO: 사용자 피드백 처리 추가
    }
  };

  return { teamName, inviteUrl, handleCopy };
};
