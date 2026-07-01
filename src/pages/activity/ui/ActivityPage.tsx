import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { shouldShowDailyQuestion } from '@/shared/api/dailyQuestion/selectors';
import { useHomeBestAttendance } from '@/shared/api/home/queries';
import { useActiveTeamSelection } from '@/shared/hooks/team/useActiveTeamSelection';
import { AppHeader, DailyQuestion, EmptyTeamView } from '@/shared/ui';
import { ActivitySkeleton } from './ActivitySkeleton';
import { EmptyActiveView } from './EmptyActiveView';
import { MonthlyBestAttendance } from './MonthlyBestAttendance';
import { MonthlyMemories } from './MonthlyMemories';

export const ActivityPage = () => {
  const navigate = useNavigate();
  const { activeTeam, openTeamSheet, toNotificationPage, isMePending, isTeamsPending } =
    useActiveTeamSelection();
  const { data: question, isPending: isQuestionPending } = useGetDailyQuestion(
    activeTeam?.teamId ?? 0,
  );
  const {
    data: bestAttendance,
    isPending: isBestAttendancePending,
    isFetching: isBestAttendanceFetching,
  } = useHomeBestAttendance(activeTeam?.teamId);
  const dailyQuestion = question?.content;
  const showDailyQuestion = shouldShowDailyQuestion(question);
  const hasActiveTeam = Boolean(activeTeam?.teamId);

  const isLoading =
    isMePending ||
    isTeamsPending ||
    (hasActiveTeam && (isQuestionPending || isBestAttendancePending));
  const isHeaderLoading = isMePending || isTeamsPending;
  const isEmpty =
    !isBestAttendanceFetching &&
    bestAttendance !== undefined &&
    (bestAttendance.members ?? []).length === 0;

  if (!isLoading && !hasActiveTeam) {
    return (
      <PageShell contentClassName="flex flex-1 flex-col">
        <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={
        <AppHeader
          teamName={activeTeam?.teamName ?? ''}
          teamNameLoading={isHeaderLoading}
          onTeamSelect={openTeamSheet}
          onBellClick={toNotificationPage}
        />
      }
      contentClassName="flex flex-col gap-9 bg-white pb-28"
    >
      {showDailyQuestion ? (
        <DailyQuestion
          question={dailyQuestion ?? ''}
          onClick={() => navigate(PATHS.DAILY_FEED_CREATE)}
        />
      ) : null}
      {isLoading ? (
        <ActivitySkeleton />
      ) : isEmpty ? (
        <div className="flex flex-1 items-center justify-center pb-3.5">
          <EmptyActiveView />
        </div>
      ) : (
        <div className="flex flex-col gap-9 px-5">
          <MonthlyBestAttendance teamId={activeTeam?.teamId} />
          <MonthlyMemories teamId={activeTeam?.teamId} />
        </div>
      )}
    </PageShell>
  );
};
