import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

export interface SwitchProps extends Omit<ComponentPropsWithRef<'button'>, 'onChange' | 'type'> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = ({
  checked,
  onCheckedChange,
  disabled,
  className,
  ref,
  ...props
}: SwitchProps) => (
  <button
    ref={ref}
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange?.(!checked)}
    className={cn(
      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-out',
      checked ? 'bg-main-001' : 'bg-gray-300',
      disabled && 'opacity-50',
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        'shadow-switch inline-block size-[22px] rounded-full bg-white transition-transform duration-200 ease-out',
        checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
      )}
    />
  </button>
);
