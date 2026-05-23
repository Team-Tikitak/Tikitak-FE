import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import {
  deleteTeamMember,
  deleteTeamMemberMe,
  getTeamDetail,
  patchTeamProfile,
  postTeamDeleteRequest,
} from './api';
import { teamKeys } from './keys';
import { userKeys } from '../user/keys';
import type { DeleteTeamMemberVariables, PatchTeamProfileVariables } from './types';
import type { Team } from '../user/types';

export const useLeaveTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeamMemberMe,
    onSuccess: (_, teamId) => {
      queryClient.setQueryData(
        userKeys.teams(),
        (old: Team[] | undefined) => old?.filter((team) => team.teamId !== teamId) ?? [],
      );
      navigate(PATHS.HOME, { replace: true });
    },
    onError: () => {
      // TODO: 요청 실패 처리
    },
  });
};

export const useTeamDelete = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => postTeamDeleteRequest(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      navigate(PATHS.HOME);
    },
    onError: () => {
      // TODO: 요청 실패 처리
    },
  });
};

export const usePatchTeamProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: PatchTeamProfileVariables) => patchTeamProfile(variables),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      navigate(`/teams/${teamId}`, { replace: true });
    },
    onError: () => {
      // TODO: 요청 실패 처리
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: DeleteTeamMemberVariables) => deleteTeamMember(variables),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
    },
    onError: () => {
      // TODO: 요청 실패 처리
    },
  });
};

export const useGetTeamDetail = (teamId: number) =>
  useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => getTeamDetail(teamId).then((res) => res.data.data),
  });
