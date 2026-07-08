import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { LOGIN_CODE_EXCHANGE_MUTATION_KEY } from '@/shared/api/auth/keys';
import AppleIcon from '@/shared/assets/Icon/AppleIcon.svg?react';
import GoogleIcon from '@/shared/assets/Icon/GoogleIcon.svg?react';
import KakaoIcon from '@/shared/assets/Icon/KakaoIcon.svg?react';
import TikiTakSplashLogo from '@/shared/assets/Logo/tiki-tak_Logo_splash.svg?react';
import { cn } from '@/shared/lib/cn';
import { LoadingState } from '@/shared/ui/LoadingState/LoadingState';
import { SocialLoginButton } from './SocialLoginButton';

export const LoginPage = () => {
  const fromSplash = (useLocation().state as { fromSplash?: boolean } | null)?.fromSplash === true;

  const loginStatus = useMutationState({
    filters: { mutationKey: LOGIN_CODE_EXCHANGE_MUTATION_KEY },
    select: (mutation) => mutation.state.status,
  }).at(-1);

  const [startedLogin, setStartedLogin] = useState(false);
  if (loginStatus === 'pending' && !startedLogin) {
    setStartedLogin(true);
  }

  const isLoggingIn = loginStatus === 'pending' || (startedLogin && loginStatus === 'success');

  const queryClient = useQueryClient();
  useEffect(() => {
    return () => {
      const mutationCache = queryClient.getMutationCache();
      mutationCache
        .findAll({ mutationKey: LOGIN_CODE_EXCHANGE_MUTATION_KEY })
        .forEach((mutation) => mutationCache.remove(mutation));
    };
  }, [queryClient]);

  return (
    <div className="flex flex-1 flex-col items-center px-[25px] pt-[31dvh]">
      <div className="splash-login-logo-frame" role="img" aria-label="tiki-tak!">
        <TikiTakSplashLogo
          className="splash-login-logo-mark splash-logo-settled"
          aria-hidden="true"
        />
      </div>
      <p
        className={cn(
          'title-0 mt-4 w-full text-center text-black',
          fromSplash && 'login-stagger-slogan',
        )}
      >
        우리의 순간을 함께 남기는 공간
      </p>
      <div className="mt-[60px] flex w-full flex-col gap-3">
        {isLoggingIn ? (
          <LoadingState variant="inline" label="로그인 중" />
        ) : (
          <>
            <SocialLoginButton
              provider="kakao"
              icon={<KakaoIcon className="h-5 w-5" aria-hidden="true" />}
              animate={fromSplash}
              animationOrder={1}
            />
            <SocialLoginButton
              provider="google"
              icon={<GoogleIcon className="h-5 w-5" aria-hidden="true" />}
              animate={fromSplash}
              animationOrder={2}
            />
            <SocialLoginButton
              provider="apple"
              icon={<AppleIcon className="h-5 w-5" aria-hidden="true" />}
              animate={fromSplash}
              animationOrder={3}
            />
          </>
        )}
      </div>
    </div>
  );
};
