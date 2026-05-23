import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { useGetTeams } from '@/shared/api/user/queries';
import { openOverlay } from '@/shared/lib';
import { BottomSheetOverlay, TeamListSheet } from '@/shared/ui/BottomSheet';
import { Header } from '@/shared/ui/Header';
import { EmptyTeamView } from './EmptyTeamView';
import { HomeHeader } from './HomeHeader';
import { MapView } from './MapView';

const TEAM_SHEET_COLLAPSED_HEIGHT = 294;
const TEAM_SHEET_TOP_GAP = 80;

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: teams, isPending } = useGetTeams();
  const teamItems = (teams ?? []).map((team) => ({
    id: String(team.teamId),
    title: team.teamName,
    description: team.description,
  }));

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const hasTeams = teamItems.length > 0;
  const selectedTeam = teamItems.find((team) => team.id === selectedTeamId) ?? teamItems[0];

  const openTeamSheet = () => {
    const expandedHeight = Math.max(
      TEAM_SHEET_COLLAPSED_HEIGHT,
      window.innerHeight - TEAM_SHEET_TOP_GAP,
    );
    const collapsedSnap = `${TEAM_SHEET_COLLAPSED_HEIGHT}px`;
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
            teams={teamItems}
            selectedTeamId={selectedTeam?.id}
            scrollable={activeSnapPoint === expandedSnap}
            onSelect={(teamId) => {
              setSelectedTeamId(teamId);
              close();
            }}
          />
        )}
      </BottomSheetOverlay>
    ));
  };

  if (isPending) return null;

  if (hasTeams) {
    return (
      <PageShell
        header={<HomeHeader teamName={selectedTeam?.title ?? ''} onTeamSelect={openTeamSheet} />}
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <MapView />
      </PageShell>
    );
  }

  return (
    <PageShell header={<Header showBackButton onBack={() => navigate(-1)} />}>
      <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
    </PageShell>
  );
};
