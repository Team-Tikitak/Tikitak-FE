import { useEffect, useState, type ComponentPropsWithRef } from 'react';
import { useMatch } from 'react-router';
import { tv } from 'tailwind-variants';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';

const TOAST_DURATION_MS = 3000;
const TOAST_EXIT_DURATION_MS = 200;

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
  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    const exitTimer = window.setTimeout(
      () => setIsLeaving(true),
      TOAST_DURATION_MS - TOAST_EXIT_DURATION_MS,
    );
    const unmountTimer = window.setTimeout(unmount, TOAST_DURATION_MS);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [unmount]);

  return (
    <div
      ref={ref}
      className={toastVariants({ position: isFeedPage ? 'feed' : 'default', className })}
      {...props}
    >
      <div
        role="status"
        className={`border-main-000 flex max-w-full items-center gap-2 rounded-full border bg-white py-2 pr-5 pl-3 text-gray-900 shadow-lg motion-reduce:animate-none ${isLeaving ? 'motion-safe:animate-[toast-exit_200ms_ease-in_both]' : 'animate-card-enter'}`}
      >
        <TakLeader aria-hidden="true" className="size-8 shrink-0" />
        <span className="body-2">{message}</span>
      </div>
    </div>
  );
}
