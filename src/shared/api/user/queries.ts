import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { deleteMe, getAgreements, getMe, getTeams, patchOnboarding, putAgreements } from './api';
import { userKeys } from './keys';
import { authKeys } from '../auth/keys';
import { clearAccessToken } from '../instance';
import { unwrap } from '../request';

export const useMe = () =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: () => unwrap(() => getMe()),
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
    mutationFn: patchOnboarding,
    onSuccess: () => {
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
