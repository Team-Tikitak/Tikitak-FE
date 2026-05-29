import { cn } from '@/shared/lib';
import { UserChip } from '../../UserChip';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

export interface ParticipantsSheetItem {
  id: string;
  name: string;
  avatarSrc?: string;
  avatarAlt?: string;
}

export interface ParticipantsSheetProps extends Omit<BottomSheetProps, 'children' | 'title'> {
  participants: ParticipantsSheetItem[];
}

export function ParticipantsSheet({ participants, className, ...props }: ParticipantsSheetProps) {
  return (
    <BottomSheet title="참여한 인원" className={cn('flex flex-col pb-6', className)} {...props}>
      <div className="flex min-h-[120px] w-full flex-wrap content-start gap-x-2 gap-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="h-fit shrink-0">
            <UserChip
              name={participant.name}
              avatarSrc={participant.avatarSrc}
              avatarAlt={participant.avatarAlt}
              size="sm"
            />
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
