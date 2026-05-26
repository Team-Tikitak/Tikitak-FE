export const DAILY_QUESTION_ENDPOINT = {
  TODAY: (teamId: number) => `/api/v1/teams/${teamId}/daily-questions/today`,
  ANSWER: (teamId: number, questionId: number) =>
    `/api/v1/teams/${teamId}/daily-questions/${questionId}/my-answer`,
} as const;
