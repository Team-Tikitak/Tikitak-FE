import { useEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import TodaysTikitakLogo from '@/shared/assets/Logo/TodaysTikitak.svg?react';
import { cn } from '@/shared/lib';

export type DailyQuestionVariant = 'pending' | 'answered';

// 홈/활동 배너가 답변 완료 상태에서 보여줄 고정 안내 문구 (질문 원문 대신 노출)
const DAILY_QUESTION_ANSWERED_MESSAGE = '참여 완료! 친구들의 답변도 확인해 보세요';

const DAILY_QUESTION_VARIANT_BACKGROUND = {
  pending: 'bg-[#ff5ca8]',
  answered: 'bg-main-001',
} satisfies Record<DailyQuestionVariant, string>;

export interface DailyQuestionProps extends ComponentPropsWithRef<'button'> {
  question: string;
  variant?: DailyQuestionVariant;
  // true면 question 대신 고정 안내 문구를 보여준다 (FeedDetail의 answered variant는 실제 질문을 보여줘야 해서 별도 분리)
  showAnsweredMessage?: boolean;
}

const MARQUEE_EDGE_MASK =
  'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)';

export const DailyQuestion = ({
  question,
  variant = 'pending',
  showAnsweredMessage = false,
  onClick,
  className,
  ref,
  ...props
}: DailyQuestionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollPx, setScrollPx] = useState(0);
  const displayText = showAnsweredMessage ? DAILY_QUESTION_ANSWERED_MESSAGE : question;

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
  }, [displayText]);

  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex h-9 w-full shrink-0 items-center gap-[10px] px-5 text-white disabled:cursor-default',
        DAILY_QUESTION_VARIANT_BACKGROUND[variant],
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
            'inline-block px-2 text-[12px] leading-normal font-bold whitespace-nowrap text-white',
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
          {displayText}
        </span>
      </div>
      {onClick && <RightIcon className="size-4 shrink-0 text-white" aria-hidden="true" />}
    </button>
  );
};
