import { useNavigate } from 'react-router';
import { toDailyFeedEdit, toFeedEdit } from '@/app/routes/paths';
import { useDeleteFeed, useGetFeedDetail } from '@/shared/api/feed/queries';
import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import { ActiveMenu } from '../ActiveMenu/ActiveMenu';
import { openConfirmDialog } from '../ConfirmDialog';

interface FeedActionMenuProps {
  teamId: number;
  feedId: number;
  /** 리스트 안에서는 삭제 후 페이지에 머무름 (기본: 이전 화면으로 이동) */
  stayOnDelete?: boolean;
}

export const FeedActionMenu = ({ teamId, feedId, stayOnDelete = false }: FeedActionMenuProps) => {
  const navigate = useNavigate();
  const { data } = useGetFeedDetail(teamId, feedId);
  const { mutate: deleteFeed } = useDeleteFeed(teamId, feedId, { navigateBack: !stayOnDelete });

  if (!data?.isMine) return null;

  const canEdit = data.type !== 'DAILY_QUESTION';

  const handleDeleteClick = () => {
    openConfirmDialog({
      title: '정말 삭제하시겠어요?',
      description: '삭제 후 복구가 불가능해요.',
      confirmLabel: '삭제하기',
      destructive: true,
      onConfirm: () => deleteFeed(),
      overlayClassName: 'z-50',
    });
  };

  const handleEditClick = () => {
    navigate(data.type === 'DAILY_QUESTION' ? toDailyFeedEdit(feedId) : toFeedEdit(feedId));
  };

  return (
    <ActiveMenu
      icon={<MoreIcon className="size-6 rotate-90 text-[#666]" />}
      onDelete={handleDeleteClick}
      onEdit={canEdit ? handleEditClick : undefined}
    />
  );
};
