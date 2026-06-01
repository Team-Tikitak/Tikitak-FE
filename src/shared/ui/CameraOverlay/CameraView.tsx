import { type RefObject } from 'react';
import ChangeIcon from '@/shared/assets/Icon/Change.svg?react';
import CloseIcon3 from '@/shared/assets/Icon/CloseIcon3.svg?react';
import { type CameraError } from '@/shared/hooks/useCamera';
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
}

export const CameraView = ({
  videoRef,
  error,
  isReady,
  onCapture,
  onClose,
  onToggleFacingMode,
  mirrored = false,
}: CameraViewProps) => {
  return (
    <div className="relative flex h-full w-full justify-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'absolute inset-0 h-full w-full scale-[1.01] object-cover',
          mirrored && '-scale-x-[1.01]',
        )}
      />

      <button
        type="button"
        aria-label="카메라 닫기"
        onClick={onClose}
        className="press-feedback absolute top-[calc(env(safe-area-inset-top)+24px)] left-6 z-10 flex size-9 items-center justify-center"
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
