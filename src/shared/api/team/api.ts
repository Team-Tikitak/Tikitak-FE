import { instance } from '../instance';
import { TEAM_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type { TeamMembersResponse } from './types';

export const getTeamMembers = (teamId: number) =>
  instance.get<ApiResponse<TeamMembersResponse>>(TEAM_ENDPOINTS.MEMBERS(teamId));
