import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, putAgreements } from './api';
import { userKeys } from './keys';

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
