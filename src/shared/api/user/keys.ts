export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  agreements: () => [...userKeys.all, 'agreements'] as const,
  teams: () => [...userKeys.all, 'teams'] as const,
};
