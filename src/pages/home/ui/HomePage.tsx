import { useNavigate } from 'react-router';
import { AppLayout } from '@/app/layout';
import { Header } from '@/shared/ui/Header';
import { EmptyTeamView } from './EmptyTeamView';

export const HomePage = () => {
  const navigate = useNavigate();

  // NOTE: useTeams() 훅으로 팀 목록 조회 후 분기
  // - teams.length === 0 → EmptyTeamView
  // - teams.length > 0   → MapView (다음 단계에서 구현)
  const hasTeams = false;

  const handleCreateTeam = () => {
    // NOTE: 팀 개설 플로우로 이동
  };

  return (
    <>
      <AppLayout.Header>
        <Header showBackButton onBack={() => navigate(-1)} />
      </AppLayout.Header>

      <AppLayout.Content className="flex flex-col">
        {hasTeams ? null : <EmptyTeamView onCreateTeam={handleCreateTeam} />}
      </AppLayout.Content>
    </>
  );
};
