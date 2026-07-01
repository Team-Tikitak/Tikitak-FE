import { type ComponentPropsWithRef, type MouseEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import { cn } from '@/shared/lib';
import type { FeedItem } from '../model/types';

const GRID_EAGER_COUNT = 9;
const HERO_PRELOAD_TIMEOUT_MS = 180;
const IMAGE_PRELOAD_CACHE_LIMIT = 150;
const imagePreloadCache = new Map<string, Promise<void>>();

interface FeedGridProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  items: FeedItem[];
}

const preloadImage = (url: string): Promise<void> => {
  if (!url) return Promise.resolve();
  const cached = imagePreloadCache.get(url);
  if (cached) return cached;

  const preload = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
  imagePreloadCache.set(url, preload);
  if (imagePreloadCache.size > IMAGE_PRELOAD_CACHE_LIMIT) {
    const oldestKey = imagePreloadCache.keys().next().value;
    if (oldestKey) imagePreloadCache.delete(oldestKey);
  }
  return preload;
};

const preloadHeroAssets = (item: FeedItem) =>
  Promise.race([
    Promise.all([preloadImage(item.thumbnailUrl), preloadImage(item.heroPreviewUrl)]).then(
      () => undefined,
    ),
    new Promise<void>((resolve) => window.setTimeout(resolve, HERO_PRELOAD_TIMEOUT_MS)),
  ]);

export const FeedGrid = ({ items, className, ref, ...props }: FeedGridProps) => {
  const navigate = useNavigate();

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
    void preloadHeroAssets(item);
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
    await preloadHeroAssets(item);
    navigate(toFeedDetail(item.id), {
      state: { thumbnailUrl: item.thumbnailUrl, heroPreviewUrl: item.heroPreviewUrl },
    });
  };

  return (
    <ul ref={ref} className={cn('grid grid-cols-3 gap-1', className)} {...props}>
      {items.map((item, index) => {
        const isAboveFold = index < GRID_EAGER_COUNT;
        return (
          <li key={item.id} className="overflow-hidden rounded-sm">
            <Link
              to={toFeedDetail(item.id)}
              state={{ thumbnailUrl: item.thumbnailUrl, heroPreviewUrl: item.heroPreviewUrl }}
              aria-label={`${item.title || item.location || '피드'} 상세 보기`}
              className="block aspect-square size-full"
              onPointerDown={() => warmHeroAssets(item)}
              onFocus={() => warmHeroAssets(item)}
              onMouseEnter={() => warmHeroAssets(item)}
              onClick={(event) => void handleFeedClick(event, item)}
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
