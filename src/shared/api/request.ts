import type { ApiResponse } from './type';
import type { AxiosResponse } from 'axios';

// 데이터가 필요한 요청: envelope를 벗겨 T를 돌려준다. 실패 검증은 instance 인터셉터가 맡는다.
export const requestResult = async <T>(
  fn: () => Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> => {
  const res = await fn();
  return res.data.data;
};

// 본문이 의미 없는 성공 응답(삭제·갱신 등): 성공하면 아무것도 돌려주지 않는다.
export const requestVoid = async (fn: () => Promise<AxiosResponse<unknown>>): Promise<void> => {
  await fn();
};
