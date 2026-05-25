import { useId, type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

interface ConfirmDialogProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title'> {
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  description,
  cancelLabel = '돌아가기',
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
  className,
  ref,
  ...props
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <div
      ref={ref}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        'w-[270px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[12px] bg-white',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-start gap-1.5 p-5">
        <h2
          id={titleId}
          className="w-full text-[18px] leading-[1.445] font-semibold text-[#171719]"
        >
          {title}
        </h2>
        {description && (
          <p
            id={descId}
            className="w-full text-[15px] leading-[1.467] font-normal text-[rgba(55,56,60,0.61)]"
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-end gap-6 px-5 pb-3">
        <button
          type="button"
          onClick={onCancel}
          className="press-feedback py-1 text-base font-semibold text-[rgba(55,56,60,0.61)]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            'press-feedback py-1 text-base font-semibold',
            destructive ? 'text-[#ff383c]' : 'text-main-002',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
