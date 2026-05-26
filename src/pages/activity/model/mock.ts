export interface RecommendedPlace {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export const MONTHLY_RECOMMENDED_PLACES: RecommendedPlace[] = [
  {
    id: 'tricle',
    title: 'TRICLE COFFEE',
    description: '슬슬 더워지는 6월, 신촌 트리클 커피에서 모각작 어때요?',
  },
  {
    id: 'sushidoku',
    title: '스시도쿠 신촌점',
    description: '오늘의 점메추! 우리팀 회식으로 스시도쿠 신촌점을 추천해요.',
  },
];

export const RECOMMENDED_PLACES_TOOLTIP = "자주 방문했던 '신촌역' 주변 핫플 큐레이션";
