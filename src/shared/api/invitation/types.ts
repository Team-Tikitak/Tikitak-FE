export interface InvitationLinkResponse {
  teamName: string;
  expiresAt: string;
  inviteToken: string;
}

export interface InvitationPreviewResponse {
  teamId: number;
  teamName: string;
  teamDescription: string;
  teamImgUrl: string;
  memberCount: number;
}

export interface AcceptInvitationRequest {
  nickname: string;
  profileImgUrl: string;
}

export interface AcceptInvitationResponse {
  teamId: number;
  teamName: string;
}

export type AcceptInvitationVariables = {
  token: string;
  body: AcceptInvitationRequest;
};
