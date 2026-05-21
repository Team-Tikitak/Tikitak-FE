export const INVITATION_ENDPOINTS = {
  INVITE_LINK: (teamId: number) => `/api/v1/teams/${teamId}/invitation-link`,
  PREVIEW: (token: string) => `/api/v1/invitation-links/${token}`,
  ACCEPT: (token: string) => `/api/v1/invitation-links/${token}/accept`,
} as const;
