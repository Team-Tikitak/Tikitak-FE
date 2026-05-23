import type { ApiResponse } from './type';
import type { AxiosResponse } from 'axios';

export const unwrap = async <T>(fn: () => Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> => {
  const res = await fn();
  return res.data.data;
};
