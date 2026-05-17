import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { setAccessToken } from '@/shared/api/instance';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const isNewMember = searchParams.get('isNewMember') === 'true';
    const hasAgreedRequiredTerms = searchParams.get('hasAgreedRequiredTerms') === 'true';

    if (accessToken) {
      setAccessToken(accessToken);
    }

    if (!hasAgreedRequiredTerms) {
      navigate(PATHS.TERMS, { replace: true });
    } else if (isNewMember) {
      navigate(PATHS.ONBOARDING, { replace: true });
    } else {
      navigate(PATHS.HOME, { replace: true });
    }
  }, [navigate, searchParams]);

  return null;
};
