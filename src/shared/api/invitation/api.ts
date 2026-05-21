import { instance, pulbicInstance } from '../instance';
import { INVITATION_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  AcceptInvitationVariables,
  InvitationPreviewResponse,
  InvitationLinkResponse,
} from './types';

export const getInvitationLink = (teamId: number) =>
  instance.get<ApiResponse<InvitationLinkResponse>>(INVITATION_ENDPOINTS.INVITE_LINK(teamId));

export const putInvitationLink = (teamId: number) =>
  instance.put<ApiResponse<InvitationLinkResponse>>(INVITATION_ENDPOINTS.INVITE_LINK(teamId));

export const postAcceptInvitation = ({ token, body }: AcceptInvitationVariables) =>
  instance.post<ApiResponse<void>>(INVITATION_ENDPOINTS.ACCEPT(token), body);

export const getInvitationPreview = (token: string) =>
  pulbicInstance.get<ApiResponse<InvitationPreviewResponse>>(INVITATION_ENDPOINTS.PREVIEW(token));
