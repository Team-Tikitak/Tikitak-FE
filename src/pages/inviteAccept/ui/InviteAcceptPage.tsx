import { Capacitor } from '@capacitor/core';
import { PageShell } from '@/app/layout';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import TikiTackLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import TikiTackIcon from '@/shared/assets/Logo/tikitakLogoIcon.svg?react';
import { Button } from '@/shared/ui';
import { InvalidInvite } from './InvalidInvite';
import { InviteBackground } from './InviteBackground';
import { useInviteAccept } from '../hooks/useInviteAccept';

export const InviteAcceptPage = () => {
  const { teamName, isInvalidInvite, handleConfirm, openInApp } = useInviteAccept();
  const isApp = Capacitor.isNativePlatform();

  if (isInvalidInvite) {
    return <InvalidInvite />;
  }

  return (
    <div className="relative isolate flex flex-1 flex-col">
      <InviteBackground />

      <PageShell
        className="bg-transparent"
        contentClassName="flex flex-col gap-4 pt-25 items-center px-4"
      >
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <TikiTackLogo className="w-[91px]" />
            <span className="title-1 text-black">초대장</span>
          </div>
          <p className="body-2 text-gray-600">
            <span className="text-main-001">{teamName}</span>팀으로 초대합니다!
          </p>
        </div>

        <div className="mt-[53px] flex flex-col items-center gap-[23px]">
          <TakLeader className="w-full max-w-[169px]" />
        </div>

        <div className="mt-25 flex w-full flex-col items-center justify-center gap-3">
          {isApp ? (
            <Button variant="secondary" onClick={handleConfirm}>
              참여하기
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                buttonIcon={<TikiTackIcon className="size-[22px]" />}
                onClick={openInApp}
              >
                티키탁 앱에서 확인하기
              </Button>
              <Button variant="secondary">설치하기</Button>
            </>
          )}
        </div>
      </PageShell>
    </div>
  );
};
