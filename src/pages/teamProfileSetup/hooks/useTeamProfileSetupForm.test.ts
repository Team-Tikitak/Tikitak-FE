import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTeamProfileSetupForm } from './useTeamProfileSetupForm';

const makeFile = (name = 'avatar.png') => new File([new Blob(['x'])], name, { type: 'image/png' });

describe('useTeamProfileSetupForm', () => {
  let createSpy: ReturnType<typeof vi.spyOn>;
  let revokeSpy: ReturnType<typeof vi.spyOn>;
  let urlCounter = 0;

  beforeEach(() => {
    urlCounter = 0;
    createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      urlCounter += 1;
      return `blob:mock-${urlCounter}`;
    });
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });
  afterEach(() => {
    createSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('initial state', () => {
    const { result } = renderHook(() => useTeamProfileSetupForm());
    expect(result.current.nickname).toBe('');
    expect(result.current.avatarFile).toBeNull();
    expect(result.current.avatarPreviewUrl).toBeNull();
    expect(result.current.isDisabled).toBe(true);
  });

  it('isDisabled flips when nickname is non-empty', () => {
    const { result } = renderHook(() => useTeamProfileSetupForm());
    act(() => result.current.setNickname('탁'));
    expect(result.current.isDisabled).toBe(false);
    act(() => result.current.setNickname('   '));
    expect(result.current.isDisabled).toBe(true);
  });

  it('setAvatar creates a preview URL and stores file', () => {
    const { result } = renderHook(() => useTeamProfileSetupForm());
    const file = makeFile();
    act(() => result.current.setAvatar(file));
    expect(result.current.avatarFile).toBe(file);
    expect(result.current.avatarPreviewUrl).toBe('blob:mock-1');
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('replacing avatar revokes the previous URL', () => {
    const { result } = renderHook(() => useTeamProfileSetupForm());
    act(() => result.current.setAvatar(makeFile('a.png')));
    act(() => result.current.setAvatar(makeFile('b.png')));
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-1');
    expect(result.current.avatarPreviewUrl).toBe('blob:mock-2');
  });

  it('setAvatar(null) clears file and revokes URL', () => {
    const { result } = renderHook(() => useTeamProfileSetupForm());
    act(() => result.current.setAvatar(makeFile()));
    act(() => result.current.setAvatar(null));
    expect(result.current.avatarFile).toBeNull();
    expect(result.current.avatarPreviewUrl).toBeNull();
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-1');
  });

  it('unmount revokes the current preview URL', () => {
    const { result, unmount } = renderHook(() => useTeamProfileSetupForm());
    act(() => result.current.setAvatar(makeFile()));
    unmount();
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-1');
  });

  it('initialNickname 으로 닉네임이 채워지고 isDisabled 가 false 이다', () => {
    const { result } = renderHook(() => useTeamProfileSetupForm({ initialNickname: '기존이름' }));
    expect(result.current.nickname).toBe('기존이름');
    expect(result.current.isDisabled).toBe(false);
  });

  it('initialAvatarUrl 이 있으면 avatarPreviewUrl 로 노출된다', () => {
    const { result } = renderHook(() =>
      useTeamProfileSetupForm({ initialAvatarUrl: 'https://cdn/x.png' }),
    );
    expect(result.current.avatarPreviewUrl).toBe('https://cdn/x.png');
  });

  it('새 파일을 picking 하면 blob URL 이 initial 보다 우선한다', () => {
    const { result } = renderHook(() =>
      useTeamProfileSetupForm({ initialAvatarUrl: 'https://cdn/x.png' }),
    );
    act(() => result.current.setAvatar(makeFile()));
    expect(result.current.avatarPreviewUrl).toBe('blob:mock-1');
  });

  it('새 파일을 picking 했다가 제거하면 initialAvatarUrl 로 fallback 된다', () => {
    const { result } = renderHook(() =>
      useTeamProfileSetupForm({ initialAvatarUrl: 'https://cdn/x.png' }),
    );
    act(() => result.current.setAvatar(makeFile()));
    act(() => result.current.setAvatar(null));
    expect(result.current.avatarPreviewUrl).toBe('https://cdn/x.png');
  });
});
