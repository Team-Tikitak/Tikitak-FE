import { useLocation } from 'react-router';
import AppleIcon from '@/shared/assets/Icon/AppleIcon.svg?react';
import GoogleIcon from '@/shared/assets/Icon/GoogleIcon.svg?react';
import KakaoIcon from '@/shared/assets/Icon/KakaoIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import { cn } from '@/shared/lib';
import { SocialLoginButton } from './SocialLoginButton';

export const LoginPage = () => {
  const fromSplash = (useLocation().state as { fromSplash?: boolean } | null)?.fromSplash === true;

  return (
    <div className="flex flex-1 flex-col items-center px-[25px] pt-[31dvh]">
      <TikiTakLogo className="view-transition-logo" />
      <p className={cn('title-0 mt-4 text-black', fromSplash && 'login-stagger-slogan')}>
        우리의 순간을 함께 남기는 공간
      </p>
      <div className="mt-[60px] flex w-full flex-col gap-3">
        <SocialLoginButton
          provider="kakao"
          icon={<KakaoIcon className="h-5 w-5" aria-hidden="true" />}
          animate={fromSplash}
        />
        <SocialLoginButton
          provider="google"
          icon={<GoogleIcon className="h-5 w-5" aria-hidden="true" />}
          animate={fromSplash}
        />
        <SocialLoginButton
          provider="apple"
          icon={<AppleIcon className="h-5 w-5" aria-hidden="true" />}
          animate={fromSplash}
        />
      </div>
    </div>
  );
};
