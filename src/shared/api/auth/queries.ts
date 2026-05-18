import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { clearAccessToken } from '@/shared/api/instance';
import { postLogout } from './api';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      clearAccessToken();
      navigate(PATHS.LOGIN, { replace: true });
    },
  });
};
