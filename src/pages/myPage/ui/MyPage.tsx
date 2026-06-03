import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useLogout } from '@/shared/api/auth/queries';
import { useDeleteMe, useGetTeams } from '@/shared/api/user/queries';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { alertDialog } from '@/shared/lib/native/nativeDialog';
import { Header, ListCard, PageSection } from '@/shared/ui';
import { openConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { MyPageSkeleton } from './MyPageSkeleton';
import { MyPageTeamCard } from './MyPageTeamCard';
import { EXTERNAL_LINKS } from '../constants/externalLinks';

export const MyPage = () => {
  const navigate = useNavigate();
  const { data: teams = [], isPending: isTeamsPending } = useGetTeams();
  const { mutate: logout } = useLogout();
  const { mutate: deleteMe } = useDeleteMe();

  const handleWithdraw = () => {
    if (teams.some((team) => team.role === 'OWNER')) {
      void alertDialog(
        '팀장으로 있는 그룹이 있으면 탈퇴할 수 없어요. 먼저 그룹을 삭제하거나 다른 멤버에게 위임해 주세요.',
        '회원 탈퇴를 할 수 없어요',
      );
      return;
    }
    openConfirmDialog({
      title: '정말 탈퇴하시겠어요?',
      description: '계정과 작성한 기록은 복구할 수 없어요.',
      confirmLabel: '탈퇴하기',
      destructive: true,
      onConfirm: () => deleteMe(),
    });
  };

  return (
    <PageShell
      header={<Header title="마이페이지" variant="left" rightIcon={null} />}
      contentClassName="no-scrollbar flex flex-col gap-8 px-5 pt-7 pb-28"
    >
      {isTeamsPending ? (
        <MyPageSkeleton />
      ) : (
        <>
          <PageSection
            title="내 팀"
            icon={<PlusIcon className="mr-1.5 size-4" />}
            iconClick={() => navigate(PATHS.TEAM_CREATE)}
            className="gap-3"
          >
            {teams.map((team) => (
              <MyPageTeamCard key={team.teamId} team={team} />
            ))}
          </PageSection>

          <PageSection title="약관 및 정책">
            <ListCard
              title="이용 약관"
              onClick={() => window.open(EXTERNAL_LINKS.TERMS, '_blank', 'noopener,noreferrer')}
            />
            <ListCard
              title="개인정보 처리방침"
              onClick={() =>
                window.open(EXTERNAL_LINKS.PRIVACY_POLICY, '_blank', 'noopener,noreferrer')
              }
            />
          </PageSection>

          <PageSection title="고객 지원">
            <ListCard
              title="고객센터"
              onClick={() =>
                window.open(EXTERNAL_LINKS.CUSTOMER_SUPPORT, '_blank', 'noopener,noreferrer')
              }
            />
            <ListCard title="로그아웃" onClick={() => logout()} />
            <ListCard title="회원 탈퇴" onClick={handleWithdraw} />
          </PageSection>
        </>
      )}
    </PageShell>
  );
};
