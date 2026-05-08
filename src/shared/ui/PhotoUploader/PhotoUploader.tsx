import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { PhotoThumbnail } from './PhotoThumbnail';
import { PhotoUploadButton } from './PhotoUploadButton';

export interface UploaderPhoto {
  id: string;
  src: string;
  alt: string;
}

interface PhotoUploaderProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  photos: UploaderPhoto[];
  max: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function PhotoUploader({
  photos,
  max,
  onAdd,
  onRemove,
  className,
  ref,
  ...props
}: PhotoUploaderProps) {
  const canAdd = photos.length < max;
  return (
    <div ref={ref} className={cn('flex gap-2 overflow-x-auto *:shrink-0', className)} {...props}>
      {photos.map((photo) => (
        <PhotoThumbnail
          key={photo.id}
          src={photo.src}
          alt={photo.alt}
          onRemove={() => onRemove(photo.id)}
        />
      ))}
      {canAdd && <PhotoUploadButton current={photos.length} max={max} onClick={onAdd} />}
    </div>
  );
}
