import { tv } from 'tailwind-variants';
import { getStartOAuthLogin } from '@/shared/api/auth/api';
import type { OAuthProvider } from '@/shared/api/auth/types';

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
};

export const SocialLoginButton = ({ provider, icon, animate }: SocialLoginButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => getStartOAuthLogin(provider)}
      className={socialLoginButton({ provider, className: animate ? 'login-stagger-button' : '' })}
    >
      {icon}
      {LABEL[provider]}
    </button>
  );
};
