import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { useHomeBestAttendance } from '@/shared/api/home/queries';
import { useGetTeams, useMe } from '@/shared/api/user/queries';
import { AppHeader, DailyQuestion } from '@/shared/ui';
import { EmptyActiveView } from './EmptyActiveView';
import { MonthlyBestAttendance } from './MonthlyBestAttendance';
import { MonthlyMemories } from './MonthlyMemories';
import { MonthlyRecommendedPlaces } from './MonthlyRecommendedPlaces';

export const ActivityPage = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: teams } = useGetTeams();
  const activeTeam = teams?.find((team) => team.teamId === me?.activeTeamId) ?? teams?.[0];
  const { data: question } = useGetDailyQuestion(activeTeam?.teamId ?? 0);
  const { data: bestAttendance } = useHomeBestAttendance(activeTeam?.teamId);
  const dailyQuestion = question?.content;

  const isEmpty = bestAttendance !== undefined && (bestAttendance.members ?? []).length === 0;

  return (
    <PageShell
      header={<AppHeader teamName={activeTeam?.teamName ?? ''} />}
      contentClassName="flex flex-col gap-9 bg-white pb-28"
    >
      <DailyQuestion
        question={dailyQuestion ?? ''}
        onClick={() => navigate(PATHS.DAILY_FEED_CREATE)}
      />
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyActiveView />
        </div>
      ) : (
        <div className="flex flex-col gap-9 px-5">
          <MonthlyBestAttendance teamId={activeTeam?.teamId} />
          <MonthlyMemories teamId={activeTeam?.teamId} />
          <MonthlyRecommendedPlaces />
        </div>
      )}
    </PageShell>
  );
};
