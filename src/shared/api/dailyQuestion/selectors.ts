import type { getDailyQuestionResponse } from './types';

export const shouldShowDailyQuestion = (question: getDailyQuestionResponse | undefined): boolean =>
  Boolean(question?.content) && question?.answerFeedId == null;
