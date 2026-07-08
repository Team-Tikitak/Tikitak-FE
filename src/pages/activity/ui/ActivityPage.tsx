import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { shouldShowDailyQuestion } from '@/shared/api/dailyQuestion/selectors';
import {
  useHomeBestAttendance,
  useHomeEveryonePick,
  useHomeRegions,
} from '@/shared/api/home/queries';
import { useActiveTeamSelection } from '@/shared/hooks/team/useActiveTeamSelection';
import { cn } from '@/shared/lib/cn';
import { AppHeader, DailyQuestion, EmptyTeamView } from '@/shared/ui';
import { ActivitySkeleton } from './ActivitySkeleton';
import { EmptyActiveView } from './EmptyActiveView';
import { MonthlyBestAttendance } from './MonthlyBestAttendance';
import { MonthlyMemories } from './MonthlyMemories';
import type { ReactNode } from 'react';

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
  const { data: pickData, isPending: isPickPending } = useHomeEveryonePick(activeTeam?.teamId);
  const { data: regionsData, isPending: isRegionsPending } = useHomeRegions(activeTeam?.teamId);

  const dailyQuestion = question?.content;
  const showDailyQuestion = shouldShowDailyQuestion(question);
  const hasActiveTeam = Boolean(activeTeam?.teamId);

  const isLoading =
    isMePending ||
    isTeamsPending ||
    (hasActiveTeam &&
      (isQuestionPending || isBestAttendancePending || isPickPending || isRegionsPending));
  const isHeaderLoading = isMePending || isTeamsPending;

  const hasNoAttendance =
    !isBestAttendanceFetching &&
    bestAttendance !== undefined &&
    (bestAttendance.members ?? []).length === 0;
  const hasNoPicks =
    !isPickPending && pickData !== undefined && (pickData.picks ?? []).length === 0;
  const hasNoRegions =
    !isRegionsPending && regionsData !== undefined && (regionsData.regions ?? []).length === 0;
  const isEmpty = hasNoAttendance && hasNoPicks && hasNoRegions;

  if (!isLoading && !hasActiveTeam) {
    return (
      <PageShell contentClassName="flex flex-1 flex-col">
        <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
      </PageShell>
    );
  }

  let content: ReactNode;
  if (isLoading) {
    content = <ActivitySkeleton />;
  } else if (isEmpty) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <EmptyActiveView />
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-9 px-5">
        <MonthlyBestAttendance teamId={activeTeam?.teamId} />
        <MonthlyMemories teamId={activeTeam?.teamId} />
      </div>
    );
  }

  return (
    <PageShell
      header={
        <>
          <AppHeader
            teamName={activeTeam?.teamName ?? ''}
            teamNameLoading={isHeaderLoading}
            onTeamSelect={openTeamSheet}
            onBellClick={toNotificationPage}
          />
          {showDailyQuestion ? (
            <DailyQuestion
              question={dailyQuestion ?? ''}
              onClick={() => navigate(PATHS.DAILY_FEED_CREATE)}
            />
          ) : null}
        </>
      }
      contentClassName="flex flex-col overflow-hidden bg-white"
    >
      <div
        className={cn(
          'no-scrollbar flex min-h-0 flex-1 flex-col gap-9 overflow-y-auto',
          showDailyQuestion && 'pt-9',
        )}
      >
        {content}
        {/* iOS(WebKit)는 스크롤 컨테이너 자신의 padding-bottom을 스크롤 범위에 안 넣어서 자식 스페이서로 하단 여백 확보 */}
        <div className="h-9 shrink-0" aria-hidden="true" />
      </div>
    </PageShell>
  );
};
