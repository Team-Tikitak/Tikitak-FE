import { refreshAccessToken } from '@/shared/api/instance';
import { authKeys } from './keys';

export const sessionQueryOptions = {
  queryKey: authKeys.session(),
  queryFn: () => refreshAccessToken(),
  retry: false,
  staleTime: Infinity,
  gcTime: Infinity,
};
