export interface InvitationLinkResponse {
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

export type AcceptInvitationVariables = {
  token: string;
  body: AcceptInvitationRequest;
};
