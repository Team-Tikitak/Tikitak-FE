import { useMe } from '@/shared/api/user/queries';

export const useActiveTeamId = (options?: { enabled?: boolean }): number => {
  const { data: me } = useMe(options);
  return me?.activeTeamId ?? 0;
};
