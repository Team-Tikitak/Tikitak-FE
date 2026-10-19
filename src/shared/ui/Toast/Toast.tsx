import { useEffect } from 'react';
import { useMatch } from 'react-router';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import { cn } from '@/shared/lib/cn';

export function Toast({ message, unmount }: { message: string; unmount: () => void }) {
  const isFeedPage = useMatch('/feed');
  useEffect(() => {
    const timer = window.setTimeout(unmount, 2000);
    return () => window.clearTimeout(timer);
  }, [unmount]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-100 mx-auto flex justify-center px-5 sm:max-w-[393px]',
        isFeedPage ? 'top-[calc(var(--safe-top)+110px)]' : 'top-[calc(var(--safe-top)+144px)]',
      )}
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
