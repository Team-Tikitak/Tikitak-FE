import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes';
import {
  postAcceptInvitation,
  getInvitationLink,
  getInvitationPreview,
  putInvitationLink,
} from './api';
import { invitationKeys } from './keys';
import { teamKeys } from '../team/keys';
import { userKeys } from '../user/keys';

export const useInvitationLink = (teamId: number) =>
  useQuery({
    queryKey: invitationKeys.teamLink(teamId),
    queryFn: async () => {
      try {
        const res = await getInvitationLink(teamId);
        return res.data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          const res = await putInvitationLink(teamId);
          return res.data.data;
        }
        throw error;
      }
    },
    enabled: Boolean(teamId),
  });

export const useInvitationPreview = (token: string) =>
  useQuery({
    queryKey: invitationKeys.preview(token),
    queryFn: () => getInvitationPreview(token).then((res) => res.data.data),
    enabled: Boolean(token),
    retry: false,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: postAcceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      navigate(PATHS.HOME, { replace: false });
    },
  });
};
