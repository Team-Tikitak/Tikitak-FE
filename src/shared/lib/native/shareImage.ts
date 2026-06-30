import { Capacitor } from '@capacitor/core';

interface ShareImageOptions {
  fileName: string;
  title?: string;
  text?: string;
}

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('이미지 변환에 실패했어요'));
    reader.readAsDataURL(blob);
  });

export const shareImageBlob = async (blob: Blob, options: ShareImageOptions): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share'),
    ]);
    const { uri } = await Filesystem.writeFile({
      path: options.fileName,
      data: await blobToBase64(blob),
      directory: Directory.Cache,
    });
    await Share.share({ title: options.title, text: options.text, files: [uri] });
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = options.fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
