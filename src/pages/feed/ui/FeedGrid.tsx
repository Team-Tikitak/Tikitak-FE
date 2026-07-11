import { useQueryClient } from '@tanstack/react-query';
import { type ComponentPropsWithRef, type MouseEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import { cn } from '@/shared/lib';
import { TodayTikitakChip } from './TodayTikitakChip';
import { preloadFeedHeroAssets, preloadImage, runFeedHeroTransition } from '../lib/feedHeroAssets';
import { warmFeedDetail } from '../lib/warmFeedDetail';
import type { FeedItem } from '../model/types';

const GRID_EAGER_COUNT = 9;

interface FeedGridProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  items: FeedItem[];
  teamId: number | null;
  suppressedHeroId?: string | null;
  onHeroCapture?: (item: FeedItem, source: HTMLElement) => void;
}

export const FeedGrid = ({
  items,
  teamId,
  suppressedHeroId,
  onHeroCapture,
  className,
  ref,
  ...props
}: FeedGridProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const urls = items
      .slice(0, GRID_EAGER_COUNT)
      .map((item) => item.heroPreviewUrl)
      .filter(Boolean);
    if (urls.length === 0) return;

    const preload = () => {
      for (const url of urls) {
        void preloadImage(url);
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(preload);
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(preload, 200);
    return () => window.clearTimeout(id);
  }, [items]);

  const warmHeroAssets = (item: FeedItem) => {
    void preloadFeedHeroAssets(item);
  };

  const handleFeedClick = async (event: MouseEvent<HTMLAnchorElement>, item: FeedItem) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    const source = event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
    const { imageAspectRatio } = await runFeedHeroTransition(item, source, (i, s) =>
      onHeroCapture?.(i, s),
    );
    navigate(toFeedDetail(item.id), {
      state: {
        thumbnailUrl: item.thumbnailUrl,
        heroPreviewUrl: item.heroPreviewUrl,
        ...(imageAspectRatio ? { imageAspectRatio } : {}),
      },
    });
  };

  return (
    <ul ref={ref} className={cn('grid grid-cols-3 gap-1', className)} {...props}>
      {items.map((item, index) => {
        const isAboveFold = index < GRID_EAGER_COUNT;
        return (
          <li key={item.id} className="relative overflow-hidden rounded-sm">
            <Link
              to={toFeedDetail(item.id)}
              state={{ thumbnailUrl: item.thumbnailUrl, heroPreviewUrl: item.heroPreviewUrl }}
              aria-label={`${item.title || (item.type === 'DAILY_QUESTION' ? item.question : item.place) || '피드'} 상세 보기`}
              className="block aspect-square size-full"
              onPointerDown={(event) => {
                const source =
                  event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
                if (source) onHeroCapture?.(item, source);
                warmHeroAssets(item);
                warmFeedDetail(queryClient, teamId, item.id);
              }}
              onFocus={() => {
                warmHeroAssets(item);
              }}
              onMouseEnter={() => warmHeroAssets(item)}
              onClick={(event) => void handleFeedClick(event, item)}
            >
              <img
                {...(suppressedHeroId === item.id
                  ? {}
                  : { 'data-hero-exit-key': `pin-${item.id}`, 'data-hero-radius': '4' })}
                src={item.thumbnailUrl}
                alt=""
                loading={isAboveFold ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className={cn(
                  'no-native-image size-full object-cover',
                  suppressedHeroId === item.id && 'opacity-0',
                )}
              />
              {item.type === 'DAILY_QUESTION' && (
                <>
                  <div
                    aria-hidden
                    className={cn(
                      'border-main-001 pointer-events-none absolute inset-0 z-40 rounded-sm border-2 transition-opacity duration-200',
                      suppressedHeroId === item.id && 'opacity-0 duration-200 ease-out',
                    )}
                  />
                  <TodayTikitakChip
                    className={cn(
                      'absolute top-0 left-0 z-40 transition-opacity duration-200',
                      suppressedHeroId === item.id && 'opacity-0 duration-200 ease-out',
                    )}
                  />
                </>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
