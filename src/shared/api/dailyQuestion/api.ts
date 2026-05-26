import { instance } from '../instance';
import { type ApiResponse } from '../type';
import { DAILY_QUESTION_ENDPOINT } from './endpoints';
import {
  type dailyQuestionResponse,
  type getDailyQuestionResponse,
  type patchDailyQuestionRequest,
  type postDailyQuestionRequest,
} from './types';

export const getDailyQuestion = (teamId: number) =>
  instance.get<ApiResponse<getDailyQuestionResponse>>(DAILY_QUESTION_ENDPOINT.TODAY(teamId));

export const postDailyQuestion = (
  teamId: number,
  questionId: number,
  body: postDailyQuestionRequest,
) =>
  instance.post<ApiResponse<dailyQuestionResponse>>(
    DAILY_QUESTION_ENDPOINT.ANSWER(teamId, questionId),
    body,
  );

export const patchDailyQuestion = (
  teamId: number,
  questionId: number,
  body: patchDailyQuestionRequest,
) =>
  instance.patch<ApiResponse<dailyQuestionResponse>>(
    DAILY_QUESTION_ENDPOINT.ANSWER(teamId, questionId),
    body,
  );
