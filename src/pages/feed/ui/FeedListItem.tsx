import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { AvatarGroup } from '@/shared/ui/AvatarGroup/AvatarGroup';
import type { FeedItem } from '../model/types';

const MAX_VISIBLE_AVATARS = 4;

interface FeedListItemProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
  item: FeedItem;
  eager?: boolean;
}

export const FeedListItem = ({
  item,
  eager = false,
  className,
  ref,
  ...props
}: FeedListItemProps) => {
  return (
    <article ref={ref} className={cn('flex w-full items-start gap-4', className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex w-full flex-col gap-1">
            <p className="font-pretendard line-clamp-2 w-full text-balance break-keep text-[14px] tracking-[-0.004em] text-gray-700">
              {item.location}
            </p>
            <p className="body-9 w-full truncate text-black">{item.title}</p>
          </div>
          {item.participantAvatarUrls.length > 0 && (
            <AvatarGroup
              users={item.participantAvatarUrls.map((src, index) => ({ id: index, src }))}
              size="xs"
              max={MAX_VISIBLE_AVATARS}
            />
          )}
        </div>
        <p className="body-10 text-gray-500">{item.date}</p>
      </div>
      <div className="relative size-[92px] shrink-0 overflow-hidden rounded-sm">
        <img
          data-hero-exit-key={`pin-${item.id}`}
          src={item.thumbnailUrl}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
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
