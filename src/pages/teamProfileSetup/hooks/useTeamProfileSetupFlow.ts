import { useLocation } from 'react-router';
import { useAcceptInvitation } from '@/shared/api/invitation/queries';
import { usePatchTeamProfile } from '@/shared/api/team/queries';
import type { SubmitProfile, TeamDraftRouteState } from '../model';

export const useTeamProfileSetupFlow = () => {
  const state = useLocation().state as TeamDraftRouteState | null;

  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: patchTeamProfile, isPending: isPatching } = usePatchTeamProfile();

  const teamName = state ? (state.mode === 'edit' ? state.teamName : state.name) : '';
  const isPending = isAccepting || isPatching;

  const submit = ({ nickname }: SubmitProfile) => {
    if (!state) return;

    if (state.mode === 'create') {
      //팀 생성 로직 연결
    }

    if (state.mode === 'join') {
      acceptInvitation({
        token: state.token,
        body: { nickname, profileImgUrl: '' },
      });
      return;
    }

    if (state.mode === 'edit') {
      patchTeamProfile({ teamId: state.teamId, body: { nickname, profileImgUrl: '' } });
    }
  };

  return { state, teamName, submit, isPending };
};
