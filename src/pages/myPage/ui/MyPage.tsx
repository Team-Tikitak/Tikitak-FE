import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS, toTermsDetail } from '@/app/routes/paths';
import { useLogout } from '@/shared/api/auth/queries';
import { useDeleteMe, useGetTeams } from '@/shared/api/user/queries';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import {
  alertDialog,
  confirmExactTextDialog,
  isNativeDialogPlatform,
} from '@/shared/lib/native/nativeDialog';
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

  const handleWithdraw = async () => {
    if (teams.some((team) => team.role === 'OWNER')) {
      void alertDialog(
        '팀장으로 있는 그룹이 있으면 탈퇴할 수 없어요. 먼저 그룹을 삭제한 후 탈퇴해 주세요.',
        '회원 탈퇴를 할 수 없어요',
      );
      return;
    }
    if (isNativeDialogPlatform()) {
      const confirmed = await confirmExactTextDialog({
        title: '정말 탈퇴하시겠어요?',
        message: '계정과 작성한 기록은 복구할 수 없어요. 계속하려면 "탈퇴하기"를 입력해 주세요.',
        confirmationText: '탈퇴하기',
        okButtonTitle: '확인',
        cancelButtonTitle: '취소',
      });
      if (confirmed) deleteMe();
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
      contentClassName="flex flex-col overflow-hidden"
    >
      {/* min-h 100%+1px: 콘텐츠가 화면보다 짧아도 항상 넘치게 해 iOS 바운스 스크롤 유지 */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-[calc(100%+1px)] flex-col gap-8 px-5 pt-7 pb-[calc(var(--bottom-nav-clearance)+env(safe-area-inset-bottom))]">
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
                <ListCard title="이용 약관" onClick={() => navigate(toTermsDetail('service'))} />
                <ListCard
                  title="개인정보 처리방침"
                  onClick={() => navigate(toTermsDetail('privacy'))}
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
        </div>
      </div>
    </PageShell>
  );
};
