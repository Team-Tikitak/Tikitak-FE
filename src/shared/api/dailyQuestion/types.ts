export type FeedType = 'GENERAL' | 'DAILY_QUESTION';

export interface Answer {
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetDailyQuestionResponse {
  questionId: number;
  content: string;
  date: string;
  answered: boolean;
  answerFeedId: number | null;
  answer: Answer | null;
}

export interface PostDailyQuestionRequest {
  content: string;
  mediaPublicId: string;
}

export interface Question {
  questionId: number;
  content: string;
  answerDate: string;
}
export interface DailyQuestionResponse {
  feedId: number;
  type: FeedType;
  question: Question;
  answer: Answer;
  createdAt: string;
  updatedAt: string;
}

export interface PatchDailyQuestionRequest {
  content?: {
    defined: boolean;
    value: string;
  };
  mediaPublicId?: {
    defined: boolean;
    value: string;
  };
}
