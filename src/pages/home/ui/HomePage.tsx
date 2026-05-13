import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { Header } from '@/shared/ui/Header';
import { EmptyTeamView } from './EmptyTeamView';
import { HomeHeader } from './HomeHeader';
import { MapView } from './MapView';

export const HomePage = () => {
  const navigate = useNavigate();

  // NOTE: useTeams() 훅으로 팀 목록 조회 후 분기
  // - teams.length === 0 → EmptyTeamView
  // - teams.length > 0   → MapView
  const hasTeams = true;

  const teamName = '캡스톤 디자인 아자잣';

  const handleSelectTeam = () => {
    //TODO: 팀 선택 바텀 시트
  };

  if (hasTeams) {
    return (
      <PageShell
        header={<HomeHeader teamName={teamName} onTeamSelect={handleSelectTeam} />}
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
