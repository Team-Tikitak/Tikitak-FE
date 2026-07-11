import { type RefObject } from 'react';
import ChangeIcon from '@/shared/assets/Icon/Change.svg?react';
import CloseIcon3 from '@/shared/assets/Icon/CloseIcon3.svg?react';
import { type CameraError } from '@/shared/hooks/camera/useCamera';
import { type CameraZoomLevel } from '@/shared/hooks/camera/useCameraStream';
import { cn } from '@/shared/lib';
import { CameraButton } from './CameraButton';

const ERROR_MESSAGES = {
  permission: '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
  unsupported: '이 브라우저에서는 카메라를 사용할 수 없습니다.',
  unknown: '카메라를 켜는 중 오류가 발생했습니다.',
} satisfies Record<CameraError, string>;

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  error: CameraError | null;
  isReady: boolean;
  onCapture: () => void;
  onClose: () => void;
  onToggleFacingMode: () => void;
  mirrored?: boolean;
  nativePreview?: boolean;
  zoomLevel?: CameraZoomLevel;
  zoomSupported?: boolean;
  onZoomChange?: (zoomLevel: CameraZoomLevel) => void;
}

export const CameraView = ({
  videoRef,
  error,
  isReady,
  onCapture,
  onClose,
  onToggleFacingMode,
  mirrored = false,
  nativePreview = false,
  zoomLevel = 1,
  zoomSupported = false,
  onZoomChange,
}: CameraViewProps) => {
  return (
    <div
      data-testid="camera-view"
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden',
        nativePreview ? 'bg-transparent' : 'bg-black',
      )}
    >
      {nativePreview ? (
        <div
          data-testid="camera-preview"
          className={cn(
            'mt-[calc(var(--safe-top)+85px)] aspect-3/4 w-full shrink-0 bg-transparent transition-opacity duration-150',
            isReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : (
        <div className="mt-[calc(var(--safe-top)+85px)] aspect-3/4 w-full shrink-0 overflow-hidden bg-black">
          <video
            ref={videoRef}
            data-testid="camera-preview"
            autoPlay
            playsInline
            muted
            className={cn(
              'h-full w-full object-cover transition-opacity duration-150',
              mirrored && '-scale-x-100',
              isReady ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>
      )}

      <button
        type="button"
        aria-label="카메라 닫기"
        onClick={onClose}
        className="press-feedback absolute top-[calc(var(--safe-top)+9px)] left-5 z-10 flex size-9 items-center justify-center"
      >
        <CloseIcon3 className="size-[18px]" />
      </button>

      {error && (
        <p className="text-h4 absolute top-1/2 left-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      {isReady && !error && (
        <div className="relative flex min-h-0 flex-1 items-start justify-center pt-2.5">
          {zoomSupported && (
            <div className="z-10 flex items-center rounded-full bg-white/12 p-1 backdrop-blur-md">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-1 left-1 size-10 rounded-full bg-[rgba(30,31,31,0.72)] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                  zoomLevel === 2 && 'translate-x-10',
                )}
              />
              {([1, 2] as const).map((level) => {
                const selected = zoomLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    aria-label={`${level}배 줌`}
                    aria-pressed={selected}
                    onClick={() => onZoomChange?.(level)}
                    className={cn(
                      'press-feedback relative z-10 flex size-10 items-center justify-center rounded-full text-[15px] leading-none font-semibold text-white transition-[color,transform] duration-200 ease-out active:scale-95',
                      selected && 'text-main-001 scale-105',
                    )}
                  >
                    {level}x
                  </button>
                );
              })}
            </div>
          )}
          <CameraButton
            className="absolute top-[79px] left-1/2 z-10 -translate-x-1/2"
            onClick={onCapture}
          />
          <button
            type="button"
            aria-label="카메라 전환"
            onClick={onToggleFacingMode}
            className="press-feedback absolute top-[97px] right-[43px] z-10 flex size-9 items-center justify-center rounded-full bg-gray-500"
          >
            <ChangeIcon className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
};
