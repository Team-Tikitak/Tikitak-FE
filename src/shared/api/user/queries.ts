import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { deleteMe, getMe, getTeams, patchActiveTeam, putAgreements } from './api';
import { userKeys } from './keys';
import { authKeys } from '../auth/keys';
import { clearAccessToken } from '../instance';

export const useMe = () =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: () => getMe().then((res) => res.data.data),
    retry: false,
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
    queryFn: () => getTeams().then((res) => res.data.data.teams ?? []),
    staleTime: 5 * 60 * 1000,
  });

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
