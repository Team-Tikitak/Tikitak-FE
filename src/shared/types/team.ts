export const TEAM_ROLES = ['OWNER', 'MEMBER'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];
