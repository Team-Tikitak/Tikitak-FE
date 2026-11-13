import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedActionMenu } from './FeedActionMenu';

const { deleteFeed, deleteState, disintegrate, restoreImage, openDialog } = vi.hoisted(() => ({
  deleteFeed: vi.fn(),
  deleteState: { isPending: false },
  disintegrate: vi.fn(),
  restoreImage: vi.fn(),
  openDialog: vi.fn(),
}));

vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/shared/api/feed/queries', () => ({
  useGetFeedDetail: () => ({ data: { isMine: true, type: 'GENERAL' } }),
  useDeleteFeed: () => ({ mutate: deleteFeed, isPending: deleteState.isPending }),
}));
vi.mock('@/shared/lib/disintegrateImage', () => ({ disintegrateImage: disintegrate }));
vi.mock('../ConfirmDialog', () => ({ openConfirmDialog: openDialog }));
vi.mock('../ActiveMenu/ActiveMenu', () => ({
  ActiveMenu: ({ onDelete }: { onDelete: () => void }) => (
    <button type="button" onClick={onDelete}>
      삭제
    </button>
  ),
}));

// 넓은 화면: 피드 영역(400~793)이 가운데 정렬되고, 이전 사진은 왼쪽 여백(7~400)에 걸쳐 있다
const RECTS: Record<string, { left: number; width: number }> = {
  feed: { left: 400, width: 393 },
  'previous-frame': { left: 7, width: 393 },
  'current-frame': { left: 400, width: 393 },
};

const renderInFeed = () =>
  render(
    <div data-feed-detail data-testid="feed">
      <figure data-feed-detail-image-frame data-testid="previous-frame" />
      <figure data-feed-detail-image-frame data-testid="current-frame" />
      <FeedActionMenu teamId={1} feedId={2} />
    </div>,
  );

describe('FeedActionMenu', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    deleteState.isPending = false;
    disintegrate.mockReturnValue(restoreImage);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const { left, width } = RECTS[this.dataset.testid ?? ''] ?? { left: 0, width: 0 };
      return { left, width, right: left + width } as DOMRect;
    });
  });

  it('삭제를 확정하면 넓은 화면에서도 지금 보고 있는 사진을 흩날리고 실패 시 되돌린다', () => {
    renderInFeed();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    openDialog.mock.calls[0][0].onConfirm();

    expect(disintegrate).toHaveBeenCalledWith(screen.getByTestId('current-frame'));
    expect(deleteFeed).toHaveBeenCalledWith(undefined, { onError: restoreImage });
  });

  it('삭제 요청 중에는 삭제 확인창을 다시 띄우지 않는다', () => {
    deleteState.isPending = true;
    renderInFeed();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    expect(openDialog).not.toHaveBeenCalled();
  });
});
