import { cn } from '@/shared/lib';
import { AvatarGroup } from '@/shared/ui/AvatarGroup/AvatarGroup';
import type { ComponentPropsWithoutRef } from 'react';

const MAX_VISIBLE_AVATARS = 6;

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
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="body-9 truncate text-gray-900">{teamName}</span>
        </div>

        <span className="body-1 truncate text-gray-700">{memberCount}명 참여 중</span>
      </div>

      <AvatarGroup
        users={users}
        size="sm"
        max={MAX_VISIBLE_AVATARS}
        total={memberCount}
        className="shrink-0"
      />
    </div>
  );
};
