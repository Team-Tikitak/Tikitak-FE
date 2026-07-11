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
        'group relative flex size-14 items-center justify-center overflow-visible rounded-full [-webkit-tap-highlight-color:transparent]',
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none relative flex size-14 items-center justify-center transition-transform duration-150 ease-out group-active:scale-[0.97]">
        <FloatingButtonIcon
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[243px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </span>
    </button>
  );
}
