export const TEAM_ENDPOINTS = {
  TEAM: (teamId: number) => `/api/v1/teams/${teamId}`,
  MEMBERS: (teamId: number) => `/api/v1/teams/${teamId}/members`,
} as const;
