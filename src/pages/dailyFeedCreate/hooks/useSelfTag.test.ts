import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamMember } from '@/shared/api/team/types';
import { useSelfTag } from './useSelfTag';

const teamDetailMock = vi.fn();
const teamMembersMock = vi.fn();

vi.mock('@/shared/api/team/queries', () => ({
  useGetTeamDetail: () => teamDetailMock(),
  useTeamMembers: () => teamMembersMock(),
}));

const makeMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  teamMemberId: 1,
  nickname: '테스트',
  role: 'OWNER',
  profileImgUrl: '',
  ...overrides,
});

describe('useSelfTag', () => {
  beforeEach(() => {
    teamDetailMock.mockReset();
    teamMembersMock.mockReset();
  });

  it('myTeamMember 가 매칭되면 isSelfTagged=true 로 자동 태그한다', () => {
    teamDetailMock.mockReturnValue({ data: { myProfile: { nickname: '테스트' } } });
    teamMembersMock.mockReturnValue({ data: { members: [makeMember()] } });

    const { result } = renderHook(() => useSelfTag({ teamId: 1 }));

    expect(result.current.isSelfTagged).toBe(true);
    expect(result.current.myTeamMember).toEqual(makeMember());
  });

  it('setIsSelfTagged(false) 호출 시 상태가 false 로 전환된다', () => {
    teamDetailMock.mockReturnValue({ data: { myProfile: { nickname: '테스트' } } });
    teamMembersMock.mockReturnValue({ data: { members: [makeMember()] } });

    const { result } = renderHook(() => useSelfTag({ teamId: 1 }));

    act(() => result.current.setIsSelfTagged(false));

    expect(result.current.isSelfTagged).toBe(false);
  });

  it('nickname 매칭 안 되면 myTeamMember 가 undefined', () => {
    teamDetailMock.mockReturnValue({ data: { myProfile: { nickname: '없는이름' } } });
    teamMembersMock.mockReturnValue({ data: { members: [makeMember()] } });

    const { result } = renderHook(() => useSelfTag({ teamId: 1 }));

    expect(result.current.myTeamMember).toBeUndefined();
  });

  it('teamDetail / teamMembers 데이터 없으면 myProfile 도 undefined', () => {
    teamDetailMock.mockReturnValue({ data: undefined });
    teamMembersMock.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useSelfTag({ teamId: null }));

    expect(result.current.myProfile).toBeUndefined();
    expect(result.current.myTeamMember).toBeUndefined();
  });
});
