export const mapKeys = {
  all: ['map'] as const,
  pins: (teamId: number) => [...mapKeys.all, 'pins', teamId] as const,
};
