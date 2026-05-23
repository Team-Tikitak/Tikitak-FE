import { useParams } from 'react-router';
import { useInvitationLink } from '@/shared/api/invitation/queries';

export const useTeamInvite = (): {
  teamName: string;
  inviteUrl: string | null;
  handleCopy: () => Promise<void>;
  isLoading: boolean;
} => {
  const { teamId } = useParams();
  const { data, isPending } = useInvitationLink(Number(teamId));
  const teamName = data?.teamName || '';
  const inviteUrl = data?.inviteToken
    ? `${window.location.origin}/invite/${data.inviteToken}`
    : null;

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // TODO: 사용자 피드백 처리 추가
    }
  };

  return { teamName, inviteUrl, handleCopy, isLoading: isPending };
};
