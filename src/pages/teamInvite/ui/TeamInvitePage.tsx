import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import CheckIcon from '@/shared/assets/Icon/CheckIcon.svg?react';
import CopyIcon from '@/shared/assets/Icon/CopyIcon.svg?react';
import { useEdgeSwipeBack } from '@/shared/hooks';
import { Button, Header } from '@/shared/ui';
import { useTeamInvite } from '../hooks/useTeamInvite';

export const TeamInvitePage = () => {
  useEdgeSwipeBack();
  const navigate = useNavigate();
  const { teamName, inviteUrl, handleCopy, copyStatus, isLoading } = useTeamInvite();

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
      <div className="bg-main-000 flex size-60 items-center justify-center rounded-xl p-4.5">
        {inviteUrl && (
          <QRCodeSVG
            value={inviteUrl}
            size={204}
            bgColor="transparent"
            fgColor="#121212"
            level="M"
            includeMargin={false}
            title={`${teamName} 초대 QR 코드`}
          />
        )}
      </div>
      <div className="relative flex items-center gap-2">
        <div className="body-1 w-53 overflow-hidden rounded-xs border border-gray-300">
          <input
            type="text"
            readOnly
            aria-label="초대 링크"
            value={inviteUrl ?? ''}
            className="ios-input-zoom-guard ios-input-zoom-guard-box h-full w-full truncate bg-transparent px-1 outline-none select-text [-webkit-touch-callout:default]"
          />
        </div>
        <button
          type="button"
          aria-label="초대 링크 복사"
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center disabled:opacity-40"
          onClick={handleCopy}
          disabled={isLoading || !inviteUrl}
        >
          {copyStatus === 'success' ? (
            <CheckIcon
              aria-hidden="true"
              className="text-main-001 size-5 motion-safe:animate-[check-reveal_250ms_ease-out_both]"
            />
          ) : (
            <CopyIcon className="size-5 text-gray-700 active:text-gray-300" />
          )}
        </button>
        <p
          role="status"
          className="body-1 absolute top-full left-1/2 mt-3 w-[min(80vw,320px)] -translate-x-1/2 text-center text-gray-700"
        >
          {copyStatus === 'success' && (
            <span className="animate-card-enter block motion-reduce:animate-none">
              초대 링크를 복사했어요
            </span>
          )}
          {copyStatus === 'error' && '복사하지 못했어요. 링크를 직접 선택해 복사해주세요'}
        </p>
      </div>
    </PageShell>
  );
};
