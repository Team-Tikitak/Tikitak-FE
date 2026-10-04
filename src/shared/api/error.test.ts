import { AxiosError, CanceledError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, NetworkError, assertEnvelopeSuccess, toApiError } from './error';

const axiosErrorWithResponse = (status: number, data?: unknown) =>
  new AxiosError('failed', undefined, undefined, undefined, { status, data } as AxiosResponse);

describe('toApiError', () => {
  it('응답이 있는 axios 오류는 status 와 서버 code·message 를 담은 ApiError 가 된다', () => {
    const original = axiosErrorWithResponse(400, { code: 'INVITE005', message: '초대 링크 없음' });

    const result = toApiError(original);

    expect(result).toBeInstanceOf(ApiError);
    expect(result).toMatchObject({
      status: 400,
      code: 'INVITE005',
      serverMessage: '초대 링크 없음',
      message: '초대 링크 없음',
      cause: original,
    });
  });

  it('서버 message 가 없으면 serverMessage 는 비워두고 HTTP 상태 기반 메시지를 쓴다', () => {
    const result = toApiError(axiosErrorWithResponse(530, '<html>tunnel error</html>'));

    expect(result).toBeInstanceOf(ApiError);
    expect((result as ApiError).serverMessage).toBeUndefined();
    expect((result as ApiError).code).toBeUndefined();
    expect((result as ApiError).message).toContain('530');
  });

  it('응답을 받지 못한 axios 오류(타임아웃·연결 실패)는 NetworkError 가 된다', () => {
    const original = new AxiosError('Network Error');

    const result = toApiError(original);

    expect(result).toBeInstanceOf(NetworkError);
    expect((result as NetworkError).cause).toBe(original);
  });

  it('취소·일반 오류·이미 변환된 오류는 그대로 통과시킨다', () => {
    const canceled = new CanceledError();
    const plain = new Error('plain');
    const apiError = new ApiError({ status: 500 });

    expect(toApiError(canceled)).toBe(canceled);
    expect(toApiError(plain)).toBe(plain);
    expect(toApiError(apiError)).toBe(apiError);
  });
});

describe('assertEnvelopeSuccess', () => {
  const response = (data: unknown, status = 200) => ({ data, status }) as AxiosResponse;

  it('HTTP 2xx 이고 success: false 이면 ApiError 로 실패시킨다', () => {
    expect(() =>
      assertEnvelopeSuccess(response({ success: false, code: 'COMMON001', message: '서버 오류' })),
    ).toThrow(ApiError);

    try {
      assertEnvelopeSuccess(response({ success: false, code: 'COMMON001' }));
    } catch (error) {
      expect(error).toMatchObject({ status: 200, code: 'COMMON001' });
    }
  });

  it('success: true 이거나 success 필드가 없는 응답은 그대로 통과시킨다', () => {
    const ok = response({ success: true, data: {} });
    const noEnvelope = response({ accessToken: 'token' });
    const emptyBody = response('');

    expect(assertEnvelopeSuccess(ok)).toBe(ok);
    expect(assertEnvelopeSuccess(noEnvelope)).toBe(noEnvelope);
    expect(assertEnvelopeSuccess(emptyBody)).toBe(emptyBody);
  });
});
