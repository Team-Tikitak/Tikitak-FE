const CHUNK_LOAD_ERROR_PATTERNS = [
  /dynamically imported module/i,
  /importing a module script failed/i,
  /loading chunk .* failed/i,
];

const RELOAD_GUARD_KEY = 'tikitak:chunk-reload-attempted';

const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

// 배포 도중/직후 이미 열려있던 세션이 옛 빌드의 청크 파일명을 참조하다 404가 나는 경우를 감지해
// 한 번만 새로고침해 최신 번들을 받아오게 한다. sessionStorage 가드로 무한 새로고침을 막는다.
export const recoverFromChunkLoadError = (error: unknown): boolean => {
  if (!isChunkLoadError(error)) return false;

  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === '1') return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
  } catch {
    // sessionStorage 접근 불가해도 새로고침은 진행
  }

  window.location.reload();
  return true;
};
