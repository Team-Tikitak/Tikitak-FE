import { instance } from '../instance';
import { NOTIFICATION_ENDPOINTS } from './endpoints';
import type { DeleteDeviceTokenRequest, RegisterDeviceTokenRequest } from './types';
import type { ApiResponse } from '../type';

export const postDeviceToken = (body: RegisterDeviceTokenRequest) =>
  instance.post<ApiResponse<string>>(NOTIFICATION_ENDPOINTS.DEVICE_TOKENS, body);

export const deleteDeviceToken = (body: DeleteDeviceTokenRequest) =>
  instance.delete<ApiResponse<string>>(NOTIFICATION_ENDPOINTS.DEVICE_TOKENS, { data: body });
