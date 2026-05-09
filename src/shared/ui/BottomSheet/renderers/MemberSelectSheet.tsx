import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { Button } from '../../Button';
import { UserChip } from '../../UserChip';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

export interface MemberSelectSheetItem {
  id: string;
  name: string;
  avatarSrc?: string;
  avatarAlt?: string;
}

export interface MemberSelectSheetProps extends Omit<
  BottomSheetProps,
  'children' | 'title' | 'onSelect'
> {
  members: MemberSelectSheetItem[];
  selectedMemberIds?: string[];
  onSelect?: (memberId: string) => void;
  confirmButtonProps?: ComponentPropsWithRef<'button'>;
}

export function MemberSelectSheet({
  members,
  selectedMemberIds = [],
  onSelect,
  confirmButtonProps,
  className,
  ...props
}: MemberSelectSheetProps) {
  const selectedIds = new Set(selectedMemberIds);
  const {
    className: confirmButtonClassName,
    children: confirmButtonChildren = '완료',
    ...restConfirmButtonProps
  } = confirmButtonProps ?? {};

  return (
    <BottomSheet
      title="인원 추가"
      className={cn('h-[290px]', className)}
      contentClassName="flex flex-col"
      {...props}
    >
      <div className="grid w-full grid-cols-4 gap-x-2 gap-y-3">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            className="justify-self-start"
            aria-pressed={selectedIds.has(member.id)}
            onClick={() => onSelect?.(member.id)}
          >
            <UserChip
              name={member.name}
              avatarSrc={member.avatarSrc}
              avatarAlt={member.avatarAlt}
              size="sm"
              selected={selectedIds.has(member.id)}
            />
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        className={cn('mt-[47px]', confirmButtonClassName)}
        {...restConfirmButtonProps}
      >
        {confirmButtonChildren}
      </Button>
    </BottomSheet>
  );
}
