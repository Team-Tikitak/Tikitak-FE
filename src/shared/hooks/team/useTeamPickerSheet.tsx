import type { Team } from '@/shared/api/user/types';
import { openOverlay } from '@/shared/lib';
import { BottomSheetOverlay, TeamListSheet } from '@/shared/ui/BottomSheet';

// 팀 2개 풀 + 3번째 살짝 보이는 높이
const COLLAPSED_HEIGHT = 360;
const TOP_GAP = 80;
const DAILY_QUESTION_BANNER_SELECTOR = '[data-daily-question-banner]';

const getExpandedHeight = () => {
  const dailyQuestionBanner = document.querySelector(DAILY_QUESTION_BANNER_SELECTOR);
  const topGap = dailyQuestionBanner?.getBoundingClientRect().bottom ?? TOP_GAP;

  return Math.max(COLLAPSED_HEIGHT, window.innerHeight - topGap);
};

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
    const expandedHeight = getExpandedHeight();
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
