import { Capacitor } from '@capacitor/core';
import { PageShell } from '@/app/layout';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import TikiTackLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import TikiTackIcon from '@/shared/assets/Logo/tikitakLogoIcon.svg?react';
import { Button } from '@/shared/ui';
import { InvalidInvite } from './InvalidInvite';
import { InviteBackground } from './InviteBackground';
import { EXTERNAL_LINKS } from '../constants/externalLinks';
import { useInviteAccept } from '../hooks/useInviteAccept';

export const InviteAcceptPage = () => {
  const { teamName, isInvalidInvite, isCheckingMembership, handleConfirm, openInApp } =
    useInviteAccept();
  const isApp = Capacitor.isNativePlatform();

  if (isInvalidInvite) {
    return <InvalidInvite />;
  }

  return (
    <div className="relative isolate flex flex-1 flex-col">
      <InviteBackground />

      <PageShell className="bg-transparent" contentClassName="flex px-4">
        <div className="flex min-h-full w-full flex-col items-center justify-center py-12">
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

          <div className="mt-20 flex w-full flex-col items-center justify-center gap-3">
            {isApp ? (
              <Button variant="secondary" onClick={handleConfirm} disabled={isCheckingMembership}>
                참여하기
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  buttonIcon={<TikiTackIcon className="size-[22px]" />}
                  onClick={openInApp}
                  disabled={isCheckingMembership}
                >
                  티키탁에서 초대장 확인하기
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(EXTERNAL_LINKS.APP_STORE, '_blank', 'noopener,noreferrer')
                  }
                >
                  설치하기
                </Button>
              </>
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
};
