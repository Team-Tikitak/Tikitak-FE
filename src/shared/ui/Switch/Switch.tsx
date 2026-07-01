import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { switchVariants } from './Switch.variant';

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'onChange' | 'type' | 'onClick'
> {
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
}: SwitchProps) => {
  const { track, thumb } = switchVariants({ checked, disabled });

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(track(), className)}
      {...props}
    >
      <span className={thumb()} />
    </button>
  );
};
