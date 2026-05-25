import { instance } from '../instance';
import { TEAM_ENDPOINTS } from './endpoints';
import type {
  CreateTeamRequest,
  CreateTeamResponse,
  DeleteTeamMemberVariables,
  PatchTeamProfileRequest,
  PatchTeamProfileVariables,
  TeamDetailResponse,
  TeamMembersResponse,
} from './types';
import type { ApiResponse } from '../type';

export const postTeam = (body: CreateTeamRequest) =>
  instance.post<ApiResponse<CreateTeamResponse>>(TEAM_ENDPOINTS.TEAMS, body);

export const postTeamDeleteRequest = (teamId: number) =>
  instance.post<ApiResponse<string>>(TEAM_ENDPOINTS.DELETE_REQUEST(teamId));

export const getTeamDetail = (teamId: number) =>
  instance.get<ApiResponse<TeamDetailResponse>>(TEAM_ENDPOINTS.TEAM(teamId));

export const getTeamMembers = (teamId: number) =>
  instance.get<ApiResponse<TeamMembersResponse>>(TEAM_ENDPOINTS.MEMBER(teamId));

export const deleteTeamMemberMe = (teamId: number) =>
  instance.delete<ApiResponse<string>>(TEAM_ENDPOINTS.MEMBER_ME(teamId));

export const patchTeamProfile = ({ teamId, body }: PatchTeamProfileVariables) =>
  instance.patch<ApiResponse<PatchTeamProfileRequest>>(TEAM_ENDPOINTS.MEMBER_ME(teamId), body);

export const deleteTeamMember = ({ teamId, targetTeamMemberId }: DeleteTeamMemberVariables) =>
  instance.delete<ApiResponse<string>>(TEAM_ENDPOINTS.MEMBER_DELETE(teamId, targetTeamMemberId));
