import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAccessToken } from './instance';
import { useAuthStore } from '../stores/authStore';

afterEach(() => {
  vi.restoreAllMocks();
  useAuthStore.getState().clearAccessToken();
});

describe('refreshAccessToken', () => {
  it('동시에 호출돼도 실제 요청은 한 번만 보내고 모든 호출자가 같은 토큰을 받는다', async () => {
    let resolvePost: (value: { data: { data: { accessToken: string } } }) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    const postSpy = vi
      .spyOn(axios, 'post')
      .mockReturnValue(postPromise as ReturnType<typeof axios.post>);

    const call1 = refreshAccessToken();
    const call2 = refreshAccessToken();
    const call3 = refreshAccessToken();

    expect(postSpy).toHaveBeenCalledTimes(1);

    resolvePost!({ data: { data: { accessToken: 'new-token' } } });

    const [token1, token2, token3] = await Promise.all([call1, call2, call3]);

    expect(token1).toBe('new-token');
    expect(token2).toBe('new-token');
    expect(token3).toBe('new-token');
    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });

  it('실패하면 대기 중인 모든 호출자가 같은 에러로 reject되고, 이후 재호출은 새 요청을 보낸다', async () => {
    const error = new Error('refresh failed');
    const postSpy = vi.spyOn(axios, 'post').mockRejectedValueOnce(error);

    const call1 = refreshAccessToken();
    const call2 = refreshAccessToken();

    await expect(call1).rejects.toBe(error);
    await expect(call2).rejects.toBe(error);
    expect(postSpy).toHaveBeenCalledTimes(1);

    postSpy.mockResolvedValueOnce({
      data: { data: { accessToken: 'retry-token' } },
    } as Awaited<ReturnType<typeof axios.post>>);

    const retryToken = await refreshAccessToken();

    expect(retryToken).toBe('retry-token');
    expect(postSpy).toHaveBeenCalledTimes(2);
  });
});
