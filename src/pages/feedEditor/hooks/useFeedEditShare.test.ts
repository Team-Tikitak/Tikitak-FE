import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedImage, FeedPlace } from '@/shared/api/feed/types';
import type { TeamMember } from '@/shared/api/team/types';
import type { CapturedPhoto } from '@/shared/types/photo';
import { useFeedEditShare } from './useFeedEditShare';

const { navigateMock, patchFeedMock, uploadMediaBlobsMock, deleteMediaMock, submitMock } =
  vi.hoisted(() => ({
    navigateMock: vi.fn(),
    patchFeedMock: vi.fn(),
    uploadMediaBlobsMock: vi.fn(),
    deleteMediaMock: vi.fn(),
    submitMock: vi.fn(),
  }));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('@/shared/api/feed/queries', () => ({
  usePatchFeed: () => ({ mutateAsync: patchFeedMock }),
}));
vi.mock('@/shared/api/media/api', () => ({
  deleteMedia: deleteMediaMock,
}));
vi.mock('@/shared/api/media/helpers', () => ({
  uploadMediaBlobs: uploadMediaBlobsMock,
}));
vi.mock('@/shared/hooks/useShareSubmit', () => ({
  useShareSubmit: () => ({
    submit: submitMock,
    isSharing: false,
  }),
}));

const makePhoto = (id: string): CapturedPhoto => ({ id, url: `blob:${id}`, blob: new Blob() });
const makeExistingImage = (mediaPublicId: string): FeedImage =>
  ({ feedImageId: 1, imageUrl: '', heroPreviewUrl: '', orderIndex: 0, mediaPublicId }) as FeedImage;
const makePlace = (): FeedPlace =>
  ({ placeId: 'k1', name: '장소', latitude: 37, longitude: 127, address: '주소' }) as FeedPlace;
const makeMember = (teamMemberId: number): TeamMember =>
  ({ teamMemberId, nickname: 'm', role: 'MEMBER', profileImgUrl: '' }) as TeamMember;

const renderShare = (overrides: Partial<Parameters<typeof useFeedEditShare>[0]> = {}) =>
  renderHook(() =>
    useFeedEditShare({
      teamId: 5,
      feedId: 9,
      content: '내용',
      existingImages: [],
      newPhotos: [],
      selectedPlace: null,
      selectedMembers: [],
      ...overrides,
    }),
  );

describe('useFeedEditShare', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // 실제 useShareSubmit처럼 task를 실행하되 실패는 삼킨다(재시도 다이얼로그 대체)
    submitMock.mockImplementation(async (task: () => Promise<void>) => {
      try {
        await task();
      } catch {
        // 실패는 무시 (실제 훅은 재시도 다이얼로그 표시)
      }
    });
  });

  it('신규/기존 사진을 병합해 mediaPublicIds를 구성하고 patch한다', async () => {
    uploadMediaBlobsMock.mockResolvedValue(['new-1', 'new-2']);
    patchFeedMock.mockResolvedValue(undefined);
    const { result } = renderShare({
      existingImages: [makeExistingImage('old-1')],
      newPhotos: [makePhoto('p-1'), makePhoto('p-2')],
      selectedPlace: makePlace(),
      selectedMembers: [makeMember(11), makeMember(22)],
    });

    await act(async () => {
      await result.current.share();
    });

    expect(patchFeedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '내용',
        mediaPublicIds: ['old-1', 'new-1', 'new-2'],
        taggedTeamMemberIds: [11, 22],
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('patch 실패 시 신규 media만 삭제하고 기존은 보존한다', async () => {
    uploadMediaBlobsMock.mockResolvedValue(['new-1']);
    patchFeedMock.mockRejectedValue(new Error('수정 실패'));
    deleteMediaMock.mockResolvedValue(undefined);
    const { result } = renderShare({
      existingImages: [makeExistingImage('old-1')],
      newPhotos: [makePhoto('p-1')],
    });

    await act(async () => {
      await result.current.share();
    });

    expect(deleteMediaMock).toHaveBeenCalledWith('new-1');
    expect(deleteMediaMock).not.toHaveBeenCalledWith('old-1');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('신규 사진이 없으면 업로드를 건너뛴다', async () => {
    patchFeedMock.mockResolvedValue(undefined);
    const { result } = renderShare({
      existingImages: [makeExistingImage('old-1')],
      newPhotos: [],
    });

    await act(async () => {
      await result.current.share();
    });

    expect(uploadMediaBlobsMock).not.toHaveBeenCalled();
    expect(patchFeedMock).toHaveBeenCalledWith(
      expect.objectContaining({ mediaPublicIds: ['old-1'] }),
    );
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
