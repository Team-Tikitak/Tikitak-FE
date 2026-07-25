import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
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
import { unwrap } from '../request';
import type { AgreementsResponse, MeResponse, OnboardingPatchRequest } from './types';

type UseMeOptions = {
  enabled?: boolean;
};

export const useMe = ({ enabled = true }: UseMeOptions = {}) =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: () => unwrap(() => getMe()),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useGetAgreements = ({ enabled = true }: UseMeOptions = {}) =>
  useQuery({
    queryKey: userKeys.agreements(),
    queryFn: () => unwrap(() => getAgreements()),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const usePutAgreements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { errorMessage: '약관 동의 저장에 실패했어요' },
    mutationFn: putAgreements,
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
    queryFn: async () => (await unwrap(() => getTeams())).teams ?? [],
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const usePatchOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OnboardingPatchRequest) => unwrap(() => patchOnboarding(body)),
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
    mutationFn: deleteMe,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.all });
      queryClient.removeQueries({ queryKey: authKeys.all });
      clearAccessToken();
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};

export const usePatchActiveTeam = ({ silent = false }: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: silent ? undefined : { errorMessage: '팀 전환에 실패했어요' },
    mutationFn: (teamId: number) => patchActiveTeam({ teamId }),
    onSuccess: (_data, teamId) => {
      queryClient.setQueryData<MeResponse>(userKeys.me(), (prev) =>
        prev ? { ...prev, activeTeamId: teamId } : prev,
      );
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
