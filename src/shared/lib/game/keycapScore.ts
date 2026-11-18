/**
 * 티키타닥은 단계를 올라가는 게임이라 한 판의 결과를 점수 하나로 합쳐 리더보드에 올린다.
 * 점수 = 클리어한 단계 수 × 100 + 모든 단계에서 가져온 키캡 수(최대 99).
 * 그래서 높은 단계까지 간 사람이 항상 앞서고, 같은 단계면 많이 가져온 사람이 앞선다.
 */
export const KEYCAP_STAGE_LABELS = ['초보', '중수', '고수', '초고수'] as const;

const POINT_CAP = 99;

export const encodeKeycapScore = (clearedStages: number, points: number) =>
  clearedStages * 100 + Math.min(POINT_CAP, Math.max(0, points));

export const decodeKeycapScore = (score: number) => ({
  clearedStages: Math.floor(score / 100),
  points: score % 100,
});

export const formatKeycapScore = (score: number) => {
  const { clearedStages, points } = decodeKeycapScore(score);
  const label =
    clearedStages === 0
      ? `${KEYCAP_STAGE_LABELS[0]} 도전`
      : `${KEYCAP_STAGE_LABELS[clearedStages - 1]} 클리어`;
  return `${label} · ${points}점`;
};
