export const MEDIA_ENDPOINTS = {
  UPLOADS: '/api/v1/media/uploads',
  UPLOAD_COMPLETE: (uploadId: string) => `/api/v1/media/uploads/${uploadId}/complete`,
  MEDIA: (mediaPublicId: string) => `/api/v1/media/${mediaPublicId}`,
} as const;
