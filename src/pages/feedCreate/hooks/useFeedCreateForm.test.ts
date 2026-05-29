import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedPlace } from '@/shared/api/feed/types';
import type { TeamMember } from '@/shared/api/team/types';
import { useFeedForm as useFeedCreateForm } from '@/shared/hooks/useFeedForm';
import type { CapturedPhoto } from '@/shared/types/photo';

const makePhoto = (id: string): CapturedPhoto => ({
  id,
  url: `blob:${id}`,
  blob: new Blob(),
});

const makePlace = (placeId: string, name: string): FeedPlace => ({
  placeId,
  name,
  latitude: 37.5,
  longitude: 127.0,
  address: '서울 어딘가',
});

const makeMember = (teamMemberId: number, nickname: string): TeamMember => ({
  teamMemberId,
  nickname,
  role: 'MEMBER',
  profileImgUrl: '',
});

describe('useFeedCreateForm', () => {
  let revokeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });
  afterEach(() => {
    revokeSpy.mockRestore();
    vi.useRealTimers();
  });

  it('initial state', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    expect(result.current.content).toBe('');
    expect(result.current.photos).toEqual([]);
    expect(result.current.isShareDisabled).toBe(true);
    expect(result.current.canAddMorePhotos).toBe(true);
    expect(result.current.selectedPlace).toBeNull();
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
    expect(revokeSpy).not.toHaveBeenCalledWith('blob:p-1');
    act(() => vi.advanceTimersByTime(1000));
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-1');
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-2');
  });

  it('isShareDisabled flips when a photo is added', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    expect(result.current.isShareDisabled).toBe(true);
    act(() => result.current.addPhoto(makePhoto('p-1')));
    expect(result.current.isShareDisabled).toBe(false);
  });

  it('selectPlace stores the place object', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    const place = makePlace('kakao-1', '망원동 센토브');
    act(() => result.current.selectPlace(place));
    expect(result.current.selectedPlace).toEqual(place);
  });

  it('commitMembers caps at 11 and removeMember filters', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    const members = Array.from({ length: 15 }, (_, i) => makeMember(i + 1, `m${i + 1}`));
    act(() => result.current.commitMembers(members));
    expect(result.current.selectedMembers).toHaveLength(11);
    act(() => result.current.removeMember(1));
    expect(result.current.selectedMembers.find((m) => m.teamMemberId === 1)).toBeUndefined();
  });

  it('maxPhotoCount 옵션 없으면 기본 10 이다', () => {
    const { result } = renderHook(() => useFeedCreateForm());
    expect(result.current.maxPhotoCount).toBe(10);
  });

  it('maxPhotoCount=1 이면 한 장만 허용한다', () => {
    const { result } = renderHook(() => useFeedCreateForm({ maxPhotoCount: 1 }));
    expect(result.current.maxPhotoCount).toBe(1);

    act(() => {
      result.current.addPhoto(makePhoto('p-1'));
      result.current.addPhoto(makePhoto('p-2'));
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].id).toBe('p-1');
    expect(result.current.canAddMorePhotos).toBe(false);
  });
});
