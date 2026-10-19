import { useEffect, type ComponentPropsWithRef } from 'react';
import { useMatch } from 'react-router';
import { tv } from 'tailwind-variants';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';

const toastVariants = tv({
  base: 'pointer-events-none fixed inset-x-0 z-100 mx-auto flex justify-center px-5 sm:max-w-[393px]',
  variants: {
    position: {
      feed: 'top-[calc(var(--safe-top)+110px)]',
      default: 'top-[calc(var(--safe-top)+144px)]',
    },
  },
});

interface ToastProps extends ComponentPropsWithRef<'div'> {
  message: string;
  unmount: () => void;
}

export function Toast({ message, unmount, className, ref, ...props }: ToastProps) {
  const isFeedPage = useMatch('/feed');
  useEffect(() => {
    const timer = window.setTimeout(unmount, 2000);
    return () => window.clearTimeout(timer);
  }, [unmount]);

  return (
    <div
      ref={ref}
      className={toastVariants({ position: isFeedPage ? 'feed' : 'default', className })}
      {...props}
    >
      <div
        role="status"
        className="animate-card-enter border-main-000 flex max-w-full items-center gap-2 rounded-full border bg-white py-2 pr-5 pl-3 text-gray-900 shadow-lg motion-reduce:animate-none"
      >
        <TakLeader aria-hidden="true" className="size-8 shrink-0" />
        <span className="body-2">{message}</span>
      </div>
    </div>
  );
}
