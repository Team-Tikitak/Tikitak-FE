import { instance } from '../instance';
import { MEDIA_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  MediaUploadCompleteRequest,
  MediaUploadCompleteResponse,
  MediaUploadRequest,
  MediaUploadResponse,
} from './types';

export const postMediaUploads = (body: MediaUploadRequest) =>
  instance.post<ApiResponse<MediaUploadResponse>>(MEDIA_ENDPOINTS.UPLOADS, body);

export const postMediaUploadComplete = (uploadId: string, body: MediaUploadCompleteRequest) =>
  instance.post<ApiResponse<MediaUploadCompleteResponse>>(
    MEDIA_ENDPOINTS.UPLOAD_COMPLETE(uploadId),
    body,
  );

export const deleteMedia = (mediaPublicId: string) =>
  instance.delete<ApiResponse<string>>(MEDIA_ENDPOINTS.MEDIA(mediaPublicId));

export const putMediaToR2 = async (uploadUrl: string, blob: Blob, contentType: string) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!response.ok) {
    throw new Error(`R2 업로드 실패: ${response.status} ${response.statusText}`);
  }
};
