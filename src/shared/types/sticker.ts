import { type StickerId } from '@/shared/assets/Sticker/catalog';

export interface PlacedSticker {
  id: string;
  stickerId: StickerId;
  /** 사진 컨테이너 너비/높이 대비 비율 (0~1). 디바이스 화면 크기와 무관하게 위치 보존. */
  xRatio: number;
  yRatio: number;
  /** 기본 크기 대비 배율 (1 = 원본). pinch로 조절. */
  scale: number;
  rotation?: number;
}

export interface PendingState {
  rawBlob: Blob;
  previewUrl: string;
  stickers: PlacedSticker[];
}
