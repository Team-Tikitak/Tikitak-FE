import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface BottomSheetProps extends Omit<ComponentPropsWithRef<'section'>, 'children' | 'title'> {
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
  ...props
}: BottomSheetProps) {
  return (
    <section
      ref={ref}
      aria-label={typeof title === 'string' ? title : undefined}
      className={cn(
        'shadow-default w-full max-w-[393px] overflow-hidden rounded-t-xl bg-white px-5 pt-4',
        className,
      )}
      {...props}
    >
      <div className="mx-auto h-1 w-[82px] rounded-[10px] bg-[#e2e2e2]" />
      {title && <h2 className="body-9 mt-4 text-center text-black">{title}</h2>}
      <div className={cn(title ? 'mt-[15px]' : 'mt-4', contentClassName)}>{children}</div>
    </section>
  );
}
