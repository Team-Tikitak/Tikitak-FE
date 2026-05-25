import { useLocation, Navigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useGetTeamDetail } from '@/shared/api/team/queries';
import { normalizeImageUrl } from '@/shared/lib';
import { TeamProfileSetupForm } from './TeamProfileSetupForm';
import type { TeamDraftRouteState } from '../model';

export const TeamProfileSetupPage = () => {
  const state = useLocation().state as TeamDraftRouteState | null;

  const editTeamId = state?.mode === 'edit' ? state.teamId : null;
  const { data: teamDetail } = useGetTeamDetail(editTeamId);

  if (!state) return <Navigate to={PATHS.TEAM_CREATE} replace />;
  if (state.mode === 'create' && !state.name) return <Navigate to={PATHS.TEAM_CREATE} replace />;
  if (state.mode === 'edit' && !state.teamName)
    return <Navigate to={`/teams/${state.teamId}`} replace />;

  if (state.mode === 'edit' && !teamDetail) return null;

  const editProfile = state.mode === 'edit' ? teamDetail?.myProfile : undefined;
  const promptTeamName = state.mode === 'edit' ? state.teamName : state.name;

  return (
    <TeamProfileSetupForm
      mode={state.mode}
      promptTeamName={promptTeamName}
      initialNickname={editProfile?.nickname}
      initialAvatarUrl={normalizeImageUrl(editProfile?.profileImgUrl)}
      initialProfileImgUrl={editProfile?.profileImgUrl}
    />
  );
};
