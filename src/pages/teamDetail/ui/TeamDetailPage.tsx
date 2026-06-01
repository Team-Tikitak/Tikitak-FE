import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { normalizeImageUrl } from '@/shared/lib';
import { Button, Header, MemberCard, PageSection } from '@/shared/ui';
import { MyProfileCard } from './MyProfileCard';
import { TeamDetailSkeleton } from './TeamDetailSkeleton';
import { useTeamDetail } from '../hooks/useTeamDetail';
import { useTeamDetailActions } from '../hooks/useTeamDetailActions';

export const TeamDetailPage = () => {
  const navigate = useNavigate();
  const { teamId: teamParams } = useParams();
  const teamId = Number(teamParams);

  const { teamName, myProfile, members, isOwner, isLoading, isError } = useTeamDetail(teamId);
  const { confirmLeave, confirmRemoveMember, confirmDelete, goInvite, goEditProfile } =
    useTeamDetailActions({ teamId, teamName });

  if (isError) {
    return (
      <PageShell
        header={<Header title="팀 상세" showBackButton onBack={() => navigate(-1)} />}
        contentClassName="flex h-full items-center justify-center py-7"
      >
        <p className="body-2 text-gray-500">팀을 찾을 수 없어요.</p>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell
        header={<Header title={teamName} showBackButton onBack={() => navigate(-1)} />}
        contentClassName="flex flex-col gap-8 px-5 py-7"
      >
        <TeamDetailSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={<Header title={teamName} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col gap-8 px-5 py-7"
      bottom={
        <button
          className="body-2 w-full cursor-pointer text-center text-gray-500 underline"
          onClick={confirmLeave}
        >
          그룹 나가기
        </button>
      }
    >
      <PageSection title="내 프로필">
        <MyProfileCard
          nickname={myProfile?.nickname}
          profileImgUrl={myProfile?.profileImgUrl}
          onEdit={goEditProfile}
        />
      </PageSection>

      <PageSection title="팀 멤버">
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <MemberCard
              key={member.teamMemberId}
              avatarSrc={normalizeImageUrl(member.profileImgUrl) ?? ''}
              name={member.nickname}
              email={member.email}
              onRemove={isOwner ? () => confirmRemoveMember(member) : undefined}
            />
          ))}
        </div>
      </PageSection>
      <div className="flex flex-col gap-3">
        <Button buttonIcon={<PlusIcon className="size-5" />} onClick={goInvite}>
          초대하기
        </Button>
        {isOwner && (
          <Button onClick={confirmDelete} variant="destructive">
            그룹 삭제
          </Button>
        )}
      </div>
    </PageShell>
  );
};
