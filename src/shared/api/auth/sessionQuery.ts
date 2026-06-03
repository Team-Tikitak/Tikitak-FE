import { setAccessToken } from '@/shared/api/instance';
import { postRefreshToken } from './api';
import { authKeys } from './keys';
import { unwrap } from '../request';

export const sessionQueryOptions = {
  queryKey: authKeys.session(),
  queryFn: async () => {
    const { accessToken } = await unwrap(() => postRefreshToken());
    setAccessToken(accessToken);
    return accessToken;
  },
  retry: false,
  staleTime: Infinity,
  gcTime: Infinity,
};
