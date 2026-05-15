import { type ComponentPropsWithRef } from 'react';
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
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="aspect-square size-full object-cover"
          />
        </li>
      ))}
    </ul>
  );
};
