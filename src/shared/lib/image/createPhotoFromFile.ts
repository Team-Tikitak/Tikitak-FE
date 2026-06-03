import type { CapturedPhoto } from '@/shared/types/photo';
import { createId } from '../createId';

export const createPhotoFromFile = (file: File): CapturedPhoto => ({
  id: createId(),
  url: URL.createObjectURL(file),
  blob: file,
});
