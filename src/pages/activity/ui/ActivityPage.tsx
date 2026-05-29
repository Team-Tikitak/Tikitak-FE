import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { useHomeBestAttendance } from '@/shared/api/home/queries';
import { useGetTeams, useMe } from '@/shared/api/user/queries';
import { AppHeader, DailyQuestion, EmptyTeamView, Header } from '@/shared/ui';
import { ActivitySkeleton } from './ActivitySkeleton';
import { EmptyActiveView } from './EmptyActiveView';
import { MonthlyBestAttendance } from './MonthlyBestAttendance';
import { MonthlyMemories } from './MonthlyMemories';
import { MonthlyRecommendedPlaces } from './MonthlyRecommendedPlaces';

export const ActivityPage = () => {
  const navigate = useNavigate();
  const { data: me, isPending: isMePending } = useMe();
  const { data: teams, isPending: isTeamsPending } = useGetTeams();
  const activeTeam = teams?.find((team) => team.teamId === me?.activeTeamId) ?? teams?.[0];
  const { data: question, isPending: isQuestionPending } = useGetDailyQuestion(
    activeTeam?.teamId ?? 0,
  );
  const { data: bestAttendance, isPending: isBestAttendancePending } = useHomeBestAttendance(
    activeTeam?.teamId,
  );
  const dailyQuestion = question?.content;
  const hasActiveTeam = Boolean(activeTeam?.teamId);

  const isLoading =
    isMePending ||
    isTeamsPending ||
    (hasActiveTeam && (isQuestionPending || isBestAttendancePending));
  const isEmpty = bestAttendance !== undefined && (bestAttendance.members ?? []).length === 0;

  return (
    <PageShell
      header={hasActiveTeam ? <AppHeader teamName={activeTeam?.teamName ?? ''} /> : <Header showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col gap-9 bg-white pb-28"
    >
      {hasActiveTeam && (
        <DailyQuestion
          question={dailyQuestion ?? ''}
          onClick={() => navigate(PATHS.DAILY_FEED_CREATE)}
        />
      )}
      {isLoading ? (
        <ActivitySkeleton />
      ) : !hasActiveTeam ? (
        <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
      ) : isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyActiveView />
        </div>
      ) : (
        <div className="flex flex-col gap-9 px-5">
          <MonthlyBestAttendance teamId={activeTeam?.teamId} />
          <MonthlyMemories teamId={activeTeam?.teamId} />
          <MonthlyRecommendedPlaces teamId={activeTeam?.teamId} />
        </div>
      )}
    </PageShell>
  );
};
