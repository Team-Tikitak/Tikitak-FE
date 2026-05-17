import { useState } from 'react';
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
  initialSelectedIds?: string[];
  onConfirm?: (memberIds: string[]) => void;
  confirmLabel?: string;
}

export function MemberSelectSheet({
  members,
  initialSelectedIds = [],
  onConfirm,
  confirmLabel = '완료',
  className,
  ...props
}: MemberSelectSheetProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const selectedSet = new Set(selectedIds);

  const toggle = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  return (
    <BottomSheet
      title="인원 추가"
      className={cn('bottom-sheet-base', className)}
      contentClassName="flex flex-col"
      {...props}
    >
      <div className="no-scrollbar grid max-h-[120px] w-full grid-cols-4 gap-x-2 gap-y-3 overflow-y-auto">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            className="h-fit justify-self-start"
            aria-pressed={selectedSet.has(member.id)}
            onClick={() => toggle(member.id)}
          >
            <UserChip
              name={member.name}
              avatarSrc={member.avatarSrc}
              avatarAlt={member.avatarAlt}
              size="sm"
              selected={selectedSet.has(member.id)}
            />
          </button>
        ))}
      </div>
      <Button variant="primary" className="mt-[47px]" onClick={() => onConfirm?.(selectedIds)}>
        {confirmLabel}
      </Button>
    </BottomSheet>
  );
}
