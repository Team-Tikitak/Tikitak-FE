import { tv } from 'tailwind-variants';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import type { ComponentPropsWithRef } from 'react';

const cameraButtonVariants = tv({
  base: 'bg-main-001 active:bg-main-002 flex h-18 w-18 items-center justify-center rounded-full',
});

type CameraButtonProps = ComponentPropsWithRef<'button'>;

export function CameraButton({ className, ref, ...props }: CameraButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="카메라 버튼"
      className={cameraButtonVariants({ className })}
      {...props}
    >
      <CameraIcon className="h-10 w-10 text-white" />
    </button>
  );
}
