import type { TeamDetail, TeamMember } from './types';

export const MOCK_TEAM_DETAIL: TeamDetail = {
  teamId: 10,
  name: '티키탁',
  description: '우리 팀 공간',
  teamImageUrl: 'https://picsum.photos/seed/team1/100',
  status: 'ACTIVE',
  memberCount: 3,
  myTeamMemberId: 100,
  myRole: 'OWNER',
  myNickname: '지니지니',
  myProfileImageUrl: 'https://picsum.photos/seed/user1/100',
  createdAt: '2026-03-04T20:30:00Z',
};

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    teamMemberId: 100,
    memberId: 1,
    nickname: '김민경',
    profileImageUrl: 'https://picsum.photos/seed/user1/100',
    email: 'js211130@naver.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: '2026-03-04T20:30:00Z',
  },
  {
    teamMemberId: 101,
    memberId: 2,
    nickname: '성정수',
    profileImageUrl: 'https://picsum.photos/seed/user2/101',
    email: 'js211130@naver.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: '2026-03-04T20:30:00Z',
  },
  {
    teamMemberId: 102,
    memberId: 3,
    nickname: '이시언',
    profileImageUrl: 'https://picsum.photos/seed/user3/102',
    email: 'js211130@naver.com',
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: '2026-03-04T20:30:00Z',
  },
];
