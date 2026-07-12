import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { AvatarGroup } from '@/shared/ui/AvatarGroup/AvatarGroup';
import { TodayTikitakChip } from './TodayTikitakChip';
import type { FeedItem } from '../model/types';

const MAX_VISIBLE_AVATARS = 4;

interface FeedListItemProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
  item: FeedItem;
  eager?: boolean;
  suppressHeroImage?: boolean;
}

export const FeedListItem = ({
  item,
  eager = false,
  suppressHeroImage = false,
  className,
  ref,
  ...props
}: FeedListItemProps) => {
  return (
    <article ref={ref} className={cn('flex w-full items-start gap-5', className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex w-full flex-col gap-1">
            <p
              className={cn(
                'font-pretendard body-1 w-full truncate',
                item.type === 'DAILY_QUESTION' ? 'text-main-001' : 'text-gray-700',
              )}
            >
              {item.type === 'DAILY_QUESTION' ? item.question : item.place}
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
          data-feed-hero-source-id={item.id}
          {...(suppressHeroImage
            ? {}
            : { 'data-hero-exit-key': `pin-${item.id}`, 'data-hero-radius': '4' })}
          src={item.thumbnailUrl}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={cn('no-native-image size-full object-cover', suppressHeroImage && 'opacity-0')}
        />
        <span
          className={cn(
            'font-pretendard absolute top-1 right-1 z-40 inline-flex items-center justify-center rounded-full bg-[rgba(30,31,31,0.6)] px-1 py-px text-center text-[12px] leading-[1.3] font-normal tracking-[-0.004em] whitespace-nowrap text-white transition-opacity duration-400',
            suppressHeroImage && 'opacity-0 duration-200 ease-out',
          )}
        >
          {item.photoCount}
        </span>
        {item.type === 'DAILY_QUESTION' && (
          <>
            <div
              aria-hidden
              className={cn(
                'border-main-001 pointer-events-none absolute inset-0 z-40 rounded-sm border-2 transition-opacity duration-200',
                suppressHeroImage && 'opacity-0 duration-200 ease-out',
              )}
            />
            <TodayTikitakChip
              className={cn(
                'absolute right-0 bottom-0 z-40 transition-opacity duration-200',
                suppressHeroImage && 'opacity-0 duration-200 ease-out',
              )}
            />
          </>
        )}
      </div>
    </article>
  );
};
