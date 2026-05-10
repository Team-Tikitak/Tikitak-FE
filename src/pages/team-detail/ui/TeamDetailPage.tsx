import { useNavigate } from 'react-router';
import { AppLayout } from '@/app/layout';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { Button, Header, MemberCard } from '@/shared/ui';
import { PageSection } from '@/shared/ui/PageSection/PageSection';
import { MOCK_TEAM_DETAIL, MOCK_TEAM_MEMBERS } from '../model/mock';

export const TeamDetailPage = () => {
  const navigate = useNavigate();
  const team = MOCK_TEAM_DETAIL;
  const members = MOCK_TEAM_MEMBERS;
  const isOwner = team.myRole === 'OWNER';
  return (
    <div>
      <AppLayout.Header>
        <Header title={team.name} showBackButton onBack={() => navigate(-1)} />
      </AppLayout.Header>

      <AppLayout.Content>
        <div className="flex flex-col gap-8 px-5 py-7">
          <PageSection title="내 프로필">
            <div className="bg-main-000 flex items-center gap-3 rounded-[8px] p-4">
              <img
                src={team.myProfileImageUrl}
                alt={team.myNickname}
                className="size-10 rounded-full"
              />
              <h3 className="body-9 text-gray-900">{team.myNickname}</h3>
              <button
                aria-label="프로필 변경"
                className="body-4 text-main-001 ml-auto cursor-pointer"
              >
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
            <Button buttonIcon={<PlusIcon />}>초대하기</Button>
            {isOwner && <Button variant="destructive">그룹 삭제</Button>}
          </div>
        </div>
      </AppLayout.Content>
      <AppLayout.Bottom>
        <button className="body-2 mt-8 w-full cursor-pointer text-center text-gray-500 underline">
          그룹 나가기
        </button>
      </AppLayout.Bottom>
    </div>
  );
};
