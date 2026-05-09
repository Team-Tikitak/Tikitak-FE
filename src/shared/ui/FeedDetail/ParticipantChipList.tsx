import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import { cn } from '@/shared/lib';
import { UserChip } from '../UserChip';
import type { ComponentPropsWithRef } from 'react';

export type Participant = {
  id: string | number;
  name: string;
  avatarSrc?: string;
  avatarAlt?: string;
};

type ParticipantChipListProps = ComponentPropsWithRef<'div'> & {
  participants: Participant[];
  onMoreClick?: () => void;
};

const MAX_VISIBLE = 3;

export function ParticipantChipList({
  participants,
  onMoreClick,
  className,
  ref,
  ...props
}: ParticipantChipListProps) {
  const visibleParticipants = participants.slice(0, MAX_VISIBLE);
  const hasMore = participants.length > MAX_VISIBLE;

  return (
    <div className={cn('flex gap-2', className)} ref={ref} {...props}>
      {visibleParticipants.map((participant) => (
        <UserChip
          key={participant.id}
          name={participant.name}
          avatarSrc={participant.avatarSrc}
          avatarAlt={participant.avatarAlt}
          size="md"
        />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={onMoreClick}
          className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white"
          aria-label="참가자 더 보기"
        >
          <MoreIcon className="w-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
