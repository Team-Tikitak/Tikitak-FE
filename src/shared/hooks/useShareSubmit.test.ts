import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useShareSubmit } from './useShareSubmit';

const { confirmDialogMock } = vi.hoisted(() => ({
  confirmDialogMock: vi.fn(),
}));

vi.mock('@/shared/lib/native/nativeDialog', () => ({
  confirmDialog: confirmDialogMock,
}));

describe('useShareSubmit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('성공 시 task를 1회 호출하고 isSharing이 true→false로 전이한다', async () => {
    const task = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useShareSubmit('실패했어요'));

    expect(result.current.isSharing).toBe(false);
    await act(async () => {
      await result.current.submit(task);
    });

    expect(task).toHaveBeenCalledTimes(1);
    expect(confirmDialogMock).not.toHaveBeenCalled();
    expect(result.current.isSharing).toBe(false);
  });

  it('실패 후 재시도를 확인하면 task를 재호출하고 최종 성공 시 종료한다', async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error('첫 실패'))
      .mockResolvedValueOnce(undefined);
    confirmDialogMock.mockResolvedValue(true);
    const { result } = renderHook(() => useShareSubmit('실패했어요'));

    await act(async () => {
      await result.current.submit(task);
    });

    expect(task).toHaveBeenCalledTimes(2);
    expect(confirmDialogMock).toHaveBeenCalledTimes(1);
    expect(result.current.isSharing).toBe(false);
  });

  it('실패 후 재시도를 취소하면 task를 재호출하지 않는다', async () => {
    const task = vi.fn().mockRejectedValue(new Error('실패'));
    confirmDialogMock.mockResolvedValue(false);
    const { result } = renderHook(() => useShareSubmit('실패했어요'));

    await act(async () => {
      await result.current.submit(task);
    });

    expect(task).toHaveBeenCalledTimes(1);
    expect(confirmDialogMock).toHaveBeenCalledTimes(1);
  });

  it('isSharing 중이면 중복 submit을 무시한다', async () => {
    let resolveTask: () => void = () => {};
    const task = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveTask = resolve;
        }),
    );
    const { result } = renderHook(() => useShareSubmit('실패했어요'));

    let firstSubmit!: Promise<void>;
    act(() => {
      firstSubmit = result.current.submit(task);
    });
    expect(result.current.isSharing).toBe(true);

    await act(async () => {
      await result.current.submit(task);
    });
    expect(task).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveTask();
      await firstSubmit;
    });
    expect(result.current.isSharing).toBe(false);
  });
});
