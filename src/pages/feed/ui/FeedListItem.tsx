import { type ComponentPropsWithRef } from 'react';
import TakSpark from '@/shared/assets/Character/TakSpark.svg';
import { cn } from '@/shared/lib';
import { ImageWithFallback } from '@/shared/ui';
import type { FeedItem } from '../model/types';

interface FeedListItemProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
  item: FeedItem;
}

export const FeedListItem = ({ item, className, ref, ...props }: FeedListItemProps) => {
  return (
    <article ref={ref} className={cn('flex w-full items-start gap-4', className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex w-full flex-col gap-1">
            <p className="font-pretendard w-full truncate text-[14px] tracking-[-0.004em] text-gray-700">
              {item.location}
            </p>
            <p className="body-9 w-full truncate text-black">{item.title}</p>
          </div>
          <div className="flex h-6 items-center -space-x-1">
            {item.participantAvatarUrls.map((url, index) => (
              <ImageWithFallback
                key={`${item.id}-${index}`}
                src={url}
                fallbackSrc={TakSpark}
                alt=""
              />
            ))}
          </div>
        </div>
        <p className="body-10 text-gray-500">{item.date}</p>
      </div>
      <div className="relative size-[92px] shrink-0 overflow-hidden rounded-sm">
        <img
          data-hero-exit-key={`pin-${item.id}`}
          src={item.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="no-native-image size-full object-cover"
        />
        <span className="font-pretendard absolute top-1 right-1 inline-flex items-center justify-center rounded-full bg-[rgba(30,31,31,0.6)] px-1 py-px text-center text-[12px] leading-[1.3] font-normal tracking-[-0.004em] whitespace-nowrap text-white">
          {item.photoCount}
        </span>
      </div>
    </article>
  );
};
