import BellIcon from '@/shared/assets/Icon/BellIcon.svg?react';
import ChevronDownIcon from '@/shared/assets/Icon/ChevronDownIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';

export const HOME_HEADER_HEIGHT = 72;

interface HomeHeaderProps {
  teamName: string;
  onTeamSelect?: () => void;
}

export const HomeHeader = ({ teamName, onTeamSelect }: HomeHeaderProps) => {
  return (
    <header className="flex h-[72px] w-full items-start justify-between bg-white px-5 pt-2 pb-[3px]">
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
      <BellIcon />
    </header>
  );
};
