import { type ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { cn } from '@/shared/lib';

interface ImageWithFallbackProps extends ComponentPropsWithoutRef<'img'> {
  fallbackSrc: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt = '',
  className,
  ...props
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <img
      src={imageSrc || fallbackSrc}
      alt={alt}
      className={cn(
        'no-native-image rounded-max size-6 border border-white object-cover',
        className,
      )}
      onError={() => {
        setImageSrc(fallbackSrc);
      }}
      {...props}
    />
  );
}
