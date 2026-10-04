import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NetworkError } from '../error';
import { restoreSession } from './restoreSession';

const { fetchQueryMock } = vi.hoisted(() => ({ fetchQueryMock: vi.fn() }));

vi.mock('@/app/providers/queryClient', () => ({
  queryClient: { fetchQuery: fetchQueryMock },
}));
vi.mock('./sessionQuery', () => ({ sessionQueryOptions: {} }));

describe('restoreSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchQueryMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('refresh 에 성공하면 authenticated', async () => {
    fetchQueryMock.mockResolvedValue('token');

    await expect(restoreSession()).resolves.toBe('authenticated');
    expect(fetchQueryMock).toHaveBeenCalledTimes(1);
  });

  it('4xx(쿠키 없음 AUTH006·토큰 무효 AUTH007)는 재시도 없이 unauthenticated', async () => {
    fetchQueryMock.mockRejectedValue(new ApiError({ status: 400, code: 'AUTH006' }));

    await expect(restoreSession()).resolves.toBe('unauthenticated');
    expect(fetchQueryMock).toHaveBeenCalledTimes(1);
  });

  it('토큰이 없는 응답처럼 서버 장애가 아닌 일반 오류도 unauthenticated', async () => {
    fetchQueryMock.mockRejectedValue(new Error('Access token not found'));

    await expect(restoreSession()).resolves.toBe('unauthenticated');
  });

  it('5xx 가 계속되면 두 번 재시도한 뒤 unavailable 로 비로그인과 구분한다', async () => {
    fetchQueryMock.mockRejectedValue(new ApiError({ status: 530 }));

    const result = restoreSession();
    await vi.advanceTimersByTimeAsync(1600);

    await expect(result).resolves.toBe('unavailable');
    expect(fetchQueryMock).toHaveBeenCalledTimes(3);
  });

  it('일시적인 네트워크 오류 뒤 재시도에 성공하면 authenticated', async () => {
    fetchQueryMock.mockRejectedValueOnce(new NetworkError()).mockResolvedValueOnce('token');

    const result = restoreSession();
    await vi.advanceTimersByTimeAsync(800);

    await expect(result).resolves.toBe('authenticated');
    expect(fetchQueryMock).toHaveBeenCalledTimes(2);
  });
});
