import { cn } from '@/shared/lib/cn';
import {
  alertDialog,
  confirmDialog,
  isNativeDialogPlatform,
} from '@/shared/lib/native/nativeDialog';
import { openOverlay } from '@/shared/lib/openOverlay';
import { ConfirmDialog } from './ConfirmDialog';

interface OpenConfirmDialogOptions {
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  /** false면 확인 버튼만 있는 알럿으로 띄운다 */
  showCancel?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  overlayClassName?: string;
  dialogClassName?: string;
}

export const openConfirmDialog = ({
  title,
  description,
  cancelLabel,
  confirmLabel,
  destructive = false,
  showCancel = true,
  onCancel,
  onConfirm,
  overlayClassName,
  dialogClassName,
}: OpenConfirmDialogOptions): void => {
  if (isNativeDialogPlatform()) {
    void (async () => {
      if (!showCancel) {
        await alertDialog(description ?? title, title, confirmLabel);
        onConfirm?.();
        return;
      }

      const confirmed = await confirmDialog({
        title,
        message: description ?? '',
        okButtonTitle: confirmLabel,
        cancelButtonTitle: cancelLabel ?? '취소',
      });

      if (confirmed) {
        onConfirm?.();
        return;
      }

      onCancel?.();
    })();
    return;
  }

  openOverlay(({ isOpen, close, unmount }) => {
    const closeAndRun = (callback?: () => void) => {
      close();
      callback?.();
    };

    return (
      <div
        className={cn(
          'dialog-overlay fixed inset-0 z-60 flex items-center justify-center bg-black/40',
          overlayClassName,
        )}
        data-state={isOpen ? 'open' : 'closed'}
        onTransitionEnd={(event) => {
          if (event.propertyName === 'opacity' && !isOpen) unmount();
        }}
      >
        <ConfirmDialog
          title={title}
          description={description}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          destructive={destructive}
          className={dialogClassName}
          onCancel={showCancel ? () => closeAndRun(onCancel) : undefined}
          onConfirm={() => closeAndRun(onConfirm)}
        />
      </div>
    );
  });
};
