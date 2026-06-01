import type { Team } from '@/shared/api/user/types';
import { openOverlay } from '@/shared/lib';
import { BottomSheetOverlay, TeamListSheet } from '@/shared/ui/BottomSheet';

const COLLAPSED_HEIGHT = 294;
const TOP_GAP = 80;

interface UseTeamPickerSheetParams {
  teams: Team[];
  selectedTeamId?: number;
  onSelectTeam: (teamId: number) => void;
  onCreateTeam: () => void;
}

export const useTeamPickerSheet = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  onCreateTeam,
}: UseTeamPickerSheetParams) => {
  const openSheet = () => {
    const expandedHeight = Math.max(COLLAPSED_HEIGHT, window.innerHeight - TOP_GAP);
    const collapsedSnap = `${COLLAPSED_HEIGHT}px`;
    const expandedSnap = `${expandedHeight}px`;
    const snapPoints = [collapsedSnap, expandedSnap];

    openOverlay(({ isOpen, close, unmount }) => (
      <BottomSheetOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        ariaTitle="팀 목록"
        ariaDescription="표시할 팀을 선택하세요"
        snapPoints={snapPoints}
        defaultSnapPoint={collapsedSnap}
        fadeFromIndex={0}
      >
        {({ activeSnapPoint }) => (
          <TeamListSheet
            open={isOpen}
            initialOffset={collapsedSnap}
            teams={teams.map((team) => ({
              id: team.teamId,
              title: team.teamName,
              description: team.description,
            }))}
            selectedTeamId={selectedTeamId}
            scrollable={activeSnapPoint === expandedSnap}
            onSelect={(teamId) => {
              onSelectTeam(Number(teamId));
              close();
            }}
            onCreateTeam={() => {
              close();
              onCreateTeam();
            }}
          />
        )}
      </BottomSheetOverlay>
    ));
  };

  return { openSheet };
};
