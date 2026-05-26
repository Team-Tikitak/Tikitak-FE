import BellIcon from '@/shared/assets/Icon/BellIcon.svg?react';
import ChevronDownIcon from '@/shared/assets/Icon/ChevronDownIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';

interface AppHeaderProps {
  teamName: string;
  onTeamSelect?: () => void;
  onBellClick?: () => void;
}

export const AppHeader = ({ teamName, onTeamSelect, onBellClick }: AppHeaderProps) => {
  return (
    <header className="flex w-full items-start justify-between bg-white px-5 pt-2 pb-[15px]">
      <div className="flex flex-col gap-2">
        <TikiTakLogo className="h-[29px] w-[76px]" />
        <button
          type="button"
          className="body-9 flex items-center gap-1 text-black"
          onClick={onTeamSelect}
        >
          {teamName}
          <ChevronDownIcon />
        </button>
      </div>
      <button
        type="button"
        onClick={onBellClick}
        aria-label="알림"
        className="flex size-6 items-center justify-center text-black"
      >
        <BellIcon />
      </button>
    </header>
  );
};
