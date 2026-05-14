import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { ImageWithFallback } from '../ImageWithFallback';

type AvatarItem = {
  id: number;
  src: string;
  fallbackSrc: string;
  alt?: string;
};

interface FeedListProps extends ComponentPropsWithRef<'button'> {
  location: string;
  title: string;
  date: string;
  imageSrc: string;
  alt?: string;
  imageCount?: number;
  members: AvatarItem[];
}

export function FeedList({
  location,
  title,
  date,
  imageSrc,
  alt,
  imageCount,
  members,
  ref,
  className,
  ...props
}: FeedListProps) {
  return (
    <button
      type="button"
      ref={ref}
      className={cn('flex w-full justify-between gap-4', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col text-start">
        <span className="body-1 w-full truncate text-gray-700">{location}</span>
        <span className="body-9 mt-1 w-full truncate text-black">{title}</span>

        <div className="mt-2 flex -space-x-1">
          {members.map((member) => (
            <ImageWithFallback
              key={member.id}
              src={member.src}
              fallbackSrc={member.fallbackSrc}
              alt={member.alt ?? '멤버 프로필 이미지'}
            />
          ))}
        </div>

        <span className="body-10 mt-3 text-gray-500">{date}</span>
      </div>

      <div className="relative shrink-0">
        <img src={imageSrc} alt={alt ?? '피드 이미지'} className="size-[92px]" />

        {imageCount !== undefined && imageCount > 1 && (
          <span className="button-3 absolute top-1 right-1 flex size-[18px] items-center justify-center rounded-sm bg-black/60 text-white">
            {imageCount}
          </span>
        )}
      </div>
    </button>
  );
}
