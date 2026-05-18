import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { clearAccessToken, setAccessToken } from '@/shared/api/instance';
import { postLogout, postRefreshToken } from './api';
import { authKeys } from './keys';
import { userKeys } from '../user/keys';

export const useAuthInit = () =>
  useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const res = await postRefreshToken();
      const accessToken = res.data.data.accessToken;
      setAccessToken(accessToken);
      return accessToken;
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: userKeys.all });
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};
