import KakaoIcon from '@/shared/assets/Icon/KakaoIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';

export const LoginPage = () => {
  return (
    <div className="flex flex-1 flex-col items-center px-[25px] pt-[35dvh]">
      <TikiTakLogo />
      <p className="title-0 mt-4 text-black">우리의 순간을 함께 남기는 공간</p>
      <button
        type="button"
        className="button-0 mt-[60px] flex w-full items-center justify-center gap-3 rounded-[20px] bg-[#FFE809] py-3 text-black"
      >
        <KakaoIcon className="h-5 w-5" />
        카카오톡 로그인
      </button>
    </div>
  );
};
