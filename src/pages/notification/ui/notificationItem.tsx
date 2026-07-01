import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import { cn } from '@/shared/lib';
import { formatRelativeTime } from '@/shared/lib/date';
import { toSafeImageUrl } from '@/shared/lib/image/normalizeImageUrl';

export type NotificationType = 'comment' | 'dailyFeed';

export interface NotificationItemProps extends Omit<ComponentPropsWithRef<typeof Link>, 'to'> {
  type: NotificationType;
  actorName: string;
  targetName?: string;
  feedId: number;
  avatarUrl?: string | null;
  createdAt: string;
  thumbnailUrl?: string | null;
}

const buildTitle = (type: NotificationType, actorName: string, targetName?: string): ReactNode => {
  if (type === 'comment') {
    return (
      <>
        <b>{actorName}</b>님이 <b>{targetName}</b>님께 댓글을 달았어요
      </>
    );
  }
  return (
    <>
      <b>{actorName}</b>님이 오늘의 게시물을 올렸어요
    </>
  );
};

export const NotificationItem = ({
  type,
  actorName,
  targetName,
  feedId,
  avatarUrl,
  createdAt,
  thumbnailUrl,
  className,
  ref,
  ...props
}: NotificationItemProps) => {
  const hasThumbnail = thumbnailUrl != null && thumbnailUrl !== '';
  const title = buildTitle(type, actorName, targetName);

  return (
    <Link
      ref={ref}
      to={toFeedDetail(String(feedId))}
      state={{ thumbnailUrl: thumbnailUrl ?? undefined }}
      className={cn('flex w-full items-center gap-3', className)}
      {...props}
    >
      <img
        src={toSafeImageUrl(avatarUrl)}
        alt=""
        loading="lazy"
        decoding="async"
        className="no-native-image size-10 shrink-0 rounded-full border border-gray-200 bg-white object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-pretendard line-clamp-2 text-[14px] leading-[1.4] font-medium tracking-[0.004em] break-keep text-black [&_b]:font-bold">
          {title}
        </p>
        <span className="body-10 text-gray-500">{formatRelativeTime(createdAt)}</span>
      </div>

      {hasThumbnail && (
        <div className="relative shrink-0">
          <div className="size-13 overflow-hidden rounded-sm">
            <img
              data-hero-exit-key={`pin-${feedId}`}
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
