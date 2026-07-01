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
import { patchActiveTeam as patchActiveTeamApi } from '../user/api';
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
    // 생성 응답에 teamId가 없어 최신 teamId 팀을 활성으로 설정
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: userKeys.teams(), type: 'all' });
      const teams = queryClient.getQueryData<Team[]>(userKeys.teams());
      const created = teams?.reduce<Team | null>(
        (latest, team) => (!latest || team.teamId > latest.teamId ? team : latest),
        null,
      );
      if (created) {
        await patchActiveTeamApi({ teamId: created.teamId });
      }
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
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: userKeys.teams() });
    },
  });
};

export const useGetTeamDetail = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: teamKeys.detail(teamId ?? 0),
    queryFn: () => unwrap(() => getTeamDetail(teamId as number)),
    enabled: typeof teamId === 'number',
    // 다른 기기에서 멤버가 합류해도 방장 캐시는 무효화되지 않으므로, 앱 포그라운드 복귀(focus) 시
    // 항상 최신화하고, 재진입 시엔 30초 지났으면 갱신(전역 5분보다 짧게, 매 마운트 강제 재조회는 X).
    staleTime: 30 * 1000,
    refetchOnWindowFocus: 'always',
  });

export const useTeamMembers = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: teamKeys.members(teamId ?? 0),
    queryFn: () => unwrap(() => getTeamMembers(teamId as number)),
    enabled: typeof teamId === 'number',
    staleTime: 60 * 1000,
  });
