import { openConfirmDialog } from './openConfirmDialog';

interface ConfirmDiscardChangesOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  onDiscard: () => void;
}

export const confirmDiscardChanges = ({
  title = '수정한 내용이 남아있어요.',
  description = '지금 나가면 수정한 내용이 저장되지 않아요.',
  confirmLabel = '계속 수정하기',
  onDiscard,
}: ConfirmDiscardChangesOptions): void => {
  openConfirmDialog({
    title,
    description,
    confirmLabel,
    onCancel: onDiscard,
  });
};
