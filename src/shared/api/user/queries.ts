import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { clearStoredRefreshToken } from '@/shared/lib/native/refreshTokenStorage';
import {
  deleteMe,
  getAgreements,
  getMe,
  getTeams,
  patchActiveTeam,
  patchOnboarding,
  putAgreements,
} from './api';
import { userKeys } from './keys';
import { authKeys } from '../auth/keys';
import { clearAccessToken } from '../instance';
import { requestResult, requestVoid } from '../request';
import type { AgreementsResponse, MeResponse, OnboardingPatchRequest, Team } from './types';

type UseMeOptions = {
  enabled?: boolean;
};

export const useMe = ({ enabled = true }: UseMeOptions = {}) =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: () => requestResult(() => getMe()),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useGetAgreements = ({ enabled = true }: UseMeOptions = {}) =>
  useQuery({
    queryKey: userKeys.agreements(),
    queryFn: () => requestResult(() => getAgreements()),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const usePutAgreements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { errorMessage: '약관 동의 저장에 실패했어요' },
    mutationFn: (body: Parameters<typeof putAgreements>[0]) =>
      requestVoid(() => putAgreements(body)),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<AgreementsResponse>(userKeys.agreements(), (prev) =>
        prev
          ? { ...prev, termsAgreed: variables.termsAgreed, privacyAgreed: variables.privacyAgreed }
          : prev,
      );
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useGetTeams = ({ enabled = true }: UseMeOptions = {}) =>
  useQuery({
    queryKey: userKeys.teams(),
    queryFn: async () => (await requestResult(() => getTeams())).teams ?? [],
    enabled,
    // 다른 기기에서 팀원이 합류해도 기존 멤버 캐시는 무효화되지 않으므로(memberCount),
    // 앱 포그라운드 복귀 시 항상 최신화하고 재진입 시엔 30초 지났으면 갱신한다.
    staleTime: 30 * 1000,
    refetchOnWindowFocus: 'always',
  });

export const usePatchOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OnboardingPatchRequest) => requestResult(() => patchOnboarding(body)),
    onSuccess: (data) => {
      queryClient.setQueryData<MeResponse>(userKeys.me(), (prev) =>
        prev
          ? {
              ...prev,
              onboardingCompleted: data.onboardingCompleted,
              profileCharacterType: data.profileCharacterType,
            }
          : prev,
      );
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useDeleteMe = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    meta: { errorMessage: '회원 탈퇴에 실패했어요' },
    mutationFn: () => requestVoid(() => deleteMe()),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.all });
      queryClient.removeQueries({ queryKey: authKeys.all });
      clearAccessToken();
      void clearStoredRefreshToken();
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};

export const usePatchActiveTeam = ({ silent = false }: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: silent ? undefined : { errorMessage: '팀 전환에 실패했어요' },
    mutationFn: (teamId: number) => requestVoid(() => patchActiveTeam({ teamId })),
    onSuccess: (_data, teamId) => {
      queryClient.setQueryData<MeResponse>(userKeys.me(), (prev) =>
        prev ? { ...prev, activeTeamId: teamId } : prev,
      );
      // 댓글 프로필 등이 teams의 isActive로 현재 팀을 찾으므로 함께 갱신(안 하면 이전 팀 프로필이 남는다)
      queryClient.setQueryData<Team[]>(userKeys.teams(), (prev) =>
        prev?.map((team) => ({ ...team, isActive: team.teamId === teamId })),
      );
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
