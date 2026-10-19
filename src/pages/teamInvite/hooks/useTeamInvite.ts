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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const teamName = data?.teamName || '';
  const inviteUrl = data?.inviteToken
    ? `${window.location.origin}/invite/${data.inviteToken}`
    : null;

  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timer = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  };

  return { teamName, inviteUrl, handleCopy, copyStatus, isLoading: isPending };
};
