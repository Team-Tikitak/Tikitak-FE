import type { TeamItem } from './types';

export const MOCK_MY_TEAMS: TeamItem[] = [
  {
    teamId: 10,
    teamMemberId: 100,
    name: '티키탁',
    description: '우리 팀 공간',
    teamImageUrl: 'https://picsum.photos/seed/team1/100',
    role: 'OWNER',
    memberStatus: 'ACTIVE',
    teamStatus: 'ACTIVE',
    nickname: '민경',
    profileImageUrl: 'https://picsum.photos/seed/user1/100',
    memberCount: 5,
    isActive: true,
    joinedAt: '2026-03-04T20:30:00Z',
  },
  {
    teamId: 11,
    teamMemberId: 101,
    name: '사이드프로젝트팀',
    description: '사이드 프로젝트',
    teamImageUrl: 'https://picsum.photos/seed/team2/100',
    role: 'MEMBER',
    memberStatus: 'ACTIVE',
    teamStatus: 'ACTIVE',
    nickname: '민경',
    profileImageUrl: 'https://picsum.photos/seed/user1/100',
    memberCount: 3,
    isActive: true,
    joinedAt: '2026-04-01T10:00:00Z',
  },
];
