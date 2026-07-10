import { cn } from '@/shared/lib';
import { FeedImageCarousel, type CarouselImage } from './FeedImageCarousel';
import { type PressPosition } from './FeedImageDetail';
import { ParticipantChipList, type Participant } from './ParticipantChipList';
import { DailyQuestion } from '../DailyQuestion/DailyQuestion';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export type { Participant, PressPosition };

type FeedDetailProps = ComponentPropsWithRef<'div'> & {
  participants: Participant[];
  images: CarouselImage[];
  authorName: string;
  content: string;
  date: string;
  onMoreParticipantsClick?: () => void;
  onLongPress?: (position: PressPosition, imageIndex: number) => void;
  heroKey?: string;
  actionSlot?: ReactNode;
  question?: string;
  // 히어로 전환 진입 시에만 배너를 늦게 페이드인
  animateQuestionBanner?: boolean;
};

export function FeedDetail({
  participants,
  images,
  authorName,
  content,
  date,
  onMoreParticipantsClick,
  onLongPress,
  heroKey,
  actionSlot,
  question,
  animateQuestionBanner = false,
  className,
  ref,
  ...props
}: FeedDetailProps) {
  return (
    <div className={cn('flex min-h-full w-full flex-col gap-5', className)} ref={ref} {...props}>
      <div className="flex min-h-9 w-full justify-center px-[18px]">
        {participants && participants.length > 0 && (
          <ParticipantChipList
            participants={participants}
            className="min-h-9"
            onMoreClick={onMoreParticipantsClick}
          />
        )}
      </div>
      <div className="flex w-full flex-col">
        {question && (
          <DailyQuestion
            question={question}
            variant="answered"
            className={cn(
              animateQuestionBanner &&
                'animate-question-banner-enter [animation-delay:180ms] motion-reduce:animate-none',
            )}
          />
        )}
        <FeedImageCarousel images={images} onLongPress={onLongPress} heroKey={heroKey} />
      </div>
      <div className="flex flex-col gap-1 px-5">
        <div className="flex w-full items-start justify-between gap-2">
          <p className="body-5 min-w-0 flex-1 text-black">
            <span className="body-4 mr-2">{authorName}</span>
            {content}
          </p>
          {actionSlot && <div className="shrink-0 pt-0.5">{actionSlot}</div>}
        </div>
        <span className="button-6 text-gray-600">{date}</span>
      </div>
      <div className="min-h-0 flex-1" aria-hidden="true" />
    </div>
  );
}
