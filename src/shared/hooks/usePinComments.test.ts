import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  useDeleteFeedComment,
  useGetFeedComments,
  usePostFeedComment,
} from '@/shared/api/feedComment/queries';
import { useGetTeams } from '@/shared/api/user/queries';
import { usePinComments } from './usePinComments';

const mockPostComment = vi.fn();
const mockDeleteComment = vi.fn();

vi.mock('@/shared/api/feedComment/queries', () => ({
  useGetFeedComments: vi.fn(),
  usePostFeedComment: vi.fn(),
  useDeleteFeedComment: vi.fn(),
}));

vi.mock('@/shared/api/user/queries', () => ({
  useGetTeams: vi.fn(),
}));

const defaultParams = { teamId: 1, feedId: 42, feedImageIds: [10, 11] };

const makeComment = (
  overrides: Partial<{
    commentId: number;
    feedImageId: number;
    positionX: number;
    positionY: number;
    teamMemberId: number;
  }> = {},
) => ({
  commentId: overrides.commentId ?? 1,
  feedId: 42,
  feedImageId: overrides.feedImageId ?? 10,
  positionX: overrides.positionX ?? 0.3,
  positionY: overrides.positionY ?? 0.4,
  content: '댓글',
  author: {
    teamMemberId: overrides.teamMemberId ?? 1,
    nickname: '유저',
    profileImageUrl: 'http://a.jpg',
    anonymous: false,
    isAnonymous: false,
  },
  createdAt: '',
  updatedAt: '',
  mine: true,
  isMine: true,
});

describe('usePinComments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useGetFeedComments).mockReturnValue({ data: { items: [] } } as unknown as ReturnType<
      typeof useGetFeedComments
    >);
    vi.mocked(usePostFeedComment).mockReturnValue({
      mutate: mockPostComment,
    } as unknown as ReturnType<typeof usePostFeedComment>);
    vi.mocked(useDeleteFeedComment).mockReturnValue({
      mutate: mockDeleteComment,
    } as unknown as ReturnType<typeof useDeleteFeedComment>);
    vi.mocked(useGetTeams).mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useGetTeams
    >);
  });

  it('초기 sheet key는 null', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    expect(result.current.openPinKey).toBeNull();
    expect(result.current.displayPinKey).toBeNull();
  });

  it('addPinAt하면 해당 슬롯으로 시트가 열림', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.addPinAt(42, 0, 30, 40));
    expect(result.current.openPinKey).toBe('42-0');
    expect(result.current.displayPinKey).toBe('42-0');
  });

  it('closeSheet은 openPinKey만 초기화, completeClose까지 displayPinKey 유지', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.addPinAt(42, 0, 30, 40));
    act(() => result.current.closeSheet());
    expect(result.current.openPinKey).toBeNull();
    expect(result.current.displayPinKey).not.toBeNull();
    act(() => result.current.completeClose());
    expect(result.current.displayPinKey).toBeNull();
  });

  it('댓글 작성 없이 닫으면(취소) 핀이 제거됨', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.addPinAt(42, 0, 30, 40));
    expect(result.current.decoratePins(42, 0, undefined)).toHaveLength(1);
    act(() => result.current.closeSheet());
    act(() => result.current.completeClose());
    expect(result.current.decoratePins(42, 0, undefined)).toHaveLength(0);
  });

  it('submitComment 후 닫으면 ghost 핀이 제거됨', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.addPinAt(42, 0, 30, 40));
    act(() => result.current.submitComment('하이'));
    act(() => result.current.closeSheet());
    act(() => result.current.completeClose());
    expect(result.current.decoratePins(42, 0, undefined)).toHaveLength(0);
  });

  it('submitComment는 postComment를 호출함', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.addPinAt(42, 0, 30, 40));
    act(() => result.current.submitComment('하이'));
    expect(mockPostComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ content: '하이', feedImageId: 10 }),
        optimisticAuthor: expect.objectContaining({ nickname: '나' }),
      }),
    );
  });

  it('pendingPosition 없으면 submitComment는 no-op', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.submitComment('drop'));
    expect(mockPostComment).not.toHaveBeenCalled();
  });

  it('같은 위치 다른 사람 댓글이면 multiple 핀', () => {
    vi.mocked(useGetFeedComments).mockReturnValue({
      data: {
        items: [
          makeComment({ commentId: 1, teamMemberId: 1 }),
          makeComment({ commentId: 2, teamMemberId: 2 }),
        ],
      },
    } as unknown as ReturnType<typeof useGetFeedComments>);
    const { result } = renderHook(() => usePinComments(defaultParams));
    const pins = result.current.decoratePins(42, 0, undefined);
    expect(pins).toHaveLength(1);
    expect(pins[0].count).toBe('multiple');
  });

  it('같은 위치 같은 사람 댓글 여러 개면 단일 핀', () => {
    vi.mocked(useGetFeedComments).mockReturnValue({
      data: {
        items: [
          makeComment({ commentId: 1, teamMemberId: 1 }),
          makeComment({ commentId: 2, teamMemberId: 1 }),
        ],
      },
    } as unknown as ReturnType<typeof useGetFeedComments>);
    const { result } = renderHook(() => usePinComments(defaultParams));
    const pins = result.current.decoratePins(42, 0, undefined);
    expect(pins).toHaveLength(1);
    expect(pins[0].count).toBeUndefined();
  });

  it('다른 위치 댓글은 별개의 핀으로 분리됨', () => {
    vi.mocked(useGetFeedComments).mockReturnValue({
      data: {
        items: [
          makeComment({ commentId: 1, positionX: 0.3, positionY: 0.4 }),
          makeComment({ commentId: 2, positionX: 0.6, positionY: 0.7 }),
        ],
      },
    } as unknown as ReturnType<typeof useGetFeedComments>);
    const { result } = renderHook(() => usePinComments(defaultParams));
    const pins = result.current.decoratePins(42, 0, undefined);
    expect(pins).toHaveLength(2);
  });

  it('decoratePins는 API 핀과 로컬 핀을 합쳐서 반환', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));
    act(() => result.current.addPinAt(42, 0, 30, 40));
    const pins = result.current.decoratePins(42, 0, undefined);
    expect(pins).toHaveLength(1);
  });

  it('시트가 닫혀있으면 폴링하지 않고, 열리면 4초 간격으로 폴링한다', () => {
    const { result } = renderHook(() => usePinComments(defaultParams));

    expect(vi.mocked(useGetFeedComments)).toHaveBeenLastCalledWith(1, 42, undefined, {
      refetchInterval: false,
    });

    act(() => result.current.addPinAt(42, 0, 30, 40));

    expect(vi.mocked(useGetFeedComments)).toHaveBeenLastCalledWith(1, 42, undefined, {
      refetchInterval: 4000,
    });

    act(() => result.current.closeSheet());

    expect(vi.mocked(useGetFeedComments)).toHaveBeenLastCalledWith(1, 42, undefined, {
      refetchInterval: false,
    });
  });
});
