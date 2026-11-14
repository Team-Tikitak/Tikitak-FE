import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { toDailyFeedEdit, toFeedEdit } from '@/app/routes/paths';
import { useDeleteFeed, useGetFeedDetail } from '@/shared/api/feed/queries';
import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import { shatterImage } from '@/shared/lib/shatterImage';
import { ActiveMenu } from '../ActiveMenu/ActiveMenu';
import { openConfirmDialog } from '../ConfirmDialog';

interface FeedActionMenuProps {
  teamId: number;
  feedId: number;
  /** 리스트 안에서는 삭제 후 페이지에 머무름 (기본: 이전 화면으로 이동) */
  stayOnDelete?: boolean;
}

// 캐러셀은 한 장씩 스냅되므로, 피드 영역 안에 중심이 들어온 사진이 지금 보고 있는 사진이다.
// 넓은 화면에선 콘텐츠가 가운데 정렬돼 이웃 사진도 뷰포트 안에 걸칠 수 있어 피드 영역을 기준으로 본다
const findVisibleImageFrame = (anchor: HTMLElement | null) => {
  const detail = anchor?.closest('[data-feed-detail]');
  if (!detail) return undefined;
  const bounds = detail.getBoundingClientRect();
  return [...detail.querySelectorAll<HTMLElement>('[data-feed-detail-image-frame]')].find(
    (frame) => {
      const rect = frame.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      return centerX >= bounds.left && centerX <= bounds.right;
    },
  );
};

export const FeedActionMenu = ({ teamId, feedId, stayOnDelete = false }: FeedActionMenuProps) => {
  const navigate = useNavigate();
  const { data } = useGetFeedDetail(teamId, feedId);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const { mutate: deleteFeed, isPending: isDeleting } = useDeleteFeed(teamId, feedId, {
    navigateBack: !stayOnDelete,
  });

  if (!data?.isMine) return null;

  const canEdit = data.type !== 'DAILY_QUESTION';

  const handleConfirmDelete = () => {
    const frame = findVisibleImageFrame(anchorRef.current);
    const restoreImage = frame ? shatterImage(frame) : undefined;
    deleteFeed(undefined, { onError: restoreImage });
  };

  const handleDeleteClick = () => {
    if (isDeleting) return;
    openConfirmDialog({
      title: '정말 삭제하시겠어요?',
      description: '삭제 후 복구가 불가능해요.',
      confirmLabel: '삭제하기',
      destructive: true,
      onConfirm: handleConfirmDelete,
      overlayClassName: 'z-50',
    });
  };

  const handleEditClick = () => {
    navigate(data.type === 'DAILY_QUESTION' ? toDailyFeedEdit(feedId) : toFeedEdit(feedId));
  };

  return (
    <span ref={anchorRef} className="contents">
      <ActiveMenu
        icon={<MoreIcon className="size-6 rotate-90 text-[#666]" />}
        onDelete={handleDeleteClick}
        onEdit={canEdit ? handleEditClick : undefined}
      />
    </span>
  );
};
