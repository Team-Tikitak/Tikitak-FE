import TikiTackLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import { InviteBackground } from './InviteBackground';

export const InvalidInvite = () => {
  return (
    <div className="relative isolate flex flex-1 flex-col items-center justify-center gap-2.5 px-5">
      <InviteBackground />
      <TikiTackLogo className="w-[91px]" />
      <p className="invite-body text-gray-600">유효하지 않은 초대입니다.</p>
    </div>
  );
};
