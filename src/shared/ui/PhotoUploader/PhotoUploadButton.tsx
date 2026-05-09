import { type ComponentPropsWithRef } from 'react';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import { cn } from '@/shared/lib';

interface PhotoUploadButtonProps extends ComponentPropsWithRef<'button'> {
  current: number;
  max: number;
}

export function PhotoUploadButton({
  current,
  max,
  className,
  ref,
  ...props
}: PhotoUploadButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={`사진 추가 (${current}/${max})`}
      className={cn(
        'flex size-28 flex-col items-center justify-center rounded-lg border border-gray-300',
        className,
      )}
      {...props}
    >
      <CameraIcon aria-hidden="true" className="size-6 text-gray-900" />
      <span className="text-[12px] leading-[140%] font-medium text-gray-900">
        {current}/{max}
      </span>
    </button>
  );
}
