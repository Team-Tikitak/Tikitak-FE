import { useId, type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

interface ConfirmDialogProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title'> {
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  /** 없으면 취소 버튼을 렌더링하지 않는다 (확인 버튼만 있는 알럿) */
  onCancel?: () => void;
  onConfirm: () => void;
}

const DEFAULT_CANCEL_LABEL = '\uCDE8\uC18C';

export function ConfirmDialog({
  title,
  description,
  cancelLabel = DEFAULT_CANCEL_LABEL,
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
        'isolate w-[335px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[12px] bg-white',
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col items-start gap-1.5 p-5">
        <h2
          id={titleId}
          className="w-full text-[18px] leading-[1.445] font-semibold tracking-[-0.0036px] text-[#171719]"
        >
          {title}
        </h2>
        {description && (
          <p
            id={descId}
            className="w-full text-[15px] leading-[1.467] font-normal tracking-[0.144px] text-[rgba(55,56,60,0.61)]"
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex w-full flex-col items-start px-5 pb-3">
        <div className="flex w-full items-center justify-end gap-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="press-feedback py-1 text-center text-[16px] leading-normal font-semibold tracking-[0.0912px] whitespace-nowrap text-[rgba(55,56,60,0.61)]"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'press-feedback py-1 text-center text-[16px] leading-normal font-semibold tracking-[0.0912px] whitespace-nowrap',
              destructive ? 'text-[#ff383c]' : 'text-main-002',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
