import type { TeamRole } from '@/shared/types';

export type DeleteTeamMemberVariables = {
  teamId: number;
  targetTeamMemberId: number;
};

export type MyProfile = {
  nickname: string;
  teamMemberRole: TeamRole;
  profileImgUrl: string;
};

export type TeamMemberItem = {
  nickname: string;
  teamMemberRole: TeamRole;
  email: string;
  profileImgUrl: string;
  teamMemberId: number;
};

export interface TeamDetailResponse {
  teamName: string;
  myProfile: MyProfile;
  teamMembers: TeamMemberItem[];
}

export interface PatchTeamProfileRequest {
  nickname: string;
  profileImgUrl: string;
}

export type PatchTeamProfileVariables = {
  teamId: number;
  body: PatchTeamProfileRequest;
};

export type TeamMember = {
  teamMemberId: number;
  nickname: string;
  role: TeamRole;
  profileImgUrl: string;
};

export interface TeamMembersResponse {
  members: TeamMember[];
}

export interface CreateTeamRequest {
  teamName: string;
  introduction: string;
  profileImageUrl: string;
  nickName: string;
}

export interface CreateTeamResponse {
  teamName: string;
}
