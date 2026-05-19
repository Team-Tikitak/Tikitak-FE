import { instance } from '../instance';
import { USER_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type { AgreementsRequest, AgreementsResponse, MeResponse } from './types';

export const getMe = () => instance.get<ApiResponse<MeResponse>>(USER_ENDPOINTS.ME);

export const getAgreements = () =>
  instance.get<ApiResponse<AgreementsResponse>>(USER_ENDPOINTS.AGREEMENTS);

export const putAgreements = (body: AgreementsRequest) =>
  instance.put<ApiResponse<AgreementsResponse>>(USER_ENDPOINTS.AGREEMENTS, body);
