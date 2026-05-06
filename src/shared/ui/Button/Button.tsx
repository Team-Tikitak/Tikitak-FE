import { cn } from '@/shared/lib';
import { ButtonVariants } from './Button.variant';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof ButtonVariants> {
  buttonIcon?: ReactNode;
}

export function Button({ variant, buttonIcon, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(ButtonVariants({ variant }), className)} {...props}>
      {buttonIcon && <span className="flex h-5 w-5 items-center">{buttonIcon}</span>}
      {children}
    </button>
  );
}
