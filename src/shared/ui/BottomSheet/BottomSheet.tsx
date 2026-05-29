import { type ComponentPropsWithRef, type ReactNode, useId } from 'react';
import { cn } from '@/shared/lib';

export interface BottomSheetProps extends Omit<
  ComponentPropsWithRef<'section'>,
  'children' | 'title'
> {
  title?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function BottomSheet({
  title,
  children,
  contentClassName,
  className,
  ref,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: BottomSheetProps) {
  const titleId = useId();

  return (
    <section
      ref={ref}
      aria-labelledby={title ? (ariaLabelledBy ?? titleId) : ariaLabelledBy}
      className={cn(
        'shadow-default w-full overflow-hidden rounded-t-xl bg-white px-5 pt-4 sm:max-w-[393px]',
        className,
      )}
      {...props}
    >
      <div className="mx-auto h-1 w-[82px] rounded-[10px] bg-[#e2e2e2]" />
      {title && (
        <h2 id={titleId} className="body-9 mt-4 text-center text-black">
          {title}
        </h2>
      )}
      <div className={cn(title ? 'mt-[15px]' : 'mt-4', contentClassName)}>{children}</div>
    </section>
  );
}
