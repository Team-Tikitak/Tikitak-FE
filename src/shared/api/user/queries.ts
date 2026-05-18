import { useQuery } from '@tanstack/react-query';
import { getMe } from './api';
import { userKeys } from './keys';

export const useMe = () =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: () => getMe().then((res) => res.data.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
