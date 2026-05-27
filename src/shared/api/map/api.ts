import { instance } from '../instance';
import { type ApiResponse } from '../type';
import { MAP_ENDPOINT } from './endpoints';
import { type getPinsResponse } from './types';

export const getPins = (teamId: number) =>
  instance.get<ApiResponse<getPinsResponse>>(MAP_ENDPOINT.PINS(teamId));
