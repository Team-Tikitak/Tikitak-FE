export const TEAM_ENDPOINTS = {
  TEAM: (teamId: number) => `/api/v1/teams/${teamId}`,
  MEMBER: (teamId: number) => `/api/v1/teams/${teamId}/members`,
  MEMBER_ME: (teamId: number) => `/api/v1/teams/${teamId}/members/me`,
  MEMBER_DELETE: (teamId: number, targetTeamMemberId: number) =>
    `/api/v1/teams/${teamId}/members/${targetTeamMemberId}`,
  DELETE_REQUEST: (teamId: number) => `/api/v1/teams/${teamId}/deletion-requests`,
} as const;
