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
  maxSelection?: number;
}

export function MemberSelectSheet({
  members,
  initialSelectedIds = [],
  onConfirm,
  confirmLabel = '완료',
  maxSelection,
  className,
  ...props
}: MemberSelectSheetProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const selectedSet = new Set(selectedIds);
  const atCap = typeof maxSelection === 'number' && selectedIds.length >= maxSelection;

  const toggle = (memberId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(memberId)) return prev.filter((id) => id !== memberId);
      if (typeof maxSelection === 'number' && prev.length >= maxSelection) return prev;
      return [...prev, memberId];
    });
  };

  return (
    <BottomSheet
      title="인원 추가"
      className={cn('bottom-sheet-base flex flex-col', className)}
      contentClassName="flex min-h-0 flex-1 flex-col"
      {...props}
    >
      <div className="no-scrollbar grid h-[120px] w-full shrink-0 grid-cols-4 content-start gap-x-2 gap-y-3 overflow-y-auto">
        {members.map((member) => {
          const selected = selectedSet.has(member.id);
          const disabled = atCap && !selected;
          return (
            <button
              key={member.id}
              type="button"
              className="h-fit justify-self-start disabled:opacity-40"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => toggle(member.id)}
            >
              <UserChip
                name={member.name}
                avatarSrc={member.avatarSrc}
                avatarAlt={member.avatarAlt}
                size="sm"
                selected={selected}
              />
            </button>
          );
        })}
      </div>
      <Button
        variant="primary"
        className="mt-auto mb-[15.62px] shrink-0"
        onClick={() => onConfirm?.(selectedIds)}
      >
        {confirmLabel}
      </Button>
    </BottomSheet>
  );
}
