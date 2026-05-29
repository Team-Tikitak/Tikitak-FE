import { postMediaUploadComplete, postMediaUploads, putMediaToR2 } from './api';
import { unwrap } from '../request';
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

  const { uploadId, items } = await unwrap(() =>
    postMediaUploads({
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
    }),
  );

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

const MEDIA_CDN_HOST = 'dev-media.kusitms.xyz';

const PURPOSE_FOLDER: Record<MediaUploadPurpose, string> = {
  PROFILE_IMAGE: 'profile-image',
  FEED_IMAGE: 'feed-image',
  TEAM_IMAGE: 'team-image',
  DAILY_QUESTION_IMAGE: 'daily-question-image',
};

export const buildMediaPublicUrl = (
  purpose: MediaUploadPurpose,
  publicId: string,
  contentType: string,
): string => {
  const folder = PURPOSE_FOLDER[purpose];
  const extension = contentType.split('/')[1] ?? 'jpg';
  return `https://${MEDIA_CDN_HOST}/media/${folder}/${publicId}.${extension}`;
};
