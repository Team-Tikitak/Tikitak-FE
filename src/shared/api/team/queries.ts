import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import {
  deleteTeamMember,
  deleteTeamMemberMe,
  getTeamDetail,
  getTeamMembers,
  patchTeamProfile,
  postTeam,
  postTeamDeleteRequest,
} from './api';
import { teamKeys } from './keys';
import { unwrap } from '../request';
import { userKeys } from '../user/keys';
import type {
  CreateTeamRequest,
  DeleteTeamMemberVariables,
  PatchTeamProfileVariables,
} from './types';
import type { Team } from '../user/types';

export const useCreateTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTeamRequest) => unwrap(() => postTeam(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      navigate(PATHS.HOME, { replace: true });
    },
    onError: () => {
      // TODO: 요청 실패 처리
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
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
      queryClient.invalidateQueries({ queryKey: userKeys.all });
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

export const useGetTeamDetail = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: teamKeys.detail(teamId ?? 0),
    queryFn: () => unwrap(() => getTeamDetail(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useTeamMembers = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: teamKeys.members(teamId ?? 0),
    queryFn: () => unwrap(() => getTeamMembers(teamId as number)),
    enabled: typeof teamId === 'number',
    staleTime: 60 * 1000,
  });
