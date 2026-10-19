import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useInvitationLink } from '@/shared/api/invitation/queries';

export const useTeamInvite = (): {
  teamName: string;
  inviteUrl: string | null;
  handleCopy: () => Promise<void>;
  copyStatus: 'idle' | 'success' | 'error';
  isLoading: boolean;
} => {
  const { teamId } = useParams();
  const { data, isPending } = useInvitationLink(Number(teamId));
  const [copyFeedback, setCopyFeedback] = useState<{ status: 'idle' | 'success' | 'error' }>({
    status: 'idle',
  });
  const copyStatus = copyFeedback.status;
  const teamName = data?.teamName || '';
  const inviteUrl = data?.inviteToken
    ? `${window.location.origin}/invite/${data.inviteToken}`
    : null;

  useEffect(() => {
    if (copyFeedback.status === 'idle') return;
    const timer = window.setTimeout(() => setCopyFeedback({ status: 'idle' }), 2000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyFeedback({ status: 'success' });
    } catch {
      setCopyFeedback({ status: 'error' });
    }
  };

  return { teamName, inviteUrl, handleCopy, copyStatus, isLoading: isPending };
};
