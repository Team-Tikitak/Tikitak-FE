import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkApiReachable } from './api';
import { ApiError, NetworkError } from '../error';
import { publicInstance } from '../instance';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('checkApiReachable', () => {
  it('정상 응답이면 true', async () => {
    vi.spyOn(publicInstance, 'get').mockResolvedValue({ data: {} });

    await expect(checkApiReachable()).resolves.toBe(true);
  });

  it('비로그인 401 처럼 서버가 응답한 4xx 는 서버가 살아 있는 것으로 본다', async () => {
    vi.spyOn(publicInstance, 'get').mockRejectedValue(new ApiError({ status: 401 }));

    await expect(checkApiReachable()).resolves.toBe(true);
  });

  it('Cloudflare 터널 오류(530) 같은 5xx 는 false', async () => {
    vi.spyOn(publicInstance, 'get').mockRejectedValue(new ApiError({ status: 530 }));

    await expect(checkApiReachable()).resolves.toBe(false);
  });

  it('응답 자체가 없는 네트워크 오류(CORS 헤더 없는 터널 오류 포함)는 false', async () => {
    vi.spyOn(publicInstance, 'get').mockRejectedValue(new NetworkError());

    await expect(checkApiReachable()).resolves.toBe(false);
  });
});
