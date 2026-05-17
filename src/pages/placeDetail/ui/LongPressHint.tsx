import { useEffect, useRef, useState } from 'react';
import HandTap from '@/shared/assets/Icon/HandTap.svg?react';
import { cn } from '@/shared/lib';

interface LongPressHintProps {
  onDismiss: () => void;
}

const FADE_OUT_DURATION_MS = 220;

export const LongPressHint = ({ onDismiss }: LongPressHintProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleDismiss = () => {
    if (isClosing) return;
    setIsClosing(true);
    timerRef.current = window.setTimeout(onDismiss, FADE_OUT_DURATION_MS);
  };

  return (
    <button
      type="button"
      aria-label="안내 닫기"
      onClick={handleDismiss}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[rgba(30,31,31,0.6)] text-white transition-opacity ease-out',
        isClosing ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{ transitionDuration: `${FADE_OUT_DURATION_MS}ms` }}
    >
      <HandTap aria-hidden="true" />
      <p className="body-7 text-center leading-[1.4]">
        꾹 눌러서
        <br />
        댓글을 달아보세요
      </p>
    </button>
  );
};
