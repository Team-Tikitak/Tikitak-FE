import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegionFeedPage } from './RegionFeedPage';

const mockUseHomeRegions = vi.fn();

vi.mock('@/shared/api/home/queries', () => ({
  useHomeRegions: (teamId: number | null | undefined) => mockUseHomeRegions(teamId),
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
    <MemoryRouter initialEntries={['/activity/region']}>
      <Routes>
        <Route path="/activity/region" element={<RegionFeedPage />} />
        <Route path="/activity" element={<div>activity</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('RegionFeedPage', () => {
  beforeEach(() => {
    mockUseHomeRegions.mockReturnValue({
      data: {
        month: 7,
        regions: [
          {
            region: '서울 관악구',
            feedCount: 2,
            feedId: 145,
            thumbnailImageUrl: 'https://example.com/145.jpg',
          },
          {
            region: '서울 강남구',
            feedCount: 1,
            feedId: 123,
            thumbnailImageUrl: 'https://example.com/123.jpg',
          },
        ],
      },
      isPending: false,
      isError: false,
    });
  });

  it('첫 번째 지역의 대표 피드를 피드 상세 콘텐츠로 렌더링한다', () => {
    renderPage();

    expect(screen.getByText('서울 관악구에서')).toBeInTheDocument();
    expect(screen.getAllByTestId('feed-detail-content')).toHaveLength(1);
    expect(screen.getByText('145')).toBeInTheDocument();
  });

  it('지역이 하나도 없으면 활동 페이지로 리다이렉트한다', () => {
    mockUseHomeRegions.mockReturnValue({
      data: { month: 7, regions: [] },
      isPending: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText('activity')).toBeInTheDocument();
  });
});
