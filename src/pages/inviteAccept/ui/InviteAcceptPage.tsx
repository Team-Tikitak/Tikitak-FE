import { PageShell } from '@/app/layout';
import TikiTackLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import TikiTackIcon from '@/shared/assets/Logo/tikitack.svg?react';
import { Button, UserChip } from '@/shared/ui';
import { InvalidInvite } from './InvalidInvite';
import { InviteBackground } from './InviteBackground';
import { useInviteAccept } from '../hooks/useInviteAccept';

export const InviteAcceptPage = () => {
  const { inviterName, teamName, avatarUrl, isInvalidInvite, handleConfirm } = useInviteAccept();

  if (isInvalidInvite) {
    return <InvalidInvite />;
  }

  return (
    <div className="relative isolate flex flex-1 flex-col">
      <InviteBackground />

      <PageShell contentClassName="flex flex-col gap-4 pt-25 items-center px-4">
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <TikiTackLogo className="w-[91px]" />
            <span className="title-0 text-black">초대장</span>
          </div>
          <p className="invite-body text-gray-600">
            <span className="text-main-001">{inviterName}</span>님이{' '}
            <span className="text-main-001">{teamName}</span>팀으로 초대합니다!
          </p>
        </div>

        <div className="mt-[53px] flex flex-col items-center gap-[23px]">
          <img src={avatarUrl} alt={inviterName} className="size-[120px]" />
          <UserChip name={inviterName} avatarSrc={avatarUrl} />
        </div>

        <div className="mt-25 flex w-full flex-col items-center justify-center gap-3">
          <Button
            variant="secondary"
            buttonIcon={<TikiTackIcon className="size-[22px]" />}
            onClick={handleConfirm}
          >
            티키탁에서 초대장 확인하기
          </Button>
          <Button variant="secondary">설치하기</Button>
        </div>
      </PageShell>
    </div>
  );
};
