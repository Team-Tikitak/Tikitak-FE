import CloseIcon from '@/shared/assets/Icon/CloseIcon.svg?react';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { formatMemberEmail } from './memberEmail';
import type { ComponentPropsWithoutRef } from 'react';

type MemberCardProps = ComponentPropsWithoutRef<'div'> & {
  avatarSrc: string;
  name: string;
  email: string | null | undefined;
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
  const displayEmail = formatMemberEmail(email);

  return (
    <div
      className={cn('flex w-full items-center justify-between gap-2 py-3 pr-4', className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar src={avatarSrc} alt={name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="body-9 truncate text-black">{name}</span>
          {displayEmail && <span className="body-1 truncate text-gray-700">{displayEmail}</span>}
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
