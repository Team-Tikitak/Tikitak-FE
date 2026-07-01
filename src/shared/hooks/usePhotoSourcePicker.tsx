import { Capacitor } from '@capacitor/core';
import { useImageFileInput } from '@/shared/hooks/useImageFileInput';
import { openOverlay } from '@/shared/lib';
import { createId } from '@/shared/lib/createId';
import { createPhotoFromFile } from '@/shared/lib/image/createPhotoFromFile';
import { optimizeFeedImageBlob } from '@/shared/lib/image/optimizeFeedImageBlob';
import { readGalleryPhotoBlob } from '@/shared/lib/image/readGalleryPhotoBlob';
import type { CapturedPhoto } from '@/shared/types/photo';
import { CameraOverlay } from '@/shared/ui/CameraOverlay';

interface UsePhotoSourcePickerOptions {
  remaining: number;
  maxFileSizeBytes?: number;
  acceptedMimeTypes?: readonly string[];
  source?: 'all' | 'gallery';
  onAdd: (photo: CapturedPhoto) => void;
}

export const usePhotoSourcePicker = ({
  remaining,
  maxFileSizeBytes,
  acceptedMimeTypes,
  source = 'all',
  onAdd,
}: UsePhotoSourcePickerOptions) => {
  const isAcceptedType = (blob: Blob) => {
    if (!acceptedMimeTypes) return true;
    if (acceptedMimeTypes.includes(blob.type)) return true;

    window.alert('JPEG, PNG, WEBP 이미지만 업로드할 수 있어요.');
    return false;
  };

  const isWithinSizeLimit = (blob: Blob) => {
    if (!maxFileSizeBytes || blob.size <= maxFileSizeBytes) return true;

    const limitMb = Math.round(maxFileSizeBytes / (1024 * 1024));
    window.alert(`이미지 크기는 ${limitMb}MB 이하여야 해요.`);
    return false;
  };

  const addFiles = async (files: File[]) => {
    for (const file of files.slice(0, remaining)) {
      const photo = await createPhotoFromFile(file);
      if (!isAcceptedType(photo.blob) || !isWithinSizeLimit(photo.blob)) {
        URL.revokeObjectURL(photo.url);
        continue;
      }
      onAdd(photo);
    }
  };

  const { openPicker, inputProps } = useImageFileInput({
    multiple: true,
    acceptedMimeTypes,
    onSelect: (files) => {
      void addFiles(files);
    },
  });

  const openCamera = () =>
    openOverlay(({ isOpen, close, unmount }) => (
      <CameraOverlay open={isOpen} onCapture={onAdd} onClose={close} onExitComplete={unmount} />
    ));

  const openGallery = async () => {
    const { Camera } = await import('@capacitor/camera');
    let photos;
    try {
      ({ photos } = await Camera.pickImages({ limit: remaining, quality: 90 }));
    } catch {
      return; // 사용자가 갤러리에서 취소
    }
    for (const photo of photos.slice(0, remaining)) {
      if (!photo.path && !photo.webPath) continue;
      try {
        const sourceBlob = await readGalleryPhotoBlob(photo);
        const blob = await optimizeFeedImageBlob(sourceBlob);
        if (!isAcceptedType(blob) || !isWithinSizeLimit(blob)) {
          continue;
        }
        onAdd({ id: createId(), url: URL.createObjectURL(blob), blob });
      } catch {
        continue;
      }
    }
  };

  const pick = async () => {
    if (remaining <= 0) return;
    if (!Capacitor.isNativePlatform()) {
      openPicker();
      return;
    }
    if (source === 'gallery') {
      await openGallery();
      return;
    }
    const { ActionSheet, ActionSheetButtonStyle } = await import('@capacitor/action-sheet');
    const { index } = await ActionSheet.showActions({
      title: '사진 업로드',
      options: [
        { title: '카메라로 촬영하기' },
        { title: '사진 선택하기' },
        { title: '취소', style: ActionSheetButtonStyle.Cancel },
      ],
    });
    if (index === 0) openCamera();
    else if (index === 1) await openGallery();
  };

  return { pick, inputProps };
};
