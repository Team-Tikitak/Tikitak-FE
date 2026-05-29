export const HOME_ENDPOINTS = {
  REGIONS: (teamId: number) => `/api/v1/teams/${teamId}/home/regions`,
  RECOMMENDED_PLACE: (teamId: number) => `/api/v1/teams/${teamId}/home/recommended-places`,
  EVERYONE_PICK: (teamId: number) => `/api/v1/teams/${teamId}/home/everyone-pick`,
  COMBINATIONS: (teamId: number) => `/api/v1/teams/${teamId}/home/combinations`,
  BEST_ATTENDANCE: (teamId: number) => `/api/v1/teams/${teamId}/home/best-attendance`,
  ALL_TAGGED: (teamId: number) => `/api/v1/teams/${teamId}/home/all-tagged`,
} as const;
