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
  zoomLevel = 1,
  zoomSupported = false,
  onZoomChange,
}: CameraViewProps) => {
  return (
    <div className="relative flex h-full w-full justify-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        data-testid="camera-preview"
        autoPlay
        playsInline
        muted
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-150',
          mirrored && '-scale-x-100',
          isReady ? 'opacity-100' : 'opacity-0',
        )}
      />

      <button
        type="button"
        aria-label="카메라 닫기"
        onClick={onClose}
        className="press-feedback absolute top-[calc(var(--safe-top)+24px)] left-6 z-10 flex size-9 items-center justify-center"
      >
        <CloseIcon3 className="size-[18px]" />
      </button>

      {error && (
        <p className="text-h4 absolute top-1/2 left-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 text-center text-white">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      {isReady && !error && (
        <>
          {zoomSupported && (
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+132px)] left-1/2 z-10 flex -translate-x-1/2 items-center rounded-full bg-black/35 p-1 backdrop-blur-md">
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
            className="absolute bottom-[calc(env(safe-area-inset-bottom)+40px)] z-10"
            onClick={onCapture}
          />
          <button
            type="button"
            aria-label="카메라 전환"
            onClick={onToggleFacingMode}
            className="press-feedback absolute right-[43px] bottom-[calc(env(safe-area-inset-bottom)+58px)] z-10 flex size-9 items-center justify-center rounded-full bg-gray-500"
          >
            <ChangeIcon className="size-6" />
          </button>
        </>
      )}
    </div>
  );
};
