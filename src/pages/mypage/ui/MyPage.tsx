import { useNavigate } from 'react-router';
import { AppLayout } from '@/app/layout';
import { PATHS, toTeamDetail } from '@/app/routes/paths';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { Button, Header, ListCard, TeamCard } from '@/shared/ui';
import { PageSection } from '@/shared/ui/PageSection/PageSection';
import { MOCK_MY_TEAMS } from '../model/mock';

const teams = MOCK_MY_TEAMS;

export const MyPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <AppLayout.Header>
        <Header title="마이페이지" variant="left" />
      </AppLayout.Header>

      <AppLayout.Content>
        <div className="flex flex-col gap-8 px-5 py-7">
          <PageSection title="내 팀" className="gap-3">
            {teams.map((team) => (
              <TeamCard
                key={team.teamId}
                teamName={team.name}
                memberCount={team.memberCount}
                users={[{ id: team.teamMemberId, src: team.profileImageUrl }]}
                isLeader={team.role === 'OWNER'}
                onClick={() => navigate(toTeamDetail(team.teamId))}
              />
            ))}
            <Button buttonIcon={<PlusIcon />} onClick={() => navigate(PATHS.TEAM_CREATE)}>
              팀 개설하기
            </Button>
          </PageSection>

          <PageSection title="약관 및 정책">
            <ListCard title="이용 약관" />
            <ListCard title="개인정보 처리방침" />
          </PageSection>

          <PageSection title="고객 지원">
            <ListCard title="고객센터" />
            <ListCard title="로그아웃" />
            <ListCard title="회원 탈퇴" />
          </PageSection>
        </div>
      </AppLayout.Content>
    </div>
  );
};
