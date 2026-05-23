import { instance } from '../instance';
import { USER_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  AgreementsRequest,
  AgreementsResponse,
  MeResponse,
  OnboardingPatchRequest,
  OnboardingPatchResponse,
  TeamListResponse,
} from './types';

export const getMe = () => instance.get<ApiResponse<MeResponse>>(USER_ENDPOINTS.ME);

export const getAgreements = () =>
  instance.get<ApiResponse<AgreementsResponse>>(USER_ENDPOINTS.AGREEMENTS);

export const putAgreements = (body: AgreementsRequest) =>
  instance.put<ApiResponse<AgreementsResponse>>(USER_ENDPOINTS.AGREEMENTS, body);

export const getTeams = () => instance.get<ApiResponse<TeamListResponse>>(USER_ENDPOINTS.TEAMS);

export const patchOnboarding = (body: OnboardingPatchRequest) =>
  instance.patch<ApiResponse<OnboardingPatchResponse>>(USER_ENDPOINTS.ONBOARDING, body);

export const deleteMe = () => instance.delete<ApiResponse<string>>(USER_ENDPOINTS.ME);
