import { useParams } from 'react-router';
import { useInvitationLink } from '@/shared/api/invitation/queries';

export const useTeamInvite = (): {
  teamName: string;
  inviteUrl: string;
  handleCopy: () => Promise<void>;
} => {
  const { teamId } = useParams();
  const { data } = useInvitationLink(Number(teamId));
  const teamName = data?.teamName || '';
  const inviteUrl = `${window.location.origin}/invite/${data?.inviteToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // TODO: 사용자 피드백 처리 추가
    }
  };

  return { teamName, inviteUrl, handleCopy };
};
