import { cn } from '@/shared/lib';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { ButtonVariants } from './Button.variant';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

interface ButtonProps extends ComponentPropsWithRef<'button'>, VariantProps<typeof ButtonVariants> {
  buttonIcon?: ReactNode;
  /** 완료 토스트 등 다른 피드백이 따로 울리는 버튼은 false */
  haptic?: boolean;
}

export function Button({
  variant,
  buttonIcon,
  className,
  ref,
  children,
  onClick,
  haptic = true,
  ...props
}: ButtonProps) {
  const handleClick: ButtonProps['onClick'] = (event) => {
    if (haptic) triggerHaptic('light');
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
