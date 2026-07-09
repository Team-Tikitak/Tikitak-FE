import { Navigate, useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useEdgeSwipeBack } from '@/shared/hooks/useEdgeSwipeBack';
import { Header, PageState } from '@/shared/ui';
import { FeedDetailList } from '@/shared/ui/FeedDetailList';
import { useRegionFeed } from '../hooks/useRegionFeed';

export const RegionFeedPage = () => {
  useEdgeSwipeBack();
  const navigate = useNavigate();
  const { teamId, region, items, isLoading, isError } = useRegionFeed();

  if (!isLoading && !isError && !region) {
    return <Navigate to={PATHS.ACTIVITY} replace />;
  }

  const header = (
    <Header title={region ? `${region}에서` : ''} showBackButton onBack={() => navigate(-1)} />
  );

  return (
    <PageState
      header={header}
      isLoading={isLoading}
      isError={isError}
      errorMessage="지역별 사진을 불러오지 못했습니다."
    >
      <PageShell header={header} contentClassName="no-scrollbar flex flex-col gap-[60px] mt-3">
        <FeedDetailList teamId={teamId} items={items} />
      </PageShell>
    </PageState>
  );
};
