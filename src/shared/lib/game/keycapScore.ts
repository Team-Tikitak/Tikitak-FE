/**
 * 티키타닥은 단계를 올라가는 게임이라 한 판의 결과를 점수 하나로 합쳐 리더보드에 올린다.
 * 점수 = 클리어한 단계 수 × 1000 + 모든 단계에서 가져온 키캡 수(최대 999).
 * 그래서 높은 단계까지 간 사람이 항상 앞서고, 같은 단계면 많이 가져온 사람이 앞선다.
 */
export const KEYCAP_STAGE_LABELS = ['초보', '중수', '고수', '초고수', '불가능'] as const;

const STAGE_UNIT = 1000;
const POINT_CAP = 999;

export const encodeKeycapScore = (clearedStages: number, points: number) =>
  clearedStages * STAGE_UNIT + Math.min(POINT_CAP, Math.max(0, points));

export const decodeKeycapScore = (score: number) => ({
  clearedStages: Math.floor(score / STAGE_UNIT),
  points: score % STAGE_UNIT,
});

const describeKeycapScore = (score: number) => {
  const { clearedStages, points } = decodeKeycapScore(score);
  // 잘못되었거나 조작된 점수가 와도 "undefined 클리어"가 보이지 않게 마지막 단계까지만 쓴다
  const clearedIndex = Math.min(clearedStages, KEYCAP_STAGE_LABELS.length) - 1;
  // 상한에 닿은 점수는 "딱 그 점수"가 아니라 "그 이상"이다
  const pointsText = points >= POINT_CAP ? `${POINT_CAP}점 이상` : `${points}점`;
  return {
    stage: KEYCAP_STAGE_LABELS[Math.max(0, clearedIndex)],
    cleared: clearedIndex >= 0,
    pointsText,
  };
};

export const formatKeycapScore = (score: number) => {
  const { stage, cleared, pointsText } = describeKeycapScore(score);
  return `${stage} ${cleared ? '클리어' : '도전'} · ${pointsText}`;
};

/** 게임 끝 화면용: 단계와 점수를 두 줄로 나눈다 (예: "초고수 난이도 클리어" 아래에 "31점") */
export const formatKeycapResult = (score: number) => {
  const { stage, cleared, pointsText } = describeKeycapScore(score);
  return `${stage} 난이도 ${cleared ? '클리어' : '도전'}\n${pointsText}`;
};
