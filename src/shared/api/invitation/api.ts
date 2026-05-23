import { instance, publicInstance } from '../instance';
import { INVITATION_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  AcceptInvitationVariables,
  InvitationPreviewResponse,
  InvitationLinkResponse,
  AcceptInvitationResponse,
} from './types';

export const getInvitationLink = (teamId: number) =>
  instance.get<ApiResponse<InvitationLinkResponse>>(INVITATION_ENDPOINTS.INVITE_LINK(teamId));

export const putInvitationLink = (teamId: number) =>
  instance.put<ApiResponse<InvitationLinkResponse>>(INVITATION_ENDPOINTS.INVITE_LINK(teamId));

export const postAcceptInvitation = ({ token, body }: AcceptInvitationVariables) =>
  instance.post<ApiResponse<AcceptInvitationResponse>>(INVITATION_ENDPOINTS.ACCEPT(token), body);

export const getInvitationPreview = (token: string) =>
  publicInstance.get<ApiResponse<InvitationPreviewResponse>>(INVITATION_ENDPOINTS.PREVIEW(token));
