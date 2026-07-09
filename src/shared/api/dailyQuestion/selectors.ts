import type { GetDailyQuestionResponse } from './types';

export const shouldShowDailyQuestion = (question: GetDailyQuestionResponse | undefined): boolean =>
  Boolean(question?.content);

// 답변을 이미 올렸으면 배너 자체는 유지하되 이동(화살표)만 막는다
export const isDailyQuestionAnswered = (question: GetDailyQuestionResponse | undefined): boolean =>
  question?.answerFeedId != null;
