import { type ComponentPropsWithRef } from 'react';
import BellIcon from '@/shared/assets/Icon/BellIcon.svg?react';
import ChevronDownIcon from '@/shared/assets/Icon/ChevronDownIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';
import { cn } from '@/shared/lib';

export interface AppHeaderProps extends ComponentPropsWithRef<'header'> {
  teamName: string;
  teamNameLoading?: boolean;
  showNotificationDot?: boolean;
  onTeamSelect?: () => void;
  onBellClick?: () => void;
}

export const AppHeader = ({
  teamName,
  teamNameLoading = false,
  showNotificationDot = false,
  onTeamSelect,
  onBellClick,
  className,
  ref,
  ...props
}: AppHeaderProps) => {
  return (
    <header
      ref={ref}
      className={cn(
        'flex w-full items-start justify-between bg-white px-5 pt-2 pb-[15px]',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <TikiTakLogo className="h-[29px] w-[76px]" />
        <button
          type="button"
          className="body-9 flex items-center gap-1 text-black"
          onClick={onTeamSelect}
          disabled={teamNameLoading}
        >
          {teamNameLoading ? (
            <span className="h-[25px] w-24 animate-pulse rounded-md bg-gray-200" />
          ) : (
            <>
              {teamName}
              <ChevronDownIcon />
            </>
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={onBellClick}
        aria-label={showNotificationDot ? '알림 (읽지 않은 알림 있음)' : '알림'}
        className="relative flex size-6 items-center justify-center text-black"
      >
        <BellIcon />
        {showNotificationDot && (
          <span className="bg-main-001 absolute top-0 right-0 size-1.5 rounded-full" aria-hidden />
        )}
      </button>
    </header>
  );
};
