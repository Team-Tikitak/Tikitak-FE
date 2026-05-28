import { type ComponentPropsWithRef } from 'react';
import { Link } from 'react-router';
import { toFeedDetail } from '@/app/routes';
import { cn } from '@/shared/lib';
import type { FeedItem } from '../model/types';

interface FeedGridProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  items: FeedItem[];
}

export const FeedGrid = ({ items, className, ref, ...props }: FeedGridProps) => {
  return (
    <ul ref={ref} className={cn('grid grid-cols-3 gap-1', className)} {...props}>
      {items.map((item) => (
        <li key={item.id} className="overflow-hidden rounded-sm">
          <Link
            to={toFeedDetail(item.id)}
            state={{ thumbnailUrl: item.thumbnailUrl }}
            className="block aspect-square size-full"
          >
            <img
              data-hero-exit-key={`pin-${item.id}`}
              src={item.thumbnailUrl}
              alt={item.title}
              className="no-native-image size-full object-cover"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};
