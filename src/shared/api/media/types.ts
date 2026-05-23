export type MediaUploadPurpose =
  | 'FEED_IMAGE'
  | 'DAILY_QUESTION_IMAGE'
  | 'TEAM_IMAGE'
  | 'PROFILE_IMAGE';

export type MediaUploadStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface FileUploadRequest {
  fileName: string;
  contentType: string;
  size: number;
}

export interface MediaUploadRequest {
  purpose: MediaUploadPurpose;
  teamId?: number;
  files: FileUploadRequest[];
}

export interface MediaUploadItem {
  mediaPublicId: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
}

export interface MediaUploadResponse {
  uploadId: string;
  uploadStatus: MediaUploadStatus;
  items: MediaUploadItem[];
}

export interface MediaUploadCompleteItem {
  mediaPublicId: string;
  contentType: string;
  size: number;
}

export interface MediaUploadCompleteRequest {
  items: MediaUploadCompleteItem[];
}

export interface MediaUploadCompleteResponse {
  uploadId: string;
  uploadStatus: MediaUploadStatus;
  completedAt: string;
  items: MediaUploadCompleteItem[];
}
