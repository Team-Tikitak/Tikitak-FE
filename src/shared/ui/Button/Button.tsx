import { cn } from '@/shared/lib';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { ButtonVariants } from './Button.variant';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

interface ButtonProps extends ComponentPropsWithRef<'button'>, VariantProps<typeof ButtonVariants> {
  buttonIcon?: ReactNode;
}

export function Button({
  variant,
  buttonIcon,
  className,
  ref,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const handleClick: ButtonProps['onClick'] = (event) => {
    triggerHaptic('light');
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(ButtonVariants({ variant }), className)}
      onClick={handleClick}
      {...props}
    >
      {buttonIcon && <span className="flex items-center">{buttonIcon}</span>}
      {children}
    </button>
  );
}
