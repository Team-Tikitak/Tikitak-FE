import { PageShell } from '@/app/layout';
import { cn } from '@/shared/lib/cn';
import { AppHeader, DailyQuestion, EmptyTeamView } from '@/shared/ui';
import { ActivitySkeleton } from './ActivitySkeleton';
import { EmptyActiveView } from './EmptyActiveView';
import { MonthlyBestAttendance } from './MonthlyBestAttendance';
import { MonthlyMemories } from './MonthlyMemories';
import { useActivityPage } from '../hooks/useActivityPage';
import type { ReactNode } from 'react';

export const ActivityPage = () => {
  const {
    activeTeam,
    teamId,
    openTeamSheet,
    toNotificationPage,
    dailyQuestion,
    showDailyQuestion,
    dailyQuestionAnswered,
    isLoading,
    isHeaderLoading,
    hasActiveTeam,
    hasUnreadNotifications,
    isEmpty,
    goToTeamCreate,
    goToDailyFeedCreate,
  } = useActivityPage();

  if (!isLoading && !hasActiveTeam) {
    return (
      <PageShell contentClassName="flex flex-1 flex-col">
        <EmptyTeamView onCreateTeam={goToTeamCreate} />
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
        <MonthlyBestAttendance teamId={teamId} />
        <MonthlyMemories teamId={teamId} />
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
            showNotificationDot={hasUnreadNotifications}
            onTeamSelect={openTeamSheet}
            onBellClick={toNotificationPage}
          />
          {showDailyQuestion ? (
            <DailyQuestion
              question={dailyQuestion}
              onClick={dailyQuestionAnswered ? undefined : goToDailyFeedCreate}
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
        <div
          className="h-[calc(var(--bottom-nav-clearance)+env(safe-area-inset-bottom))] shrink-0"
          aria-hidden="true"
        />
      </div>
    </PageShell>
  );
};
