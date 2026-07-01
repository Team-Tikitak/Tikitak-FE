import { Capacitor } from '@capacitor/core';
import type { GalleryPhoto } from '@capacitor/camera';

const base64ToBlob = (base64: string, contentType: string): Blob => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: contentType });
};

const getPhotoContentType = (format?: string): string => {
  if (!format) return 'image/jpeg';
  return `image/${format === 'jpg' ? 'jpeg' : format}`;
};

export const readGalleryPhotoBlob = async (photo: GalleryPhoto): Promise<Blob> => {
  if (Capacitor.isNativePlatform() && photo.path) {
    const { Filesystem } = await import('@capacitor/filesystem');
    const { data } = await Filesystem.readFile({ path: photo.path });

    if (data instanceof Blob) return data;
    return base64ToBlob(data, getPhotoContentType(photo.format));
  }

  return fetch(photo.webPath).then((response) => response.blob());
};
