import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib';
import { TeamMenuItem } from '../../TeamMenuItem';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

export interface TeamListSheetItem {
  id: number;
  title: string;
  description: string;
}

export interface TeamListSheetProps extends Omit<
  BottomSheetProps,
  'children' | 'title' | 'onSelect'
> {
  teams: TeamListSheetItem[];
  selectedTeamId?: number;
  onSelect?: (teamId: number) => void;
  onCreateTeam?: () => void;
  scrollable?: boolean;
  open?: boolean;
  initialOffset?: string;
}

const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

export function TeamListSheet({
  teams,
  selectedTeamId,
  onSelect,
  onCreateTeam,
  scrollable = false,
  open = true,
  initialOffset,
  className,
  contentClassName,
  ...props
}: TeamListSheetProps) {
  return (
    <BottomSheet
      title="팀 목록"
      className={cn('flex h-full min-h-0 flex-col px-0', className)}
      contentClassName={cn('flex min-h-0 w-full flex-1 flex-col', contentClassName)}
      {...props}
    >
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col items-start px-5',
          scrollable ? 'overflow-y-auto' : 'overflow-hidden',
          onCreateTeam && 'pb-[88px]',
        )}
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
      </div>
      {onCreateTeam &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-60 mx-auto w-full max-w-[393px]"
            style={
              {
                '--initial-transform': initialOffset,
                animation: open
                  ? `slideFromBottom 500ms ${EASING} both`
                  : `slideToBottom 500ms ${EASING} both`,
              } as React.CSSProperties
            }
          >
            <div className="pointer-events-auto bg-white px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onCreateTeam}
                className="press-feedback body-2 w-full rounded-full border border-gray-300 py-3 text-center text-gray-700"
              >
                팀 개설하기
              </button>
            </div>
          </div>,
          document.body,
        )}
    </BottomSheet>
  );
}
