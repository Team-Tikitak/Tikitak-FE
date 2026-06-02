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
import { invalidateTeamMembershipQueries } from './invalidateTeamMembership';
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
    meta: { errorMessage: '팀 생성에 실패했어요' },
    mutationFn: (body: CreateTeamRequest) => unwrap(() => postTeam(body)),
    onSuccess: () => {
      invalidateTeamMembershipQueries(queryClient);
      navigate(PATHS.HOME, { replace: true });
    },
  });
};

export const useLeaveTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    meta: { errorMessage: '팀 나가기에 실패했어요' },
    mutationFn: deleteTeamMemberMe,
    onSuccess: (_, teamId) => {
      queryClient.setQueryData(
        userKeys.teams(),
        (old: Team[] | undefined) => old?.filter((team) => team.teamId !== teamId) ?? [],
      );
      invalidateTeamMembershipQueries(queryClient);
      navigate(PATHS.HOME, { replace: true });
    },
  });
};

export const useTeamDelete = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    meta: { errorMessage: '팀 삭제에 실패했어요' },
    mutationFn: (teamId: number) => postTeamDeleteRequest(teamId),
    onSuccess: () => {
      invalidateTeamMembershipQueries(queryClient);
      navigate(PATHS.HOME);
    },
  });
};

export const usePatchTeamProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    meta: { errorMessage: '프로필 수정에 실패했어요' },
    mutationFn: (variables: PatchTeamProfileVariables) => patchTeamProfile(variables),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      navigate(`/teams/${teamId}`, { replace: true });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { errorMessage: '멤버 내보내기에 실패했어요' },
    mutationFn: (variables: DeleteTeamMemberVariables) => deleteTeamMember(variables),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
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
