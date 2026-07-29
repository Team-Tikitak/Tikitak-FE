import { QRCodeSVG } from 'qrcode.react';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import CopyIcon from '@/shared/assets/Icon/CopyIcon.svg?react';
import TikiTackLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import { EXTERNAL_LINKS } from '@/shared/constants/externalLinks';
import { cn } from '@/shared/lib/cn';
import { openExternalUrl } from '@/shared/lib/openExternalUrl';
import { Button, openConfirmDialog } from '@/shared/ui';

interface DesktopWebLandingProps {
  pathname: string;
}

const getInviteUrl = (pathname: string): string | null => {
  if (!/^\/invite\/[^/]+$/.test(pathname)) return null;
  return `${window.location.origin}${pathname}`;
};

export const DesktopWebLanding = ({ pathname }: DesktopWebLandingProps) => {
  const inviteUrl = getInviteUrl(pathname);
  const isInvite = Boolean(inviteUrl);

  const handleCopyInviteUrl = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard?.writeText(inviteUrl).catch(() => undefined);
  };

  const handleAndroidInstall = () => {
    openConfirmDialog({
      title: 'Android 앱은 준비 중이에요',
      description: '조금만 기다려주세요.\n출시되면 바로 이용할 수 있어요.',
      confirmLabel: '확인',
      showCancel: false,
    });
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-gray-100 px-6 py-10 font-sans">
      <section className="grid w-full max-w-240 grid-cols-[1fr_320px] items-center gap-12 bg-white px-12 py-10 max-md:grid-cols-1 max-md:px-6">
        <div className="flex flex-col items-start">
          <TikiTackLogo className="w-28" aria-label="티키탁" />
          <h1 className="mt-10 text-[32px] leading-[1.28] font-extrabold text-black">
            티키탁은 모바일에서
            <br />
            가장 자연스럽게 사용할 수 있어요
          </h1>
          <p className="body-1 mt-5 max-w-120 text-gray-600">
            {isInvite ? (
              '초대장은 휴대폰으로 QR 코드를 스캔하거나 링크를 복사해서 열어주세요.'
            ) : (
              <>
                현재 웹 화면은 모바일 이용에 맞춰져 있어요.
                <br />
                휴대폰에서 접속하거나 앱을 설치해 이용해주세요.
              </>
            )}
          </p>

          <div className="mt-8 flex w-full max-w-90 flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" onClick={() => openExternalUrl(EXTERNAL_LINKS.APP_STORE)}>
                <span className="inline-block -translate-y-px leading-none">iOS 앱 설치하기</span>
              </Button>
              <Button variant="secondary" className="h-12" onClick={handleAndroidInstall}>
                <span className="inline-block -translate-y-px leading-none">
                  Android 앱 설치하기
                </span>
              </Button>
            </div>
            {inviteUrl && (
              <Button
                variant="secondary"
                buttonIcon={<CopyIcon className="size-5" />}
                onClick={handleCopyInviteUrl}
              >
                초대 링크 복사하기
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn(
            'bg-main-000 flex min-h-80 flex-col items-center justify-center rounded-lg p-6',
            !inviteUrl && 'gap-6',
          )}
        >
          {inviteUrl ? (
            <>
              <div role="img" aria-label="초대 링크 QR 코드">
                <QRCodeSVG
                  aria-hidden={true}
                  value={inviteUrl}
                  size={220}
                  bgColor="transparent"
                  fgColor="#121212"
                  level="M"
                  includeMargin={false}
                  title="초대 링크 QR 코드"
                />
              </div>
              <p className="body-2 mt-5 text-center text-gray-600">
                휴대폰 카메라로 스캔하면
                <br />
                초대장으로 바로 이동해요
              </p>
            </>
          ) : (
            <>
              <TakLeader className="w-full max-w-40" aria-hidden />
              <p className="body-2 text-center text-gray-600">
                PC에서는 안내 화면만 제공돼요.
                <br />앱 이용은 모바일에서 계속해주세요.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
};
