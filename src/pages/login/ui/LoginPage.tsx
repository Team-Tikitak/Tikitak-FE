import { useLocation } from 'react-router';
import KakaoIcon from '@/shared/assets/Icon/KakaoIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import { cn } from '@/shared/lib';

export const LoginPage = () => {
  const fromSplash = (useLocation().state as { fromSplash?: boolean } | null)?.fromSplash === true;

  return (
    <div className="flex flex-1 flex-col items-center px-[25px] pt-[35dvh]">
      <TikiTakLogo className="view-transition-logo" />
      <p className={cn('title-0 mt-4 text-black', fromSplash && 'login-stagger-slogan')}>
        우리의 순간을 함께 남기는 공간
      </p>
      <button
        type="button"
        className={cn(
          'button-0 bg-kakao-yellow mt-[60px] flex w-full items-center justify-center gap-3 rounded-[20px] py-3 text-black',
          fromSplash && 'login-stagger-button',
        )}
      >
        <KakaoIcon className="h-5 w-5" aria-hidden="true" />
        카카오톡 로그인
      </button>
    </div>
  );
};
