import { useState } from 'react';
import { tv } from 'tailwind-variants';
import { checkApiReachable, getStartOAuthLogin } from '@/shared/api/auth/api';
import type { OAuthProvider } from '@/shared/api/auth/types';
import { alertDialog } from '@/shared/lib/native/nativeDialog';

const socialLoginButton = tv({
  base: 'button-0 flex w-full items-center justify-center gap-3 rounded-[20px] py-3',
  variants: {
    provider: {
      kakao: 'bg-kakao-yellow text-black',
      google: 'border border-invite-border ',
      apple: 'bg-black text-white',
    },
  },
});

const LABEL: Record<OAuthProvider, string> = {
  kakao: '카카오 로그인',
  google: '구글 로그인',
  apple: 'Apple 로그인',
};

type SocialLoginButtonProps = {
  provider: OAuthProvider;
  icon: React.ReactNode;
  animate?: boolean;
  animationOrder?: 1 | 2 | 3;
};

export const SocialLoginButton = ({
  provider,
  icon,
  animate,
  animationOrder,
}: SocialLoginButtonProps) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      if (!(await checkApiReachable())) {
        await alertDialog('서버에 연결할 수 없어요.\n잠시 후 다시 시도해주세요.');
        return;
      }
      getStartOAuthLogin(provider);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className={socialLoginButton({
        provider,
        className: animate
          ? `login-stagger-button login-stagger-button-${animationOrder ?? 1}`
          : '',
      })}
    >
      {icon}
      {LABEL[provider]}
    </button>
  );
};
