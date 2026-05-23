import { postMediaUploadComplete, postMediaUploads, putMediaToR2 } from './api';
import type { MediaUploadPurpose } from './types';

interface UploadMediaInput {
  purpose: MediaUploadPurpose;
  teamId?: number;
  blobs: Blob[];
  fileNamePrefix?: string;
}

export const uploadMediaBlobs = async ({
  purpose,
  teamId,
  blobs,
  fileNamePrefix = 'image',
}: UploadMediaInput): Promise<string[]> => {
  if (blobs.length === 0) return [];

  const presignRes = await postMediaUploads({
    purpose,
    teamId,
    files: blobs.map((blob, index) => {
      const contentType = blob.type || 'image/jpeg';
      const extension = contentType.split('/')[1] ?? 'jpg';
      return {
        fileName: `${fileNamePrefix}-${Date.now()}-${index}.${extension}`,
        contentType,
        size: blob.size,
      };
    }),
  });

  const { uploadId, items } = presignRes.data.data;

  await Promise.all(
    items.map((item, index) => putMediaToR2(item.uploadUrl, blobs[index], item.contentType)),
  );

  await postMediaUploadComplete(uploadId, {
    items: items.map((item, index) => ({
      mediaPublicId: item.mediaPublicId,
      contentType: item.contentType,
      size: blobs[index].size,
    })),
  });

  return items.map((item) => item.mediaPublicId);
};
