import { cn } from '@/shared/lib';
import { FeedImageCarousel, type CarouselImage } from './FeedImageCarousel';
import { ParticipantChipList, type Participant } from './ParticipantChipList';
import type { ComponentPropsWithRef } from 'react';

export type { Participant };

type FeedDetailProps = ComponentPropsWithRef<'div'> & {
  participants: Participant[];
  images: CarouselImage[];
  authorName: string;
  content: string;
  date: string;
  onMoreParticipantsClick?: () => void;
};

export function FeedDetail({
  participants,
  images,
  authorName,
  content,
  date,
  onMoreParticipantsClick,
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
      <FeedImageCarousel images={images} />
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
