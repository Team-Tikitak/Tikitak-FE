import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { Check } from '@/shared/ui/Check';

interface TeamMenuItemProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  title: string;
  description: string;
  selected?: boolean;
}

export function TeamMenuItem({
  title,
  description,
  selected = false,
  className,
  ref,
  ...props
}: TeamMenuItemProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn('flex w-full items-center justify-center gap-4 py-3', className)}
      {...props}
    >
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
        <span className="body-2 w-full truncate break-keep text-black">{title}</span>
        <span className="body-1 w-full truncate break-keep text-gray-700">{description}</span>
      </span>
      {selected && <Check checked className="shrink-0" />}
    </button>
  );
}
