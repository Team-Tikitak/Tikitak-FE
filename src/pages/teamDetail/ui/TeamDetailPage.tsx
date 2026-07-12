import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import { teamKeys } from '@/shared/api/team/keys';
import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { useEdgeSwipeBack } from '@/shared/hooks';
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh';
import { toSafeImageUrl } from '@/shared/lib';
import { Button, Header, PageSection } from '@/shared/ui';
import { PullToRefreshIndicator } from '@/shared/ui/PullToRefreshIndicator';
import { MemberCard } from './MemberCard';
import { MyProfileCard } from './MyProfileCard';
import { TeamDetailSkeleton } from './TeamDetailSkeleton';
import { useTeamDetail } from '../hooks/useTeamDetail';
import { useTeamDetailActions } from '../hooks/useTeamDetailActions';

export const TeamDetailPage = () => {
  useEdgeSwipeBack();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLElement | null>(null);
  const { teamId: teamParams } = useParams();
  const teamId = Number(teamParams);

  const { teamName, myProfile, members, isOwner, isLoading, isError } = useTeamDetail(teamId);
  const { confirmLeave, confirmRemoveMember, confirmDelete, goInvite, goEditProfile } =
    useTeamDetailActions({ teamId, teamName, memberCount: members.length });
  const pullToRefresh = usePullToRefresh({
    scrollRef: contentRef,
    disabled: !Number.isFinite(teamId) || isLoading || isError,
    onRefresh: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) }),
        queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) }),
      ]),
  });

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
      contentRef={contentRef}
      contentProps={pullToRefresh.touchHandlers}
      contentClassName="overscroll-contain relative"
      bottom={
        !isOwner && (
          <button
            className="body-2 w-full cursor-pointer text-center text-gray-500 underline"
            onClick={confirmLeave}
          >
            그룹 나가기
          </button>
        )
      }
    >
      <PullToRefreshIndicator
        pullDistance={pullToRefresh.pullDistance}
        threshold={pullToRefresh.threshold}
        armed={pullToRefresh.isRefreshArmed}
        refreshing={pullToRefresh.isRefreshing}
      />
      <div
        className="flex flex-col gap-8 px-5 py-7"
        style={{
          transform: `translateY(${pullToRefresh.pullDistance}px)`,
          transition:
            pullToRefresh.isRefreshing || pullToRefresh.pullDistance === 0
              ? 'transform 180ms ease-out'
              : undefined,
        }}
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
                avatarSrc={toSafeImageUrl(member.profileImgUrl)}
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
      </div>
    </PageShell>
  );
};
