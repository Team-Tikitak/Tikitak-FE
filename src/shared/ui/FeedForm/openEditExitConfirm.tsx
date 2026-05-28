import { openOverlay } from '@/shared/lib/openOverlay';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface OpenEditExitConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  onExit: () => void;
}

export const openEditExitConfirm = ({
  title = '수정한 내용이 남아있어요.',
  description = '지금 나가면 수정한 내용이 저장되지 않아요.',
  confirmLabel = '계속 수정하기',
  onExit,
}: OpenEditExitConfirmOptions): void => {
  openOverlay(({ isOpen, close, unmount }) => (
    <div
      className="dialog-overlay fixed inset-0 z-60 flex items-center justify-center bg-black/40"
      data-state={isOpen ? 'open' : 'closed'}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'opacity' && !isOpen) unmount();
      }}
    >
      <ConfirmDialog
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={close}
        onCancel={() => {
          close();
          onExit();
        }}
      />
    </div>
  ));
};
