import type { GetDailyQuestionResponse } from './types';

export const shouldShowDailyQuestion = (question: GetDailyQuestionResponse | undefined): boolean =>
  Boolean(question?.content) && question?.answerFeedId == null;
