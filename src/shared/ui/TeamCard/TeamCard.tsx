import CrownIcon from '@/shared/assets/Icon/CrownIcon.svg?react';
import { cn } from '@/shared/lib';
import { AvatarGroup } from '../AvatarGroup/AvatarGroup';
import type { ComponentPropsWithoutRef } from 'react';

type TeamCardProps = ComponentPropsWithoutRef<'div'> & {
  teamName: string;
  memberCount: number;
  users: {
    id: number;
    src: string;
    alt?: string;
  }[];
  isLeader?: boolean;
};

export const TeamCard = ({
  teamName,
  memberCount,
  users,
  isLeader = false,
  className,
  ...props
}: TeamCardProps) => {
  return (
    <div
      className={cn(
        'gap-sm flex items-end justify-between rounded-[12px] bg-[#EBF8FE] p-[18px]',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <div className="gap-xs flex items-center">
          <span className="body-9 text-gray-900">{teamName}</span>
          {isLeader && <CrownIcon className="text-main-001 size-5" />}
        </div>

        <span className="body-1 text-gray-700">{memberCount}명 참여 중</span>
      </div>

      <AvatarGroup users={users} size="sm" />
    </div>
  );
};
