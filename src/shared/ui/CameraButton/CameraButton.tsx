import { cn } from '@/shared/lib';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import type { ButtonHTMLAttributes } from 'react';

type CameraButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function CameraButton({ className, ...props }: CameraButtonProps) {
  return (
    <button
      type="button"
      aria-label="카메라 버튼"
      className={cn(
        'bg-main-001 active:bg-main-002 flex h-18 w-18 items-center justify-center rounded-full',
        className,
      )}
      {...props}
    >
      <CameraIcon className="h-10 w-10" />
    </button>
  );
}
