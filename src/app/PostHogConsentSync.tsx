import { useEffect } from 'react';
import { useGetAgreements } from '@/shared/api/user/queries';
import { setPostHogConsent } from '@/shared/lib/posthog';
import { useAuthStore } from '@/shared/stores/authStore';

export const PostHogConsentSync = () => {
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));
  const { data: agreements, isSuccess } = useGetAgreements({ enabled: isLoggedIn });

  useEffect(() => {
    if (!isLoggedIn) {
      setPostHogConsent(false);
      return;
    }

    if (!isSuccess) return;

    setPostHogConsent(Boolean(agreements?.termsAgreed && agreements?.privacyAgreed));
  }, [agreements, isLoggedIn, isSuccess]);

  return null;
};
