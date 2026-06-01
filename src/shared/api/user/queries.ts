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
import type { MeResponse, OnboardingPatchRequest } from './types';

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

export const useGetAgreements = () =>
  useQuery({
    queryKey: userKeys.agreements(),
    queryFn: () => unwrap(() => getAgreements()),
    staleTime: 5 * 60 * 1000,
  });

export const usePutAgreements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putAgreements,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useGetTeams = () =>
  useQuery({
    queryKey: userKeys.teams(),
    queryFn: async () => (await unwrap(() => getTeams())).teams ?? [],
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
    mutationFn: deleteMe,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userKeys.all });
      queryClient.removeQueries({ queryKey: authKeys.all });
      clearAccessToken();
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};

export const usePatchActiveTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => patchActiveTeam({ teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
