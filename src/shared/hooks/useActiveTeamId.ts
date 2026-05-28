import { useMe } from '@/shared/api/user/queries';

export const useActiveTeamId = (): number => {
  const { data: me } = useMe();
  return me?.activeTeamId ?? 0;
};
