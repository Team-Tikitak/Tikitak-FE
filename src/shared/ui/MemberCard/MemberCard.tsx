import CloseIcon from '@/shared/assets/Icon/CloseIcon.svg?react';
import { cn } from '@/shared/lib';
import { Avatar } from '../Avatar/Avatar';
import type { ComponentPropsWithoutRef } from 'react';

type MemberCardProps = ComponentPropsWithoutRef<'div'> & {
  avatarSrc: string;
  name: string;
  email: string;
  onRemove?: () => void;
};

export const MemberCard = ({
  avatarSrc,
  name,
  email,
  onRemove,
  className,
  ...props
}: MemberCardProps) => {
  return (
    <div
      className={cn('flex w-full items-center justify-between gap-2 py-3 pr-4', className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar src={avatarSrc} alt={name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="body-9 truncate text-black">{name}</span>
          <span className="body-1 truncate text-gray-700">{email}</span>
        </div>
      </div>
      {onRemove && (
        <button type="button" aria-label="멤버 삭제" onClick={onRemove}>
          <CloseIcon className="size-6 cursor-pointer text-gray-700" />
        </button>
      )}
    </div>
  );
};
