import { useNavigate } from 'react-router';
import { PATHS, toTeamInvite } from '@/app/routes/paths';
import { useDeleteTeamMember, useLeaveTeam, useTeamDelete } from '@/shared/api/team/queries';
import type { TeamMemberItem } from '@/shared/api/team/types';
import { openConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface UseTeamDetailActionsParams {
  teamId: number;
  teamName: string;
}

export const useTeamDetailActions = ({ teamId, teamName }: UseTeamDetailActionsParams) => {
  const navigate = useNavigate();
  const { mutate: mutateLeaveTeam } = useLeaveTeam();
  const { mutate: postTeamDelete } = useTeamDelete();
  const { mutate: removeMember } = useDeleteTeamMember();

  const confirmLeave = () =>
    openConfirmDialog({
      title: '그룹에서 나가시겠어요?',
      description: '나가면 이 그룹의 기록을 더 이상 볼 수 없어요.',
      confirmLabel: '나가기',
      destructive: true,
      onConfirm: () => mutateLeaveTeam(teamId),
    });

  const confirmRemoveMember = (member: TeamMemberItem) =>
    openConfirmDialog({
      title: `${member.nickname} 님을 내보내시겠어요?`,
      description: '내보낸 멤버는 다시 초대해야 합류할 수 있어요.',
      confirmLabel: '내보내기',
      destructive: true,
      onConfirm: () =>
        removeMember({
          teamId,
          targetTeamMemberId: member.teamMemberId,
        }),
    });

  const confirmDelete = () =>
    openConfirmDialog({
      title: '정말 그룹을 삭제하시겠어요?',
      description: '그룹의 모든 기록이 삭제되며 복구할 수 없어요.',
      confirmLabel: '삭제하기',
      destructive: true,
      onConfirm: () => postTeamDelete(teamId),
    });

  const goInvite = () => navigate(toTeamInvite(teamId));

  const goEditProfile = () =>
    navigate(PATHS.TEAM_PROFILE_SETUP, {
      state: {
        mode: 'edit',
        teamId,
        teamName,
      },
    });

  return { confirmLeave, confirmRemoveMember, confirmDelete, goInvite, goEditProfile };
};
