import { type QueryClient } from '@tanstack/react-query';
import { teamKeys } from './keys';
import { homeKeys } from '../home/keys';
import { mapKeys } from '../map/keys';
import { userKeys } from '../user/keys';

export const invalidateTeamMembershipQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: teamKeys.all });
  queryClient.invalidateQueries({ queryKey: userKeys.all });
  queryClient.removeQueries({ queryKey: mapKeys.all });
  queryClient.removeQueries({ queryKey: homeKeys.all });
};
