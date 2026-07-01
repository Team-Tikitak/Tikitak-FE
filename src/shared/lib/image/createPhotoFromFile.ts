import type { CapturedPhoto } from '@/shared/types/photo';
import { createId } from '../createId';
import { optimizeFeedImageBlob } from './optimizeFeedImageBlob';

export const createPhotoFromFile = async (file: File): Promise<CapturedPhoto> => {
  const blob = await optimizeFeedImageBlob(file);

  return {
    id: createId(),
    url: URL.createObjectURL(blob),
    blob,
  };
};
