import { PageShell } from '@/app/layout';
import CloseIcon from '@/shared/assets/Icon/CloseIcon.svg?react';
import { CameraButton } from '@/shared/ui';

interface CameraViewProps {
  onCapture: () => void;
  onClose: () => void;
}

export const CameraView = ({ onCapture, onClose }: CameraViewProps) => {
  return (
    <PageShell contentClassName="relative flex flex-1 justify-center bg-black">
      <button
        aria-label="카메라 닫기"
        onClick={onClose}
        className="absolute top-15 left-6 cursor-pointer"
      >
        <CloseIcon className="size-4 text-white" />
      </button>

      <CameraButton className="absolute bottom-10" onClick={onCapture} />
      {/* TODO: 카메라 촬영 기능 구현 */}
    </PageShell>
  );
};
