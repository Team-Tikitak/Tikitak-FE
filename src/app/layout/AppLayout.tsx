import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

type AppLayoutProps = ComponentPropsWithRef<'div'>;
type AppLayoutHeaderProps = ComponentPropsWithRef<'header'>;
type AppLayoutContentProps = ComponentPropsWithRef<'main'>;
type AppLayoutBottomProps = ComponentPropsWithRef<'footer'>;

export const AppLayoutRoot = ({ className, ref, ...props }: AppLayoutProps) => {
  return (
    <div
      ref={ref}
      className={cn('mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-white', className)}
      {...props}
    />
  );
};

export const AppLayoutHeader = ({ className, ref, ...props }: AppLayoutHeaderProps) => {
  return <header ref={ref} className={cn('shrink-0', className)} {...props} />;
};

export const AppLayoutContent = ({ className, ref, ...props }: AppLayoutContentProps) => {
  return <main ref={ref} className={cn('min-h-0 flex-1 overflow-y-auto', className)} {...props} />;
};

export const AppLayoutBottom = ({ className, ref, ...props }: AppLayoutBottomProps) => {
  return (
    <footer
      ref={ref}
      className={cn('shrink-0 px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]', className)}
      {...props}
    />
  );
};
