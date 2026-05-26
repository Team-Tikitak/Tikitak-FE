import { useGetDailyQuestion } from '@/shared/api/dailyQuestion/queries';
import { useGetPins } from '@/shared/api/map/queries';
import { useMe } from '@/shared/api/user/queries';

export const useMapView = () => {
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? 0;

  const { data: question } = useGetDailyQuestion(teamId);
  const dailyQuestion = question?.content;

  const { data } = useGetPins(teamId);
  const pins = data?.pins ?? [];

  return { dailyQuestion, pins };
};
