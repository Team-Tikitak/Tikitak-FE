import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS, toTeamDetail } from '@/app/routes/paths';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { Button, Header, ListCard, PageSection, TeamCard } from '@/shared/ui';
import { MOCK_MY_TEAMS } from '../model/mock';

const teams = MOCK_MY_TEAMS;

export const MyPage = () => {
  const navigate = useNavigate();

  return (
    <PageShell
      header={<Header title="마이페이지" variant="left" rightIcon={null} />}
      contentClassName="no-scrollbar flex flex-col gap-8 px-5 pt-7 pb-28"
    >
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
        <Button
          buttonIcon={<PlusIcon className="size-5" />}
          onClick={() => navigate(PATHS.TEAM_CREATE)}
        >
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
    </PageShell>
  );
};
