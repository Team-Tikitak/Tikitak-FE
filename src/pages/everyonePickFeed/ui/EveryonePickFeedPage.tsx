import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { useEdgeSwipeBack } from '@/shared/hooks/useEdgeSwipeBack';
import { Header, PageState } from '@/shared/ui';
import { FeedDetailList } from '@/shared/ui/FeedDetailList';
import { useEveryonePickFeed } from '../hooks/useEveryonePickFeed';

export const EveryonePickFeedPage = () => {
  useEdgeSwipeBack();
  const navigate = useNavigate();
  const { teamId, items, isLoading, isError } = useEveryonePickFeed();

  const header = <Header title="모두의 PICK" showBackButton onBack={() => navigate(-1)} />;

  return (
    <PageState
      header={header}
      isLoading={isLoading}
      isError={isError}
      errorMessage="모두의 PICK을 불러오지 못했습니다."
    >
      <PageShell header={header} contentClassName="no-scrollbar flex flex-col gap-[60px] mt-3">
        <FeedDetailList teamId={teamId} items={items} />
      </PageShell>
    </PageState>
  );
};
