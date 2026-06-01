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
    mutationFn: postAcceptInvitation,
    onSuccess: () => {
      invalidateTeamMembershipQueries(queryClient);
      navigate(PATHS.HOME, { replace: false });
    },
  });
};
