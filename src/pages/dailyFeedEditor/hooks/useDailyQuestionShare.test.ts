import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDailyQuestionShare } from './useDailyQuestionShare';

const { post, upload, remove, navigate, feedback } = vi.hoisted(() => ({
  post: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  navigate: vi.fn(),
  feedback: vi.fn(),
}));

vi.mock('react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@/shared/api/dailyQuestion/queries', () => ({
  usePostDailyQuestion: () => ({ mutateAsync: post }),
}));
vi.mock('@/shared/api/media/helpers', () => ({ uploadMediaBlobs: upload }));
vi.mock('@/shared/api/media/api', () => ({ deleteMedia: remove }));
vi.mock('@/shared/hooks/useShareSubmit', () => ({
  useShareSubmit: () => ({ submit: (task: () => Promise<void>) => task(), isSharing: false }),
}));
vi.mock('@/shared/ui/Toast/showToast', () => ({
  showToast: feedback,
}));

describe('useDailyQuestionShare', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    upload.mockResolvedValue(['photo']);
    remove.mockResolvedValue(undefined);
  });

  const renderShare = () =>
    renderHook(() =>
      useDailyQuestionShare({
        teamId: 1,
        questionId: 2,
        content: '내용',
        photo: { id: 'photo', url: 'blob:photo', blob: new Blob() },
      }),
    );

  it('작성 성공 후에만 완료 피드백을 표시한다', async () => {
    post.mockResolvedValue(undefined);
    const { result } = renderShare();
    await act(async () => result.current.share());
    expect(navigate).toHaveBeenCalledWith(-1);
    expect(feedback).toHaveBeenCalledWith('피드를 올렸어요');
  });

  it('작성에 실패하면 업로드를 정리하고 완료 피드백을 표시하지 않는다', async () => {
    post.mockRejectedValue(new Error('failed'));
    const { result } = renderShare();
    await act(async () => expect(result.current.share()).rejects.toThrow('failed'));
    expect(remove).toHaveBeenCalledWith('photo');
    expect(feedback).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
