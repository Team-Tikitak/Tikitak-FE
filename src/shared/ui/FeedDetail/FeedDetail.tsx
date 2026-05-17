import { cn } from '@/shared/lib';
import { FeedImageCarousel, type CarouselImage } from './FeedImageCarousel';
import { type PressPosition } from './FeedImageDetail';
import { ParticipantChipList, type Participant } from './ParticipantChipList';
import type { ComponentPropsWithRef } from 'react';

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
  className,
  ref,
  ...props
}: FeedDetailProps) {
  return (
    <div className={cn('flex w-full flex-col gap-5', className)} ref={ref} {...props}>
      <ParticipantChipList
        participants={participants}
        className="mx-auto"
        onMoreClick={onMoreParticipantsClick}
      />
      <FeedImageCarousel images={images} onLongPress={onLongPress} heroKey={heroKey} />
      <div className="flex flex-col gap-1 px-5">
        <p className="body-5 text-black">
          <span className="body-4 mr-2">{authorName}</span>
          {content}
        </p>
        <span className="button-6 text-gray-600">{date}</span>
      </div>
    </div>
  );
}
