const SDK_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
  import.meta.env.VITE_KAKAO_MAP_APP_KEY
}&autoload=false`;

let kakaoSdkPromise: Promise<void> | null = null;

export const ensureKakaoSdk = (): Promise<void> => {
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Kakao SDK requires browser'));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (!window.kakao?.maps) reject(new Error('Kakao SDK load timeout'));
    }, 10_000);

    const finish = () => {
      const maps = window.kakao?.maps;
      if (!maps) {
        window.clearTimeout(timeoutId);
        reject(new Error('Kakao SDK loaded but maps unavailable'));
        return;
      }
      maps.load(() => {
        window.clearTimeout(timeoutId);
        resolve();
      });
    };

    // 이미 로드됨(또는 테스트 stub) → 바로 사용
    if (window.kakao?.maps) {
      finish();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk]');
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', finish, { once: true });
    script.addEventListener(
      'error',
      () => {
        window.clearTimeout(timeoutId);
        reject(new Error('Kakao SDK failed to load'));
      },
      { once: true },
    );

    if (!existing) {
      script.src = SDK_SRC;
      script.async = true;
      script.dataset.kakaoSdk = 'true';
      document.head.appendChild(script);
    }
  });

  return kakaoSdkPromise;
};
