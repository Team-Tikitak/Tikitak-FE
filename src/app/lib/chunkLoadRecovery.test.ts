import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recoverFromChunkLoadError } from './chunkLoadRecovery';

describe('recoverFromChunkLoadError', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
  });

  it('청크 로드 실패 에러가 아니면 새로고침하지 않는다', () => {
    const handled = recoverFromChunkLoadError(new Error('그냥 일반 에러'));

    expect(handled).toBe(false);
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('청크 로드 실패 에러면 새로고침하고 true를 반환한다', () => {
    const handled = recoverFromChunkLoadError(
      new Error('Failed to fetch dynamically imported module'),
    );

    expect(handled).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('이미 새로고침을 시도했으면 같은 세션에서 다시 시도하지 않는다', () => {
    recoverFromChunkLoadError(new Error('Failed to fetch dynamically imported module'));
    const secondHandled = recoverFromChunkLoadError(
      new Error('Failed to fetch dynamically imported module'),
    );

    expect(secondHandled).toBe(false);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
