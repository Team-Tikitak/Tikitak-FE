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

const renderInFeed = () =>
  render(
    <div data-feed-detail>
      <figure data-feed-detail-image-frame data-testid="frame" />
      <FeedActionMenu teamId={1} feedId={2} />
    </div>,
  );

describe('FeedActionMenu', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    deleteState.isPending = false;
    disintegrate.mockReturnValue(restoreImage);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 390,
    } as DOMRect);
  });

  it('삭제를 확정하면 보이는 사진을 흩날리고 실패 시 원래대로 되돌린다', () => {
    renderInFeed();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    openDialog.mock.calls[0][0].onConfirm();

    expect(disintegrate).toHaveBeenCalledWith(screen.getByTestId('frame'));
    expect(deleteFeed).toHaveBeenCalledWith(undefined, { onError: restoreImage });
  });

  it('삭제 요청 중에는 삭제 확인창을 다시 띄우지 않는다', () => {
    deleteState.isPending = true;
    renderInFeed();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    expect(openDialog).not.toHaveBeenCalled();
  });
});
