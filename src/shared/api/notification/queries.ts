import { useMutation } from '@tanstack/react-query';
import { deleteDeviceToken, postDeviceToken } from './api';
import type { DeleteDeviceTokenRequest, RegisterDeviceTokenRequest } from './types';

export const useRegisterDeviceToken = () =>
  useMutation({
    meta: { errorMessage: '알림 토큰 등록에 실패했어요' },
    mutationFn: (body: RegisterDeviceTokenRequest) => postDeviceToken(body),
  });

export const useDeleteDeviceToken = () =>
  useMutation({
    meta: { errorMessage: '알림 토큰 해제에 실패했어요' },
    mutationFn: (body: DeleteDeviceTokenRequest) => deleteDeviceToken(body),
  });
