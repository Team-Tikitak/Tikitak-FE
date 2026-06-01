const LEGACY_RUNTIME_CACHE_NAMES = ['tikitak-api'] as const;

export const clearLegacyPwaRuntimeCaches = async () => {
  if (!('caches' in window)) {
    return;
  }

  try {
    await Promise.all(
      LEGACY_RUNTIME_CACHE_NAMES.map((cacheName) => window.caches.delete(cacheName)),
    );
  } catch {
    // 캐시 삭제 실패가 부팅을 막지 않게
  }
};
