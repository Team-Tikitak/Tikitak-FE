import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CapturedPhoto } from '@/pages/camera/hooks/useCamera';
import { useFeedCreateForm } from './useFeedCreateForm';

const makePhoto = (id: string): CapturedPhoto => ({
  id,
  url: `blob:${id}`,
  blob: new Blob(),
});

describe('useFeedCreateForm', () => {
  let revokeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });
  afterEach(() => {
    revokeSpy.mockRestore();
  });

  it('initial state', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    expect(result.current.content).toBe('');
    expect(result.current.photos).toEqual([]);
    expect(result.current.isShareDisabled).toBe(true);
    expect(result.current.canAddMorePhotos).toBe(true);
    expect(result.current.selectedLocationTitle).toBeUndefined();
    expect(result.current.selectedMembers).toEqual([]);
  });

  it('setContent enforces max length', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    const longText = 'x'.repeat(2000);
    act(() => result.current.setContent(longText));
    expect(result.current.content).toHaveLength(result.current.maxContentLength);
  });

  it('addPhoto appends up to maxPhotoCount', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    act(() => {
      for (let i = 0; i < result.current.maxPhotoCount + 3; i += 1) {
        result.current.addPhoto(makePhoto(`p-${i}`));
      }
    });
    expect(result.current.photos).toHaveLength(result.current.maxPhotoCount);
    expect(result.current.canAddMorePhotos).toBe(false);
  });

  it('removePhoto revokes the object URL', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    const photo = makePhoto('p-1');
    act(() => result.current.addPhoto(photo));
    act(() => result.current.removePhoto('p-1'));
    expect(result.current.photos).toEqual([]);
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-1');
  });

  it('unmount revokes remaining photos', () => {
    const { result, unmount } = renderHook(() => useFeedCreateForm());
    act(() => {
      result.current.addPhoto(makePhoto('p-1'));
      result.current.addPhoto(makePhoto('p-2'));
    });
    unmount();
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-1');
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-2');
  });

  it('isShareDisabled flips when a photo is added', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    expect(result.current.isShareDisabled).toBe(true);
    act(() => result.current.addPhoto(makePhoto('p-1')));
    expect(result.current.isShareDisabled).toBe(false);
  });

  it('selectLocation reflects via selectedLocationTitle', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    act(() => result.current.selectLocation('loc-1'));
    expect(result.current.selectedLocationTitle).toBe('망원동 센토브');
  });

  it('commitMembers and removeMember', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    act(() => result.current.commitMembers(['m-1', 'm-2']));
    expect(result.current.selectedMembers.map((member) => member.id)).toEqual(['m-1', 'm-2']);
    act(() => result.current.removeMember('m-1'));
    expect(result.current.selectedMembers.map((member) => member.id)).toEqual(['m-2']);
  });
});
