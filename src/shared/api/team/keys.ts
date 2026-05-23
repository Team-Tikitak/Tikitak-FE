export const teamKeys = {
  all: ['team'] as const,
  detail: (teamId: number) => [...teamKeys.all, 'detail', teamId] as const,
  members: (teamId: number) => [...teamKeys.all, 'members', teamId] as const,
};
