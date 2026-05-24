import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { useGetTeams, useMe, usePatchActiveTeam } from '@/shared/api/user/queries';
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
  const { data: me } = useMe();
  const { data: teams, isPending } = useGetTeams();
  const { mutate: patchActiveTeam } = usePatchActiveTeam();

  const hasTeams = me?.hasTeam ?? false;
  const teamItems = teams ?? [];

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    () => me?.activeTeamId ?? null,
  );
  const selectedTeam = teamItems.find((team) => team.teamId === selectedTeamId) ?? teamItems[0];

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
            teams={teamItems.map((team) => ({
              id: team.teamId,
              title: team.teamName,
              description: team.description,
            }))}
            selectedTeamId={selectedTeam ? selectedTeam.teamId : undefined}
            scrollable={activeSnapPoint === expandedSnap}
            onSelect={(teamId) => {
              setSelectedTeamId(Number(teamId));
              patchActiveTeam(Number(teamId));
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
        header={<HomeHeader teamName={selectedTeam?.teamName ?? ''} onTeamSelect={openTeamSheet} />}
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <MapView />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={<Header showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-1 flex-col"
    >
      <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
    </PageShell>
  );
};
