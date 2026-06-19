import { useEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import TodaysTikitakLogo from '@/shared/assets/Logo/TodaysTikitak.svg?react';
import { cn } from '@/shared/lib';

export interface DailyQuestionProps extends ComponentPropsWithRef<'button'> {
  question: string;
}

const MARQUEE_EDGE_MASK =
  'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)';

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
        'flex h-9 w-full shrink-0 items-center gap-[10px] bg-[#43b0e0] px-5 text-white',
        className,
      )}
      {...props}
    >
      <TodaysTikitakLogo
        role="img"
        aria-label="Today's Tiki-tak!"
        className="h-3.5 w-[77px] shrink-0 translate-y-[2px]"
      />
      <div
        ref={containerRef}
        className="flex min-w-0 flex-1 items-center overflow-hidden"
        style={
          scrollPx > 0
            ? { maskImage: MARQUEE_EDGE_MASK, WebkitMaskImage: MARQUEE_EDGE_MASK }
            : undefined
        }
      >
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
                  animationDuration: `${Math.max(3, scrollPx / 25)}s`,
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
