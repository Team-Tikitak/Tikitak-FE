import { cn } from '@/shared/lib';
import { TeamMenuItem } from '../../TeamMenuItem';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

export interface TeamListSheetItem {
  id: string;
  title: string;
  description: string;
}

export interface TeamListSheetProps extends Omit<
  BottomSheetProps,
  'children' | 'title' | 'onSelect'
> {
  teams: TeamListSheetItem[];
  selectedTeamId?: string;
  onSelect?: (teamId: string) => void;
  scrollable?: boolean;
}

export function TeamListSheet({
  teams,
  selectedTeamId,
  onSelect,
  scrollable = false,
  className,
  contentClassName,
  ...props
}: TeamListSheetProps) {
  return (
    <BottomSheet
      title="팀 목록"
      className={cn('flex h-full min-h-0 flex-col px-0', className)}
      contentClassName={cn(
        'flex min-h-0 w-full flex-1 flex-col items-start px-5 pb-[calc(16px+env(safe-area-inset-bottom))]',
        scrollable ? 'overflow-y-auto' : 'overflow-hidden',
        contentClassName,
      )}
      {...props}
    >
      {teams.map((team) => (
        <TeamMenuItem
          key={team.id}
          title={team.title}
          description={team.description}
          selected={team.id === selectedTeamId}
          onClick={() => onSelect?.(team.id)}
        />
      ))}
    </BottomSheet>
  );
}
