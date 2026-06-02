import { instance } from '../instance';
import { type ApiResponse } from '../type';
import { MAP_ENDPOINT } from './endpoints';
import { type GetPinsResponse } from './types';

export const getPins = (teamId: number) =>
  instance.get<ApiResponse<GetPinsResponse>>(MAP_ENDPOINT.PINS(teamId));
