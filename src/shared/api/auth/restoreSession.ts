import { queryClient } from '@/app/providers/queryClient';
import { setAccessToken } from '@/shared/api/instance';
import { postRefreshToken } from './api';
import { authKeys } from './keys';
import { unwrap } from '../request';

export const restoreSession = async (): Promise<boolean> => {
  try {
    await queryClient.fetchQuery({
      queryKey: authKeys.session(),
      queryFn: async () => {
        const { accessToken } = await unwrap(() => postRefreshToken());
        setAccessToken(accessToken);
        return accessToken;
      },
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
    });
    return true;
  } catch {
    return false;
  }
};
