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
      <div className="grid min-h-[120px] w-full grid-cols-4 content-start gap-x-2 gap-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="h-fit justify-self-start">
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
