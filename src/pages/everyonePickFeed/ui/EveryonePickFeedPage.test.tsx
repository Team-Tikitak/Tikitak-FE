import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EveryonePickFeedPage } from './EveryonePickFeedPage';

const mockUseHomeEveryonePick = vi.fn();

vi.mock('@/shared/api/home/queries', () => ({
  useHomeEveryonePick: (teamId: number | null | undefined) => mockUseHomeEveryonePick(teamId),
}));

vi.mock('@/shared/hooks/team/useActiveTeamId', () => ({
  useActiveTeamId: () => 1,
}));

vi.mock('@/shared/hooks/useEdgeSwipeBack', () => ({
  useEdgeSwipeBack: vi.fn(),
}));

vi.mock('@/shared/hooks/useFirstVisitHint', () => ({
  useFirstVisitHint: () => ({ seen: false, markSeen: vi.fn() }),
}));

vi.mock('@/shared/ui/FeedDetail/FeedDetailContent', () => ({
  FeedDetailContent: ({ feedId }: { feedId: number }) => (
    <article data-testid="feed-detail-content">{feedId}</article>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/activity/everyone-pick']}>
      <EveryonePickFeedPage />
    </MemoryRouter>,
  );

describe('EveryonePickFeedPage', () => {
  beforeEach(() => {
    mockUseHomeEveryonePick.mockReturnValue({
      data: {
        month: 7,
        picks: [
          { feedId: 1, thumbnailImageUrl: 'https://example.com/1.jpg', heroPreviewUrl: '' },
          { feedId: 2, thumbnailImageUrl: 'https://example.com/2.jpg', heroPreviewUrl: '' },
        ],
      },
      isPending: false,
      isError: false,
    });
  });

  it('모두의 PICK 응답 리스트 전체를 피드 상세 콘텐츠로 렌더링한다', () => {
    renderPage();

    expect(screen.getAllByTestId('feed-detail-content')).toHaveLength(2);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('모두의 PICK이 없으면 피드 콘텐츠를 렌더링하지 않는다', () => {
    mockUseHomeEveryonePick.mockReturnValue({
      data: { month: 7, picks: [] },
      isPending: false,
      isError: false,
    });

    renderPage();

    expect(screen.queryAllByTestId('feed-detail-content')).toHaveLength(0);
  });
});
