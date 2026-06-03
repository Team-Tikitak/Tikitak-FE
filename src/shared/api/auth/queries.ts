import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { clearAccessToken, endLogout, setAccessToken, startLogout } from '@/shared/api/instance';
import { postLoginCodeExchange, postLogout, postRefreshToken } from './api';
import { authKeys } from './keys';
import { unwrap } from '../request';
import { userKeys } from '../user/keys';

export const useAuthInit = () =>
  useQuery({
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

export const useLoginCodeExchange = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
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
    mutationFn: postLogout,
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
