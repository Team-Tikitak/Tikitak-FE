import { instance } from '../instance';
import { USER_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type { MeResponse } from './types';

export const getMe = () => instance.get<ApiResponse<MeResponse>>(USER_ENDPOINTS.ME);
