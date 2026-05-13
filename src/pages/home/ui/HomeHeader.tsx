import BellIcon from '@/shared/assets/Icon/BellIcon.svg?react';
import ChevronDownIcon from '@/shared/assets/Icon/ChevronDownIcon.svg?react';
import TikiTakLogo from '@/shared/assets/Logo/tiki-tak_Logo.svg?react';

interface HomeHeaderProps {
  teamName: string;
  onTeamSelect?: () => void;
}

export const HomeHeader = ({ teamName, onTeamSelect }: HomeHeaderProps) => {
  return (
    <header className="flex h-21 w-full justify-between bg-white px-5 pt-2">
      <div className="flex flex-col gap-2">
        <TikiTakLogo className="h-[29px] w-[76px]" />
        <button
          type="button"
          className="body-4 flex items-center gap-3 text-black"
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
