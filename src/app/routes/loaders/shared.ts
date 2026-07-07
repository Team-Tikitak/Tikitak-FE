import axios from 'axios';
import { redirect } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { postRefreshToken } from '@/shared/api/auth/api';
import { authKeys } from '@/shared/api/auth/keys';
import { getAccessToken, setAccessToken } from '@/shared/api/instance';
import { unwrap } from '@/shared/api/request';
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
    queryFn: () => unwrap(() => getMe()),
    staleTime: 5 * 60 * 1000,
  });

export const ensureSessionAccessToken = () =>
  queryClient.ensureQueryData({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { accessToken } = await unwrap(() => postRefreshToken());
      setAccessToken(accessToken);
      return accessToken;
    },
  });

export const getHttpStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

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
