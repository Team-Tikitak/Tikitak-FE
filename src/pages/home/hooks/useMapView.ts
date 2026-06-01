import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { shouldShowDailyQuestion } from '@/shared/api/dailyQuestion/selectors';
import { useGetPins } from '@/shared/api/map/queries';

export const useMapView = (teamId: number) => {
  const { data: question } = useGetDailyQuestion(teamId);
  const dailyQuestion = question?.content;
  const showDailyQuestion = shouldShowDailyQuestion(question);

  const { data } = useGetPins(teamId);
  const pins = data?.pins ?? [];

  return { dailyQuestion, showDailyQuestion, pins };
};
