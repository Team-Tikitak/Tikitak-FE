import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useTeamMembers } from '@/shared/api/team/queries';
import type { TeamMember } from '@/shared/api/team/types';
import { useGetTeams, useMe } from '@/shared/api/user/queries';
import { useFeedForm } from '@/shared/hooks/useFeedForm';
import { EmptyTeamView, Header, PageState } from '@/shared/ui';
import { FeedFormView } from './FeedFormView';
import { useFeedShare } from '../hooks/useFeedShare';

interface FeedCreateFormProps {
  teamId: number;
  teamMembers: TeamMember[];
  myMember: TeamMember | null;
}

const FeedCreateForm = ({ teamId, teamMembers, myMember }: FeedCreateFormProps) => {
  const navigate = useNavigate();
  const form = useFeedForm({ initialMembers: myMember ? [myMember] : [] });
  const { content, photos, selectedPlace, selectedMembers, removePhoto, isShareDisabled } = form;

  const { share, isSharing } = useFeedShare({
    teamId,
    content,
    photos,
    selectedPlace,
    selectedMembers,
  });

  const photoItems = photos.map((photo) => ({
    key: photo.id,
    src: photo.url,
    onRemove: () => removePhoto(photo.id),
  }));

  return (
    <FeedFormView
      title="글쓰기"
      submitLabel="공유하기"
      submitDisabled={isShareDisabled || isSharing}
      onBack={() => navigate(-1)}
      onSubmit={share}
      form={form}
      teamMembers={teamMembers}
      myMemberId={myMember?.teamMemberId}
      photoItems={photoItems}
      photoCount={photos.length}
    />
  );
};

export const FeedCreatePage = () => {
  const navigate = useNavigate();
  const { data: me, isPending: isMePending } = useMe();
  const { data: teams, isPending: isTeamsPending } = useGetTeams();
  const teamId = me?.activeTeamId ?? null;
  const { data: teamMembersData, isPending: isMembersPending } = useTeamMembers(teamId);

  const myTeamMemberId = teams?.find((team) => team.teamId === teamId)?.teamMemberId ?? null;
  const rawMembers = teamMembersData?.members ?? [];
  const myMember = rawMembers.find((m) => m.teamMemberId === myTeamMemberId) ?? null;
  const teamMembers = myMember
    ? [myMember, ...rawMembers.filter((m) => m.teamMemberId !== myTeamMemberId)]
    : rawMembers;

  const isLoading = isMePending || isTeamsPending || isMembersPending;

  return (
    <PageState
      header={<Header title="글쓰기" onBack={() => navigate(-1)} />}
      isLoading={isLoading}
      loadingSlot={<div />}
      isError={!isLoading && !teamId}
      errorSlot={<EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />}
    >
      {teamId && <FeedCreateForm teamId={teamId} teamMembers={teamMembers} myMember={myMember} />}
    </PageState>
  );
};
