import TikitakLogoIcon from '@/shared/assets/Logo/tikitakLogoIcon.svg?react';
import { cn } from '@/shared/lib';
import type { ComponentPropsWithoutRef } from 'react';

interface MapImageProps extends ComponentPropsWithoutRef<'button'> {
  src?: string;
  count?: number;
}

export const MapImage = ({ src, count, className, ...props }: MapImageProps) => {
  return (
    <button
      {...props}
      type="button"
      className={cn(
        'absolute size-[87px] overflow-hidden rounded-[6px] border-4 border-white',
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="no-native-image size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center bg-white">
          <TikitakLogoIcon className="size-10" aria-hidden="true" />
        </div>
      )}
      {Boolean(count) && (
        <div className="absolute right-1 bottom-1 flex h-[21px] w-8 items-center justify-center rounded-[29px] bg-white text-gray-700">
          +{count}
        </div>
      )}
    </button>
  );
};
