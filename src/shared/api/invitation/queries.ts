import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { alertDialog } from '@/shared/lib/native/nativeDialog';
import {
  postAcceptInvitation,
  getInvitationLink,
  getInvitationPreview,
  putInvitationLink,
} from './api';
import { invitationKeys } from './keys';
import { unwrap } from '../request';
import { invalidateTeamMembershipQueries } from '../team/invalidateTeamMembership';

export const useInvitationLink = (teamId: number) =>
  useQuery({
    queryKey: invitationKeys.teamLink(teamId),
    queryFn: async () => {
      try {
        return await unwrap(() => getInvitationLink(teamId));
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
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
    // 강퇴당한 팀 재참여 불가 등 서버가 구체적 사유를 내려주므로,
    // meta 고정 문구 대신 onError에서 서버 메시지를 그대로 노출한다.
    mutationFn: postAcceptInvitation,
    onSuccess: () => {
      invalidateTeamMembershipQueries(queryClient);
      navigate(PATHS.HOME, { replace: false });
    },
    onError: (error) => {
      const data = isAxiosError(error)
        ? (error.response?.data as { message?: unknown } | undefined)
        : undefined;
      const serverMessage = typeof data?.message === 'string' ? data.message : undefined;
      void alertDialog(serverMessage ?? '팀 참여에 실패했어요');
    },
  });
};
