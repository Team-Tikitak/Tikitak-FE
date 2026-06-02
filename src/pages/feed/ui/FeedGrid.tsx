import { type ComponentPropsWithRef } from 'react';
import { Link } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import { cn } from '@/shared/lib';
import type { FeedItem } from '../model/types';

const GRID_EAGER_COUNT = 9;

interface FeedGridProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  items: FeedItem[];
}

export const FeedGrid = ({ items, className, ref, ...props }: FeedGridProps) => {
  return (
    <ul ref={ref} className={cn('grid grid-cols-3 gap-1', className)} {...props}>
      {items.map((item, index) => {
        const isAboveFold = index < GRID_EAGER_COUNT;
        return (
          <li key={item.id} className="overflow-hidden rounded-sm">
            <Link
              to={toFeedDetail(item.id)}
              state={{ thumbnailUrl: item.thumbnailUrl }}
              aria-label={`${item.title || item.location || '피드'} 상세 보기`}
              className="block aspect-square size-full"
            >
              <img
                data-hero-exit-key={`pin-${item.id}`}
                src={item.thumbnailUrl}
                alt=""
                loading={isAboveFold ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="no-native-image size-full object-cover"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
