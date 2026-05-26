export const MAP_ENDPOINT = {
  PINS: (teamId: number) => `/api/v1/teams/${teamId}/map/pins`,
} as const;
