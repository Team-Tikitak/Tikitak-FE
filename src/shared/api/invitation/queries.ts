import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import {
  postAcceptInvitation,
  getInvitationLink,
  getInvitationPreview,
  putInvitationLink,
} from './api';
import { invitationKeys } from './keys';
import { unwrap } from '../request';
import { invalidateTeamMembershipQueries } from '../team/invalidateTeamMembership';
import { patchActiveTeam as patchActiveTeamApi } from '../user/api';

export const useInvitationLink = (teamId: number) =>
  useQuery({
    queryKey: invitationKeys.teamLink(teamId),
    queryFn: async () => {
      try {
        return await unwrap(() => getInvitationLink(teamId));
      } catch (error) {
        if (isAxiosError(error) && error.response?.data?.code === 'INVITE005') {
          return unwrap(() => putInvitationLink(teamId));
        }
        throw error;
      }
    },
  });

export const useInvitationPreview = (token: string) =>
  useQuery({
    queryKey: invitationKeys.preview(token),
    queryFn: () => unwrap(() => getInvitationPreview(token)),
    enabled: Boolean(token),
    retry: false,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    // 강퇴당한 팀 재참여 불가 등 서버가 구체적 사유를 내려주므로 서버 메시지를 우선 노출
    meta: { errorMessage: '팀 참여에 실패했어요', useServerMessage: true },
    mutationFn: (variables) => unwrap(() => postAcceptInvitation(variables)),
    onSuccess: async (data) => {
      await patchActiveTeamApi({ teamId: data.teamId });
      invalidateTeamMembershipQueries(queryClient);
      navigate(PATHS.HOME, { replace: true });
    },
  });
};
