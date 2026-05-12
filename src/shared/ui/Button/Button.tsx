import { cn } from '@/shared/lib';
import { ButtonVariants } from './Button.variant';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

interface ButtonProps extends ComponentPropsWithRef<'button'>, VariantProps<typeof ButtonVariants> {
  buttonIcon?: ReactNode;
}

export function Button({ variant, buttonIcon, className, ref, children, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(ButtonVariants({ variant }), className)}
      {...props}
    >
      {buttonIcon && <span className="flex items-center">{buttonIcon}</span>}
      {children}
    </button>
  );
}
