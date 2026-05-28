let kakaoSdkPromise: Promise<void> | null = null;

export const ensureKakaoSdk = (): Promise<void> => {
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Kakao SDK requires browser'));
      return;
    }

    const tryLoad = () => {
      const maps = window.kakao?.maps;
      if (maps) {
        maps.load(() => resolve());
        return true;
      }
      return false;
    };

    if (tryLoad()) return;

    const intervalId = window.setInterval(() => {
      if (tryLoad()) window.clearInterval(intervalId);
    }, 50);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      if (!window.kakao?.maps) reject(new Error('Kakao SDK load timeout'));
    }, 10_000);
  });

  return kakaoSdkPromise;
};
