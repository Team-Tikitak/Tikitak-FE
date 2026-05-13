import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { Header } from '@/shared/ui/Header';
import { EmptyTeamView } from './EmptyTeamView';

export const HomePage = () => {
  const navigate = useNavigate();

  // TODO: useTeams() 훅으로 팀 목록 조회 후 분기


  const handleCreateTeam = () => {
    // NOTE: 팀 개설 플로우로 이동
  };

  return (
    <PageShell
      header={<Header showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col"
    >
      {hasTeams ? null : <EmptyTeamView onCreateTeam={handleCreateTeam} />}
    </PageShell>
  );
};
