import { redirect } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { authKeys } from '@/shared/api/auth/keys';
import { ApiError } from '@/shared/api/error';
import { getAccessToken, refreshAccessToken } from '@/shared/api/instance';
import { requestResult } from '@/shared/api/request';
import { getMe } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { PATHS } from '../paths';

export const parsePositiveIntegerParam = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const ensureMe = () =>
  queryClient.ensureQueryData({
    queryKey: userKeys.me(),
    queryFn: () => requestResult(() => getMe()),
    staleTime: 5 * 60 * 1000,
    // 복원된 캐시를 즉시 쓰고, stale이면 백그라운드에서 갱신
    revalidateIfStale: true,
  });

export const ensureSessionAccessToken = () =>
  queryClient.ensureQueryData({
    queryKey: authKeys.session(),
    queryFn: () => refreshAccessToken(),
    retry: false,
  });

export const getHttpStatus = (error: unknown) =>
  error instanceof ApiError ? error.status : undefined;

export const ensureAuthenticatedForLoader = async () => {
  if (getAccessToken()) return;

  try {
    await ensureSessionAccessToken();
  } catch (error) {
    const status = getHttpStatus(error);
    if (status !== undefined && status >= 400 && status < 500) {
      throw redirect(PATHS.LOGIN);
    }
    throw error;
  }
};

export const ensureActiveTeamId = async () => {
  const me = await ensureMe();
  return me.activeTeamId;
};
