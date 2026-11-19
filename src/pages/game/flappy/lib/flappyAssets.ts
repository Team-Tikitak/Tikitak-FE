import takBurnerUrl from '@/shared/assets/Character/TakBurner.svg';
import orangeSunUrl from '@/shared/assets/Sticker/OrangeSun.svg';
import redAsteriskUrl from '@/shared/assets/Sticker/RedAsterisk.svg';
import redBlossomUrl from '@/shared/assets/Sticker/RedBlossom.svg';
import yellowFlowerUrl from '@/shared/assets/Sticker/YellowFlower.svg';

export interface GameAssets {
  bird: HTMLImageElement;
  /** 기둥 끝에 피는 꽃 (장애물마다 하나) */
  flowers: HTMLImageElement[];
}

const FLOWER_URLS = [yellowFlowerUrl, redBlossomUrl, orangeSunUrl, redAsteriskUrl];

const createImage = (src: string) => {
  const image = new Image();
  image.src = src;
  return image;
};

/** 이미지는 로드되는 대로 그려지므로 기다리지 않는다 (그리는 쪽에서 로드 여부를 확인) */
export const createGameAssets = (): GameAssets => ({
  bird: createImage(takBurnerUrl),
  flowers: FLOWER_URLS.map(createImage),
});
