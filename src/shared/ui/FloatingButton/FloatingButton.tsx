import { type ComponentPropsWithRef } from 'react';
import FloatingButtonIcon from '@/shared/assets/Icon/FloatingButtonIcon.svg?react';
import { cn } from '@/shared/lib';

type FloatingButtonProps = ComponentPropsWithRef<'button'>;

export function FloatingButton({ className, ref, ...props }: FloatingButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="추가"
      className={cn(
        'relative flex size-14 items-center justify-center overflow-visible rounded-full transition-transform duration-150 ease-out [-webkit-tap-highlight-color:transparent] active:scale-[0.97]',
        className,
      )}
      {...props}
    >
      <FloatingButtonIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[243px] max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </button>
  );
}
