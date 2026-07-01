import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTeamCreateForm } from './useTeamCreateForm';

describe('useTeamCreateForm', () => {
  it('초기 팀 생성 draft를 폼 값으로 사용한다', () => {
    const { result } = renderHook(() =>
      useTeamCreateForm({ name: '티키팀', description: '함께 기록하는 팀' }),
    );

    expect(result.current.name).toBe('티키팀');
    expect(result.current.description).toBe('함께 기록하는 팀');
    expect(result.current.draft).toEqual({
      name: '티키팀',
      description: '함께 기록하는 팀',
    });
    expect(result.current.isDisabled).toBe(false);
  });

  it('초기 draft가 없으면 빈 값으로 시작하고 입력 값을 draft에 반영한다', () => {
    const { result } = renderHook(() => useTeamCreateForm());

    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.isDisabled).toBe(true);

    act(() => {
      result.current.setName('새 팀');
      result.current.setDescription('새 팀 소개');
    });

    expect(result.current.draft).toEqual({
      name: '새 팀',
      description: '새 팀 소개',
    });
    expect(result.current.isDisabled).toBe(false);
  });
});
