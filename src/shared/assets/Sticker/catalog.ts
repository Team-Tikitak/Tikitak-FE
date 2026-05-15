import { type ComponentType, type SVGProps } from 'react';
import BlueLink from './BlueLink.svg?react';
import BlueLinkUrl from './BlueLink.svg?url';
import BlueSparkle from './BlueSparkle.svg?react';
import BlueSparkleUrl from './BlueSparkle.svg?url';
import DomeHat from './DomeHat.svg?react';
import DomeHatUrl from './DomeHat.svg?url';
import GreenLeaf from './GreenLeaf.svg?react';
import GreenLeafUrl from './GreenLeaf.svg?url';
import MintChevron from './MintChevron.svg?react';
import MintChevronUrl from './MintChevron.svg?url';
import MintHook from './MintHook.svg?react';
import MintHookUrl from './MintHook.svg?url';
import OrangeArc from './OrangeArc.svg?react';
import OrangeArcUrl from './OrangeArc.svg?url';
import OrangeBeans from './OrangeBeans.svg?react';
import OrangeBeansUrl from './OrangeBeans.svg?url';
import OrangeMug from './OrangeMug.svg?react';
import OrangeMugUrl from './OrangeMug.svg?url';
import OrangeSpiral from './OrangeSpiral.svg?react';
import OrangeSpiralUrl from './OrangeSpiral.svg?url';
import OrangeSun from './OrangeSun.svg?react';
import OrangeSunUrl from './OrangeSun.svg?url';
import PinkLoop from './PinkLoop.svg?react';
import PinkLoopUrl from './PinkLoop.svg?url';
import PinkSlash from './PinkSlash.svg?react';
import PinkSlashUrl from './PinkSlash.svg?url';
import PinkSquiggle from './PinkSquiggle.svg?react';
import PinkSquiggleUrl from './PinkSquiggle.svg?url';
import PinkTulip from './PinkTulip.svg?react';
import PinkTulipUrl from './PinkTulip.svg?url';
import RedAsterisk from './RedAsterisk.svg?react';
import RedAsteriskUrl from './RedAsterisk.svg?url';
import RedBlossom from './RedBlossom.svg?react';
import RedBlossomUrl from './RedBlossom.svg?url';
import RedMountain from './RedMountain.svg?react';
import RedMountainUrl from './RedMountain.svg?url';
import RedWave from './RedWave.svg?react';
import RedWaveUrl from './RedWave.svg?url';
import StripedBall from './StripedBall.svg?react';
import StripedBallUrl from './StripedBall.svg?url';
import UStack from './UStack.svg?react';
import UStackUrl from './UStack.svg?url';
import WhiteCloud from './WhiteCloud.svg?react';
import WhiteCloudUrl from './WhiteCloud.svg?url';
import YellowArrows from './YellowArrows.svg?react';
import YellowArrowsUrl from './YellowArrows.svg?url';
import YellowFlower from './YellowFlower.svg?react';
import YellowFlowerUrl from './YellowFlower.svg?url';

export const STICKER_IDS = [
  'pinkTulip',
  'blueSparkle',
  'orangeSun',
  'orangeMug',
  'yellowFlower',
  'whiteCloud',
  'greenLeaf',
  'stripedBall',
  'orangeBeans',
  'domeHat',
  'pinkSquiggle',
  'redMountain',
  'redBlossom',
  'redWave',
  'orangeArc',
  'mintChevron',
  'mintHook',
  'pinkLoop',
  'uStack',
  'orangeSpiral',
  'redAsterisk',
  'pinkSlash',
  'blueLink',
  'yellowArrows',
] as const;

export type StickerId = (typeof STICKER_IDS)[number];

export interface StickerEntry {
  id: StickerId;
  Component: ComponentType<SVGProps<SVGSVGElement>>;
  url: string;
  label: string;
}

const STICKER_MAP = {
  pinkTulip: { Component: PinkTulip, url: PinkTulipUrl, label: '튤립' },
  blueSparkle: { Component: BlueSparkle, url: BlueSparkleUrl, label: '반짝임' },
  orangeSun: { Component: OrangeSun, url: OrangeSunUrl, label: '태양' },
  orangeMug: { Component: OrangeMug, url: OrangeMugUrl, label: '머그컵' },
  yellowFlower: { Component: YellowFlower, url: YellowFlowerUrl, label: '꽃' },
  whiteCloud: { Component: WhiteCloud, url: WhiteCloudUrl, label: '구름' },
  greenLeaf: { Component: GreenLeaf, url: GreenLeafUrl, label: '잎' },
  stripedBall: { Component: StripedBall, url: StripedBallUrl, label: '줄무늬 공' },
  orangeBeans: { Component: OrangeBeans, url: OrangeBeansUrl, label: '콩' },
  domeHat: { Component: DomeHat, url: DomeHatUrl, label: '돔' },
  pinkSquiggle: { Component: PinkSquiggle, url: PinkSquiggleUrl, label: '지그재그' },
  redMountain: { Component: RedMountain, url: RedMountainUrl, label: '산' },
  redBlossom: { Component: RedBlossom, url: RedBlossomUrl, label: '꽃잎' },
  redWave: { Component: RedWave, url: RedWaveUrl, label: '물결' },
  orangeArc: { Component: OrangeArc, url: OrangeArcUrl, label: '활' },
  mintChevron: { Component: MintChevron, url: MintChevronUrl, label: '화살' },
  mintHook: { Component: MintHook, url: MintHookUrl, label: '갈고리' },
  pinkLoop: { Component: PinkLoop, url: PinkLoopUrl, label: '링크' },
  uStack: { Component: UStack, url: UStackUrl, label: '묶음' },
  orangeSpiral: { Component: OrangeSpiral, url: OrangeSpiralUrl, label: '소용돌이' },
  redAsterisk: { Component: RedAsterisk, url: RedAsteriskUrl, label: '별' },
  pinkSlash: { Component: PinkSlash, url: PinkSlashUrl, label: '빗금' },
  blueLink: { Component: BlueLink, url: BlueLinkUrl, label: '사슬' },
  yellowArrows: { Component: YellowArrows, url: YellowArrowsUrl, label: '화살들' },
} satisfies Record<StickerId, Omit<StickerEntry, 'id'>>;

export const STICKERS: StickerEntry[] = STICKER_IDS.map((id) => ({
  id,
  ...STICKER_MAP[id],
}));

export const getSticker = (id: StickerId): StickerEntry => ({
  id,
  ...STICKER_MAP[id],
});
