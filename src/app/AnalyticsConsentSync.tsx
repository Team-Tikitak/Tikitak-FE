import { useEffect, useRef } from 'react';
import { useGetAgreements } from '@/shared/api/user/queries';
import { setFirebaseAnalyticsEnabled } from '@/shared/lib/native/analytics';
import { setPostHogConsent } from '@/shared/lib/posthog';
import { useAuthStore } from '@/shared/stores/authStore';

export const AnalyticsConsentSync = () => {
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));
  const { data: agreements, isSuccess } = useGetAgreements({ enabled: isLoggedIn });
  const wasLoggedInRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) {
      // 앱 시작 직후는 세션 복원 전이라 토큰이 없을 뿐이다. 로그아웃된 순간에만 끈다.
      if (wasLoggedInRef.current) {
        setPostHogConsent(false);
        setFirebaseAnalyticsEnabled(false);
      }
      wasLoggedInRef.current = false;
      return;
    }

    wasLoggedInRef.current = true;
    if (!isSuccess) return;

    const hasConsent = Boolean(agreements?.termsAgreed && agreements?.privacyAgreed);
    setPostHogConsent(hasConsent);
    setFirebaseAnalyticsEnabled(hasConsent);
  }, [agreements, isLoggedIn, isSuccess]);

  return null;
};
