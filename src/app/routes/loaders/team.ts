import { redirect, type LoaderFunctionArgs } from 'react-router';
import { queryClient } from '@/app/providers/queryClient';
import { teamDetailQueryOptions } from '@/shared/api/team/queries';
import { PATHS } from '../paths';
import { ensureAuthenticatedForLoader, parsePositiveIntegerParam } from './shared';

export const teamDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const teamId = parsePositiveIntegerParam(params.teamId);
  if (!teamId) return redirect(PATHS.HOME);

  await ensureAuthenticatedForLoader();
  await queryClient.ensureQueryData(teamDetailQueryOptions(teamId));
  return null;
};
