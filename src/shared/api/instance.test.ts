import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_ENDPOINTS } from './auth/endpoints';
import { ApiError, NetworkError } from './error';
import { instance, refreshAccessToken } from './instance';
import { useAuthStore } from '../stores/authStore';

const { readStoredRefreshTokenMock, storeRefreshTokenMock, clearStoredRefreshTokenMock } =
  vi.hoisted(() => ({
    readStoredRefreshTokenMock: vi.fn(),
    storeRefreshTokenMock: vi.fn(),
    clearStoredRefreshTokenMock: vi.fn(),
  }));

vi.mock('@/shared/lib/native/refreshTokenStorage', () => ({
  readStoredRefreshToken: readStoredRefreshTokenMock,
  storeRefreshToken: storeRefreshTokenMock,
  clearStoredRefreshToken: clearStoredRefreshTokenMock,
}));

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
      .spyOn(instance, 'post')
      .mockReturnValue(postPromise as ReturnType<typeof instance.post>);

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
    const postSpy = vi.spyOn(instance, 'post').mockRejectedValueOnce(error);

    const call1 = refreshAccessToken();
    const call2 = refreshAccessToken();

    await expect(call1).rejects.toBe(error);
    await expect(call2).rejects.toBe(error);
    expect(postSpy).toHaveBeenCalledTimes(1);

    postSpy.mockResolvedValueOnce({
      data: { data: { accessToken: 'retry-token' } },
    } as Awaited<ReturnType<typeof instance.post>>);

    const retryToken = await refreshAccessToken();

    expect(retryToken).toBe('retry-token');
    expect(postSpy).toHaveBeenCalledTimes(2);
  });
});

describe('instance 응답 인터셉터', () => {
  const originalAdapter = instance.defaults.adapter;

  const respond = (
    config: InternalAxiosRequestConfig,
    status: number,
    data: unknown,
  ): Promise<AxiosResponse> => {
    const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse;
    if (status >= 200 && status < 300) return Promise.resolve(response);
    return Promise.reject(new AxiosError(`status ${status}`, undefined, config, null, response));
  };

  beforeEach(() => {
    useAuthStore.getState().clearAccessToken();
  });

  afterEach(() => {
    instance.defaults.adapter = originalAdapter;
  });

  it('HTTP 200 이어도 envelope 가 success: false 이면 ApiError 로 실패한다', async () => {
    instance.defaults.adapter = (config) =>
      respond(config, 200, { success: false, code: 'COMMON001', message: '서버 내부 오류' });

    const error = await instance.get('/api/v1/any').catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 200,
      code: 'COMMON001',
      serverMessage: '서버 내부 오류',
    });
  });

  it('HTTP 4xx/5xx 는 서버 code·message 를 담은 ApiError 가 된다', async () => {
    instance.defaults.adapter = (config) =>
      respond(config, 500, { code: 'COMMON001', message: '서버 내부 오류' });

    const error = await instance.get('/api/v1/any').catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, code: 'COMMON001' });
  });

  it('응답을 받지 못한 오류는 NetworkError 가 된다', async () => {
    instance.defaults.adapter = () => Promise.reject(new AxiosError('Network Error'));

    const error = await instance.get('/api/v1/any').catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(NetworkError);
  });

  it('동시에 401 이 나도 refresh 는 한 번만 수행하고 모든 요청이 새 토큰으로 재시도된다', async () => {
    let refreshCalls = 0;
    instance.defaults.adapter = (config) => {
      if (config.url === AUTH_ENDPOINTS.TOKEN_REFRESH) {
        refreshCalls += 1;
        return respond(config, 200, { success: true, data: { accessToken: 'fresh-token' } });
      }
      if (config.headers.get('Authorization') === 'Bearer fresh-token') {
        return respond(config, 200, { success: true, data: 'ok' });
      }
      return respond(config, 401, { message: 'expired' });
    };

    const results = await Promise.all([
      instance.get('/api/v1/a'),
      instance.get('/api/v1/b'),
      instance.get('/api/v1/c'),
    ]);

    expect(results.map((result) => result.data.data)).toEqual(['ok', 'ok', 'ok']);
    expect(refreshCalls).toBe(1);
  });

  it('refresh 가 5xx 로 실패하면 세션을 유지한 채 ApiError 로 실패한다', async () => {
    useAuthStore.getState().setAccessToken('old-token');
    instance.defaults.adapter = (config) => {
      if (config.url === AUTH_ENDPOINTS.TOKEN_REFRESH) return respond(config, 500, {});
      return respond(config, 401, { message: 'expired' });
    };

    const error = await instance.get('/api/v1/any').catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500 });
    expect(useAuthStore.getState().accessToken).toBe('old-token');
  });
});

describe('refreshAccessToken 쿠키 없음 폴백', () => {
  const originalAdapter = instance.defaults.adapter;

  const respond = (
    config: InternalAxiosRequestConfig,
    status: number,
    data: unknown,
  ): Promise<AxiosResponse> => {
    const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse;
    if (status >= 200 && status < 300) return Promise.resolve(response);
    return Promise.reject(new AxiosError(`status ${status}`, undefined, config, null, response));
  };

  const cookieMissing = {
    success: false,
    status: 400,
    code: 'AUTH006',
    message: '리프레시 토큰이 필요합니다.',
  };
  const invalidToken = {
    success: false,
    status: 401,
    code: 'AUTH007',
    message: '유효하지 않은 리프레시 토큰입니다.',
  };
  const refreshBody = (config: InternalAxiosRequestConfig) =>
    typeof config.data === 'string'
      ? (JSON.parse(config.data) as { refreshToken?: string })
      : undefined;

  beforeEach(() => {
    readStoredRefreshTokenMock.mockReset().mockResolvedValue(null);
    storeRefreshTokenMock.mockReset().mockResolvedValue(undefined);
    clearStoredRefreshTokenMock.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    instance.defaults.adapter = originalAdapter;
  });

  it('refresh 에 성공하면 응답의 새 refreshToken 을 저장한다 (서버가 회전시키므로 매번 갱신)', async () => {
    instance.defaults.adapter = (config) =>
      respond(config, 200, {
        success: true,
        data: { accessToken: 'access-1', refreshToken: 'refresh-2' },
      });

    await expect(refreshAccessToken()).resolves.toBe('access-1');
    expect(storeRefreshTokenMock).toHaveBeenCalledWith('refresh-2');
  });

  it('쿠키가 없고(AUTH006) 저장된 토큰이 있으면 본문 refreshToken 으로 한 번 더 시도해 복구한다', async () => {
    readStoredRefreshTokenMock.mockResolvedValue('stored-refresh');
    const bodies: Array<{ refreshToken?: string } | undefined> = [];
    instance.defaults.adapter = (config) => {
      bodies.push(refreshBody(config));
      if (!refreshBody(config)?.refreshToken) return respond(config, 400, cookieMissing);
      return respond(config, 200, {
        success: true,
        data: { accessToken: 'access-2', refreshToken: 'refresh-3' },
      });
    };

    await expect(refreshAccessToken()).resolves.toBe('access-2');

    expect(bodies).toEqual([undefined, { refreshToken: 'stored-refresh' }]);
    expect(storeRefreshTokenMock).toHaveBeenCalledWith('refresh-3');
  });

  it('쿠키도 없고 저장된 토큰도 없으면 추가 요청 없이 AUTH006 으로 실패한다', async () => {
    let calls = 0;
    instance.defaults.adapter = (config) => {
      calls += 1;
      return respond(config, 400, cookieMissing);
    };

    const error = await refreshAccessToken().catch((cause: unknown) => cause);

    expect(error).toMatchObject({ status: 400, code: 'AUTH006' });
    expect(calls).toBe(1);
    expect(clearStoredRefreshTokenMock).not.toHaveBeenCalled();
  });

  it('폴백 토큰도 서버가 거절하면(4xx) 저장된 토큰을 지우고 실패한다', async () => {
    readStoredRefreshTokenMock.mockResolvedValue('stale-refresh');
    instance.defaults.adapter = (config) =>
      refreshBody(config)?.refreshToken
        ? respond(config, 401, invalidToken)
        : respond(config, 400, cookieMissing);

    const error = await refreshAccessToken().catch((cause: unknown) => cause);

    expect(error).toMatchObject({ status: 401, code: 'AUTH007' });
    expect(clearStoredRefreshTokenMock).toHaveBeenCalledTimes(1);
  });

  it('폴백 중 서버 장애(5xx)면 저장된 토큰을 보존한다', async () => {
    readStoredRefreshTokenMock.mockResolvedValue('stored-refresh');
    instance.defaults.adapter = (config) =>
      refreshBody(config)?.refreshToken
        ? respond(config, 530, {})
        : respond(config, 400, cookieMissing);

    const error = await refreshAccessToken().catch((cause: unknown) => cause);

    expect(error).toMatchObject({ status: 530 });
    expect(clearStoredRefreshTokenMock).not.toHaveBeenCalled();
  });

  it('쿠키는 있는데 무효(AUTH007)면 폴백하지 않는다', async () => {
    readStoredRefreshTokenMock.mockResolvedValue('stored-refresh');
    let calls = 0;
    instance.defaults.adapter = (config) => {
      calls += 1;
      return respond(config, 401, invalidToken);
    };

    const error = await refreshAccessToken().catch((cause: unknown) => cause);

    expect(error).toMatchObject({ status: 401, code: 'AUTH007' });
    expect(calls).toBe(1);
    expect(readStoredRefreshTokenMock).not.toHaveBeenCalled();
  });
});
