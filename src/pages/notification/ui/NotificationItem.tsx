import { type ComponentPropsWithRef } from 'react';
import { Link } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import { cn } from '@/shared/lib';
import { formatRelativeTime } from '@/shared/lib/date';
import { toSafeImageUrl } from '@/shared/lib/image/normalizeImageUrl';
import { emphasizeNames } from '../lib/emphasizeNames';
import { notificationHeroKey } from '../lib/notificationHeroKey';

export interface NotificationItemProps extends Omit<
  ComponentPropsWithRef<typeof Link>,
  'to' | 'state' | 'title'
> {
  body: string;
  feedId: number;
  notificationId: number;
  avatarUrl?: string | null;
  createdAt: string;
  thumbnailUrl?: string | null;
  heroPreviewUrl?: string | null;
  unread?: boolean;
}

export const NotificationItem = ({
  body,
  feedId,
  notificationId,
  avatarUrl,
  createdAt,
  thumbnailUrl,
  heroPreviewUrl,
  unread = false,
  className,
  ref,
  ...props
}: NotificationItemProps) => {
  const hasThumbnail = thumbnailUrl != null && thumbnailUrl !== '';
  const emphasizedBody = emphasizeNames(body);
  const heroKey = notificationHeroKey(feedId, notificationId);

  return (
    <Link
      ref={ref}
      to={toFeedDetail(String(feedId))}
      state={{
        thumbnailUrl: thumbnailUrl ?? undefined,
        heroPreviewUrl: heroPreviewUrl ?? undefined,
        heroKey,
      }}
      className={cn('flex w-full items-center gap-3', unread && 'bg-main-000', className)}
      {...props}
    >
      {unread && <span className="sr-only">안 읽은 알림</span>}
      <img
        src={toSafeImageUrl(avatarUrl) || TakBuilder}
        alt=""
        loading="lazy"
        decoding="async"
        className="no-native-image size-10 shrink-0 rounded-full border border-gray-200 bg-white object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-pretendard line-clamp-2 text-[14px] leading-[1.4] font-medium tracking-[0.004em] break-keep text-black [&_b]:font-bold">
          {emphasizedBody}
        </p>
        <span className="body-10 text-gray-500">{formatRelativeTime(createdAt)}</span>
      </div>

      {hasThumbnail && (
        <div className="relative shrink-0">
          <div className="size-13 overflow-hidden rounded-sm">
            <img
              data-hero-exit-key={heroKey}
              data-hero-radius="4"
              src={toSafeImageUrl(thumbnailUrl)}
              alt=""
              loading="lazy"
              decoding="async"
              className="no-native-image size-full object-cover"
            />
          </div>
        </div>
      )}
    </Link>
  );
};
