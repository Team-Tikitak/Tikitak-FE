import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePendingPhotoStore } from '@/shared/stores/pendingPhotoStore';
import { confirmCapturedPhoto } from './finalizeCapturedPhoto';

const { applyFilterMock, composeMock, cropMock, alertDialogMock } = vi.hoisted(() => ({
  applyFilterMock: vi.fn(),
  composeMock: vi.fn(),
  cropMock: vi.fn(),
  alertDialogMock: vi.fn(),
}));

vi.mock('./photoFilter', () => ({ applyFilterToBlob: applyFilterMock }));
vi.mock('./composePhoto', () => ({ composePhotoWithStickers: composeMock }));
vi.mock('./cropImageBlob', () => ({ cropImageBlobToAspectRatio: cropMock }));
vi.mock('@/shared/lib/native/nativeDialog', () => ({ alertDialog: alertDialogMock }));

const rawBlob = new Blob(['raw'], { type: 'image/jpeg' });
const finalBlob = new Blob(['final'], { type: 'image/jpeg' });
const pendingState = { rawBlob, previewUrl: 'blob:preview', stickers: [] };

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('confirmCapturedPhoto', () => {
  beforeEach(() => {
    applyFilterMock.mockReset().mockResolvedValue(rawBlob);
    composeMock.mockReset();
    cropMock.mockReset().mockResolvedValue(finalBlob);
    alertDialogMock.mockReset();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:final');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('즉시 반환하고, 합성이 끝나면 최종 사진을 onCapture 로 넘긴다', async () => {
    const onCapture = vi.fn();

    confirmCapturedPhoto(pendingState, 'none', onCapture);

    expect(onCapture).not.toHaveBeenCalled();
    expect(usePendingPhotoStore.getState().count).toBe(1);

    await flush();

    expect(onCapture).toHaveBeenCalledWith({
      id: expect.any(String),
      url: 'blob:final',
      blob: finalBlob,
    });
    expect(usePendingPhotoStore.getState().count).toBe(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('스티커가 있으면 합성 단계를 거친다', async () => {
    const stickers = [{ id: 's1' }] as never;
    composeMock.mockResolvedValue(rawBlob);

    confirmCapturedPhoto({ ...pendingState, stickers }, 'none', vi.fn());
    await flush();

    expect(composeMock).toHaveBeenCalledWith(rawBlob, stickers);
  });

  it('합성에 실패하면 안내 다이얼로그를 띄우고 onCapture 는 호출하지 않는다', async () => {
    applyFilterMock.mockRejectedValue(new Error('canvas failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onCapture = vi.fn();

    confirmCapturedPhoto(pendingState, 'grayscale(1)', onCapture);
    await flush();

    expect(onCapture).not.toHaveBeenCalled();
    expect(alertDialogMock).toHaveBeenCalledTimes(1);
    expect(usePendingPhotoStore.getState().count).toBe(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
});
