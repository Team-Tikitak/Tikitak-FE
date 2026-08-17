import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { usePutAgreements } from '@/shared/api/user/queries';
import { setPostHogConsent } from '@/shared/lib/posthog';
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
      setPostHogConsent(true);
      navigate(PATHS.ONBOARDING);
    } catch {
      // 공통 mutation 오류 처리기가 사용자에게 실패 메시지를 표시한다.
    }
  };

  return { terms, allChecked, isSubmitting, toggleAll, toggle, submit, goBack };
};
