import { useEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import { cn } from '@/shared/lib';

export interface DailyQuestionProps extends ComponentPropsWithRef<'button'> {
  question: string;
}

export const DailyQuestion = ({
  question,
  onClick,
  className,
  ref,
  ...props
}: DailyQuestionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollPx, setScrollPx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const calc = () => {
      const overflow = text.scrollWidth - container.clientWidth;
      setScrollPx(Math.max(0, overflow));
    };

    calc();

    const observer = new ResizeObserver(calc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [question]);

  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={cn(
        'flex h-9 w-full shrink-0 items-center justify-center gap-[10px] bg-[#43b0e0] px-5 text-white',
        className,
      )}
      {...props}
    >
      <span className="logo shrink-0 text-white">Today's Tiki-tak!</span>
      <div ref={containerRef} className="flex min-w-0 flex-1 items-center overflow-hidden">
        <span
          ref={textRef}
          className={cn(
            'inline-block text-[12px] leading-normal font-bold whitespace-nowrap text-white',
            scrollPx > 0 && 'animate-marquee-scroll',
          )}
          style={
            scrollPx > 0
              ? ({
                  '--marquee-distance': `-${scrollPx}px`,
                  animationDuration: `${Math.max(2, scrollPx / 35)}s`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {question}
        </span>
      </div>
      {onClick && <RightIcon className="size-4 shrink-0 text-white" />}
    </button>
  );
};
