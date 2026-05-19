import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { usePutAgreements } from '@/shared/api/user/queries';
import { useTermsAgreement } from './useTermsAgreement';

export const useTermsFlow = () => {
  const navigate = useNavigate();
  const { terms, allChecked, toggleAll, toggle } = useTermsAgreement();
  const { mutateAsync: putAgreements, isPending: isSubmitting } = usePutAgreements();

  const goBack = () => navigate(PATHS.LOGIN, { replace: true });

  const submit = async () => {
    if (!allChecked || isSubmitting) return;
    try {
      await putAgreements({ termsAgreed: true, privacyAgreed: true });
      navigate(PATHS.ONBOARDING);
    } catch (error) {
      console.error('약관 동의 저장 실패', error);
    }
  };

  return { terms, allChecked, isSubmitting, toggleAll, toggle, submit, goBack };
};
