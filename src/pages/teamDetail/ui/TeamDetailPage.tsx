import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { Button, Header, MemberCard, PageSection } from '@/shared/ui';
import { useTeamDetail } from '../hooks/useTeamDetail';

export const TeamDetailPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { team, members, isOwner } = useTeamDetail();

  if (!team) {
    return (
      <PageShell
        header={<Header title="팀 상세" showBackButton onBack={() => navigate(-1)} />}
        contentClassName="flex h-full items-center justify-center py-7"
      >
        <p className="body-2 text-gray-500">팀을 찾을 수 없어요.</p>
      </PageShell>
    );
  }
  return (
    <PageShell
      header={<Header title={team.name} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col gap-8 px-5 py-7"
      bottom={
        <button className="body-2 w-full cursor-pointer text-center text-gray-500 underline">
          그룹 나가기
        </button>
      }
    >
      <PageSection title="내 프로필">
        <div className="bg-main-000 flex items-center gap-3 rounded-lg p-4">
          <img
            src={team.myProfileImageUrl}
            alt={team.myNickname}
            className="no-native-image size-10 rounded-full"
          />
          <h3 className="body-9 text-gray-900">{team.myNickname}</h3>
          <button aria-label="프로필 변경" className="body-4 text-main-001 ml-auto cursor-pointer">
            변경
          </button>
        </div>
      </PageSection>

      <PageSection title="팀 멤버">
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <MemberCard
              key={member.teamMemberId}
              avatarSrc={member.profileImageUrl ?? ''}
              name={member.nickname}
              email={member.email ?? ''}
              onRemove={isOwner ? () => {} : undefined}
            />
          ))}
        </div>
      </PageSection>
      <div className="flex flex-col gap-3">
        <Button
          buttonIcon={<PlusIcon className="size-5" />}
          onClick={() => navigate(`/teams/${teamId}/invite`)}
        >
          초대하기
        </Button>
        {isOwner && <Button variant="destructive">그룹 삭제</Button>}
      </div>
    </PageShell>
  );
};
