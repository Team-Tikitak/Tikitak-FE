export type FeedType = 'GENERAL' | 'DAILY_QUESTION';

export interface Answer {
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface getDailyQuestionResponse {
  questionId: number;
  content: string;
  date: string;
  answered: boolean;
  answerFeedId: number | null;
  answer: Answer | null;
}

export interface postDailyQuestionRequest {
  content: string;
  mediaPublicId: string;
}

export interface Question {
  questionId: number;
  content: string;
  answerDate: string;
}
export interface dailyQuestionResponse {
  feedId: number;
  type: FeedType;
  question: Question;
  answer: Answer;
  createdAt: string;
  updatedAt: string;
}

export interface patchDailyQuestionRequest {
  content: {
    defined: boolean;
    value: string;
  };
  mediaPublicId: {
    defined: boolean;
    value: string;
  };
}
