import { FEED_IMAGE_HEIGHT, FEED_IMAGE_WIDTH } from '@/shared/constants';
import { createId } from '@/shared/lib/createId';
import { alertDialog } from '@/shared/lib/native/nativeDialog';
import { trackPendingPhoto } from '@/shared/stores/pendingPhotoStore';
import type { CapturedPhoto } from '@/shared/types/photo';
import type { PendingState, PlacedSticker } from '@/shared/types/sticker';
import { composePhotoWithStickers } from './composePhoto';
import { cropImageBlobToAspectRatio } from './cropImageBlob';
import { applyFilterToBlob } from './photoFilter';

// 카메라 리뷰에서 확정한 사진에 필터·스티커를 입히고 피드 비율로 자른 최종본을 만든다.
export const finalizeCapturedPhoto = async (
  rawBlob: Blob,
  filterCss: string,
  stickers: PlacedSticker[],
): Promise<CapturedPhoto> => {
  const filteredBlob = await applyFilterToBlob(rawBlob, filterCss);
  const composedBlob =
    stickers.length > 0 ? await composePhotoWithStickers(filteredBlob, stickers) : filteredBlob;
  const uploadBlob = await cropImageBlobToAspectRatio(
    composedBlob,
    FEED_IMAGE_WIDTH,
    FEED_IMAGE_HEIGHT,
  );

  return { id: createId(), url: URL.createObjectURL(uploadBlob), blob: uploadBlob };
};

// 리뷰 화면에서 확정하면 오버레이가 바로 닫히므로, 합성은 오버레이 mount 여부와 무관하게 끝까지 진행하고
// 완료되면 onCapture로 넘긴다. 진행 중에는 pendingPhotoStore로 작성 화면이 대기 상태를 표시한다.
export const confirmCapturedPhoto = (
  { rawBlob, previewUrl, stickers }: PendingState,
  filterCss: string,
  onCapture: (photo: CapturedPhoto) => void,
): void => {
  void trackPendingPhoto(() => finalizeCapturedPhoto(rawBlob, filterCss, stickers))
    .then(onCapture)
    .catch((cause) => {
      console.error('사진 합성 실패', cause);
      void alertDialog('사진을 처리하지 못했어요.\n다시 시도해주세요.');
    })
    .finally(() => URL.revokeObjectURL(previewUrl));
};
