import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedDetailResponse } from '@/shared/api/feed/types';
import type { CapturedPhoto } from '@/shared/types/photo';
import { useDailyFeedEditForm } from './useDailyFeedEditForm';

const { navigateMock, confirmDiscardChangesMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  confirmDiscardChangesMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('@/shared/ui/ConfirmDialog', () => ({
  confirmDiscardChanges: confirmDiscardChangesMock,
}));

const makeFeedDetail = (): FeedDetailResponse =>
  ({
    feedId: 1,
    content: '원본 내용',
    images: [{ feedImageId: 10, imageUrl: 'https://img/origin.jpg', mediaPublicId: 'origin-id' }],
  }) as unknown as FeedDetailResponse;

const makePhoto = (id: string): CapturedPhoto => ({ id, url: `blob:${id}`, blob: new Blob() });

describe('useDailyFeedEditForm', () => {
  let revokeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });
  afterEach(() => {
    revokeSpy.mockRestore();
    vi.useRealTimers();
  });

  it('변경이 없으면 handleBack이 즉시 navigate(-1) 한다', () => {
    const { result } = renderHook(() => useDailyFeedEditForm(makeFeedDetail()));
    act(() => result.current.handleBack());
    expect(navigateMock).toHaveBeenCalledWith(-1);
    expect(confirmDiscardChangesMock).not.toHaveBeenCalled();
  });

  it('content 변경 후 handleBack은 확인 다이얼로그를 띄운다', () => {
    const { result } = renderHook(() => useDailyFeedEditForm(makeFeedDetail()));
    act(() => result.current.setContent('수정된 내용'));
    act(() => result.current.handleBack());
    expect(confirmDiscardChangesMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('새 사진 추가 후 handleBack은 확인 다이얼로그를 띄운다', () => {
    const { result } = renderHook(() => useDailyFeedEditForm(makeFeedDetail()));
    act(() => result.current.addPhoto(makePhoto('p-1')));
    act(() => result.current.handleBack());
    expect(confirmDiscardChangesMock).toHaveBeenCalledTimes(1);
  });

  it('addPhoto는 기존 새 사진을 revoke하고 교체한다', () => {
    const { result } = renderHook(() => useDailyFeedEditForm(makeFeedDetail()));
    act(() => result.current.addPhoto(makePhoto('p-1')));
    act(() => result.current.addPhoto(makePhoto('p-2')));
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-1');
    expect(result.current.newPhoto?.id).toBe('p-2');
  });

  it('removePhoto는 새 사진과 기존 이미지를 모두 비운다', () => {
    const { result } = renderHook(() => useDailyFeedEditForm(makeFeedDetail()));
    act(() => result.current.addPhoto(makePhoto('p-1')));
    act(() => result.current.removePhoto());
    expect(revokeSpy).toHaveBeenCalledWith('blob:p-1');
    expect(result.current.newPhoto).toBeNull();
    expect(result.current.currentPhotoUrl).toBeNull();
    expect(result.current.existingMediaPublicId).toBeNull();
  });

  it('기존 이미지가 남아있으면 existingMediaPublicId를 노출한다', () => {
    const { result } = renderHook(() => useDailyFeedEditForm(makeFeedDetail()));
    expect(result.current.existingMediaPublicId).toBe('origin-id');
  });
});
