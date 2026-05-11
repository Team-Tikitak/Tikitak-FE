import { PageShell } from '@/app/layout';
import CloseIcon from '@/shared/assets/Icon/CloseIcon.svg?react';
import StickerIcon from '@/shared/assets/Icon/StickerIcon.svg?react';
import { Button } from '@/shared/ui';

interface CameraReviewProps {
  capturedImage: string;
  onRetake: () => void;
}

export const CameraReview = ({ capturedImage, onRetake }: CameraReviewProps) => {
  return (
    <PageShell
      contentClassName="relative flex flex-1 justify-center bg-black"
      bottom={<Button variant="primary">업로드</Button>}
    >
      <img src={capturedImage} alt="촬영된 사진" className="h-full w-full object-cover" />
      <button
        aria-label="재촬영"
        className="absolute top-15 left-6 size-7 cursor-pointer rounded-full bg-black/60"
        onClick={onRetake}
      >
        <CloseIcon className="size-4 text-white" />
      </button>
      <button aria-label="스티커 추가" className="absolute top-15 right-6 cursor-pointer">
        <StickerIcon className="size-7" />
      </button>
    </PageShell>
  );
};
