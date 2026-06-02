import { instance } from '../instance';
import { type ApiResponse } from '../type';
import { DAILY_QUESTION_ENDPOINT } from './endpoints';
import {
  type DailyQuestionResponse,
  type GetDailyQuestionResponse,
  type PatchDailyQuestionRequest,
  type PostDailyQuestionRequest,
} from './types';

export const getDailyQuestion = (teamId: number) =>
  instance.get<ApiResponse<GetDailyQuestionResponse>>(DAILY_QUESTION_ENDPOINT.TODAY(teamId));

export const postDailyQuestion = (
  teamId: number,
  questionId: number,
  body: PostDailyQuestionRequest,
) =>
  instance.post<ApiResponse<DailyQuestionResponse>>(
    DAILY_QUESTION_ENDPOINT.ANSWER(teamId, questionId),
    body,
  );

export const patchDailyQuestion = (
  teamId: number,
  questionId: number,
  body: PatchDailyQuestionRequest,
) =>
  instance.patch<ApiResponse<DailyQuestionResponse>>(
    DAILY_QUESTION_ENDPOINT.ANSWER(teamId, questionId),
    body,
  );
