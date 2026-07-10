import { useRef, type ReactNode } from 'react';
import { useNavigationType } from 'react-router';
import { PageShell } from '@/app/layout';
import { useHeroHandoff } from '@/shared/hooks/useHeroHandoff';
import { cn } from '@/shared/lib/cn';
import { AppHeader, DailyQuestion, EmptyTeamView } from '@/shared/ui';
import { StoredHero } from '@/shared/ui/StoredHero';
import { ActivitySkeleton } from './ActivitySkeleton';
import { EmptyActiveView } from './EmptyActiveView';
import { MonthlyBestAttendance } from './MonthlyBestAttendance';
import { MonthlyMemories } from './MonthlyMemories';
import { useActivityPage } from '../hooks/useActivityPage';

const ACTIVITY_HERO_STORAGE_KEY = 'tikitak:last-activity-hero';

export const ActivityPage = () => {
  const navigationType = useNavigationType();
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
    goToDailyQuestionFeed,
    isHeroItemLoaded,
  } = useActivityPage();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { storedHero, storedHeroVisible, suppressedItemId, captureHero } = useHeroHandoff({
    storageKey: ACTIVITY_HERO_STORAGE_KEY,
    navigationType,
    scrollRestored: true,
    isItemLoaded: isHeroItemLoaded,
    scrollFrameRef: scrollRef,
  });

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
        <MonthlyMemories
          teamId={teamId}
          suppressedItemId={suppressedItemId}
          onHeroCapture={captureHero}
        />
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
              variant={dailyQuestionAnswered ? 'answered' : 'pending'}
              showAnsweredMessage={dailyQuestionAnswered}
              onClick={dailyQuestionAnswered ? goToDailyQuestionFeed : goToDailyFeedCreate}
            />
          ) : null}
        </>
      }
      contentClassName="relative isolate flex flex-col overflow-hidden bg-white"
    >
      <div
        ref={scrollRef}
        className={cn(
          'no-scrollbar relative flex min-h-0 flex-1 flex-col gap-9 overflow-y-auto',
          showDailyQuestion && 'pt-9',
        )}
      >
        {storedHero && (
          <StoredHero storedHero={storedHero} visible={storedHeroVisible} radius="8" />
        )}
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
