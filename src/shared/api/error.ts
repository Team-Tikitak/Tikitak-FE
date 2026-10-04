import axios, { isAxiosError, type AxiosResponse } from 'axios';

interface ErrorBody {
  serverMessage?: string;
  code?: string;
}

// 백엔드가 내려준 message/code만 신뢰한다. 없으면 undefined로 두어 FE 하드코딩 문구 정책을 유지한다.
const readErrorBody = (data: unknown): ErrorBody => {
  if (typeof data !== 'object' || data === null) return {};
  const { message, code } = data as { message?: unknown; code?: unknown };
  return {
    serverMessage: typeof message === 'string' ? message : undefined,
    code: typeof code === 'string' ? code : undefined,
  };
};

interface ApiErrorInit extends ErrorBody {
  status: number;
}

// 서버가 응답한 실패: HTTP 4xx/5xx와 HTTP 2xx인데 envelope가 success: false인 경우
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly serverMessage?: string;

  constructor({ status, code, serverMessage }: ApiErrorInit, options?: ErrorOptions) {
    super(serverMessage ?? `API request failed with status ${status}`, options);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.serverMessage = serverMessage;
  }
}

// 응답을 받지 못한 실패: 타임아웃, 연결 실패, CORS 헤더 없는 게이트웨이 오류(Cloudflare 터널 등)
export class NetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super('Network request failed', options);
    this.name = 'NetworkError';
  }
}

// axios 오류만 변환하고, 취소나 그 밖의 오류는 그대로 둔다. 이미 변환된 오류도 그대로 통과한다.
export const toApiError = (error: unknown): unknown => {
  if (!isAxiosError(error) || axios.isCancel(error)) return error;
  if (!error.response) return new NetworkError({ cause: error });

  return new ApiError(
    { status: error.response.status, ...readErrorBody(error.response.data) },
    { cause: error },
  );
};

// HTTP 2xx여도 envelope가 success: false면 성공으로 취급하지 않는다. success 필드가 없는 응답은 건드리지 않는다.
export const assertEnvelopeSuccess = <T extends AxiosResponse>(response: T): T => {
  const body: unknown = response.data;
  if (
    typeof body === 'object' &&
    body !== null &&
    (body as { success?: unknown }).success === false
  ) {
    throw new ApiError({ status: response.status, ...readErrorBody(body) });
  }

  return response;
};
