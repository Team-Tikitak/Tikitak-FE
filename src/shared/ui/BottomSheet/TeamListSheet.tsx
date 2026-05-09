import { type ComponentPropsWithRef } from 'react';
import { TeamMenuItem } from '../TeamMenuItem';
import { BottomSheet } from './BottomSheet';

export interface TeamListSheetItem {
  id: string;
  title: string;
  description: string;
}

interface TeamListSheetProps extends Omit<
  ComponentPropsWithRef<typeof BottomSheet>,
  'children' | 'title' | 'onSelect'
> {
  teams: TeamListSheetItem[];
  selectedTeamId?: string;
  onSelect?: (teamId: string) => void;
}

export function TeamListSheet({
  teams,
  selectedTeamId,
  onSelect,
  className,
  ...props
}: TeamListSheetProps) {
  return (
    <BottomSheet
      title="팀 목록"
      className={className ?? 'h-[294px]'}
      contentClassName="flex w-full max-w-[350px] flex-col items-start"
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
