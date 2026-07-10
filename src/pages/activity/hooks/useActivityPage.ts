import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import {
  isDailyQuestionAnswered,
  shouldShowDailyQuestion,
} from '@/shared/api/dailyQuestion/selectors';
import {
  useHomeBestAttendance,
  useHomeEveryonePick,
  useHomeRegions,
} from '@/shared/api/home/queries';
import { useActiveTeamSelection } from '@/shared/hooks/team/useActiveTeamSelection';
import { useHasUnreadNotifications } from '@/shared/hooks/useHasUnreadNotifications';

export const useActivityPage = () => {
  const navigate = useNavigate();
  const { activeTeam, openTeamSheet, toNotificationPage, isMePending, isTeamsPending } =
    useActiveTeamSelection();
  const teamId = activeTeam?.teamId;

  const { data: question, isPending: isQuestionPending } = useGetDailyQuestion(teamId ?? 0);
  const { data: bestAttendance, isPending: isBestAttendancePending } =
    useHomeBestAttendance(teamId);
  const { data: pickData, isPending: isPickPending } = useHomeEveryonePick(teamId);
  const { data: regionsData, isPending: isRegionsPending } = useHomeRegions(teamId);
  const hasUnreadNotifications = useHasUnreadNotifications();

  const showDailyQuestion = shouldShowDailyQuestion(question);
  const dailyQuestionAnswered = isDailyQuestionAnswered(question);
  const hasActiveTeam = Boolean(teamId);

  const isLoading =
    isMePending ||
    isTeamsPending ||
    (hasActiveTeam &&
      (isQuestionPending || isBestAttendancePending || isPickPending || isRegionsPending));
  const isHeaderLoading = isMePending || isTeamsPending;

  // 빈 상태 판별은 isPending 기준 — isFetching을 쓰면 백그라운드 리패치마다 isEmpty가 토글돼 깜빡인다
  const hasNoAttendance =
    !isBestAttendancePending &&
    bestAttendance !== undefined &&
    (bestAttendance.members ?? []).length === 0;
  const hasNoPicks =
    !isPickPending && pickData !== undefined && (pickData.picks ?? []).length === 0;
  const hasNoRegions =
    !isRegionsPending && regionsData !== undefined && (regionsData.regions ?? []).length === 0;
  const isEmpty = hasNoAttendance && hasNoPicks && hasNoRegions;

  const goToTeamCreate = () => navigate(PATHS.TEAM_CREATE);
  const goToDailyFeedCreate = () => navigate(PATHS.DAILY_FEED_CREATE);
  const goToDailyQuestionFeed = () => navigate(PATHS.FEED);

  // 히어로 핸드오프가 복귀 시 저장된 히어로의 대상이 아직 화면에 남아있는지 확인할 때 쓴다
  const isHeroItemLoaded = (itemId: string) =>
    String(pickData?.picks[0]?.feedId) === itemId ||
    String(regionsData?.regions[0]?.feedId) === itemId;

  return {
    activeTeam,
    teamId,
    openTeamSheet,
    toNotificationPage,
    dailyQuestion: question?.content ?? '',
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
  };
};
