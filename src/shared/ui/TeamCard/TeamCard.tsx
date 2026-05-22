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
        'flex items-end justify-between gap-2 rounded-[12px] p-[18px]',
        isLeader ? 'bg-main-000' : 'bg-gray-200',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="body-9 text-gray-900">{teamName}</span>
        </div>

        <span className="body-1 text-gray-700">{memberCount}명 참여 중</span>
      </div>

      <AvatarGroup users={users} size="sm" />
    </div>
  );
};
