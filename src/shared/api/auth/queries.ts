import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { clearAccessToken, endLogout, setAccessToken, startLogout } from '@/shared/api/instance';
import {
  clearStoredDeviceToken,
  readStoredDeviceToken,
} from '@/shared/lib/native/deviceTokenStorage';
import { getDeviceTokenIfGranted } from '@/shared/lib/native/getDeviceToken';
import {
  clearStoredRefreshToken,
  storeRefreshToken,
} from '@/shared/lib/native/refreshTokenStorage';
import { consumeRedirectAfterLogin } from '@/shared/lib/routing/redirectAfterLogin';
import { postLoginCodeExchange, postLogout } from './api';
import { authKeys, LOGIN_CODE_EXCHANGE_MUTATION_KEY } from './keys';
import { sessionQueryOptions } from './sessionQuery';
import { deleteDeviceToken } from '../notification/api';
import { requestResult, requestVoid } from '../request';
import { userKeys } from '../user/keys';

export const useAuthInit = () => useQuery(sessionQueryOptions);

export const useLoginCodeExchange = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: LOGIN_CODE_EXCHANGE_MUTATION_KEY,
    meta: { errorMessage: '로그인에 실패했어요. 다시 시도해주세요.' },
    mutationFn: (loginCode: string) => requestResult(() => postLoginCodeExchange({ loginCode })),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      void storeRefreshToken(data.refreshToken);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      navigate(consumeRedirectAfterLogin() ?? PATHS.HOME, { replace: true });
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
      return requestVoid(() => postLogout());
    },
    onMutate: () => {
      startLogout();
    },
    onSettled: async () => {
      // 삭제가 끝나기 전에 세션 복구가 시작되면 저장 토큰으로 되살아날 수 있어 먼저 기다린다
      await clearStoredRefreshToken();
      clearAccessToken();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: userKeys.all });
      endLogout();
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};
