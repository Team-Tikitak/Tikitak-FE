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
    const commitMembers = vi.fn();

    const { result } = renderHook(() => useSelfTag({ teamId: 1, commitMembers }));

    expect(result.current.isSelfTagged).toBe(true);
    expect(result.current.myTeamMember).toEqual(makeMember());
    expect(commitMembers).toHaveBeenCalledWith([makeMember()]);
  });

  it('setIsSelfTagged(false) 호출 시 commitMembers 가 빈 배열로 갱신된다', () => {
    teamDetailMock.mockReturnValue({ data: { myProfile: { nickname: '테스트' } } });
    teamMembersMock.mockReturnValue({ data: { members: [makeMember()] } });
    const commitMembers = vi.fn();

    const { result } = renderHook(() => useSelfTag({ teamId: 1, commitMembers }));
    commitMembers.mockClear();

    act(() => result.current.setIsSelfTagged(false));

    expect(result.current.isSelfTagged).toBe(false);
    expect(commitMembers).toHaveBeenLastCalledWith([]);
  });

  it('다시 태그하면 myTeamMember 가 재커밋된다', () => {
    teamDetailMock.mockReturnValue({ data: { myProfile: { nickname: '테스트' } } });
    teamMembersMock.mockReturnValue({ data: { members: [makeMember()] } });
    const commitMembers = vi.fn();

    const { result } = renderHook(() => useSelfTag({ teamId: 1, commitMembers }));
    act(() => result.current.setIsSelfTagged(false));
    commitMembers.mockClear();

    act(() => result.current.setIsSelfTagged(true));

    expect(commitMembers).toHaveBeenLastCalledWith([makeMember()]);
  });

  it('nickname 매칭 안 되면 myTeamMember 가 undefined 이고 commit 은 빈 배열', () => {
    teamDetailMock.mockReturnValue({ data: { myProfile: { nickname: '없는이름' } } });
    teamMembersMock.mockReturnValue({ data: { members: [makeMember()] } });
    const commitMembers = vi.fn();

    const { result } = renderHook(() => useSelfTag({ teamId: 1, commitMembers }));

    expect(result.current.myTeamMember).toBeUndefined();
    expect(commitMembers).toHaveBeenLastCalledWith([]);
  });

  it('teamDetail / teamMembers 데이터 없으면 myProfile 도 undefined', () => {
    teamDetailMock.mockReturnValue({ data: undefined });
    teamMembersMock.mockReturnValue({ data: undefined });
    const commitMembers = vi.fn();

    const { result } = renderHook(() => useSelfTag({ teamId: null, commitMembers }));

    expect(result.current.myProfile).toBeUndefined();
    expect(result.current.myTeamMember).toBeUndefined();
    expect(commitMembers).toHaveBeenLastCalledWith([]);
  });
});
