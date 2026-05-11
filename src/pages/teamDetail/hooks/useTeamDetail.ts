import { useParams } from 'react-router';
import { MOCK_TEAM_DETAIL, MOCK_TEAM_MEMBERS } from '../model/mock';

export const useTeamDetail = () => {
  const { teamId } = useParams();
  const team = Number(teamId) === MOCK_TEAM_DETAIL.teamId ? MOCK_TEAM_DETAIL : null;
  const members = team ? MOCK_TEAM_MEMBERS : [];
  const isOwner = team?.myRole === 'OWNER';

  return { team, members, isOwner };
};
