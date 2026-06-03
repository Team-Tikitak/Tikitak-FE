import { queryClient } from '@/app/providers/queryClient';
import { sessionQueryOptions } from './sessionQuery';

export const restoreSession = async (): Promise<boolean> => {
  try {
    await queryClient.fetchQuery(sessionQueryOptions);
    return true;
  } catch {
    return false;
  }
};
