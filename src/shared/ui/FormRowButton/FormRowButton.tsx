import { type ComponentPropsWithRef, type ReactNode } from 'react';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import { cn } from '@/shared/lib';

export interface FormRowButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  icon: ReactNode;
  label: string;
}

export const FormRowButton = ({ icon, label, className, ref, ...props }: FormRowButtonProps) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'press-feedback flex h-6 w-full items-center justify-between disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="flex items-center gap-2">
      {icon}
      <span className="text-h3 leading-[1.4] font-semibold tracking-[0.004em] text-black">
        {label}
      </span>
    </span>
    <RightIcon className="size-6 shrink-0" aria-hidden="true" />
  </button>
);
