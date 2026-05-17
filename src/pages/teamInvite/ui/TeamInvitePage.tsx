import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import CopyIcon from '@/shared/assets/Icon/CopyIcon.svg?react';
import { Button, Header } from '@/shared/ui';
import { useTeamInvite } from '../hooks/useTeamInvite';

export const TeamInvitePage = () => {
  const navigate = useNavigate();
  const { teamName, inviteUrl, handleCopy } = useTeamInvite();

  return (
    <PageShell
      header={<Header title={teamName} showBackButton onBack={() => navigate(-1)} />}
      bottom={
        <Button variant="primary" onClick={() => navigate(-1)}>
          완료
        </Button>
      }
      contentClassName="flex flex-col gap-4 pt-18 items-center"
    >
      <div className="bg-main-000 flex size-60 items-center justify-center rounded-md p-4.5">
        <QRCodeSVG
          value={inviteUrl}
          size={204}
          bgColor="transparent"
          fgColor="#121212"
          level="M"
          includeMargin={false}
          title={`${teamName} 초대 QR 코드`}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className="body-1 w-53 truncate rounded-xs border border-gray-300 px-1 outline-none"
        />
        <button
          type="button"
          aria-label="초대 링크 복사"
          className="cursor-pointer"
          onClick={handleCopy}
        >
          <CopyIcon className="size-5 text-gray-700 active:text-gray-300" />
        </button>
      </div>
    </PageShell>
  );
};
