import { useQuery } from '@tanstack/react-query';
import { getTeamMembers } from './api';
import { teamKeys } from './keys';

export const useTeamMembers = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: teamKeys.members(teamId ?? 0),
    queryFn: () => getTeamMembers(teamId as number).then((res) => res.data.data),
    enabled: typeof teamId === 'number',
    staleTime: 60 * 1000,
  });
