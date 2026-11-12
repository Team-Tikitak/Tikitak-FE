import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamMember } from '@/shared/api/team/types';
import { useFeedForm } from '@/shared/hooks/feed/useFeedForm';
import type { FeedDraft } from '@/shared/lib/storage/feedDraftStore';
import { useFeedDraft } from './useFeedDraft';

const { loadDraft, saveDraft, deleteDraft, openDialog } = vi.hoisted(() => ({
  loadDraft: vi.fn(),
  saveDraft: vi.fn(),
  deleteDraft: vi.fn(),
  openDialog: vi.fn(),
}));

vi.mock('@/shared/lib/storage/feedDraftStore', () => ({
  loadFeedDraft: loadDraft,
  saveFeedDraft: saveDraft,
  deleteFeedDraft: deleteDraft,
}));
vi.mock('@/shared/ui/ConfirmDialog', () => ({ openConfirmDialog: openDialog }));

const me = { teamMemberId: 1, nickname: '나' } as TeamMember;
const friend = { teamMemberId: 2, nickname: '친구' } as TeamMember;
const place = { placeId: 'p1', name: '카페', latitude: 0, longitude: 0, address: '서울' };

const savedDraft: FeedDraft = {
  content: '작성 중',
  place,
  memberIds: [1, 2],
  photos: [{ id: 'photo-1', blob: new Blob(['a']) }],
  updatedAt: 0,
};

const renderDraft = () =>
  renderHook(() => {
    const form = useFeedForm({ initialMembers: [me] });
    const draft = useFeedDraft({ teamId: 7, form, teamMembers: [me, friend] });
    return { form, draft };
  });

// loadFeedDraft 응답을 받아 이어쓰기 판단까지 진행시킨다
const flushLoad = () => act(async () => {});

describe('useFeedDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    saveDraft.mockResolvedValue(undefined);
    deleteDraft.mockResolvedValue(undefined);
    URL.createObjectURL = vi.fn(() => 'blob:restored');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('임시저장본이 없으면 확인창 없이 입력을 잠시 뒤 저장한다', async () => {
    loadDraft.mockResolvedValue(null);
    const { result } = renderDraft();
    await flushLoad();

    act(() => result.current.form.setContent('안녕'));
    act(() => vi.advanceTimersByTime(500));

    expect(openDialog).not.toHaveBeenCalled();
    expect(saveDraft).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ content: '안녕', memberIds: [1], photos: [] }),
    );
  });

  it('내용 없이 함께한 멤버만 있으면 저장하지도 지우지도 않는다', async () => {
    loadDraft.mockResolvedValue(null);
    renderDraft();
    await flushLoad();

    act(() => vi.advanceTimersByTime(500));

    expect(saveDraft).not.toHaveBeenCalled();
    expect(deleteDraft).not.toHaveBeenCalled();
  });

  it('이어쓰기를 고르면 글·장소·멤버·사진을 복원한다', async () => {
    loadDraft.mockResolvedValue(savedDraft);
    const { result } = renderDraft();
    await flushLoad();

    expect(openDialog).toHaveBeenCalledWith(
      expect.objectContaining({ confirmLabel: '이어쓰기', cancelLabel: '새로 쓰기' }),
    );
    act(() => openDialog.mock.calls[0][0].onConfirm());

    expect(result.current.form.content).toBe('작성 중');
    expect(result.current.form.selectedPlace).toEqual(place);
    expect(result.current.form.selectedMembers).toEqual([me, friend]);
    expect(result.current.form.photos).toEqual([
      { id: 'photo-1', blob: savedDraft.photos[0].blob, url: 'blob:restored' },
    ]);
  });

  it('새로 쓰기(또는 Android에서 확인창 닫기)는 기존 임시저장본을 바로 지우지 않고 새 입력으로 덮어쓴다', async () => {
    loadDraft.mockResolvedValue(savedDraft);
    const { result } = renderDraft();
    await flushLoad();

    act(() => openDialog.mock.calls[0][0].onCancel());
    act(() => vi.advanceTimersByTime(500));

    expect(result.current.form.content).toBe('');
    expect(deleteDraft).not.toHaveBeenCalled();
    expect(saveDraft).not.toHaveBeenCalled();

    act(() => result.current.form.setContent('새 글'));
    act(() => vi.advanceTimersByTime(500));

    expect(saveDraft).toHaveBeenCalledWith(7, expect.objectContaining({ content: '새 글' }));
  });

  it('이어쓴 내용을 모두 지우면 임시저장본도 지운다', async () => {
    loadDraft.mockResolvedValue({ ...savedDraft, place: null });
    const { result } = renderDraft();
    await flushLoad();
    act(() => openDialog.mock.calls[0][0].onConfirm());
    act(() => vi.advanceTimersByTime(500));

    act(() => {
      result.current.form.setContent('');
      result.current.form.removePhoto('photo-1');
    });
    act(() => vi.advanceTimersByTime(500));

    expect(deleteDraft).toHaveBeenCalledWith(7);
  });

  it('이어쓰기 여부를 고르기 전에는 저장하지 않는다', async () => {
    loadDraft.mockResolvedValue(savedDraft);
    const { result } = renderDraft();
    await flushLoad();

    act(() => result.current.form.setContent('덮어쓰기'));
    act(() => vi.advanceTimersByTime(500));

    expect(saveDraft).not.toHaveBeenCalled();
    expect(deleteDraft).not.toHaveBeenCalled();
  });

  it('저장 대기 중에 화면을 떠나면 마지막 입력을 바로 저장한다', async () => {
    loadDraft.mockResolvedValue(null);
    const { result, unmount } = renderDraft();
    await flushLoad();

    act(() => result.current.form.setContent('나가기 직전'));
    unmount();

    expect(saveDraft).toHaveBeenCalledWith(7, expect.objectContaining({ content: '나가기 직전' }));
  });

  it('공유에 성공하면 임시저장본을 지우고 이후 저장하지 않는다', async () => {
    loadDraft.mockResolvedValue(null);
    const { result, unmount } = renderDraft();
    await flushLoad();

    act(() => result.current.form.setContent('공유할 글'));
    act(() => result.current.draft.discardDraft());
    act(() => vi.advanceTimersByTime(500));
    unmount();

    expect(deleteDraft).toHaveBeenCalledWith(7);
    expect(saveDraft).not.toHaveBeenCalled();
  });
});
