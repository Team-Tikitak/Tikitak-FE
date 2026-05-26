export const dailyQuestionKeys = {
  all: ['dailyQuestion'] as const,
  today: (teamId: number) => [...dailyQuestionKeys.all, 'today', teamId] as const,
};
