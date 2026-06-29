import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { clearAccessToken, endLogout, setAccessToken, startLogout } from '@/shared/api/instance';
import {
  clearStoredDeviceToken,
  readStoredDeviceToken,
} from '@/shared/lib/native/deviceTokenStorage';
import { getDeviceTokenIfGranted } from '@/shared/lib/native/getDeviceToken';
import { postLoginCodeExchange, postLogout } from './api';
import { authKeys, LOGIN_CODE_EXCHANGE_MUTATION_KEY } from './keys';
import { sessionQueryOptions } from './sessionQuery';
import { deleteDeviceToken } from '../notification/api';
import { unwrap } from '../request';
import { userKeys } from '../user/keys';

export const useAuthInit = () => useQuery(sessionQueryOptions);

export const useLoginCodeExchange = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: LOGIN_CODE_EXCHANGE_MUTATION_KEY,
    meta: { errorMessage: '로그인에 실패했어요. 다시 시도해주세요.' },
    mutationFn: (loginCode: string) => unwrap(() => postLoginCodeExchange({ loginCode })),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      navigate(PATHS.HOME, { replace: true });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const fcmToken =
        (await readStoredDeviceToken()) ?? (await getDeviceTokenIfGranted())?.fcmToken;
      if (fcmToken) {
        try {
          await deleteDeviceToken({ fcmToken });
          await clearStoredDeviceToken();
        } catch {
          // 해제 실패 시 토큰을 보존
        }
      }
      return postLogout();
    },
    onMutate: () => {
      startLogout();
    },
    onSettled: () => {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: userKeys.all });
      endLogout();
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};
