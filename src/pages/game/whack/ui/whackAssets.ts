import { type ComponentType, type SVGProps } from 'react';
import TakBuilder from '@/shared/assets/Character/TakBuilder.svg?react';
import TakBurner from '@/shared/assets/Character/TakBurner.svg?react';
import TakCare from '@/shared/assets/Character/TakCare.svg?react';
import TakFree from '@/shared/assets/Character/TakFree.svg?react';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import TakSpark from '@/shared/assets/Character/TakSpark.svg?react';
import RedAsterisk from '@/shared/assets/Sticker/RedAsterisk.svg?react';

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface WhackCharacter {
  Component: SvgComponent;
  /** SVG 안의 여백과 모양 차이 때문에 작아 보이는 캐릭터를 눈대중으로 맞추는 보정값 */
  scale: number;
}

// 순서는 whackEngine의 variant(0..5)와 맞춘다
export const TAK_CHARACTERS: WhackCharacter[] = [
  { Component: TakBuilder, scale: 1 },
  { Component: TakBurner, scale: 1 },
  { Component: TakCare, scale: 1.12 },
  { Component: TakFree, scale: 1.25 },
  { Component: TakLeader, scale: 1.05 },
  { Component: TakSpark, scale: 1.05 },
];

export const BAD_CHARACTER: WhackCharacter = { Component: RedAsterisk, scale: 0.95 };
