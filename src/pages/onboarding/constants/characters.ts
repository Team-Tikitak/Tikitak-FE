import type { ProfileCharacterType } from '@/shared/api/user/types';
import TakBuilder from '@/shared/assets/Character/TakBuilder.svg?react';
import TakBurner from '@/shared/assets/Character/TakBurner.svg?react';
import TakCare from '@/shared/assets/Character/TakCare.svg?react';
import TakFree from '@/shared/assets/Character/TakFree.svg?react';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import TakSpark from '@/shared/assets/Character/TakSpark.svg?react';

const CHARACTER_BY_ID = {
  leader: { label: 'TakLeader', name: '탁리더', Icon: TakLeader, offsetClass: '' },
  // 시각 중심 보정
  spark: {
    label: 'TakSpark',
    name: '탁스파크',
    Icon: TakSpark,
    offsetClass: '-translate-x-1.5 -translate-y-1',
  },
  burner: { label: 'TakBurner', name: '탁버너', Icon: TakBurner, offsetClass: '' },
  builder: { label: 'TakBuilder', name: '탁빌더', Icon: TakBuilder, offsetClass: '' },
  free: { label: 'TakFree', name: '탁프리', Icon: TakFree, offsetClass: '' },
  care: { label: 'TakCare', name: '탁케어', Icon: TakCare, offsetClass: '' },
} as const;

export type CharacterId = keyof typeof CHARACTER_BY_ID;

export const CHARACTER_IDS = [
  'leader',
  'spark',
  'burner',
  'builder',
  'free',
  'care',
] as const satisfies readonly CharacterId[];

export const isCharacterId = (value: string | undefined): value is CharacterId =>
  value !== undefined && (CHARACTER_IDS as readonly string[]).includes(value);

export const CHARACTER_TO_PROFILE_TYPE = {
  leader: 'TAK_LEADER',
  spark: 'TAK_SPARK',
  burner: 'TAK_BURNER',
  builder: 'TAK_BUILDER',
  free: 'TAK_FREE',
  care: 'TAK_CARE',
} as const satisfies Record<CharacterId, ProfileCharacterType>;

const toRow = (ids: readonly CharacterId[]) => ids.map((id) => ({ id, ...CHARACTER_BY_ID[id] }));

export const TOP_ROW_CHARACTERS = toRow(['leader', 'spark', 'burner', 'builder', 'free', 'care']);

export const BOTTOM_ROW_CHARACTERS = toRow([
  'builder',
  'free',
  'care',
  'leader',
  'spark',
  'burner',
]);

export const getCharacter = (id: CharacterId) => CHARACTER_BY_ID[id];

interface CharacterResult {
  headline: string;
  summary: string;
}

export const CHARACTER_RESULTS: Record<CharacterId, CharacterResult> = {
  leader: {
    headline: '당신이 있어서 팀이 움직입니다',
    summary:
      '방향이 흔들릴 때, 당신은 가장 먼저 중심을 잡는 사람이에요. 탁리더는 팀의 나침반 — 결정을 내리고 사람을 이끄는 데서 진짜 에너지를 얻는 당신을 위한 캐릭터예요.',
  },
  spark: {
    headline: '팀에 불꽃을 지피는 사람, 그게 당신이에요',
    summary:
      '막힌 분위기, 지루한 회의, 식어가는 아이디어 — 당신은 그 순간 갑자기 모든 걸 바꿔놓아요. 탁스파크는 아이디어를 발사하는 힘으로 팀을 살아있게 만드는 당신의 캐릭터예요.',
  },
  burner: {
    headline: '끝까지 해내는 사람이 바로 당신입니다',
    summary:
      '화려하지 않아도 괜찮아요. 어떤 상황에서도 맡은 것을 끝까지 완수하는 당신이야말로 팀의 실제 완성도를 만드는 사람이에요. 탁버너는 묵묵한 실행력으로 빛나는 당신의 캐릭터예요.',
  },
  builder: {
    headline: '복잡한 문제도 당신 앞에선 풀립니다',
    summary:
      "당신은 혼란 속에서 구조를 찾아내고, 막힌 곳에서 해결책을 설계해요. 탁빌더는 논리와 분석으로 팀에 '답'을 가져오는 당신 — 팀이 가장 믿고 맡기는 캐릭터예요.",
  },
  free: {
    headline: '남들이 보지 못한 길을 찾는 사람',
    summary:
      '정해진 방식이 답이 아닐 수 있다는 걸 당신은 본능적으로 알아요. 탁프리는 자유로운 시각으로 예상 밖의 돌파구를 열어내는 당신 — 창의적 독립성이 당신의 가장 큰 무기예요.',
  },
  care: {
    headline: '팀이 버틸 수 있게 해주는 사람',
    summary:
      '성과보다 사람을 먼저 보는 당신이 있어서 팀이 오래 함께할 수 있어요. 탁케어는 팀의 정서적 기둥 — 지칠 때 곁에 있고, 힘들 때 가장 먼저 알아채는 당신의 캐릭터예요.',
  },
};
