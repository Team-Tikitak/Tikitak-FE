import { overlay } from 'overlay-kit';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { BottomSheetOverlay, TeamListSheet, type TeamListSheetItem } from '@/shared/ui/BottomSheet';
import { Header } from '@/shared/ui/Header';
import { EmptyTeamView } from './EmptyTeamView';
import { HomeHeader } from './HomeHeader';
import { MapView } from './MapView';

// NOTE: useTeams() hook integration pending; temporary data for sheet behavior.
const MOCK_TEAMS = [
  { id: 'capstone', title: '캡스톤 디자인 아자잣', description: '새로운 게시글 +23' },
  { id: 'tikitak', title: '큐시즘 티키탁', description: '새로운 게시글 +4' },
  { id: 'club', title: '대학교 시디과 소모임', description: '새로운 게시글 +87' },
  { id: 'design', title: '디자인 스터디', description: '새로운 게시글 +12' },
  { id: 'frontend', title: '프론트엔드 모임', description: '새로운 게시글 +8' },
  { id: 'weekend', title: '주말 산책 크루', description: '새로운 게시글 +31' },
  { id: 'photo', title: '사진 기록반', description: '새로운 게시글 +16' },
  { id: 'branding', title: '브랜딩 워크숍', description: '새로운 게시글 +5' },
  { id: 'research', title: '사용자 리서치 팀', description: '새로운 게시글 +19' },
] satisfies TeamListSheetItem[];

const TEAM_SHEET_COLLAPSED_HEIGHT = 278;
const TEAM_SHEET_TOP_GAP = 80;

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(MOCK_TEAMS[0].id);

  const hasTeams = true;
  const selectedTeam = MOCK_TEAMS.find((team) => team.id === selectedTeamId) ?? MOCK_TEAMS[0];

  const openTeamSheet = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    const expandedHeight = Math.max(
      TEAM_SHEET_COLLAPSED_HEIGHT,
      window.innerHeight - TEAM_SHEET_TOP_GAP,
    );
    const collapsedSnap = `${TEAM_SHEET_COLLAPSED_HEIGHT}px`;
    const expandedSnap = `${expandedHeight}px`;
    const snapPoints = [collapsedSnap, expandedSnap];

    overlay.open(({ isOpen, close, unmount }) => (
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
            teams={MOCK_TEAMS}
            selectedTeamId={selectedTeam.id}
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

  if (hasTeams) {
    return (
      <PageShell
        header={<HomeHeader teamName={selectedTeam.title} onTeamSelect={openTeamSheet} />}
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
