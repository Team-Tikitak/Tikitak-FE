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
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...props
}: TeamCardProps) => {
  return (
    <div
      className={cn(
        'flex items-end justify-between gap-2 rounded-[12px] p-[18px]',
        onClick && 'motion-safe:press-feedback cursor-pointer',
        isLeader ? 'bg-main-000' : 'bg-gray-200',
        className,
      )}
      role={onClick ? 'button' : role}
      tabIndex={onClick ? 0 : tabIndex}
      onClick={onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !onClick || (event.key !== 'Enter' && event.key !== ' '))
          return;

        event.preventDefault();
        event.currentTarget.click();
      }}
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
