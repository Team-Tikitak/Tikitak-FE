import { type ComponentPropsWithRef } from 'react';
import CancelIcon from '@/shared/assets/Icon/CancelIcon.svg?react';
import { cn } from '@/shared/lib';

interface PhotoThumbnailProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  src: string;
  alt: string;
  onRemove?: () => void;
}

export function PhotoThumbnail({
  src,
  alt,
  onRemove,
  className,
  ref,
  ...props
}: PhotoThumbnailProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative size-28 overflow-hidden rounded-lg border border-gray-300',
        className,
      )}
      {...props}
    >
      <img src={src} alt={alt} className="size-full object-cover" />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="사진 삭제"
          className="absolute top-2 right-2 text-gray-300"
        >
          <CancelIcon aria-hidden="true" className="block size-4" />
        </button>
      )}
    </div>
  );
}
